import React from 'react';
import { Typography, Space } from 'antd';

const { Text } = Typography;

const hours = Array.from({ length: 24 }, (_, i) => {
  const h = (i + 5) % 24;
  return `${h}:00`;
});

const productColors = {
  shampoo: 'bg-blue-600',
  conditioner: 'bg-emerald-500',
  premix: 'bg-amber-500',
  washout: 'bg-washout',
};

const TankTimeline = ({ tasks = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in mb-8">
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Time Header */}
          <div className="flex border-b border-slate-100">
            <div className="w-20 shrink-0 border-r border-slate-100 bg-slate-50"></div>
            {hours.map((hour, i) => (
              <div
                key={i}
                className="flex-1 py-3 text-center text-xs font-semibold text-slate-400 border-r border-slate-50 last:border-r-0"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Grid Area */}
          <div className="relative bg-slate-50/30">
            {tasks.map((resourceRow, rowIndex) => (
              <div
                key={rowIndex}
                className="flex border-b border-slate-100 last:border-b-0 min-h-[50px] group"
              >
                {/* Resource Label */}
                <div className="w-20 shrink-0 flex items-center justify-center font-bold text-slate-700 border-r border-slate-100 bg-slate-50 group-hover:bg-slate-100 transition-colors text-xs">
                  {resourceRow.resource}
                </div>

                {/* Timeline Row */}
                <div className="flex-1 relative">
                  {/* Placeholder Grid Lines */}
                  <div className="absolute inset-0 flex">
                    {hours.map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-slate-100/50 last:border-r-0"
                      ></div>
                    ))}
                  </div>

                  {/* Task Items */}
                  <div className="relative h-10 my-1">
                    {resourceRow.items.map((item) => (
                      <div
                        key={item.id}
                        className={`absolute top-0 bottom-0 rounded-md p-1 px-2 text-white shadow-sm flex items-center transition-transform hover:scale-[1.02] cursor-pointer z-10 ${productColors[item.type] || 'bg-slate-400'}`}
                        style={{
                          left: `${(((item.start - 5 + 24) % 24) / 24) * 100}%`,
                          width: `${(item.duration / 24) * 100}%`,
                        }}
                      >
                        <Text
                          className={`font-bold truncate text-[10px] ${item.type === 'washout' ? 'text-slate-500' : 'text-white'}`}
                        >
                          {item.title}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600 shadow-sm"></div>
          <Text className="text-xs font-medium text-slate-600">Shampoo</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500 shadow-sm"></div>
          <Text className="text-xs font-medium text-slate-600">Conditioner</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500 shadow-sm"></div>
          <Text className="text-xs font-medium text-slate-600">Premix</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-washout shadow-sm border border-slate-200"></div>
          <Text className="text-xs font-medium text-slate-600">Washout</Text>
        </div>
      </div>
    </div>
  );
};

export default TankTimeline;
