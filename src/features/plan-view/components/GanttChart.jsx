import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const hours = Array.from({ length: 24 }, (_, i) => {
    const h = (i + 5) % 24;
    return `${h}:00`;
});

const statusColors = {
    ready: 'bg-blue-500',
    running: 'bg-emerald-500',
    conflict: 'bg-rose-500',
    warning: 'bg-amber-500',
};

const GanttChart = ({ tasks }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                    {/* Time Header */}
                    <div className="flex border-b border-slate-100">
                        <div className="w-20 shrink-0 border-r border-slate-100 bg-slate-50"></div>
                        {hours.map((hour, i) => (
                            <div key={i} className="flex-1 py-3 text-center text-xs font-semibold text-slate-400 border-r border-slate-50 last:border-r-0">
                                {hour}
                            </div>
                        ))}
                    </div>

                    {/* Grid Area */}
                    <div className="relative bg-slate-50/30">
                        {tasks.map((resourceRow, rowIndex) => (
                            <div key={rowIndex} className="flex border-b border-slate-100 last:border-b-0 min-h-[100px] group">
                                {/* Resource Label */}
                                <div className="w-20 shrink-0 flex items-center justify-center font-bold text-slate-700 border-r border-slate-100 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                    {resourceRow.resource}
                                </div>

                                {/* Timeline Row */}
                                <div className="flex-1 relative p-2">
                                    {/* Placeholder Grid Lines */}
                                    <div className="absolute inset-0 flex">
                                        {hours.map((_, i) => (
                                            <div key={i} className="flex-1 border-r border-slate-100/50 last:border-r-0"></div>
                                        ))}
                                    </div>

                                    {/* Task Items */}
                                    <div className="relative h-full">
                                        {resourceRow.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`absolute top-0 bottom-0 rounded-lg p-3 text-white shadow-sm flex flex-col justify-center transition-transform hover:scale-[1.02] cursor-pointer z-10 ${statusColors[item.status]}`}
                                                style={{
                                                    left: `${(item.start / 24) * 100}%`,
                                                    width: `${(item.duration / 24) * 100}%`,
                                                }}
                                            >
                                                <div className="flex items-center justify-between gap-1">
                                                    <Text className="text-white font-bold leading-tight truncate text-xs shrink">
                                                        {item.title}
                                                    </Text>
                                                    {item.icon && <span className="text-white/80 text-xs">{item.icon}</span>}
                                                </div>
                                                <Text className="text-white/80 text-[10px] truncate">
                                                    {item.batch}
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
        </div>
    );
};

export default GanttChart;
