import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Typography, Tooltip, message } from 'antd';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { useUpdateGanttEditMutation } from '@/store/api/statusApi';
import { useTimeline } from '../hooks/useTimeline';

const { Text } = Typography;

const statusColors = {
  ready:    'bg-gradient-to-r from-blue-500 to-blue-600',
  running:  'bg-gradient-to-r from-emerald-500 to-emerald-600',
  conflict: 'bg-gradient-to-r from-rose-500 to-rose-600',
  warning:  'bg-gradient-to-r from-amber-500 to-amber-600',
  downtime: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
};

const MS_PER_5_MIN = 5 * 60 * 1000;

function snapTo5Min(ms) {
  return Math.round(ms / MS_PER_5_MIN) * MS_PER_5_MIN;
}

function formatLocalISO(date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 19);
}

// ─────────────────────────────────────────────
// TaskBar — renders a single draggable task bar
// ─────────────────────────────────────────────
const TaskBar = ({ item, leftPct, widthPct, isDragOverlay = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id, data: item });

  const style = {
    position:  'absolute',
    left:      `${leftPct}%`,
    width:     `${widthPct}%`,
    top:       `${item.laneIndex * 80}px`,
    height:    '70px',
    transform: transform ? `translateX(${transform.x}px)` : undefined,
    opacity:   isDragging && !isDragOverlay ? 0.45 : 1,
    // Prevent the bar from shrinking below a visible minimum while dragging
    minWidth:  40,
  };

  const content = (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(isDragOverlay ? {} : listeners)}
      {...(isDragOverlay ? {} : attributes)}
      style={style}
      className={`
        rounded-xl p-3 text-white shadow-lg flex flex-col justify-center
        cursor-grab z-10 border border-white/20 select-none
        ${statusColors[item.status] || statusColors.ready}
        transition-[opacity,box-shadow] duration-150 hover:shadow-2xl
        ${isDragOverlay ? 'cursor-grabbing ring-2 ring-white/40 scale-[1.02]' : ''}
      `}
    >
      <div className="flex items-center justify-between gap-2 overflow-hidden pointer-events-none">
        <Text className="text-white font-extrabold leading-tight truncate text-[13px] shrink shadow-sm pointer-events-none">
          {item.title}
        </Text>
      </div>
      <div className="flex items-center gap-2 mt-1 opacity-90 pointer-events-none">
        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">
          {item.batch}
        </span>
        <Text className="text-white/80 text-[11px] font-medium truncate pointer-events-none">
          {((item.end - item.start) / 3600000).toFixed(1)}h
        </Text>
      </div>
    </div>
  );

  if (isDragOverlay) return content;

  return (
    <Tooltip
      title={
        <div className="p-1">
          <div className="font-bold border-b border-white/20 mb-1">{item.title}</div>
          <div className="text-[10px] opacity-90">
            {new Date(item.start).toLocaleTimeString()} –{' '}
            {new Date(item.end).toLocaleTimeString()}
          </div>
        </div>
      }
      placement="top"
      color="#1e293b"
    >
      {content}
    </Tooltip>
  );
};

// Lightweight clone rendered inside <DragOverlay> — no drag listeners needed
const OverlayBar = ({ item }) => (
  <TaskBar item={item} leftPct={0} widthPct={100} isDragOverlay />
);

