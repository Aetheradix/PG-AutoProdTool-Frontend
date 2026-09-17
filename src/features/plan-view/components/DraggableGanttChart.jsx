import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Typography, Tooltip, message } from 'antd';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { useUpdateGanttEditMutation } from '@/store/api/statusApi';
import { useTimeline } from '../hooks/useTimeline';
import { ClockCircleOutlined, ControlOutlined } from '@ant-design/icons';

const { Text } = Typography;

const statusColors = {
  ready: 'bg-gradient-to-br from-blue-500 to-blue-600',
  running: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  conflict: 'bg-gradient-to-br from-rose-500 to-red-600',
  warning: 'bg-gradient-to-br from-amber-500 to-orange-500',
  downtime: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
  washout: 'bg-gradient-to-br from-slate-600 to-slate-700',
};

const MS_PER_5_MIN = 5 * 60 * 1000;
const snapTo5Min = (ms) => Math.round(ms / MS_PER_5_MIN) * MS_PER_5_MIN;
const formatLocalISO = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 19);
};

// ─────────────────────────────────────────────
// TaskBar: Draggable Item
// ─────────────────────────────────────────────
const TaskBar = ({ item, leftPct, widthPct, isDragOverlay = false }) => {
  const isNonDraggable = item.status === 'downtime' || item.status === 'washout';
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,
    disabled: isNonDraggable,
  });

  const fmtTime = (ms) =>
    new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const fmtDate = (ms) =>
    new Date(ms).toLocaleDateString([], { day: '2-digit', month: 'short' });

  const style = {
    position: 'absolute',
    left: `${leftPct}%`,
    width: `${widthPct}%`,
    top: '8px',
    height: '90px',
    transform: transform ? `translateX(${transform.x}px)` : undefined,
    opacity: isDragging && !isDragOverlay ? 0.45 : 1,
    minWidth: 45,
  };

  const isWashout = item.status === 'washout';

  const content = (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(isDragOverlay ? {} : listeners)}
      {...(isDragOverlay ? {} : attributes)}
      style={style}
      className={`rounded-xl px-2 py-1.5 text-white shadow-lg flex flex-col justify-between z-10 border border-white/20 select-none overflow-hidden ${statusColors[item.status] || statusColors.ready} transition-all duration-200 ${isNonDraggable ? 'cursor-default' : 'cursor-grab'} ${isDragOverlay ? 'cursor-grabbing ring-4 ring-white/30 scale-[1.05]' : ''}`}
    >
      {/* Title */}
      <span className="font-bold truncate text-[11px] leading-tight block w-full">{item.title}</span>

      {!isWashout && (
        <>
          {/* Batch ID */}
          <div className="flex items-center mt-0.5 min-w-0">
            <span className="bg-black/25 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider truncate block max-w-full">
              {item.batch}
            </span>
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
        <span className="text-[8px] uppercase bg-black/20 px-1.5 py-0.5 rounded-full font-bold tracking-widest truncate block max-w-full">
          {item.status}
        </span>
      </div>
    </div>
  );

  return isDragOverlay ? (
    content
  ) : (
    <Tooltip
      title={`${item.title} | ${item.status === 'washout' ? 'WASHOUT' : `Batch: ${item.batch}`} | ${fmtDate(item.start)} ${fmtTime(item.start)} – ${fmtDate(item.end)} ${fmtTime(item.end)} | Status: ${item.status}`}
      placement="top"
      color="#1e293b"
    >
      {content}
    </Tooltip>
  );
};

