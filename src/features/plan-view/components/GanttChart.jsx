import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Typography, Tooltip, Modal, Button } from 'antd';
import { FiBox } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useTimeline } from '../hooks/useTimeline';
import { useTimelineScale } from '../hooks/useTimelineScale';
import { TimelineControls } from './TimelineControls';

const { Text } = Typography;

const statusColors = {
  ready: 'bg-gradient-to-r from-blue-500 to-blue-600',
  running: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
  conflict: 'bg-gradient-to-r from-rose-500 to-rose-600',
  warning: 'bg-gradient-to-r from-amber-500 to-amber-600',
  downtime: 'bg-gradient-to-br from-orange-500 to-red-600',
  washout: 'bg-gradient-to-br from-slate-600 to-slate-700',
};

const statusBadgeColors = {
  ready: 'bg-blue-100 text-blue-700 border-blue-300',
  running: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  conflict: 'bg-rose-100 text-rose-700 border-rose-300',
  warning: 'bg-amber-100 text-amber-700 border-amber-300',
  downtime: 'bg-red-100 text-red-700 border-red-300',
  washout: 'bg-slate-100 text-slate-700 border-slate-300',
};

const fmtTime = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
const fmtDate = (ms) => new Date(ms).toLocaleDateString([], { day: '2-digit', month: 'short' });

