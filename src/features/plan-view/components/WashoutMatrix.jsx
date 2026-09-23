import { Empty, Spin, Tabs, Tooltip, Input } from 'antd';
import { useMemo, useState } from 'react';
import { useGetWashoutMatrixQuery } from '../../../store/api/statusApi';
import { FiDroplet, FiSearch } from 'react-icons/fi';

const WASHOUT_CONFIG = {
  WASH: { label: 'WASH', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  RINSE: { label: 'WASH', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  NONE: { label: 'NONE', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  '-': { label: '-', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
};

const MATRIX_TABS = [
  { key: 'FMT', label: 'FMT Matrix', desc: 'FMT Washout Matrix' },
  { key: 'MMT_6T', label: 'MMT 6T Matrix', desc: 'MMT 6T Washout Matrix' },
  { key: 'MMT_12T', label: 'MMT 12T Matrix', desc: 'MMT 12T Washout Matrix' },
  { key: 'PST', label: 'PST Matrix', desc: 'PST (Post-Storage Tank) Washout Matrix' },
];

const Legend = () => (
  <div className="flex flex-wrap items-center gap-3 text-xs">
    {Object.entries(WASHOUT_CONFIG)
      .filter(([k]) => k !== '-' && k !== 'RINSE')
      .map(([key, cfg]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className="inline-block w-4 h-4 rounded-sm border"
            style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
          />
          <span className="font-bold" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
      ))}
  </div>
);

const MatrixGrid = ({ rows }) => {
  const [search, setSearch] = useState('');

  const { sources, targets, matrix } = useMemo(() => {
    if (!rows || rows.length === 0) return { sources: [], targets: [], matrix: {} };
    const srcSet = new Set();
    const tgtSet = new Set();
    const mat = {};
    rows.forEach((r) => {
      const src = String(r.source_gcas || '').trim();
      const tgt = String(r.target_gcas || '').trim();
      const type = String(r.washout_type || '')
        .toUpperCase()
        .trim();
      if (!src || !tgt) return;
      srcSet.add(src);
      tgtSet.add(tgt);
      if (!mat[src]) mat[src] = {};
      mat[src][tgt] = type || 'NONE';
    });
    return { sources: [...srcSet].sort(), targets: [...tgtSet].sort(), matrix: mat };
  }, [rows]);

  const filteredSources = useMemo(() => {
    if (!search.trim()) return sources;
    const q = search.toLowerCase();
    return sources.filter((s) => s.toLowerCase().includes(q));
  }, [sources, search]);

  if (!sources.length)
    return (
      <div className="flex justify-center py-16">
        <Empty description="No matrix data available" />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          prefix={<FiSearch className="text-slate-400" size={13} />}
          placeholder="Filter by source GCAS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="max-w-xs h-9 rounded-md border-slate-300 text-sm font-medium"
        />
        <div className="flex gap-4 text-xs text-slate-500 font-medium">
          <span>
            <b className="text-slate-700">{filteredSources.length}</b> sources
          </span>
          <span>
            <b className="text-slate-700">{targets.length}</b> targets
          </span>
          <span>
            <b className="text-slate-700">{rows.length}</b> rules
          </span>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-slate-200 shadow-sm max-h-[65vh]">
        <table className="border-collapse text-xs font-mono min-w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              <th
                className="sticky left-0 z-20 bg-[#002060] text-white px-3 py-2 text-center font-black text-[10px] tracking-widest uppercase whitespace-nowrap"
                style={{ minWidth: 130 }}
              >
                SRC \ TGT
              </th>
              {targets.map((tgt) => (
                <th
                  key={tgt}
                  className="bg-[#002060] text-white px-2 py-2 font-bold text-[10px] whitespace-nowrap text-center border-l border-blue-900/40"
                  style={{ minWidth: 70 }}
                >
                  <Tooltip title={tgt}>
                    <span>{tgt.length > 10 ? tgt.slice(0, 9) + '...' : tgt}</span>
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSources.map((src, ri) => (
              <tr key={src} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                <td className="sticky left-0 z-10 px-3 py-1.5 font-black text-[11px] text-slate-700 bg-slate-100 border-r border-b border-slate-200 whitespace-nowrap">
                  <Tooltip title={src}>
                    <span>{src.length > 16 ? src.slice(0, 15) + '...' : src}</span>
                  </Tooltip>
                </td>
                {targets.map((tgt) => {
                  const raw = matrix[src]?.[tgt];
                  const type = raw ? raw.toUpperCase() : '-';
                  const cfg = WASHOUT_CONFIG[type] || WASHOUT_CONFIG['-'];
                  const isSelf = src === tgt;
                  return (
                    <td
                      key={tgt}
                      className="border-b border-l border-slate-100 px-1 py-1 text-center"
                      style={{ backgroundColor: isSelf ? '#f1f5f9' : raw ? cfg.bg : 'transparent' }}
                    >
                      {isSelf ? (
                        <span className="text-slate-300 font-black">-</span>
                      ) : raw ? (
                        <Tooltip title={`${src} to ${tgt}: ${cfg.label}`}>
                          <span
                            className="inline-block px-1.5 py-0.5 rounded-sm font-black text-[9px] tracking-wide leading-tight cursor-default"
                            style={{
                              color: cfg.color,
                              border: `1px solid ${cfg.border}`,
                              backgroundColor: cfg.bg,
                            }}
                          >
                            {cfg.label}
                          </span>
                        </Tooltip>
                      ) : (
                        <span className="text-slate-200">.</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WashoutMatrix = () => {
  const { data, isLoading, error } = useGetWashoutMatrixQuery();
  const [activeMatrix, setActiveMatrix] = useState('FMT');

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" tip="Loading Washout Matrix..." />
      </div>
    );

  if (error)
    return (
      <div className="p-10">
        <Empty description="Error loading Washout Matrix data" />
      </div>
    );

  const matrices = data?.data || {};

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <FiDroplet className="text-blue-600" size={18} />
          </div>
          <div>
            <h2 className="m-0 text-base font-black text-[#002060] uppercase tracking-tight">
              Washout Matrix
            </h2>
            <p className="m-0 text-xs text-slate-400 font-medium mt-0.5">
              Source to Target GCAS washout rules
            </p>
          </div>
        </div>
        <Legend />
      </div>
      <div className="px-6 py-5">
        <Tabs
          activeKey={activeMatrix}
          onChange={setActiveMatrix}
          size="small"
          type="card"
          items={MATRIX_TABS.map((t) => ({
            key: t.key,
            label: <span className="font-bold text-xs px-1">{t.label}</span>,
            children: (
              <div className="pt-4">
                <MatrixGrid rows={matrices[t.key] || []} />
              </div>
            ),
          }))}
        />
      </div>
    </div>
  );
};

export default WashoutMatrix;
