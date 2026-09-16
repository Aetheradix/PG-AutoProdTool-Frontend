import React, { useMemo, useState } from 'react';
import { Modal, Form, Input, Select, Radio, AutoComplete, Tag, Tooltip } from 'antd';
import {
  FiCopy,
  FiDatabase,
  FiLayers,
  FiClock,
  FiDroplet,
  FiEdit3,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

/**
 * Generically extracts the standard/representative values for a given Technology
 * across all existing items belonging to that technology in dataSource.
 * Dynamic and future-proof: does not hardcode specific fields or technologies.
 */
function extractGenericTechDefaults(items, techName) {
  if (!items || items.length === 0) return { technology: techName };

  const ignoredKeys = new Set([
    'id',
    'gcas',
    'description',
    'created_at',
    'updated_at',
    '_uniqueKey',
    'key',
  ]);

  const defaults = { technology: techName };

  // Collect all unique keys present across all items for this technology
  const allKeys = new Set();
  items.forEach((item) => {
    Object.keys(item).forEach((k) => {
      if (!ignoredKeys.has(k)) allKeys.add(k);
    });
  });

  // For each key, find the most common non-null, non-empty value (mode)
  allKeys.forEach((key) => {
    const validValues = items
      .map((item) => item[key])
      .filter((val) => val !== null && val !== undefined && val !== '');

    if (validValues.length > 0) {
      const frequencyMap = {};
      validValues.forEach((v) => {
        frequencyMap[v] = (frequencyMap[v] || 0) + 1;
      });
      // Sort by frequency descending
      const mostCommonValue = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1])[0][0];

      defaults[key] = mostCommonValue;
    }
  });

  return defaults;
}

