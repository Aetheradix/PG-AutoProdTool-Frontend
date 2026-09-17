import React, { useMemo } from 'react';
import { Typography, Tooltip } from 'antd';
import { useTimeline } from '../hooks/useTimeline';

const { Text } = Typography;

const statusColors = {
  ready: 'bg-gradient-to-r from-blue-500 to-blue-600',
  running: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
  conflict: 'bg-gradient-to-r from-rose-500 to-rose-600',
  warning: 'bg-gradient-to-r from-amber-500 to-amber-600',
  downtime: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
  washout: 'bg-gradient-to-br from-slate-600 to-slate-700',
};

const fmtTime = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
const fmtDate = (ms) => new Date(ms).toLocaleDateString([], { day: '2-digit', month: 'short' });

const GanttChart = ({ tasks = [], filterRange = null }) => {
  const { tasksWithLanes, timeLabels, timelineStart, timelineEnd, totalDurationHrs, getPosition } =
    useTimeline(tasks, filterRange);

  // --- API DATA GROUPING LOGIC ---
  const groupedData = useMemo(() => {
    const systems = {};
    const order = { '12T': 0, '6T': 1, '1.25T': 2 };

    tasksWithLanes.forEach((row) => {
      // API se aane wale resource name ko split karein (e.g., "12T / FMT")
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

  console.log('Grouped Data for Gantt Chart:', groupedData);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden w-full font-sans">
      <div className="overflow-auto custom-scrollbar max-h-[75vh]">
        <div style={{ minWidth: `${Math.max(totalDurationHrs * 200, 1200)}px` }}>
          
          {/* Timeline Header */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 sticky top-0 z-50 backdrop-blur-md">
            <div className="w-24 shrink-0 border-r border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-400 sticky left-0 z-50 bg-slate-50 uppercase tracking-widest">System</div>
            <div className="w-24 shrink-0 border-r border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-400 sticky left-[96px] z-50 bg-slate-50 uppercase tracking-widest">Tanks</div>
            {timeLabels.slice(0, -1).map((time, i) => (
              <div key={i} className="flex-1 py-4 text-center text-[11px] font-black text-slate-500 border-r border-slate-100">
                {time.label}
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
                    <div className="flex-1 relative p-3">
                      {/* Grid Vertical Lines */}
                      <div className="absolute inset-0 flex pointer-events-none opacity-5">
                        {timeLabels.map((_, i) => <div key={i} className="flex-1 border-r border-black"></div>)}
                      </div>

                      {/* Task Bars */}
                      {row.items.map((item) => {
                        const isWashout = item.status === 'washout';
                        return (
                        <Tooltip key={item.id} title={`${item.title} | ${isWashout ? 'WASHOUT' : `Batch: ${item.batch}`} | ${fmtDate(item.start)} ${fmtTime(item.start)} – ${fmtDate(item.end)} ${fmtTime(item.end)} | Status: ${item.status}`} color="#000">
                          <div
                            className={`absolute rounded-xl px-2 py-1.5 text-white shadow-lg flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer border border-white/20 overflow-hidden ${statusColors[item.status] || statusColors.ready}`}
                            style={{
                              left: `${getPosition(item.start)}%`,
                              width: `${getPosition(item.end) - getPosition(item.start)}%`,
                              top: `${item.laneIndex * 100 + 10}px`,
                              height: '90px',
                              minWidth: '45px',
                            }}
                          >
                            {/* Title */}
                            <span className="font-bold truncate text-[11px] leading-tight block w-full">{item.title}</span>

                            {!isWashout && (
                              <>
                                {/* Batch ID */}
                                <div className="flex items-center mt-0.5 min-w-0">
                                  <span className="bg-black/25 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider truncate block max-w-full">{item.batch}</span>
                                </div>

                                {/* Start & End Time */}
                                <div className="flex items-center gap-1 text-[9px] opacity-90 mt-0.5 min-w-0">
                                  <span className="bg-white/15 px-1 py-0.5 rounded font-semibold truncate max-w-[45%]">{fmtTime(item.start)}</span>
                                  <span className="opacity-70 shrink-0">→</span>
                                  <span className="bg-white/15 px-1 py-0.5 rounded font-semibold truncate max-w-[45%]">{fmtTime(item.end)}</span>
                                </div>
                              </>
                            )}

                            {/* Status */}
                            <div className="flex items-center mt-0.5 min-w-0">
                              <span className="text-[8px] uppercase bg-black/20 px-1.5 py-0.5 rounded-full font-bold tracking-widest truncate block max-w-full">{item.status}</span>
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
    </div>
  );
};

export default GanttChart;