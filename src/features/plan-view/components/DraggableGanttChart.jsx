import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Typography, Tooltip, Modal, Button, message } from 'antd';
import { FiBox } from 'react-icons/fi';
import dayjs from 'dayjs';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { useUpdateGanttEditMutation } from '@/store/api/statusApi';
import { useTimeline } from '../hooks/useTimeline';
import { useTimelineScale } from '../hooks/useTimelineScale';
import { TimelineControls } from './TimelineControls';
import { ClockCircleOutlined, ControlOutlined } from '@ant-design/icons';

const { Text } = Typography;

const statusColors = {
  ready: 'bg-gradient-to-br from-blue-500 to-blue-600',
  running: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  conflict: 'bg-gradient-to-br from-rose-500 to-red-600',
  warning: 'bg-gradient-to-br from-amber-500 to-orange-500',
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

const MS_PER_5_MIN = 5 * 60 * 1000;
const snapTo5Min = (ms) => Math.round(ms / MS_PER_5_MIN) * MS_PER_5_MIN;
const formatLocalISO = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 19);
};

const fmtTime = (ms) =>
  new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
const fmtDate = (ms) =>
  new Date(ms).toLocaleDateString([], { day: '2-digit', month: 'short' });

// ─────────────────────────────────────────────
// TaskBar: Draggable Item
// ─────────────────────────────────────────────
const TaskBar = ({
  item,
  leftPct,
  widthPct,
  isDragOverlay = false,
  onTileClick,
  tankType,
  system,
}) => {
  const isNonDraggable = item.status === 'downtime' || item.status === 'washout';
  const isDowntime = item.status === 'downtime';
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,
    disabled: isNonDraggable,
  });

  const style = {
    position: 'absolute',
    left: `${leftPct}%`,
    width: `${widthPct}%`,
    top: '8px',
    height: '90px',
    transform: transform ? `translateX(${transform.x}px)` : undefined,
    opacity: isDragging && !isDragOverlay ? 0.45 : 1,
    minWidth: 55,
    // Diagonal stripe pattern + solid deep red/amber gradient for downtime blocks
    ...(isDowntime && {
      backgroundColor: '#b91c1c',
      backgroundImage:
        'repeating-linear-gradient(135deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 6px, transparent 6px, transparent 14px), linear-gradient(135deg, #c2410c 0%, #b91c1c 50%, #7f1d1d 100%)',
      zIndex: 20,
    }),
  };

  const isWashout = item.status === 'washout';

  const content = (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(isDragOverlay ? {} : listeners)}
      {...(isDragOverlay ? {} : attributes)}
      onClick={(e) => {
        e.stopPropagation();
        onTileClick?.({
          ...item,
          startMs,
          endMs,
          system,
          tankName: tankType,
        });
      }}
      style={style}
      className={`rounded-xl px-2 py-1.5 text-white shadow-lg flex flex-col justify-between z-10 border select-none overflow-hidden
        ${isDowntime ? 'border-amber-300/80 border-dashed ring-1 ring-amber-400/50 shadow-md shadow-red-900/40' : 'border-white/20'}
        ${isDowntime ? '' : (statusColors[item.status] || statusColors.ready)}
        transition-all duration-200
        ${isNonDraggable ? 'cursor-default' : 'cursor-grab'}
        ${isDragOverlay ? 'cursor-grabbing ring-4 ring-white/30 scale-[1.05]' : ''}`}
    >
      {/* Title */}
      <span className={`font-bold truncate text-[11px] leading-tight block w-full ${isDowntime ? 'text-amber-100 font-extrabold' : 'text-white'}`}>{item.title}</span>

      {!isWashout && !isDowntime && (
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

      {isDowntime && (
        <div className="flex flex-col gap-0.5 mt-0.5 min-w-0">
          <div className="flex items-center gap-1 text-[9px] opacity-95 min-w-0">
            <span className="bg-black/40 px-1 py-0.5 rounded font-mono font-bold truncate">{fmtTime(item.start)}</span>
            <span className="opacity-70 shrink-0">→</span>
            <span className="bg-black/40 px-1 py-0.5 rounded font-mono font-bold truncate">{fmtTime(item.end)}</span>
          </div>
          {item.duration != null && (
            <span className="text-[9px] font-bold text-amber-300">({item.duration}m)</span>
          )}
        </div>
      )}

      {/* Status */}
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
  );

  const startMs = item.start ?? (item.start_time ? new Date(item.start_time).getTime() : 0);
  const endMs = item.end ?? (item.end_time ? new Date(item.end_time).getTime() : 0);

  const tooltipTitle = isDowntime
    ? `DOWNTIME — ${item.reason || item.title} | ${fmtDate(startMs)} ${fmtTime(startMs)} – ${fmtTime(endMs)} | Duration: ${item.duration ?? '?'} mins | Line: ${item.line || 'All'}`
    : `${item.title} | ${item.status === 'washout' ? 'WASHOUT' : `Batch: ${item.batch}`} | ${fmtDate(startMs)} ${fmtTime(startMs)} – ${fmtDate(endMs)} ${fmtTime(endMs)}${item.status === 'washout' ? '' : ` | Tech: ${item.tech_type || (item.status === 'warning' ? 'Dual' : 'Single')}`}`;

  return isDragOverlay ? (
    content
  ) : (
    <Tooltip
      title={tooltipTitle}
      placement="top"
      color={isDowntime ? '#7f1d1d' : '#1e293b'}
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
  onTaskModified,
  isFirst,
  onTileClick,
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
        if (newStart === item.start && newEnd === item.end) return;
        // Notify parent that this batch was modified (for reset tracking)
        onTaskModified?.(item.batch, newStart, newEnd, item.start, item.end);
        onTaskUpdate({ id: item.id, batch_id: item.batch, start: newStart, end: newEnd });
      },
      [timelineStart, timelineEnd, onTaskUpdate, onTaskModified]
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
                onTileClick={onTileClick}
                tankType={tankData.tankType}
                system={system}
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
  onTaskModified,
}) => {
  const { tasksWithLanes, timeLabels, timelineStart, timelineEnd, totalDurationHrs, getPosition } =
    useTimeline(tasks, filterRange);
  const [updateGanttEdit] = useUpdateGanttEditMutation();
  const scrollRef = useRef(null);
  const isSyncingRef = useRef(false);

  const slotCount = timeLabels.slice(0, -1).length;
  const {
    effectiveSlotWidth,
    totalWidth: scaledTotalWidth,
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
    fixedLeftWidth: 240,   // w-28 (112px) + w-32 (128px)
    minSlotWidth: 50,
    initialZoom: 200,
    scrollRef,
  });

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

  // Find earliest downtime across all rows
  const firstDowntime = useMemo(() => {
    let earliest = null;
    tasksWithLanes.forEach((row) => {
      row.items?.forEach((item) => {
        if (item.status === 'downtime') {
          const startMs = item.start ?? new Date(item.start_time).getTime();
          if (!earliest || startMs < earliest.startMs) {
            earliest = { ...item, startMs };
          }
        }
      });
    });
    return earliest;
  }, [tasksWithLanes]);

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

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden w-full">
      {/* Top Toolbar: Navigation + Timeline View Controls */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 bg-slate-50/70 flex-wrap">
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

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-auto custom-scrollbar max-h-[80vh]"
      >
        <div
          style={{
            width: isFit && !isOverflowing ? '100%' : `${scaledTotalWidth}px`,
            minWidth: isFit && !isOverflowing ? '100%' : `${scaledTotalWidth}px`,
          }}
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
                style={{
                  flex: isFit && !isOverflowing ? '1 1 0%' : 'none',
                  width: isFit && !isOverflowing ? undefined : `${effectiveSlotWidth}px`,
                  minWidth: isFit && !isOverflowing ? undefined : `${effectiveSlotWidth}px`,
                }}
                className={`py-2 text-center border-r border-slate-200/50 ${
                  time.isNewDay || i === 0 ? 'bg-indigo-100/60 border-l-2 border-l-indigo-500' : ''
                }`}
              >
                <div className="text-[11px] font-black text-slate-700">{time.label}</div>
                {(time.isNewDay || i === 0) && (
                  <div className="text-[9px] font-bold text-indigo-700 tracking-tight leading-none mt-0.5">
                    {new Date(time.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                  </div>
                )}
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
                    onTaskModified={onTaskModified}
                    onTileClick={setActiveDetailItem}
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

export default DraggableGanttChart;