export function SKUMasterAddModal({ open, onCancel, onOk, confirmLoading, dataSource = [] }) {
  const [form] = Form.useForm();

  // Primary: Selected Technology for auto-filling and grouping
  const [selectedTech, setSelectedTech] = useState(null);
  // Secondary / Optional: Selected individual SKU to copy
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Search filter text states for dynamic "Add custom" dropdown options
  const [gcasSearch, setGcasSearch] = useState('');
  const [descSearch, setDescSearch] = useState('');
  const [techSearch, setTechSearch] = useState('');

  // 1. Group dataSource by Technology and extract lists
  const { technologyGroups, rawGcasList, rawDescList, rawTechList } = useMemo(() => {
    const techGroups = {}; // techName -> array of items
    const gcasSet = new Set();
    const descSet = new Set();
    const techSet = new Set();

    dataSource.forEach((item) => {
      const cleanGcas = String(item.gcas || '')
        .replace(/^'/, '')
        .trim();
      if (cleanGcas) gcasSet.add(cleanGcas);

      const desc = String(item.description || '').trim();
      if (desc) descSet.add(desc);

      const tech = String(item.technology || '').trim();
      if (tech) {
        techSet.add(tech);
        if (!techGroups[tech]) techGroups[tech] = [];
        techGroups[tech].push(item);
      }
    });

    return {
      technologyGroups: {
        groups: techGroups,
        techNames: Array.from(techSet).sort(),
      },
      rawGcasList: Array.from(gcasSet),
      rawDescList: Array.from(descSet),
      rawTechList: Array.from(techSet).sort(),
    };
  }, [dataSource]);

  // Primary Technology Dropdown Options (with variant count badge)
  const technologySelectOptions = useMemo(() => {
    const options = technologyGroups.techNames.map((techName) => {
      const count = technologyGroups.groups[techName]?.length || 0;
      return {
        value: techName,
        label: `${techName} (${count} ${count === 1 ? 'variant' : 'variants'})`,
        techName,
        count,
      };
    });

    return options;
  }, [technologyGroups]);

  // Dynamic dropdown options with "Manual / New Entry" option at top
  const gcasOptions = useMemo(() => {
    const query = gcasSearch.trim().toLowerCase();
    const matches = rawGcasList
      .filter((g) => !query || g.toLowerCase().includes(query))
      .map((g) => ({
        value: g,
        label: <span>{g}</span>,
      }));

    if (gcasSearch.trim() && !rawGcasList.some((g) => g.toLowerCase() === query)) {
      return [
        {
          value: gcasSearch.trim(),
          label: (
            <div className="flex items-center gap-1.5 text-blue-600 font-bold py-0.5">
              <FiEdit3 size={13} />
              <span>
                Use manual entry: <b>"{gcasSearch.trim()}"</b>
              </span>
            </div>
          ),
        },
        ...matches,
      ];
    }
    return matches;
  }, [rawGcasList, gcasSearch]);

  const descOptions = useMemo(() => {
    const query = descSearch.trim().toLowerCase();
    const matches = rawDescList
      .filter((d) => !query || d.toLowerCase().includes(query))
      .map((d) => ({
        value: d,
        label: <span>{d}</span>,
      }));

    if (descSearch.trim() && !rawDescList.some((d) => d.toLowerCase() === query)) {
      return [
        {
          value: descSearch.trim(),
          label: (
            <div className="flex items-center gap-1.5 text-blue-600 font-bold py-0.5">
              <FiEdit3 size={13} />
              <span>
                Use manual entry: <b>"{descSearch.trim()}"</b>
              </span>
            </div>
          ),
        },
        ...matches,
      ];
    }
    return matches;
  }, [rawDescList, descSearch]);

  const techOptions = useMemo(() => {
    const query = techSearch.trim().toLowerCase();
    const matches = rawTechList
      .filter((t) => !query || t.toLowerCase().includes(query))
      .map((t) => ({
        value: t,
        label: <span>{t}</span>,
      }));

    if (techSearch.trim() && !rawTechList.some((t) => t.toLowerCase() === query)) {
      return [
        {
          value: techSearch.trim(),
          label: (
            <div className="flex items-center gap-1.5 text-blue-600 font-bold py-0.5">
              <FiEdit3 size={13} />
              <span>
                Use manual entry: <b>"{techSearch.trim()}"</b>
              </span>
            </div>
          ),
        },
        ...matches,
      ];
    }
    return matches;
  }, [rawTechList, techSearch]);

  // ── Primary: Handle Technology Selection for Auto-Fill ─────────
  const handleTechnologyAutoFill = (techVal) => {
    setSelectedTech(techVal);
    setSelectedVariant(null); // Reset secondary SKU selector

    if (!techVal || techVal === '__BLANK__') {
      form.resetFields();
      return;
    }

    const items = technologyGroups.groups[techVal] || [];
    const techDefaults = extractGenericTechDefaults(items, techVal);

    // Preserve user-entered GCAS & Description to maintain data integrity
    const currentValues = form.getFieldsValue();
    const preserveGcas = currentValues.gcas;
    const preserveDesc = currentValues.description;

    form.setFieldsValue({
      ...techDefaults,
      technology: techVal,
      tech_class: techDefaults.tech_class === 'Single' ? 'Single' : 'Dual',
      ...(preserveGcas ? { gcas: preserveGcas } : {}),
      ...(preserveDesc ? { description: preserveDesc } : {}),
    });
  };

  // ── Secondary / Optional: Copy Specific Existing SKU ──────────
  const handleVariantCopy = (gcasVal) => {
    setSelectedVariant(gcasVal);

    if (!gcasVal || gcasVal === '__BLANK__') {
      return;
    }

    const found = dataSource.find(
      (item) =>
        String(item.gcas || '')
          .replace(/^'/, '')
          .trim() === String(gcasVal).trim()
    );

    if (found) {
      const cleanGcas = String(found.gcas || '')
        .replace(/^'/, '')
        .trim();
      // Sync active technology selector to match this variant
      if (found.technology) {
        setSelectedTech(found.technology);
      }
      form.setFieldsValue({
        ...found,
        gcas: cleanGcas,
        tech_class: found.tech_class === 'Single' ? 'Single' : 'Dual',
      });
    }
  };

  // Auto-fill when existing GCAS is picked from dropdown
  const handleGcasSelect = (val) => {
    const cleanVal = String(val).replace(/^'/, '').trim();
    const found = dataSource.find(
      (item) =>
        String(item.gcas || '')
          .replace(/^'/, '')
          .trim() === cleanVal
    );
    if (found) {
      if (found.technology) {
        setSelectedTech(found.technology);
      }
      form.setFieldsValue({
        description: found.description,
        technology: found.technology,
        tech_class: found.tech_class === 'Single' ? 'Single' : 'Dual',
        bct_12t_fmt: found.bct_12t_fmt,
        bct_12t_mmt: found.bct_12t_mmt,
        bct_6t_fmt: found.bct_6t_fmt,
        bct_6t_mmt: found.bct_6t_mmt,
        cons_12t_dm5500: found.cons_12t_dm5500,
        cons_12t_hc_base: found.cons_12t_hc_base,
        cons_12t_lp_base: found.cons_12t_lp_base,
        cons_6t_dm5500: found.cons_6t_dm5500,
        cons_6t_hc_base: found.cons_6t_hc_base,
        cons_6t_lp_base: found.cons_6t_lp_base,
        cons_12t_sls: found.cons_12t_sls,
        cons_12t_betain: found.cons_12t_betain,
        cons_12t_sle3s: found.cons_12t_sle3s,
        cons_6t_sls: found.cons_6t_sls,
        cons_6t_betain: found.cons_6t_betain,
        cons_6t_sle3s: found.cons_6t_sle3s,
      });
    }
  };

  // Auto-fill when existing Description is picked from dropdown
  const handleDescSelect = (val) => {
    const found = dataSource.find(
      (item) => String(item.description || '').trim() === String(val).trim()
    );
    if (found) {
      if (found.technology) {
        setSelectedTech(found.technology);
      }
      form.setFieldsValue({
        technology: found.technology,
        tech_class: found.tech_class === 'Single' ? 'Single' : 'Dual',
        bct_12t_fmt: found.bct_12t_fmt,
        bct_12t_mmt: found.bct_12t_mmt,
        bct_6t_fmt: found.bct_6t_fmt,
        bct_6t_mmt: found.bct_6t_mmt,
        cons_12t_dm5500: found.cons_12t_dm5500,
        cons_12t_hc_base: found.cons_12t_hc_base,
        cons_12t_lp_base: found.cons_12t_lp_base,
        cons_6t_dm5500: found.cons_6t_dm5500,
        cons_6t_hc_base: found.cons_6t_hc_base,
        cons_6t_lp_base: found.cons_6t_lp_base,
        cons_12t_sls: found.cons_12t_sls,
        cons_12t_betain: found.cons_12t_betain,
        cons_12t_sle3s: found.cons_12t_sle3s,
        cons_6t_sls: found.cons_6t_sls,
        cons_6t_betain: found.cons_6t_betain,
        cons_6t_sle3s: found.cons_6t_sle3s,
      });
    }
  };

  // Auto-fill when existing Technology is picked from inline field
  const handleTechSelect = (val) => {
    handleTechnologyAutoFill(val);
  };

  const handleFinish = (values) => {
    const sanitized = { ...values };

    if (sanitized.gcas) {
      sanitized.gcas = String(sanitized.gcas).trim();
    }

    if (!sanitized.tech_class) {
      sanitized.tech_class = 'Dual';
    }

    // Convert empty values to null or numbers
    Object.keys(sanitized).forEach((key) => {
      const val = sanitized[key];
      if (val === '' || val === undefined) {
        sanitized[key] = null;
      } else if (key.startsWith('bct_') || key.startsWith('cons_') || key.startsWith('act_')) {
        sanitized[key] = isNaN(Number(val)) ? null : Number(val);
      }
    });

    onOk(sanitized);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-[#002060] pb-2 border-b border-slate-100">
          <FiDatabase className="text-blue-600" size={20} />
          <span className="font-bold text-lg">Add New SKU Master</span>
        </div>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        setSelectedTech(null);
        setSelectedVariant(null);
        setGcasSearch('');
        setDescSearch('');
        setTechSearch('');
        onCancel();
      }}
      onOk={() => form.submit()}
      okText="Create"
      cancelText="Cancel"
      confirmLoading={confirmLoading}
      width={1100}
      centered
      className="premium-modal"
      styles={{ body: { padding: '20px 24px', maxHeight: '80vh', overflowY: 'auto' } }}
    >
      {/* ── Section: Technology-Based Auto-Fill & Grouping Banner ── */}
      <div className="p-4 mb-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {selectedTech && selectedTech !== '__BLANK__' && (
            <Tag color="blue" className="text-[10px] font-bold uppercase rounded-full px-2">
              Active: {selectedTech}
            </Tag>
          )}
          <div className="w-full sm:w-64">
            <div className="text-[10px] font-black uppercase text-blue-900 tracking-wider mb-1 flex items-center justify-between">
              <span>Primary: Technology Group</span>
              <span className="text-[9px] text-blue-600 font-bold">Recommended</span>
            </div>
            <Select
              placeholder="Select Technology to auto-fill..."
              className="w-full font-bold shadow-xs"
              showSearch
              allowClear
              value={selectedTech}
              onChange={handleTechnologyAutoFill}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                { value: '__BLANK__', label: ' Start Fresh / Blank (Manual Entry)' },
                ...technologySelectOptions,
              ]}
            />
          </div>

          {/* 2. SECONDARY: Optional Specific SKU Copy (Grouped by Tech) */}
          <div className="w-full sm:w-64">
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
              <span>Optional: Copy Specific SKU</span>
            </div>
            <Select
              placeholder="Or copy specific SKU..."
              className="w-full font-medium"
              showSearch
              allowClear
              value={selectedVariant}
              onChange={handleVariantCopy}
              filterOption={(input, option) =>
                (option?.searchValue ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              <Select.Option value="__BLANK__" searchValue="blank clear none">
                <span className="text-slate-400 italic">None (keep technology defaults)</span>
              </Select.Option>

              {/* Grouped by Technology */}
              {technologyGroups.techNames.map((tech) => (
                <Select.OptGroup
                  key={tech}
                  label={
                    <div className="flex items-center justify-between font-bold text-slate-700 text-xs py-0.5">
                      <span className="text-blue-700 font-bold">{tech}</span>
                      <span className="text-slate-400 font-normal text-[10px]">
                        {technologyGroups.groups[tech].length} variants
                      </span>
                    </div>
                  }
                >
                  {technologyGroups.groups[tech].map((item) => {
                    const cleanGcas = String(item.gcas || '')
                      .replace(/^'/, '')
                      .trim();
                    return (
                      <Select.Option
                        key={cleanGcas}
                        value={cleanGcas}
                        searchValue={`${cleanGcas} ${item.description || ''} ${tech}`}
                      >
                        <div className="flex items-center justify-between text-xs py-0.5">
                          <span className="font-bold text-slate-800">{cleanGcas}</span>
                          <span className="text-slate-500 truncate max-w-[170px] ml-2 font-medium">
                            {item.description || 'No Desc'}
                          </span>
                        </div>
                      </Select.Option>
                    );
                  })}
                </Select.OptGroup>
              ))}
            </Select>
          </div>
          {/* Dual Selectors: Primary (Technology) + Secondary (Specific SKU Copy) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* 1. PRIMARY: Technology Dropdown */}
          </div>
        </div>

        {/* Informative Helper Footer when Technology is Selected */}
        {selectedTech && selectedTech !== '__BLANK__' && (
          <div className="mt-3 pt-2.5 border-t border-blue-100/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Standard parameters auto-filled from Technology:{' '}
                <b className="text-blue-900">{selectedTech}</b> (
                {technologyGroups.groups[selectedTech]?.length || 0} existing variants in group).
                All values remain fully editable below.
              </span>
            </div>
            <span
              className="text-blue-600 font-bold cursor-pointer hover:underline text-[11px]"
              onClick={() => handleTechnologyAutoFill('__BLANK__')}
            >
              Clear Auto-Fill
            </span>
          </div>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ tech_class: 'Dual' }}
      >
        {/* ── Section 1: Variant Core Info ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <FiLayers className="text-blue-600" size={15} />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Variant Identification & Technology
              </span>
            </div>
            <Tag color="blue" className="text-[10px] font-semibold">
              Select from dropdown OR type manual entry freely
            </Tag>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
            {/* GCAS */}
            <Form.Item
              name="gcas"
              label={
                <span className="font-bold text-slate-700 text-xs">
                  GCAS Code <span className="text-slate-400 font-normal">(type or pick)</span>
                </span>
              }
              rules={[{ required: true, message: 'GCAS code is required' }]}
            >
              <AutoComplete
                options={gcasOptions}
                onSelect={handleGcasSelect}
                onSearch={setGcasSearch}
                placeholder="Type manual GCAS or pick..."
                className="w-full font-bold"
              >
                <Input allowClear className="font-bold h-9" />
              </AutoComplete>
            </Form.Item>

            {/* Description */}
            <Form.Item
              name="description"
              label={
                <span className="font-bold text-slate-700 text-xs">
                  Description <span className="text-slate-400 font-normal">(type or pick)</span>
                </span>
              }
            >
              <AutoComplete
                options={descOptions}
                onSelect={handleDescSelect}
                onSearch={setDescSearch}
                placeholder="Type manual description or pick..."
                className="w-full font-medium"
              >
                <Input allowClear className="h-9" />
              </AutoComplete>
            </Form.Item>

            {/* Technology */}
            <Form.Item
              name="technology"
              label={
                <span className="font-bold text-slate-700 text-xs">
                  Technology <span className="text-slate-400 font-normal">(type or pick)</span>
                </span>
              }
            >
              <AutoComplete
                options={techOptions}
                onSelect={handleTechSelect}
                onSearch={setTechSearch}
                placeholder="Type manual tech or pick..."
                className="w-full font-medium"
              >
                <Input allowClear className="h-9" />
              </AutoComplete>
            </Form.Item>

            {/* Tech Class (Tank Setup: Single vs Dual Tank) */}
            <Form.Item
              name="tech_class"
              label={
                <span className="font-bold text-slate-700 text-xs">
                  Tank Setup <span className="text-slate-400 font-normal">(Single / Dual)</span>
                </span>
              }
            >
              <Radio.Group buttonStyle="solid" className="w-full flex h-9">
                <Radio.Button
                  value="Single"
                  className="flex-1 text-center font-bold text-xs leading-8"
                >
                  Single Tank
                </Radio.Button>
                <Radio.Button
                  value="Dual"
                  className="flex-1 text-center font-bold text-xs leading-8"
                >
                  Dual Tank
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>
        </div>

        {/* ── Section 2: Batch Cycle Times (BCT) ── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FiClock className="text-amber-600" size={15} />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Batch Cycle Times (BCT)
            </span>
            <span className="text-[11px] text-slate-400 font-normal ml-1">
              (Optional — minutes)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
            <Form.Item
              name="bct_12t_fmt"
              label={<span className="font-semibold text-slate-600 text-xs">BCT 12T FMT</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="bct_12t_mmt"
              label={<span className="font-semibold text-slate-600 text-xs">BCT 12T MMT</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="bct_6t_fmt"
              label={<span className="font-semibold text-slate-600 text-xs">BCT 6T FMT</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="bct_6t_mmt"
              label={<span className="font-semibold text-slate-600 text-xs">BCT 6T MMT</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
          </div>
        </div>

        {/* ── Section 3: Tank Consumptions (12T & 6T) ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiDroplet className="text-blue-600" size={15} />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Raw Material Tank Consumption Rates
            </span>
            <span className="text-[11px] text-slate-400 font-normal ml-1">
              (Optional — kg per batch)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
            <Form.Item
              name="cons_12t_dm5500"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 12T DM5500</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="cons_12t_hc_base"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 12T HC Base</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="cons_12t_lp_base"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 12T LP Base</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="cons_6t_dm5500"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 6T DM5500</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>

            <Form.Item
              name="cons_6t_hc_base"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 6T HC Base</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="cons_6t_lp_base"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 6T LP Base</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="cons_12t_sls"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 12T SLS</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="cons_12t_betain"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 12T Betain</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>

            <Form.Item
              name="cons_12t_sle3s"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 12T SLE3S</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="cons_6t_sls"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 6T SLS</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="cons_6t_betain"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 6T Betain</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item
              name="cons_6t_sle3s"
              label={<span className="font-semibold text-slate-600 text-xs">Cons 6T SLE3S</span>}
            >
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
}

export default SKUMasterAddModal;
