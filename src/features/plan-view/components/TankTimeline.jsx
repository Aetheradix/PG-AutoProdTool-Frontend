import React, { useMemo } from 'react';
import { Typography, Space, Tooltip } from 'antd';

const { Text } = Typography;

const productColors = {
  shampoo: 'bg-gradient-to-r from-blue-600 to-blue-700',
  conditioner: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
  premix: 'bg-gradient-to-r from-amber-500 to-amber-600',
  washout: 'bg-slate-500',
};

const TankTimeline = ({ tasks = [] }) => {
  const { timelineItems, timelineStart, timelineEnd, timeLabels, totalDurationHrs } = useMemo(() => {
    let minTime = Infinity;
    let maxTime = -Infinity;
    const allItems = [];

  

    tasks.sort((a, b) => (a.resource || "").localeCompare(b.resource || "")).forEach(resource => {
      resource.items.forEach(item => {
        const start = new Date(item.start_time).getTime();
        const end = new Date(item.end_time).getTime();
        if (start < minTime) minTime = start;
        if (end > maxTime) maxTime = end;
        allItems.push({ ...item, start, end });
      });
    });

    if (allItems.length === 0) {
      return { timelineItems: [], timelineStart: 0, timelineEnd: 0, timeLabels: [], totalDurationHrs: 1 };
    }

    const start = new Date(minTime);
    start.setMinutes(0, 0, 0);
    const timelineStart = start.getTime();

    const end = new Date(maxTime);
    end.setMinutes(0, 0, 0);
    if (end.getTime() < maxTime) {
      end.setHours(end.getHours() + 1);
    }
    const timelineEnd = end.getTime();

    const durationMs = timelineEnd - timelineStart;
    const totalDurationHrs = durationMs / (1000 * 60 * 60);

    const labels = [];
    for (let i = 0; i <= totalDurationHrs; i++) {
      const time = new Date(timelineStart + i * 3600000);
      labels.push({
        label: `${time.getHours()}:00`,
        fullDate: time.toLocaleString(),
        isNewDay: time.getHours() === 0 && i !== 0
      });
    }

    return { timelineItems: allItems, timelineStart, timelineEnd, timeLabels: labels, totalDurationHrs };
  }, [tasks]);

  const tasksWithLanes = useMemo(() => {
    return tasks.map(resourceRow => {
      const resourceItems = timelineItems
        .filter(item => resourceRow.items.some(ri => ri.id === item.id))
        .sort((a, b) => a.start - b.start);

      const lanes = [];

      const itemsWithLanes = resourceItems.map(item => {
        let laneIndex = 0;
        const itemEnd = item.end;

        while (laneIndex < lanes.length && lanes[laneIndex] > item.start) {
          laneIndex++;
        }

        if (laneIndex === lanes.length) {
          lanes.push(itemEnd);
        } else {
          lanes[laneIndex] = itemEnd;
        }

        return { ...item, laneIndex };
      });

      return { ...resourceRow, items: itemsWithLanes, totalLanes: Math.max(lanes.length, 1) };
    });
  }, [tasks, timelineItems]);

  const getPosition = (time) => {
    return ((time - timelineStart) / (timelineEnd - timelineStart)) * 100;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in mb-10">
      <div className="overflow-x-auto custom-scrollbar">
        <div style={{ minWidth: `${Math.max(totalDurationHrs * 120, 1200)}px` }}>
          {/* Time Header */}
          <div className="flex border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="w-24 shrink-0 border-r border-slate-200 bg-slate-100/50 flex items-center justify-center font-bold text-slate-500 text-xs tracking-wider">
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
                    {new Date(timelineStart + i * 3600000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
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
                className="flex border-b border-slate-100 last:border-b-0 min-h-[80px] group"
                style={{ height: `${Math.max(resourceRow.totalLanes * 50 + 30, 80)}px` }}
              >
                {/* Resource Label */}
                <div className="w-24 shrink-0 flex items-center justify-center font-black text-slate-600 border-r border-slate-200 bg-slate-50 group-hover:bg-blue-50 transition-colors duration-300">
                  <div className="bg-white shadow-sm border border-slate-200 rounded-lg px-2 py-1 text-[11px] sticky top-20">
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
                            className="font-extrabold truncate text-[11px] !text-white"
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
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md"></div>
          <Text className="text-sm font-semibold text-slate-700 uppercase tracking-tight">Shampoo</Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md"></div>
          <Text className="text-sm font-semibold text-slate-700 uppercase tracking-tight">Conditioner</Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-md"></div>
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
