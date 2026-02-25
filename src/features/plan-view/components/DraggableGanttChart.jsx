import React, { useState, useRef, useEffect } from 'react';
import { Typography, Tooltip, message } from 'antd';
import { useTimeline } from '@/hooks/useTimeline';
import { useUpdateTimelineDataMutation } from '@/store/api/statusApi';

const { Text } = Typography;

const statusColors = {
    ready: 'bg-gradient-to-r from-blue-500 to-blue-600',
    running: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    conflict: 'bg-gradient-to-r from-rose-500 to-rose-600',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600',
};

const DraggableGanttChart = ({ tasks = [], filterRange = null }) => {
    const {
        tasksWithLanes,
        timeLabels,
        timelineStart,
        timelineEnd,
        totalDurationHrs,
        getPosition,
    } = useTimeline(tasks, filterRange);

    const [updateTimelineData] = useUpdateTimelineDataMutation();
    const [draggingItem, setDraggingItem] = useState(null);
    const chartRef = useRef(null);

    const handleMouseDown = (e, item) => {
        const rect = chartRef.current.getBoundingClientRect();
        setDraggingItem({
            ...item,
            startX: e.clientX,
            originalStart: item.start,
            originalEnd: item.end,
            containerWidth: rect.width,
        });
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!draggingItem) return;

            const deltaX = e.clientX - draggingItem.startX;
            const percentDelta = (deltaX / draggingItem.containerWidth) * 100;
            const timeDelta = (percentDelta / 100) * (timelineEnd - timelineStart);

            // In a real implementation with internal state, we'd update the item's position here for smooth drag
            // For now, let's keep it simple and update on mouse up, or we can use a local state for the item
        };

        const handleMouseUp = async (e) => {
            if (!draggingItem) return;

            const deltaX = e.clientX - draggingItem.startX;
            const percentDelta = (deltaX / draggingItem.containerWidth) * 100;
            const timeDelta = (percentDelta / 100) * (timelineEnd - timelineStart);

            // nearest 5 minutes for usability
            const MS_PER_5_MIN = 5 * 60 * 1000;
            const newStartTime = new Date(Math.round((draggingItem.originalStart + timeDelta) / MS_PER_5_MIN) * MS_PER_5_MIN);
            const newEndTime = new Date(Math.round((draggingItem.originalEnd + timeDelta) / MS_PER_5_MIN) * MS_PER_5_MIN);

            try {
                await updateTimelineData({
                    id: draggingItem.id,
                    start_time: newStartTime.toISOString().slice(0, 19).replace('T', ' '),
                    end_time: newEndTime.toISOString().slice(0, 19).replace('T', ' '),
                }).unwrap();
                message.success('Time updated successfully');
            } catch (err) {
                message.error('Failed to update time');
                console.error(err);
            }

            setDraggingItem(null);
        };

        if (draggingItem) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingItem, timelineStart, timelineEnd, updateTimelineData]);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in mb-10">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <Text className="font-bold text-slate-700">Draggable Timeline (timeline_data)</Text>
                <Text type="secondary" className="text-xs">Drag bars to adjust schedule</Text>
            </div>
            <div className="overflow-auto custom-scrollbar max-h-[70vh]" ref={chartRef}>
                <div style={{ minWidth: `${Math.max(totalDurationHrs * 120, 1200)}px` }} className="relative">
                    {/* Time Header */}
                    <div className="flex border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20">
                        <div className="w-24 shrink-0 border-r border-slate-200 bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs tracking-wider sticky left-0 z-30">
                            RESOURCE
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
                                className="flex border-b border-slate-100 last:border-b-0 min-h-[140px] group"
                                style={{ height: `${Math.max(resourceRow.totalLanes * 80 + 40, 140)}px` }}
                            >
                                {/* Resource Label */}
                                <div className="w-24 shrink-0 flex items-center justify-center font-black text-slate-600 border-r border-slate-200 bg-slate-100 group-hover:bg-blue-50 transition-colors duration-300 sticky left-0 z-20">
                                    <div className="bg-white shadow-sm border border-slate-200 rounded-lg px-3 py-2 text-sm">
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
                                        {resourceRow.items.map((item) => (
                                            <Tooltip
                                                key={item.id}
                                                title={
                                                    <div className="p-1">
                                                        <div className="font-bold border-b border-white/20 mb-1">
                                                            {item.title}
                                                        </div>
                                                        <div className="text-[10px] opacity-90">
                                                            {new Date(item.start).toLocaleTimeString()} -{' '}
                                                            {new Date(item.end).toLocaleTimeString()}
                                                        </div>
                                                        <div className="text-[10px] opacity-90">
                                                            {new Date(item.start).toDateString()}
                                                        </div>
                                                    </div>
                                                }
                                                placement="top"
                                                color="#1e293b"
                                            >
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, item)}
                                                    className={`absolute rounded-xl p-3 text-white shadow-lg flex flex-col justify-center transition-all duration-150 hover:scale-[1.01] hover:shadow-2xl cursor-move z-10 border border-white/20 ${statusColors[item.status] || statusColors.ready} ${draggingItem?.id === item.id ? 'opacity-50 scale-105 z-50 ring-2 ring-white shadow-2xl' : ''}`}
                                                    style={{
                                                        left: `${getPosition(item.start)}%`,
                                                        width: `${getPosition(item.end) - getPosition(item.start)}%`,
                                                        top: `${item.laneIndex * 80}px`,
                                                        height: '70px',
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                        <Text className="text-white font-extrabold leading-tight truncate text-[13px] shrink shadow-sm">
                                                            {item.title}
                                                        </Text>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 opacity-90">
                                                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">
                                                            {item.batch}
                                                        </span>
                                                        <Text className="text-white/80 text-[11px] font-medium truncate">
                                                            {((item.end - item.start) / 3600000).toFixed(1)}h
                                                        </Text>
                                                    </div>
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
        </div>
    );
};

export default DraggableGanttChart;