// ─────────────────────────────────────────────
// ResourceRow
// ─────────────────────────────────────────────
const ResourceRow = ({
  resourceRow,
  timelineStart,
  timelineEnd,
  getPosition,
  onTaskUpdate,
  timeLabels,
}) => {
  const [items, setItems]     = useState(resourceRow.items);
  const [activeId, setActiveId] = useState(null);
  const rowRef = useRef(null);

  // Keep items in sync when parent data changes (e.g. after a refetch)
  useEffect(() => {
    setItems(resourceRow.items);
  }, [resourceRow.items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a small movement before activating — avoids misfire on click
      activationConstraint: { distance: 4 },
    })
  );

  const handleDragStart = useCallback(({ active }) => {
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    ({ active, delta }) => {
      setActiveId(null);

      if (!delta.x || !rowRef.current) return;

      const totalW  = rowRef.current.getBoundingClientRect().width;
      const totalMs = timelineEnd - timelineStart;
      const deltaMs = (delta.x / totalW) * totalMs;

      const item = active.data.current;

      let newStart = snapTo5Min(item.start + deltaMs);
      let newEnd   = newStart + (item.end - item.start);

      // Clamp to timeline bounds
      if (newStart < timelineStart) {
        newStart = timelineStart;
        newEnd   = newStart + (item.end - item.start);
      }
      if (newEnd > timelineEnd) {
        newEnd   = timelineEnd;
        newStart = newEnd - (item.end - item.start);
      }

      // Ignore sub-threshold movements (same guard as before)
      if (Math.abs(newStart - item.start) < MS_PER_5_MIN / 2) return;

      // Optimistic local update so the bar repositions immediately
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, start: newStart, end: newEnd } : i
        )
      );

      // Fire the API call (no domEl needed — we're using React state now)
      onTaskUpdate({ id: item.id, start: newStart, end: newEnd }, item, null);
    },
    [timelineStart, timelineEnd, onTaskUpdate]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  return (
    <div
      className="flex border-b border-slate-100 last:border-b-0 min-h-35 group"
      style={{ height: `${Math.max(resourceRow.totalLanes * 80 + 40, 140)}px` }}
    >
      {/* Resource label */}
      <div className="w-40 shrink-0 flex items-center justify-center font-black text-slate-600 border-r border-slate-200 bg-slate-100 group-hover:bg-blue-50 transition-colors duration-300 sticky left-0 z-20">
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg px-3 py-2 text-sm w-[90%] text-center truncate">
          {resourceRow.resource}
        </div>
      </div>

      {/* Timeline area */}
      <div className="flex-1 relative p-4">
        {/* Column grid lines */}
        <div className="absolute inset-0 flex pointer-events-none">
          {timeLabels.slice(0, -1).map((time, i) => (
            <div
              key={i}
              className={`flex-1 border-r border-slate-100/80 last:border-r-0 ${
                time.isNewDay ? 'border-l-2 border-l-blue-100' : ''
              }`}
            />
          ))}
        </div>

        {/* DndContext scoped per row — prevents cross-row drops */}
        <DndContext
          sensors={sensors}
          modifiers={[restrictToParentElement]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="relative h-full" ref={rowRef}>
            {items.map((item) => {
              const leftPct  = getPosition(item.start);
              const widthPct = getPosition(item.end) - getPosition(item.start);

              return (
                <TaskBar
                  key={item.id}
                  item={item}
                  leftPct={leftPct}
                  widthPct={widthPct}
                />
              );
            })}
          </div>

          {/* DragOverlay renders the floating clone while dragging */}
          <DragOverlay dropAnimation={null}>
            {activeItem ? (
              <div
                style={{
                  width:  `${getPosition(activeItem.end) - getPosition(activeItem.start)}%`,
                  height: '70px',
                  // The overlay lives outside the row's coordinate space so we
                  // size it explicitly via inline style only — no left/top needed.
                }}
              >
                <OverlayBar item={activeItem} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// DraggableGanttChart (root)
// ─────────────────────────────────────────────
const DraggableGanttChart = ({ tasks = [], filterRange = null }) => {
  const {
    tasksWithLanes,
    timeLabels,
    timelineStart,
    timelineEnd,
    totalDurationHrs,
    getPosition,
  } = useTimeline(tasks, filterRange);

  const [updateGanttEdit] = useUpdateGanttEditMutation();

  const handleTaskUpdate = useCallback(
    async (updateData, originalItem) => {
      try {
        await updateGanttEdit({
          id:         updateData.id,
          start_time: formatLocalISO(new Date(updateData.start)),
          end_time:   formatLocalISO(new Date(updateData.end)),
        });
        message.success('Time updated successfully');
      } catch (err) {
        message.error('Failed to update time');
        console.error(err);
        // Note: optimistic update was already applied in ResourceRow.
        // On error you may want to trigger a refetch / revert via your
        // RTK Query cache invalidation strategy rather than manual DOM ops.
      }
    },
    [updateGanttEdit]
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in mb-10">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <Text className="font-bold text-slate-700">Draggable Timeline (@dnd-kit)</Text>
        <Text type="secondary" className="text-xs">
          Drag bars to adjust schedule
        </Text>
      </div>

      <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-350px)] sm:max-h-[60vh] lg:max-h-[70vh]">
        <div
          style={{ minWidth: `${Math.max(totalDurationHrs * 200, 1200)}px` }}
          className="relative"
        >
          {/* Header row */}
          <div className="flex border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="w-40 shrink-0 border-r border-slate-200 bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs tracking-wider sticky left-0 z-30">
              RESOURCE
            </div>
            {timeLabels.slice(0, -1).map((time, i) => (
              <div
                key={i}
                className={`flex-1 py-4 text-center text-[11px] font-bold text-slate-500 border-r border-slate-200/50 last:border-r-0 ${
                  time.isNewDay ? 'bg-blue-50/50' : ''
                }`}
                title={time.fullDate}
              >
                {time.label}
                {time.isNewDay && (
                  <div className="text-[9px] text-blue-400 opacity-70">
                    {new Date(time.timestamp).toLocaleDateString(undefined, {
                      day:   'numeric',
                      month: 'short',
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resource rows */}
          <div className="relative bg-white">
            {tasksWithLanes.map((resourceRow, rowIndex) => (
              <ResourceRow
                key={rowIndex}
                resourceRow={resourceRow}
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
                getPosition={getPosition}
                timeLabels={timeLabels}
                onTaskUpdate={handleTaskUpdate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableGanttChart;