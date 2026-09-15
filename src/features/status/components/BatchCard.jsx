import React from 'react';
import { Card, Typography, Tooltip, Tag } from 'antd';
import { FiCalendar, FiLayers, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const { Text } = Typography;

// Format quantity to kg and Tons
const formatQuantity = (qty) => {
  if (qty === null || qty === undefined || qty === '' || isNaN(Number(qty))) {
    return null;
  }
  const num = Number(qty);
  if (num === 0) return { kg: '0 kg', tons: '0 T', raw: 0 };
  const kg = num.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' kg';
  const tons = (num / 1000).toFixed(1) + ' T';
  return { kg, tons, raw: num };
};

const BatchCard = ({ 
  id, 
  batchId, 
  brand, 
  quantity, 
  bulkPercent, 
  gcas, 
  ph, 
  viscosity, 
  date, 
  status, 
  color, 
  index, 
  hexCode 
}) => {
  const normalizedHex = hexCode?.toLowerCase();
  const normalizedColor = color?.toLowerCase() || '';
  const isDarkBackground =
    normalizedHex === '#000000' ||
    normalizedHex === '#c00000' ||
    normalizedHex === '#1a1a1a' ||
    normalizedHex === '#ff00ff' ||
    normalizedColor.includes('black') ||
    normalizedColor.includes('red') ||
    normalizedColor.includes('dark') ||
    normalizedColor.includes('magenta') ||
    normalizedColor.includes('pink');

  const textColor = isDarkBackground ? '#ffffff' : '#0f172a';
  const subtextColor = isDarkBackground ? 'rgba(255, 255, 255, 0.75)' : 'rgba(15, 23, 42, 0.65)';
  const glassBg = isDarkBackground ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.07)';
  const glassBorder = isDarkBackground ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.12)';
  const pillBg = isDarkBackground ? 'rgba(0, 0, 0, 0.4)' : '#ffffff';
  const pillText = isDarkBackground ? '#ffffff' : '#0f172a';

  const bgHex = hexCode || (color ? color : '#3b82f6');
  const qtyData = formatQuantity(quantity);


  // Status icon
  const isApprove = status?.toLowerCase().includes('approve') || status?.toLowerCase().includes('clean');
  const isHold = status?.toLowerCase().includes('hold') || status?.toLowerCase().includes('reject');

  return (
    <Tooltip
      title={
        <div className="p-2 space-y-1 text-xs">
          <div className="font-bold text-sm border-b border-white/20 pb-1 flex justify-between gap-4">
            <span>Tank #{id}</span>
            <span>Batch: {batchId}</span>
          </div>
          <div><strong className="text-slate-300">Variant:</strong> {brand}</div>
          {qtyData && (
            <div>
              <strong className="text-slate-300">Bulk Quantity:</strong> {qtyData.kg} ({qtyData.tons})
            </div>
          )}
          {gcas && <div><strong className="text-slate-300">GCAS:</strong> {gcas}</div>}
          {ph && <div><strong className="text-slate-300">pH:</strong> {ph} | <strong className="text-slate-300">Viscosity:</strong> {viscosity}</div>}
          <div><strong className="text-slate-300">Next Tank Date:</strong> {date}</div>
          <div><strong className="text-slate-300">Status:</strong> {status}</div>
        </div>
      }
      placement="top"
      color="#0f172a"
    >
      <div
        className="w-full h-full flex flex-col justify-between rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative overflow-hidden"
        style={{
          background: `linear-gradient(155deg, ${bgHex}F2, ${bgHex})`,
          boxShadow: `0 8px 24px -4px ${bgHex}4D, 0 2px 6px -1px rgba(0, 0, 0, 0.06)`,
          border: `1.5px solid ${!isDarkBackground ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)'}`,
          color: textColor,
          minHeight: '280px',
        }}
      >
        {/* Subtle decorative glow overlay */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-20 blur-2xl"
          style={{ background: !isDarkBackground ? '#000000' : '#ffffff' }}
        />

        {/* Top Header: Tank ID + Status Badge */}
        <div className="flex items-center justify-between gap-2 z-10">
          <div 
            className="px-2.5 py-1 rounded-lg font-black text-xs tracking-wider uppercase flex items-center gap-1 shadow-sm"
            style={{ 
              backgroundColor: pillBg, 
              color: pillText,
              border: `1px solid ${glassBorder}` 
            }}
          >
            <span>#{id}</span>
          </div>

          <div
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-sm max-w-[65%] truncate"
            style={{
              backgroundColor: glassBg,
              backdropFilter: 'blur(8px)',
              color: textColor,
              border: `1px solid ${glassBorder}`
            }}
          >
            <span 
              className={`w-2 h-2 rounded-full shrink-0 ${isApprove ? 'bg-emerald-400' : isHold ? 'bg-amber-400' : 'bg-current'} animate-pulse`} 
            />
            <span className="truncate">{status}</span>
          </div>
        </div>

        {/* Middle Section: Batch ID + Full Variant Name */}
        <div className="my-3 z-10 flex flex-col items-center text-center">
          <p 
            style={{ color: subtextColor }}
            className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5"
          >
            BATCH ID
          </p>
          <div 
            className="text-2xl sm:text-3xl font-black tracking-tight font-mono mb-2"
            style={{ color: textColor }}
          >
            {batchId}
          </div>

          <p 
            style={{ color: subtextColor }}
            className="text-[10px] font-extrabold uppercase tracking-widest mb-1"
          >
            VARIANT / BRAND
          </p>
          {/* Full Variant Name without ellipsis truncation */}
          <h4
            style={{ color: textColor }}
            className="text-xs sm:text-[13px] font-bold uppercase leading-snug px-1 line-clamp-3 min-h-[38px] flex items-center justify-center"
            title={brand}
          >
            {brand}
          </h4>
        </div>

        {/* Bottom Section: Quantity Pill + Date */}
        <div className="space-y-2 z-10 mt-auto">
          {/* Quantity Box */}
          <div
            className="rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-sm"
            style={{
              backgroundColor: glassBg,
              backdropFilter: 'blur(8px)',
              border: `1px solid ${glassBorder}`,
            }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <FiLayers size={13} style={{ color: subtextColor }} className="shrink-0" />
              <span style={{ color: subtextColor }} className="text-[10px] font-extrabold uppercase tracking-wider">
                QTY:
              </span>
            </div>
            <div className="text-right">
              {qtyData ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black" style={{ color: textColor }}>
                    {qtyData.kg}
                  </span>
                  <span 
                    className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                    style={{ backgroundColor: pillBg, color: pillText }}
                  >
                    {qtyData.tons}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold" style={{ color: subtextColor }}>
                  N/A
                </span>
              )}
            </div>
          </div>

          {/* Date Section */}
          <div className="flex items-center justify-between px-1 text-[11px]">
            <span style={{ color: subtextColor }} className="flex items-center gap-1">
              <FiCalendar size={12} />
              <span>Date:</span>
            </span>
            <span className="font-bold tracking-tight" style={{ color: textColor }}>
              {date}
            </span>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default BatchCard;