const GanttChart = ({ tasks = [], filterRange = null }) => {
  const scrollRef = useRef(null);
  const { tasksWithLanes, timeLabels, timelineStart, timelineEnd, totalDurationHrs, getPosition } =
    useTimeline(tasks, filterRange);

  const slotCount = timeLabels.slice(0, -1).length;
  const {
    effectiveSlotWidth,
    totalWidth,
    isOverflowing,
    isFit,
    zoomIn,
    zoomOut,
    zoomFit,
    canZoomIn,
    canZoomOut,
    zoomLevelDisplay,
  } = useTimelineScale({
    slotCount,
    fixedLeftWidth: 192,
    minSlotWidth: 50,
    initialZoom: 200,
    scrollRef,
  });

  // --- API DATA GROUPING LOGIC ---
  const groupedData = useMemo(() => {
    const systems = {};
    const order = { '12T': 0, '6T': 1, '1.25T': 2 };

    tasksWithLanes.forEach((row) => {
      const [sys, tank] = row.resource.split('/').map(s => s.trim());
      
      if (!systems[sys]) {
        systems[sys] = { name: sys, rows: [] };
      }
      systems[sys].rows.push({
        tankName: tank || 'N/A',
        items: row.items,
        totalLanes: row.totalLanes
      });
    });

    return Object.values(systems).sort((a, b) => (order[a.name] ?? 99) - (order[b.name] ?? 99));
  }, [tasksWithLanes]);

  // Find earliest downtime across all rows
  const firstDowntime = useMemo(() => {
    let earliest = null;
    groupedData.forEach(sys => {
      sys.rows.forEach(row => {
        row.items.forEach(item => {
          if (item.status === 'downtime') {
            const startMs = item.start ?? new Date(item.start_time).getTime();
            if (!earliest || startMs < earliest.startMs) {
              earliest = { ...item, startMs };
            }
          }
        });
      });
    });
    return earliest;
  }, [groupedData]);

  // Active item for Detail Modal
  const [activeDetailItem, setActiveDetailItem] = useState(null);

  const jumpToDowntime = useCallback(() => {
    if (!firstDowntime || !scrollRef.current || timelineEnd === timelineStart) return;
    const pct = (firstDowntime.startMs - timelineStart) / (timelineEnd - timelineStart);
    const scrollableW = scrollRef.current.scrollWidth;
    const scrollTo = pct * scrollableW - scrollRef.current.clientWidth / 2;
    scrollRef.current.scrollTo({ left: Math.max(0, scrollTo), behavior: 'smooth' });
  }, [firstDowntime, timelineStart, timelineEnd]);

  const jumpToStart = useCallback(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, []);

  console.log('GanttChart Rendered — items per row:', groupedData.map(s => ({ system: s.name, rows: s.rows.map(r => ({ tank: r.tankName, items: r.items.length, downtimes: r.items.filter(i => i.status === 'downtime').length })) })));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden w-full font-sans">
      {/* Top Toolbar: Navigation + Timeline View Controls */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-100 bg-slate-50/70 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={jumpToStart}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer"
          >
            ⏮ Start
          </button>
          {firstDowntime && (
            <button
              onClick={jumpToDowntime}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors animate-pulse cursor-pointer"
            >
              ⛔ Jump to Downtime — {fmtDate(firstDowntime.startMs)} {fmtTime(firstDowntime.startMs)}
            </button>
          )}
          {!firstDowntime && (
            <span className="text-xs text-slate-400">No downtimes planned</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <TimelineControls
            zoomLevelDisplay={zoomLevelDisplay}
            isFit={isFit}
            canZoomIn={canZoomIn}
            canZoomOut={canZoomOut}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomFit={zoomFit}
          />
          <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200/80 px-2.5 py-1 rounded-md shadow-2xs">
            {timelineStart ? `${fmtDate(timelineStart)} → ${fmtDate(timelineEnd)}` : ''}
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="overflow-auto custom-scrollbar max-h-[75vh]">
        <div
          style={{
            width: isFit && !isOverflowing ? '100%' : `${totalWidth}px`,
            minWidth: isFit && !isOverflowing ? '100%' : `${totalWidth}px`,
          }}
        >
          {/* Timeline Header */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 sticky top-0 z-50 backdrop-blur-md">
            <div className="w-24 shrink-0 border-r border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-400 sticky left-0 z-50 bg-slate-50 uppercase tracking-widest">System</div>
            <div className="w-24 shrink-0 border-r border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-400 sticky left-[96px] z-50 bg-slate-50 uppercase tracking-widest">Tanks</div>
            {timeLabels.slice(0, -1).map((time, i) => (
              <div
                key={i}
                style={{
                  flex: isFit && !isOverflowing ? '1 1 0%' : 'none',
                  width: isFit && !isOverflowing ? undefined : `${effectiveSlotWidth}px`,
                  minWidth: isFit && !isOverflowing ? undefined : `${effectiveSlotWidth}px`,
                }}
                className={`py-2 text-center border-r border-slate-100 ${
                  time.isNewDay || i === 0 ? 'bg-blue-50/70 border-l-2 border-l-blue-400' : ''
                }`}
              >
                <div className="text-[11px] font-black text-slate-600">{time.label}</div>
                {(time.isNewDay || i === 0) && (
                  <div className="text-[9px] font-bold text-blue-600 tracking-tight leading-none mt-0.5">
                    {new Date(time.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Grouped Rows */}
          {groupedData.map((system,id) => (
            <div key={id} className="flex border-b border-slate-100 last:border-b-0">
              
              {/* System Column (Merged Look) */}
              <div className="w-24 shrink-0 flex items-center justify-center font-black text-slate-700 bg-white border-r border-slate-100 sticky left-0 z-30 text-sm">
                {system.name}
              </div>

              {/* Sub-rows for Tanks */}
              <div className="flex-1">
                {system.rows.map((row, idx) => (
                  <div key={idx} className="flex border-b border-slate-50 last:border-b-0 group min-h-[110px]">
                    
                    {/* Tank Label */}
                    <div className="w-24 shrink-0 flex items-center justify-center border-r border-slate-100 bg-white sticky left-[96px] z-20">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">
                        {row.tankName}
                      </span>
                    </div>

                    {/* Timeline Grid */}
                    <div className="flex-1 relative py-2">
                      {/* Grid Vertical Lines */}
                      <div className="absolute inset-0 flex pointer-events-none opacity-5">
                        {timeLabels.slice(0, -1).map((_, i) => (
                          <div
                            key={i}
                            style={{
                              flex: isFit && !isOverflowing ? '1 1 0%' : 'none',
                              width: isFit && !isOverflowing ? undefined : `${effectiveSlotWidth}px`,
                              minWidth: isFit && !isOverflowing ? undefined : `${effectiveSlotWidth}px`,
                            }}
                            className="border-r border-black"
                          />
                        ))}
                      </div>

                      {/* Task Bars */}
                      {row.items.map((item) => {
                        const isWashout = item.status === 'washout';
                        const isDowntime = item.status === 'downtime';
                        // Compute start/end ms — prefer pre-computed, fall back to start_time string
                        const startMs = item.start ?? new Date(item.start_time).getTime();
                        const endMs   = item.end   ?? new Date(item.end_time).getTime();
                        if (isNaN(startMs) || isNaN(endMs)) return null;
                        const leftPct  = getPosition(startMs);
                        const widthPct = getPosition(endMs) - leftPct;
                        if (widthPct <= 0) return null;
                        const topPx = (item.laneIndex ?? 0) * 100 + 10;
                        return (
                          <Tooltip
                            key={item.id}
                            title={
                              isDowntime
                                ? `DOWNTIME — ${item.reason || item.title} | ${fmtDate(startMs)} ${fmtTime(startMs)} – ${fmtTime(endMs)} | Duration: ${item.duration ?? '?'} mins | Line: ${item.line || 'All'}`
                                : `${item.title} | ${isWashout ? 'WASHOUT' : `Batch: ${item.batch}`} | ${fmtDate(startMs)} ${fmtTime(startMs)} – ${fmtDate(endMs)} ${fmtTime(endMs)}${isWashout ? '' : ` | Tech: ${item.tech_type || (item.status === 'warning' ? 'Dual' : 'Single')}`}`
                            }
                            color={isDowntime ? '#7f1d1d' : '#1e293b'}
                          >
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDetailItem({
                                  ...item,
                                  startMs,
                                  endMs,
                                  system: system.name,
                                  tankName: row.tankName,
                                });
                              }}
                              className={`absolute rounded-xl px-2 py-1.5 text-white shadow-lg flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer border overflow-hidden
                                ${isDowntime ? 'border-amber-300/80 border-dashed ring-1 ring-amber-400/50 shadow-md shadow-red-900/40' : 'border-white/20'}
                                ${isDowntime ? '' : (statusColors[item.status] || statusColors.ready)}`}
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                top: `${topPx}px`,
                                height: '90px',
                                minWidth: '55px',
                                ...(isDowntime && {
                                  backgroundColor: '#b91c1c',
                                  backgroundImage:
                                    'repeating-linear-gradient(135deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 6px, transparent 6px, transparent 14px), linear-gradient(135deg, #c2410c 0%, #b91c1c 50%, #7f1d1d 100%)',
                                  zIndex: 20,
                                }),
                              }}
                            >
                              <span className={`font-bold truncate text-[11px] leading-tight block w-full ${isDowntime ? 'text-amber-100 font-extrabold' : 'text-white'}`}>{item.title}</span>

                              {!isWashout && !isDowntime && (
                                <>
                                  <div className="flex items-center mt-0.5 min-w-0">
                                    <span className="bg-black/25 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider truncate block max-w-full">{item.batch}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[9px] opacity-90 mt-0.5 min-w-0">
                                    <span className="bg-white/15 px-1 py-0.5 rounded font-semibold truncate max-w-[45%]">{fmtTime(startMs)}</span>
                                    <span className="opacity-70 shrink-0">→</span>
                                    <span className="bg-white/15 px-1 py-0.5 rounded font-semibold truncate max-w-[45%]">{fmtTime(endMs)}</span>
                                  </div>
                                </>
                              )}

                              {isDowntime && (
                                <div className="flex flex-col gap-0.5 mt-0.5 min-w-0">
                                  <div className="flex items-center gap-1 text-[9px] opacity-95 min-w-0">
                                    <span className="bg-black/40 px-1 py-0.5 rounded font-mono font-bold truncate">{fmtTime(startMs)}</span>
                                    <span className="opacity-70 shrink-0">→</span>
                                    <span className="bg-black/40 px-1 py-0.5 rounded font-mono font-bold truncate">{fmtTime(endMs)}</span>
                                  </div>
                                  {item.duration != null && (
                                    <span className="text-[9px] font-bold text-amber-300">({item.duration}m)</span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center mt-0.5 min-w-0">
                                <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-full font-black tracking-widest truncate block max-w-full ${
                                  isDowntime
                                    ? 'bg-black/50 text-amber-300 ring-1 ring-amber-400/40'
                                    : isWashout
                                    ? 'bg-black/30 text-slate-200'
                                    : item.tech_type === 'Dual' || item.status === 'warning'
                                    ? 'bg-black/30 text-amber-100 ring-1 ring-amber-300/40'
                                    : 'bg-black/25 text-white'
                                }`}>
                                  {isDowntime ? 'DOWNTIME' : isWashout ? 'WASHOUT' : (item.tech_type === 'Dual' || item.status === 'warning' ? 'DUAL' : 'SINGLE')}
                                </span>
                              </div>
                            </div>
                          </Tooltip>
                      )})}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 1.25T Empty Placeholder */}
          {!groupedData.find(s => s.name === '1.25T') && (
            <div className="flex border-b border-slate-100 h-[110px]">
              <div className="w-24 shrink-0 border-r border-slate-100 flex items-center justify-center font-bold text-slate-300 sticky left-0 bg-white">1.25T</div>
              <div className="w-24 shrink-0 border-r border-slate-100 flex items-center justify-center text-[10px] italic text-slate-200 sticky left-[96px] bg-white">No Config</div>
              <div className="flex-1 bg-slate-50/30"></div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ────────────────────────────────────────────── */}
      <Modal
        open={!!activeDetailItem}
        onCancel={() => setActiveDetailItem(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setActiveDetailItem(null)}>
            Close
          </Button>,
        ]}
        title={
          <div className="flex items-center justify-between border-b pb-2 pr-6">
            <div className="flex items-center gap-2">
              <FiBox className={`${activeDetailItem?.status === 'downtime' ? 'text-red-600' : 'text-blue-600'} text-lg`} />
              <span className="font-black text-slate-800 text-base">
                {activeDetailItem?.status === 'downtime'
                  ? `Downtime Details: ${activeDetailItem?.title || activeDetailItem?.batch}`
                  : activeDetailItem?.status === 'washout'
                  ? `Washout Details: ${activeDetailItem?.title}`
                  : `Batch Details: ${activeDetailItem?.batch || activeDetailItem?.id}`}
              </span>
            </div>
            {activeDetailItem && (
              <span
                className={`text-xs px-2 py-0.5 rounded font-black uppercase border ${
                  statusBadgeColors[activeDetailItem.status] || statusBadgeColors.ready
                }`}
              >
                {activeDetailItem.status.toUpperCase()}
              </span>
            )}
          </div>
        }
      >
        {activeDetailItem && (
          <div className="py-2 space-y-3">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Product Info</div>
              <div className="text-sm font-black text-slate-800 mt-1">
                {activeDetailItem.description || activeDetailItem.title || (activeDetailItem.status === 'downtime' ? activeDetailItem.reason : 'No Description')}
              </div>
              {activeDetailItem.status !== 'downtime' && activeDetailItem.status !== 'washout' && (
                <div className="text-xs text-blue-700 font-bold mt-0.5">
                  Product Code (P_CODE): {activeDetailItem.pCode || activeDetailItem.p_code || activeDetailItem.gcas || activeDetailItem.product_code || '—'}
                </div>
              )}
              {activeDetailItem.status === 'downtime' && (
                <div className="text-xs text-red-700 font-bold mt-0.5">
                  Target Line: {activeDetailItem.line || activeDetailItem.system || 'All Systems'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Production Line
                </span>
                <span className="text-slate-800 font-bold text-sm">
                  {activeDetailItem.system ? `${activeDetailItem.system} System` : (activeDetailItem.line || 'Unassigned')}
                </span>
                {(activeDetailItem.tank_config || activeDetailItem.tankName) && (
                  <span className="text-slate-500 ml-1">({activeDetailItem.tank_config || activeDetailItem.tankName})</span>
                )}
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Order Number
                </span>
                <span className="text-slate-800 font-bold text-sm">
                  {activeDetailItem.orderNo || activeDetailItem.order_no || activeDetailItem.order_number || activeDetailItem.batch || '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Scheduled Start
                </span>
                <span className="text-slate-800 font-bold">
                  {activeDetailItem.startMs ? dayjs(activeDetailItem.startMs).format('DD MMM YYYY, HH:mm') : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Scheduled End
                </span>
                <span className="text-slate-800 font-bold">
                  {activeDetailItem.endMs ? dayjs(activeDetailItem.endMs).format('DD MMM YYYY, HH:mm') : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Planned Quantity
                </span>
                <span className="text-emerald-700 font-black text-sm">
                  {activeDetailItem.qty != null
                    ? `${Number(activeDetailItem.qty).toLocaleString()} ${activeDetailItem.uom || 'EA'}`
                    : activeDetailItem.quantity != null
                    ? `${Number(activeDetailItem.quantity).toLocaleString()} ${activeDetailItem.uom || 'EA'}`
                    : activeDetailItem.batch_size != null
                    ? `${Number(activeDetailItem.batch_size).toLocaleString()} ${activeDetailItem.uom || 'T'}`
                    : '1 Batch'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Duration
                </span>
                <span className="text-blue-700 font-black text-sm">
                  {activeDetailItem.status === 'downtime'
                    ? `${activeDetailItem.duration || Math.round((activeDetailItem.endMs - activeDetailItem.startMs) / 60000)} Minutes`
                    : activeDetailItem.status === 'washout'
                    ? `${activeDetailItem.duration_minutes || Math.round((activeDetailItem.endMs - activeDetailItem.startMs) / 60000)} Minutes`
                    : activeDetailItem.startMs && activeDetailItem.endMs
                    ? `${((activeDetailItem.endMs - activeDetailItem.startMs) / 3600000).toFixed(1)} Hours`
                    : '—'}
                </span>
              </div>
            </div>

            {activeDetailItem.remarks && (
              <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-xs">
                <span className="text-amber-800 font-bold block">Remarks:</span>
                <span className="text-slate-700 mt-0.5 block">{activeDetailItem.remarks}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GanttChart;