import React, { useMemo } from 'react';
import { Typography, Tooltip, Empty, Spin } from 'antd';
import { useTimeline } from '../../plan-view/hooks/useTimeline';
import { useGetPackingPlanQuery } from '../../../store/api/packingPlanApi';

const { Text } = Typography;

const statusColors = {
  ready: 'bg-linear-to-r from-blue-500 to-blue-600',
  running: 'bg-linear-to-r from-emerald-500 to-emerald-600',
  conflict: 'bg-linear-to-r from-rose-500 to-rose-600',
  warning: 'bg-linear-to-r from-amber-500 to-amber-600',
};

const PackingPlanGantt = ({ filterRange = null }) => {
  const { data: apiData, isLoading, isError } = useGetPackingPlanQuery({ limit: 1000 });

  const tasks = useMemo(() => {
    if (!apiData || !apiData.data) return [];

    // Group items by line
    const grouped = apiData.data.reduce((acc, item) => {
      const line = item.line || 'Unassigned';
      if (!acc[line]) acc[line] = [];
      
      acc[line].push({
        id: item.id,
        title: item.p_code || item.description || 'No Title',
        description: item.description,
        batch: item.batch_no || item.order_no,
        start_time: item.start_datetime,
        end_time: item.end_datetime,
        status: 'ready', 
        qty: item.planned_qty,
        uom: item.base_uom
      });
      return acc;
    }, {});

    return Object.entries(grouped).map(([resource, items]) => ({
      resource,
      items
    }));
  }, [apiData]);

  const {
    tasksWithLanes,
    timeLabels,
    timelineStart,
    timelineEnd,
    totalDurationHrs,
    getPosition,
  } = useTimeline(tasks, filterRange, 30);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-100 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Spin size="large" tip="Loading Packing Plan Timeline..." />
      </div>
    );
  }

  if (isError || tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
        <Empty description={isError ? "Error loading packing plan data" : "No packing plan data available"} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in mb-10 w-full">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <Text className="font-bold text-slate-700">Packing Plan Visual Timeline</Text>
        
      </div>
      <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-350px)] sm:max-h-[60vh] lg:max-h-[70vh]">
        <div style={{ minWidth: `${Math.max(totalDurationHrs * 120, 1200)}px` }}>
          {/* Time Header */}
          <div className="flex border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="w-40 shrink-0 border-r border-slate-200 bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs tracking-wider sticky left-0 z-30 uppercase">
              Line / Resource
            </div>
            {timeLabels.slice(0, -1).map((time, i) => (
              <div
                key={i}
                className={`flex-1 py-4 text-center text-[11px] font-bold text-slate-500 border-r border-slate-200/50 last:border-r-0 ${time.isNewDay ? 'bg-blue-50/50' : ''}`}
                title={time.fullDate}
              >
                {time.label}
                {time.isNewDay && (
                  <div className="text-[9px] text-blue-400 opacity-70">
                    {new Date(time.timestamp).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Grid Area */}
          <div className="relative bg-white">
            {tasksWithLanes.map((resourceRow, rowIndex) => (
              <div
                key={rowIndex}
                className="flex border-b border-slate-100 last:border-b-0 min-h-35 group"
                style={{ height: `${Math.max(resourceRow.totalLanes * 80 + 40, 140)}px` }}
              >
                {/* Resource Label */}
                <div className="w-40 shrink-0 flex items-center justify-center font-black text-slate-600 border-r border-slate-200 bg-slate-100 group-hover:bg-blue-50 transition-colors duration-300 sticky left-0 z-20">
                  <div className="bg-white shadow-sm border border-slate-200 rounded-lg px-3 py-2 text-sm w-[90%] text-center truncate">
                    {resourceRow.resource}
                  </div>
                </div>

                {/* Timeline Row */}
                <div className="flex-1 relative p-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {timeLabels.slice(0, -1).map((time, i) => (
                      <div
                        key={i}
                        className={`flex-1 border-r border-slate-100/80 last:border-r-0 ${time.isNewDay ? 'border-l-2 border-l-blue-100' : ''}`}
                      ></div>
                    ))}
                  </div>

                  {/* Task Items */}
                  <div className="relative h-full">
                    {resourceRow.items.map((item) => {
                      return (
                        <Tooltip
                          key={item.id}
                          title={
                            <div className="p-1">
                              <div className="font-bold border-b border-white/20 mb-1">
                                {item.title}
                              </div>
                              <div className="text-[10px] opacity-90 italic mb-1">
                                {item.description}
                              </div>
                              <div className="text-[10px] opacity-90">
                                <b>Start:</b> {new Date(item.start).toLocaleString()}
                              </div>
                              <div className="text-[10px] opacity-90">
                                <b>End:</b> {new Date(item.end).toLocaleString()}
                              </div>
                              <div className="mt-2 text-[10px] font-bold text-blue-200 flex justify-between">
                                <span>Batch: {item.batch}</span>
                                <span>Qty: {item.qty} {item.uom}</span>
                              </div>
                            </div>
                          }
                          placement="top"
                          color="#1e293b"
                        >
                          <div
                            className={`absolute rounded-xl p-3 text-white shadow-lg flex flex-col justify-center transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl cursor-pointer z-10 border border-white/20 ${statusColors[item.status] || statusColors.ready}`}
                            style={{
                              left: `${getPosition(item.start)}%`,
                              width: `${getPosition(item.end) - getPosition(item.start)}%`,
                              top: `${item.laneIndex * 80}px`,
                              height: '70px',
                            }}
                          >
                            <div className="flex items-center justify-between gap-2 overflow-hidden">
                              <Text className="text-white font-black leading-tight truncate text-[14px] shadow-sm uppercase tracking-tight">
                                {item.title}
                              </Text>
                              <span className="bg-white/30 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20 shrink-0">
                                {item.uom || 'UNIT'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 opacity-90">
                              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">
                                {item.batch}
                              </span>
                              <Text className="text-white/90 text-[11px] font-bold truncate">
                                {((item.end - item.start) / 3600000).toFixed(1)}h
                              </Text>
                            </div>
                            
                            {/* Visual indicator dots like in the screenshot */}
                            <div className="mt-auto pt-1 flex justify-end gap-1 opacity-40">
                              <div className="w-1 h-1 rounded-full bg-white"></div>
                              <div className="w-1 h-1 rounded-full bg-white"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                            </div>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackingPlanGantt;
