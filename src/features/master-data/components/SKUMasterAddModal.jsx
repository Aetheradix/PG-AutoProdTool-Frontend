import React, { useMemo, useState } from 'react';
import { Modal, Form, Input, Select, Radio, AutoComplete, Tag } from 'antd';
import { FiCopy, FiDatabase, FiLayers, FiClock, FiDroplet, FiEdit3 } from 'react-icons/fi';

export function SKUMasterAddModal({
  open,
  onCancel,
  onOk,
  confirmLoading,
  dataSource = [],
}) {
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Search filter text states for dynamic "Add custom" dropdown options
  const [gcasSearch, setGcasSearch] = useState('');
  const [descSearch, setDescSearch] = useState('');
  const [techSearch, setTechSearch] = useState('');

  // Extract distinct clean options from dataSource
  const { rawGcasList, rawDescList, rawTechList, variantOptions } = useMemo(() => {
    const gcasSet = new Set();
    const descSet = new Set();
    const techSet = new Set();
    const variants = [];

    dataSource.forEach((item) => {
      const cleanGcas = String(item.gcas || '').replace(/^'/, '').trim();
      if (cleanGcas) {
        gcasSet.add(cleanGcas);
        variants.push({
          value: cleanGcas,
          rawGcas: item.gcas,
          label: `${cleanGcas} — ${item.description || 'No Desc'} (${item.technology || 'N/A'} • ${item.tech_class || 'N/A'})`,
          record: item,
        });
      }
      const desc = String(item.description || '').trim();
      if (desc) descSet.add(desc);

      const tech = String(item.technology || '').trim();
      if (tech) techSet.add(tech);
    });

    return {
      rawGcasList: Array.from(gcasSet),
      rawDescList: Array.from(descSet),
      rawTechList: Array.from(techSet),
      variantOptions: variants,
    };
  }, [dataSource]);

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
              <span>Use manual entry: <b>"{gcasSearch.trim()}"</b></span>
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
              <span>Use manual entry: <b>"{descSearch.trim()}"</b></span>
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
              <span>Use manual entry: <b>"{techSearch.trim()}"</b></span>
            </div>
          ),
        },
        ...matches,
      ];
    }
    return matches;
  }, [rawTechList, techSearch]);

  // Handle template selection to auto-fill all fields
  const handleTemplateChange = (gcasVal) => {
    setSelectedTemplate(gcasVal);
    if (!gcasVal || gcasVal === '__NEW__') {
      form.resetFields();
      return;
    }
    const found = dataSource.find(
      (item) => String(item.gcas || '').replace(/^'/, '').trim() === String(gcasVal).trim()
    );
    if (found) {
      const cleanGcas = String(found.gcas || '').replace(/^'/, '').trim();
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
      (item) => String(item.gcas || '').replace(/^'/, '').trim() === cleanVal
    );
    if (found) {
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
    const found = dataSource.find((item) => String(item.description || '').trim() === String(val).trim());
    if (found) {
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

  // Auto-fill when existing Technology is picked from dropdown
  const handleTechSelect = (val) => {
    const found = dataSource.find((item) => String(item.technology || '').trim() === String(val).trim());
    if (found) {
      form.setFieldsValue({
        tech_class: found.tech_class === 'Single' ? 'Single' : 'Dual',
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

  const handleFinish = (values) => {
    const sanitized = { ...values };

    // Clean GCAS string
    if (sanitized.gcas) {
      sanitized.gcas = String(sanitized.gcas).trim();
    }

    // Default tech_class to Dual if not selected
    if (!sanitized.tech_class) {
      sanitized.tech_class = 'Dual';
    }

    // Convert empty values to null or numbers
    Object.keys(sanitized).forEach((key) => {
      const val = sanitized[key];
      if (val === '' || val === undefined) {
        sanitized[key] = null;
      } else if (
        key.startsWith('bct_') ||
        key.startsWith('cons_') ||
        key.startsWith('act_')
      ) {
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
        setSelectedTemplate(null);
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
      {/* ── Auto-fill / Template Selector Banner ── */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FiCopy size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-950 uppercase tracking-wider">
              Auto-Fill From Existing Variant
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Pick an existing SKU to pre-fill, or choose "Start With Blank" for manual entry
            </div>
          </div>
        </div>

        <Select
          placeholder="Select existing SKU to copy..."
          className="w-full sm:w-80 font-medium"
          showSearch
          allowClear
          value={selectedTemplate}
          onChange={handleTemplateChange}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={[
            { value: '__NEW__', label: '✨ + Start With Blank Variant (Manual Entry)' },
            ...variantOptions,
          ]}
        />
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
                <Radio.Button value="Single" className="flex-1 text-center font-bold text-xs leading-8">
                  Single Tank
                </Radio.Button>
                <Radio.Button value="Dual" className="flex-1 text-center font-bold text-xs leading-8">
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
            <Form.Item name="bct_12t_fmt" label={<span className="font-semibold text-slate-600 text-xs">BCT 12T FMT</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="bct_12t_mmt" label={<span className="font-semibold text-slate-600 text-xs">BCT 12T MMT</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="bct_6t_fmt" label={<span className="font-semibold text-slate-600 text-xs">BCT 6T FMT</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="bct_6t_mmt" label={<span className="font-semibold text-slate-600 text-xs">BCT 6T MMT</span>}>
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
            <Form.Item name="cons_12t_dm5500" label={<span className="font-semibold text-slate-600 text-xs">Cons 12T DM5500</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="cons_12t_hc_base" label={<span className="font-semibold text-slate-600 text-xs">Cons 12T HC Base</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="cons_12t_lp_base" label={<span className="font-semibold text-slate-600 text-xs">Cons 12T LP Base</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="cons_6t_dm5500" label={<span className="font-semibold text-slate-600 text-xs">Cons 6T DM5500</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>

            <Form.Item name="cons_6t_hc_base" label={<span className="font-semibold text-slate-600 text-xs">Cons 6T HC Base</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="cons_6t_lp_base" label={<span className="font-semibold text-slate-600 text-xs">Cons 6T LP Base</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="cons_12t_sls" label={<span className="font-semibold text-slate-600 text-xs">Cons 12T SLS</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="cons_12t_betain" label={<span className="font-semibold text-slate-600 text-xs">Cons 12T Betain</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>

            <Form.Item name="cons_12t_sle3s" label={<span className="font-semibold text-slate-600 text-xs">Cons 12T SLE3S</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="cons_6t_sls" label={<span className="font-semibold text-slate-600 text-xs">Cons 6T SLS</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="cons_6t_betain" label={<span className="font-semibold text-slate-600 text-xs">Cons 6T Betain</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
            <Form.Item name="cons_6t_sle3s" label={<span className="font-semibold text-slate-600 text-xs">Cons 6T SLE3S</span>}>
              <Input type="number" placeholder="0.0" className="rounded-lg font-mono text-sm" />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
}

export default SKUMasterAddModal;