// ─────────────────────────────────────────────
// TankRow: Sub-row for MMT, FMT, etc.
// ─────────────────────────────────────────────
const TankRow = ({
  tankData,
  system,
  timelineStart,
  timelineEnd,
  getPosition,
  onTaskUpdate,
  isFirst,
}) => {
  const rowRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    const handleDragEnd = useCallback(
      ({ active, delta }) => {
        if (!delta.x || !rowRef.current) return;
        const totalW = rowRef.current.getBoundingClientRect().width;
        const totalMs = timelineEnd - timelineStart;
        const deltaMs = (delta.x / totalW) * totalMs;
        const item = active.data.current;
        let newStart = snapTo5Min(item.start + deltaMs);
        let newEnd = newStart + (item.end - item.start);
        if (newStart < timelineStart) newStart = timelineStart;
        if (newEnd > timelineEnd) newEnd = timelineEnd;
        onTaskUpdate({ id: item.id, batch_id: item.batch, start: newStart, end: newEnd });
      },
      [timelineStart, timelineEnd, onTaskUpdate]
    );

  return (
    <div className="flex border-b border-slate-100 last:border-b-0 min-h-[110px] bg-white hover:bg-slate-50/50 transition-colors">
      {/* System Label Column (Merged visual) */}
      <div
        className={`w-28 shrink-0 flex items-center justify-center border-r border-slate-200 font-black text-slate-700 sticky left-0 z-30 bg-slate-50 ${!isFirst ? 'text-transparent border-t-0' : 'bg-blue-50/30'}`}
      >
        {system}
      </div>

      {/* Tank Label Column */}
      <div className="w-32 shrink-0 flex items-center justify-center border-r border-slate-200 font-bold text-[11px] text-slate-500 sticky left-[112px] z-20 bg-white">
        <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200 uppercase tracking-wider">
          {tankData.tankType}
        </span>
      </div>

      {/* Gantt Timeline Area */}
      <div className="flex-1 relative" ref={rowRef}>
        <DndContext
          sensors={sensors}
          modifiers={[restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <div className="relative h-full w-full">
            {tankData.items.map((item) => (
              <TaskBar
                key={item.id}
                item={item}
                leftPct={getPosition(item.start)}
                widthPct={getPosition(item.end) - getPosition(item.start)}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Chart Component
// ─────────────────────────────────────────────
const DraggableGanttChart = ({
  tasks = [],
  filterRange = null,
  synchronizedScroll = null,
  onScrollChange,
}) => {
  const { tasksWithLanes, timeLabels, timelineStart, timelineEnd, totalDurationHrs, getPosition } =
    useTimeline(tasks, filterRange);
  const [updateGanttEdit] = useUpdateGanttEditMutation();
  const scrollRef = useRef(null);
  const isSyncingRef = useRef(false);

  // --- NESTED GROUPING LOGIC ---
  const groupedData = useMemo(() => {
    const groups = {};
    const priority = { '12T': 0, '6T': 1, '1.25T': 2 };

    tasksWithLanes.forEach((row) => {
      // Expecting resource format: "12T / MMT" or "12T / FMT"
      const parts = row.resource.split('/');
      const system = parts[0]?.trim() || 'Unknown';
      const tank = parts[1]?.trim() || 'General';

      if (!groups[system]) groups[system] = [];
      groups[system].push({ tankType: tank, items: row.items });
    });

    return Object.keys(groups)
      .sort((a, b) => (priority[a] ?? 999) - (priority[b] ?? 999))
      .map((sys) => ({
        system: sys,
        tanks: groups[sys].sort((a, b) => a.tankType.localeCompare(b.tankType)),
      }));
  }, [tasksWithLanes]);

  const handleTaskUpdate = useCallback(
    async (updateData) => {
      try {
        await updateGanttEdit({
          id: updateData.batch_id || updateData.id,
          start_time: formatLocalISO(new Date(updateData.start)),
          end_time: formatLocalISO(new Date(updateData.end)),
        }).unwrap();
        message.success('Update Success');
      } catch (err) {
        message.error('Update Failed');
      }
    },
    [updateGanttEdit]
  );

  useEffect(() => {
    if (!scrollRef.current || !synchronizedScroll) return;

    const { left = 0, top = 0 } = synchronizedScroll;
    const leftDiff = Math.abs(scrollRef.current.scrollLeft - left);
    const topDiff = Math.abs(scrollRef.current.scrollTop - top);

    if (leftDiff < 1 && topDiff < 1) return;

    isSyncingRef.current = true;
    scrollRef.current.scrollTo({ left, top });

    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, [synchronizedScroll]);

  const handleScroll = useCallback(
    (event) => {
      if (isSyncingRef.current) return;
      onScrollChange?.({
        left: event.currentTarget.scrollLeft,
        top: event.currentTarget.scrollTop,
      });
    },
    [onScrollChange]
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden w-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-auto custom-scrollbar max-h-[80vh]"
      >
        <div
          style={{ minWidth: `${Math.max(totalDurationHrs * 200, 1200)}px` }}
          className="relative"
        >
          {/* Header Row */}
          <div className="flex border-b border-slate-200 bg-slate-200/80 backdrop-blur sticky top-0 z-50">
            <div className="w-28 shrink-0 border-r border-slate-300 flex items-center justify-center font-black text-[10px] text-slate-500 sticky left-0 z-[60] bg-slate-200">
              SYSTEM
            </div>
            <div className="w-32 shrink-0 border-r border-slate-300 flex items-center justify-center font-black text-[10px] text-slate-500 sticky left-[112px] z-[60] bg-slate-200">
              TANKS
            </div>
            {timeLabels.slice(0, -1).map((time, i) => (
              <div
                key={i}
                className={`flex-1 py-3 text-center text-[11px] font-black text-slate-600 border-r border-slate-200/50 ${time.isNewDay ? 'bg-indigo-100/30' : ''}`}
              >
                {time.label}
              </div>
            ))}
          </div>

          {/* Grouped Rows */}
          <div className="bg-white">
            {groupedData.map((group) => (
              <React.Fragment key={group.system}>
                {group.tanks.map((tankData, idx) => (
                  <TankRow
                    key={`${group.system}-${tankData.tankType}`}
                    system={group.system}
                    tankData={tankData}
                    isFirst={idx === 0}
                    timelineStart={timelineStart}
                    timelineEnd={timelineEnd}
                    getPosition={getPosition}
                    onTaskUpdate={handleTaskUpdate}
                  />
                ))}
                {/* System Divider */}
                <div className="h-1 bg-slate-200"></div>
              </React.Fragment>
            ))}

            {/* Auto-Placeholder for missing 1.25T */}
            {!groupedData.find((g) => g.system === '1.25T') && (
              <div className="flex border-b border-slate-200 min-h-[110px] bg-slate-50/40">
                <div className="w-28 shrink-0 border-r border-slate-200 flex items-center justify-center font-black text-slate-400 bg-slate-100 sticky left-0 z-30">
                  1.25T
                </div>
                <div className="w-32 shrink-0 border-r border-slate-200 flex items-center justify-center text-[10px] italic text-slate-300 sticky left-[112px] z-20 bg-white">
                  No Config
                </div>
                <div className="flex-1 bg-stripes-slate opacity-20"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableGanttChart;
