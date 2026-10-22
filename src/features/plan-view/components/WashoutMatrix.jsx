import { Empty, Spin, Tabs, Tooltip, Input, Button, message } from 'antd';
import { useMemo, useState } from 'react';
import { useGetWashoutMatrixQuery, useSyncPstMatrixMutation } from '../../../store/api/statusApi';
import { FiDroplet, FiSearch, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { WashoutMatrixUploadModal } from './WashoutMatrixUploadModal';

const WASHOUT_CONFIG = {
  WASH: { label: 'WASH', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  RINSE: { label: 'WASH', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  X: { label: 'X', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  NONE: { label: 'X', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  '-': { label: '-', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
};

const MATRIX_TABS = [
  { key: 'FMT', label: 'FMT Matrix', desc: 'FMT Washout Matrix (fmt_wo_matrix)' },
  { key: 'MMT_6T', label: 'MMT 6T Matrix', desc: 'MMT 6T Washout Matrix (mmt_6t_matrix)' },
  { key: 'MMT_12T', label: 'MMT 12T Matrix', desc: 'MMT 12T Washout Matrix (mmt_12t_matrix)' },
  { key: 'PST', label: 'PST Matrix', desc: 'Combined PST Washout Matrix (pst_wo_matrix)' },
];

const Legend = () => (
  <div className="flex flex-wrap items-center gap-3 text-xs">
    {Object.entries(WASHOUT_CONFIG)
      .filter(([k]) => k !== '-' && k !== 'RINSE' && k !== 'NONE')
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

const MatrixRow = React.memo(({ srcItem, ri, targets, rowMatrix }) => {
  return (
    <tr className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
      {/* Variant Name */}
      <td
        className="sticky left-0 z-10 px-3 py-1.5 font-medium text-xs text-slate-800 bg-white border-r border-b border-slate-200 whitespace-nowrap truncate"
        style={{ minWidth: 260, maxWidth: 320 }}
        title={srcItem.desc || srcItem.gcas}
      >
        <span className="font-semibold text-slate-700">
          {srcItem.desc || srcItem.gcas}
        </span>
      </td>
      {/* MMT GCAS (displays 98677867, etc.) */}
      <td
        className="sticky left-[260px] z-10 px-3 py-1.5 font-mono font-bold text-xs text-blue-700 bg-slate-50 text-center border-r border-b border-slate-200 whitespace-nowrap"
        style={{ minWidth: 100 }}
      >
        {srcItem.gcas}
      </td>
      {/* Matrix cells with native fast tooltip */}
      {targets.map((tgt) => {
        const raw = rowMatrix?.[tgt.key];
        const type = raw ? raw.toUpperCase() : '-';
        const cfg = WASHOUT_CONFIG[type] || WASHOUT_CONFIG['-'];
        const isSelf = srcItem.key === tgt.key;
        return (
          <td
            key={tgt.key}
            className="border-b border-l border-slate-100 px-1 py-1 text-center"
            style={{ backgroundColor: isSelf ? '#f1f5f9' : raw ? cfg.bg : 'transparent' }}
            title={isSelf ? 'Same Product' : raw ? `${srcItem.desc || srcItem.gcas} → ${tgt.desc || tgt.gcas}: ${cfg.label}` : ''}
          >
            {isSelf ? (
              <span className="text-slate-300 font-black">-</span>
            ) : raw ? (
              <span
                className="inline-block px-1.5 py-0.5 rounded-sm font-black text-[9px] tracking-wide leading-tight cursor-default select-none"
                style={{
                  color: cfg.color,
                  border: `1px solid ${cfg.border}`,
                  backgroundColor: cfg.bg,
                }}
              >
                {cfg.label}
              </span>
            ) : (
              <span className="text-slate-200">.</span>
            )}
          </td>
        );
      })}
    </tr>
  );
});

const MatrixGrid = ({ rows }) => {
  const [search, setSearch] = useState('');

  const { sources, targets, matrix } = useMemo(() => {
    if (!rows || rows.length === 0) return { sources: [], targets: [], matrix: {} };
    const srcOrder = [];
    const tgtOrder = [];
    const srcSeen = new Set();
    const tgtSeen = new Set();
    const mat = {};

    rows.forEach((r) => {
      const src = String(r.source_gcas || '').trim();
      const tgt = String(r.target_gcas || '').trim();
      const desc = String(r.source_description || '').trim();
      const tgtDesc = String(r.target_description || '').trim();
      const type = String(r.washout_type || '')
        .toUpperCase()
        .trim();
      if (!src || !tgt) return;

      const srcKey = desc ? `${desc}:::${src}` : src;
      const tgtKey = tgtDesc ? `${tgtDesc}:::${tgt}` : (desc ? `${desc}:::${tgt}` : tgt);

      if (!srcSeen.has(srcKey)) {
        srcSeen.add(srcKey);
        srcOrder.push({ key: srcKey, gcas: src, desc: desc });
      }
      if (!tgtSeen.has(tgtKey)) {
        tgtSeen.add(tgtKey);
        tgtOrder.push({ key: tgtKey, gcas: tgt, desc: tgtDesc || desc });
      }

      if (!mat[srcKey]) mat[srcKey] = {};
      mat[srcKey][tgtKey] = type || 'X';
    });

    return { sources: srcOrder, targets: tgtOrder, matrix: mat };
  }, [rows]);

  const filteredSources = useMemo(() => {
    if (!search.trim()) return sources;
    const q = search.toLowerCase();
    return sources.filter(
      (s) => s.gcas.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
    );
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
          placeholder="Filter by GCAS or variant name..."
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

      <div
        className="overflow-auto rounded-lg border border-slate-200 shadow-sm max-h-[65vh]"
        style={{ transform: 'translateZ(0)', willChange: 'scroll-position' }}
      >
        <table className="border-collapse text-xs min-w-full">
          <thead className="sticky top-0 z-20 shadow-sm">
            <tr>
              <th
                className="sticky left-0 z-30 bg-[#002060] text-white px-3 py-2 text-left font-bold text-xs uppercase tracking-wider whitespace-nowrap"
                style={{ minWidth: 260, maxWidth: 320 }}
              >
                Variant Name (Product Description)
              </th>
              <th
                className="sticky left-[260px] z-30 bg-[#001848] text-white px-3 py-2 text-center font-black text-xs tracking-wider whitespace-nowrap border-r border-blue-900"
                style={{ minWidth: 100 }}
              >
                MMT GCAS
              </th>
              {targets.map((tgt) => (
                <th
                  key={tgt.key}
                  className="bg-[#002060] text-white px-2 py-2 font-bold text-[10px] whitespace-nowrap text-center border-l border-blue-900/40"
                  style={{ minWidth: 80 }}
                  title={tgt.desc ? `${tgt.desc} (GCAS: ${tgt.gcas})` : tgt.gcas}
                >
                  <div className="flex flex-col items-center leading-tight">
                    <span className="font-mono text-xs text-blue-200 font-black">{tgt.gcas}</span>
                    {tgt.desc && (
                      <span className="text-[9px] font-normal text-slate-300 max-w-[75px] truncate">
                        {tgt.desc.split('\n')[0].slice(0, 16)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSources.map((srcItem, ri) => (
              <MatrixRow
                key={srcItem.key}
                srcItem={srcItem}
                ri={ri}
                targets={targets}
                rowMatrix={matrix[srcItem.key]}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WashoutMatrix = () => {
  const { data, isLoading, error, refetch } = useGetWashoutMatrixQuery();
  const [syncPstMatrix, { isLoading: isSyncingPst }] = useSyncPstMatrixMutation();
  const [activeMatrix, setActiveMatrix] = useState('FMT');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const handleSyncPst = async () => {
    try {
      const res = await syncPstMatrix().unwrap();
      message.success(res?.message || 'PST Matrix synchronized successfully!');
      refetch();
    } catch (err) {
      console.error('PST sync error:', err);
      message.error(err?.data?.detail || 'Failed to synchronize PST Matrix.');
    }
  };

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
              Source to Target GCAS washout rules across FMT, MMT (6T/12T), and combined PST
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Legend />
          <Button
            icon={<FiRefreshCw className={isSyncingPst ? 'animate-spin' : ''} size={13} />}
            onClick={handleSyncPst}
            loading={isSyncingPst}
            className="border-slate-300 text-slate-700 hover:text-blue-700 font-semibold text-xs flex items-center gap-1.5 h-8 rounded-lg"
          >
            Sync PST Matrix
          </Button>
          <Button
            type="primary"
            icon={<FiUpload size={14} />}
            onClick={() => setUploadModalOpen(true)}
            className="bg-[#002060] hover:bg-blue-900 border-none font-bold text-xs flex items-center gap-1.5 h-8 rounded-lg shadow-sm"
          >
            Upload Matrix
          </Button>
        </div>
      </div>
      <div className="px-6 py-5">
        <Tabs
          activeKey={activeMatrix}
          onChange={setActiveMatrix}
          size="small"
          type="card"
          destroyInactiveTabPane
          items={MATRIX_TABS.map((t) => ({
            key: t.key,
            label: (
              <span className="font-bold text-xs px-1 flex items-center gap-1.5">
                {t.label}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({(matrices[t.key] || []).length})
                </span>
              </span>
            ),
            children: activeMatrix === t.key ? (
              <div className="pt-4">
                <MatrixGrid rows={matrices[t.key] || []} />
              </div>
            ) : null,
          }))}
        />
      </div>

      <WashoutMatrixUploadModal
        visible={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        initialMatrix={activeMatrix}
        onSuccess={(matrixType) => {
          if (matrixType) setActiveMatrix(matrixType);
          refetch();
        }}
      />
    </div>
  );
};

export default WashoutMatrix;
