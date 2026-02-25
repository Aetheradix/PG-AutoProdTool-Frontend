import React, { useMemo } from 'react';
import { Typography, Space, Tooltip } from 'antd';
import { useTimeline } from '@/hooks/useTimeline';

const { Text } = Typography;

const productColors = {
  shampoo: 'bg-linear-to-r from-blue-600 to-blue-700',
  conditioner: 'bg-linear-to-r from-emerald-500 to-emerald-600',
  premix: 'bg-linear-to-r from-amber-500 to-amber-600',
  washout: 'bg-slate-500',
};

const TankTimeline = ({ tasks = [], filterRange = null }) => {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => (a.resource || "").localeCompare(b.resource || ""));
  }, [tasks]);

  const {
    tasksWithLanes,
    timeLabels,
    timelineStart,
    timelineEnd,
    totalDurationHrs,
    getPosition,
  } = useTimeline(sortedTasks, filterRange);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in mb-10">
      <div className="overflow-auto custom-scrollbar max-h-[70vh]">
        <div style={{ minWidth: `${Math.max(totalDurationHrs * 120, 1200)}px` }}>
          {/* Time Header */}
          <div className="flex border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="w-24 shrink-0 border-r border-slate-200 bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs tracking-wider sticky left-0 z-30">
              TANK ID
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
                    {new Date(time.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
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
                className="flex border-b border-slate-100 last:border-b-0 min-h-20 group"
                style={{ height: `${Math.max(resourceRow.totalLanes * 50 + 30, 80)}px` }}
              >
                {/* Resource Label */}
                <div className="w-24 shrink-0 flex items-center justify-center font-black text-slate-600 border-r border-slate-200 bg-slate-100 group-hover:bg-blue-50 transition-colors duration-300 sticky left-0 z-20">
                  <div className="bg-white shadow-sm border border-slate-200 rounded-lg px-2 py-1 text-[11px]">
                    {resourceRow.resource}
                  </div>
                </div>

                {/* Timeline Row */}
                <div className="flex-1 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {timeLabels.slice(0, -1).map((time, i) => (
                      <div
                        key={i}
                        className={`flex-1 border-r border-slate-100/50 last:border-r-0 ${time.isNewDay ? 'border-l-2 border-l-blue-100' : ''}`}
                      ></div>
                    ))}
                  </div>

                  {/* Task Items */}
                  <div className="relative h-full m-1">
                    {resourceRow.items.map((item) => (
                      <Tooltip
                        key={item.id}
                        title={
                          <div className="p-1">
                            <div className="font-bold border-b border-white/20 mb-1">{item.title}</div>
                            <div className="text-[10px] opacity-90">
                              {new Date(item.start).toLocaleTimeString()} - {new Date(item.end).toLocaleTimeString()}
                            </div>
                          </div>
                        }
                        placement="top"
                        color="#1e293b"
                      >
                        <div
                          className={`absolute rounded-lg p-2 text-white shadow-md flex items-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer z-10 border border-white/10 ${productColors[item.type] || 'bg-slate-400'}`}
                          style={{
                            left: `${getPosition(item.start)}%`,
                            width: `${getPosition(item.end) - getPosition(item.start)}%`,
                            top: `${item.laneIndex * 50}px`,
                            height: '40px'
                          }}
                        >
                          <Text
                            className="font-extrabold truncate text-[11px] text-white!"
                          >
                            {item.title}
                          </Text>
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-center gap-10">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 shadow-md"></div>
          <Text className="text-sm font-semibold text-slate-700 uppercase tracking-tight">Shampoo</Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 shadow-md"></div>
          <Text className="text-sm font-semibold text-slate-700 uppercase tracking-tight">Conditioner</Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-linear-to-br from-amber-500 to-amber-600 shadow-md"></div>
          <Text className="text-sm font-semibold text-slate-700 uppercase tracking-tight">Premix</Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-slate-200 border border-slate-300 shadow-inner"></div>
          <Text className="text-sm font-semibold text-slate-700 uppercase tracking-tight">Washout</Text>
        </div>
      </div>
    </div>
  );
};

export default TankTimeline;
