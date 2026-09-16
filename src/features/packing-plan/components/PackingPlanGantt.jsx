import React, { useMemo, useState, useRef } from 'react';
import { Typography, Tooltip, Empty, Spin, Button, Input, Select, Modal } from 'antd';
import {
  FiClock,
  FiLayers,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiSearch,
  FiBox,
} from 'react-icons/fi';
import { useGetPackingPlanQuery } from '../../../store/api/packingPlanApi';
import { combineDateAndDuration } from '@/utils/tableUtils';
import dayjs from 'dayjs';

const { Text } = Typography;

// Exact color theme requested by user
const statusColors = {
  ready: 'bg-linear-to-r from-blue-500 to-blue-600',
  running: 'bg-linear-to-r from-emerald-500 to-emerald-600',
  conflict: 'bg-linear-to-r from-rose-500 to-rose-600',
  warning: 'bg-linear-to-r from-amber-500 to-amber-600',
};

const statusBadgeColors = {
  ready: 'bg-blue-100 text-blue-700 border-blue-300',
  running: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  conflict: 'bg-rose-100 text-rose-700 border-rose-300',
  warning: 'bg-amber-100 text-amber-700 border-amber-300',
};

const LINE_METADATA = {
  INC1: { name: 'Sachet Line 1', code: 'INC1', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  INC2: { name: 'Sachet Line 2', code: 'INC2', badge: 'bg-slate-50 text-slate-700 border-slate-200' },
  INC4: { name: 'Sachet Line 4', code: 'INC4', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  INC6: { name: 'Sachet Line 6', code: 'INC6', badge: 'bg-slate-50 text-slate-700 border-slate-200' },
  INT2: { name: 'Ronchi',        code: 'INT2', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  INT3: { name: 'Tube Line 1',   code: 'INT3', badge: 'bg-slate-50 text-slate-700 border-slate-200' },
};

const getLineInfo = (rawLine) => {
  if (!rawLine) {
    return { name: 'Unassigned', code: 'UN', badge: 'bg-slate-50 text-slate-600 border-slate-200' };
  }
  const cleaned = rawLine.trim();
  if (LINE_METADATA[cleaned]) return LINE_METADATA[cleaned];
  for (const [key, meta] of Object.entries(LINE_METADATA)) {
    if (
      cleaned.toLowerCase().includes(meta.name.toLowerCase()) ||
      cleaned.toLowerCase().includes(key.toLowerCase())
    ) {
      return meta;
    }
  }
  return {
    name: cleaned,
    code: cleaned.slice(0, 4).toUpperCase(),
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
  };
};

function resolveMs(dateStr, timeStr, fallbackDate) {
  if (!dateStr && !fallbackDate) return null;
  const combined = combineDateAndDuration(dateStr || fallbackDate, timeStr);
  if (combined) {
    const t = new Date(combined).getTime();
    if (!isNaN(t)) return t;
  }
  return null;
}

const determineStatus = (item, startMs, endMs) => {
  if (item.status && statusColors[item.status.toLowerCase()]) {
    return item.status.toLowerCase();
  }
  const rem = (item.remarks || '').toLowerCase();
  if (rem.includes('conflict') || rem.includes('hold') || rem.includes('stop') || rem.includes('error') || rem.includes('breakdown')) {
    return 'conflict';
  }
  if (rem.includes('warn') || rem.includes('delay') || rem.includes('check') || rem.includes('pending') || rem.includes('wash') || rem.includes('clean')) {
    return 'warning';
  }
  const now = Date.now();
  if (startMs && endMs && now >= startMs && now <= endMs) {
    return 'running';
  }
  return 'ready';
};

const ROW_HEIGHT = 86;
const LABEL_WIDTH = 200;

const PackingPlanGantt = ({ filterRange = null }) => {
  const { data: apiData, isLoading, isError } = useGetPackingPlanQuery({ page: 1, limit: 1000 });
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedLine, setSelectedLine] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [pxPerHour, setPxPerHour] = useState(130);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDetailItem, setActiveDetailItem] = useState(null);
  const [hoveredUid, setHoveredUid] = useState(null);
  const scrollContainerRef = useRef(null);

  // 1. Process Raw Items
  const { sanitizedItems, availableDates, availableLines, stats } = useMemo(() => {
    if (!apiData?.data || !Array.isArray(apiData.data)) {
      return { sanitizedItems: [], availableDates: [], availableLines: [], stats: { batches: 0, lines: 0, qty: 0 } };
    }

    const items = [];
    const dateSet = new Set();
    const lineSet = new Set();
    let totalQty = 0;

    apiData.data.forEach((item, idx) => {
      // Filter out excel headers
      const lineStr = (item.line || '').trim();
      if (lineStr.toLowerCase().includes('production plan') && !item.p_code) return;
      if (!item.start_date && !item.p_code && !item.batch_no) return;

      let startMs = resolveMs(item.start_date, item.start_time, item.end_date);
      let endMs = resolveMs(item.end_date, item.end_time, item.start_date);

      // Handle missing or 0-duration times gracefully
      if (startMs && (!endMs || endMs <= startMs)) {
        endMs = startMs + 45 * 60 * 1000; // 45 min default duration for visual clarity
      } else if (!startMs && endMs) {
        startMs = endMs - 45 * 60 * 1000;
      }

      if (item.start_date) dateSet.add(item.start_date);
      if (item.end_date) dateSet.add(item.end_date);
      if (lineStr) lineSet.add(lineStr);

      const qtyNum = parseFloat(item.planned_qty) || 0;
      totalQty += qtyNum;

      const itemStatus = determineStatus(item, startMs, endMs);

      items.push({
        _uid: `batch-${item.id || idx}`,
        id: item.id || idx,
        batch: item.batch_no || item.order_no || `B-${idx + 1}`,
        orderNo: item.order_no || '—',
        pCode: item.p_code || '—',
        description: item.description || '',
        rawLine: lineStr || 'Unassigned',
        lineInfo: getLineInfo(lineStr),
        startDate: item.start_date,
        startTime: item.start_time,
        endDate: item.end_date,
        endTime: item.end_time,
        startMs,
        endMs,
        qty: qtyNum,
        uom: item.base_uom || 'EA',
        remarks: item.remarks || '',
        shift: item.shift || 'A',
        status: itemStatus,
      });
    });

    const sortedDates = Array.from(dateSet).sort();
    const sortedLines = Array.from(lineSet).sort();

    return {
      sanitizedItems: items,
      availableDates: sortedDates,
      availableLines: sortedLines,
      stats: {
        batches: items.length,
        lines: lineSet.size,
        qty: Math.round(totalQty),
      },
    };
  }, [apiData]);

  // 2. Timeline Boundaries & Filtered Items
  const { filteredGroups, timelineStart, timelineEnd, timeSteps, totalPxWidth } = useMemo(() => {
    if (sanitizedItems.length === 0) {
      return { filteredGroups: [], timelineStart: 0, timelineEnd: 0, timeSteps: [], totalPxWidth: 1200 };
    }

    let currentItems = sanitizedItems;

    if (selectedLine !== 'ALL') {
      currentItems = currentItems.filter((i) => i.rawLine === selectedLine || i.lineInfo.name === selectedLine);
    }

    if (selectedDay !== 'ALL') {
      currentItems = currentItems.filter((i) => i.startDate === selectedDay || i.endDate === selectedDay);
    }

    if (selectedStatus !== 'ALL') {
      currentItems = currentItems.filter((i) => i.status === selectedStatus);
    }

    // Determine Timeline Start & End
    let minMs = Infinity;
    let maxMs = -Infinity;

    if (filterRange?.start && filterRange?.end) {
      minMs = new Date(filterRange.start).getTime();
      maxMs = new Date(filterRange.end).getTime();
    } else if (selectedDay !== 'ALL') {
      const dayStart = dayjs(selectedDay).startOf('day').toDate().getTime();
      const dayEnd = dayjs(selectedDay).endOf('day').toDate().getTime();
      minMs = dayStart;
      maxMs = dayEnd;
    } else {
      currentItems.forEach((i) => {
        if (i.startMs && i.startMs < minMs) minMs = i.startMs;
        if (i.endMs && i.endMs > maxMs) maxMs = i.endMs;
      });
      if (!isFinite(minMs) || !isFinite(maxMs)) {
        minMs = Date.now();
        maxMs = minMs + 24 * 3600000;
      }
    }

    // Align bounds to full hour
    const dStart = new Date(minMs);
    dStart.setMinutes(0, 0, 0);
    const tStart = dStart.getTime();

    const dEnd = new Date(maxMs);
    dEnd.setMinutes(0, 0, 0);
    if (dEnd.getTime() < maxMs) dEnd.setHours(dEnd.getHours() + 1);
    // Add 1 hour buffer at the end
    dEnd.setHours(dEnd.getHours() + 1);
    const tEnd = dEnd.getTime();

    const totalHours = Math.max(1, (tEnd - tStart) / 3600000);
    const totalPx = Math.max(totalHours * pxPerHour, 1200);

    // Generate Hourly Steps
    const steps = [];
    for (let h = 0; h < totalHours; h++) {
      const curTime = new Date(tStart + h * 3600000);
      const isMidnight = curTime.getHours() === 0;
      const isShiftStart = curTime.getHours() === 7 || curTime.getHours() === 15 || curTime.getHours() === 23;
      steps.push({
        index: h,
        time: curTime,
        hourLabel: dayjs(curTime).format('HH:mm'),
        dateLabel: dayjs(curTime).format('DD MMM (ddd)'),
        isMidnight,
        isShiftStart,
        shiftName: curTime.getHours() === 7 ? 'Shift A' : curTime.getHours() === 15 ? 'Shift B' : curTime.getHours() === 23 ? 'Shift C' : null,
      });
    }

    // Pixel conversion
    const toPx = (ms) => {
      if (ms == null) return 0;
      return ((ms - tStart) / 3600000) * pxPerHour;
    };

    // Group items by Line with multi-lane allocation
    const groupedMap = {};
    currentItems.forEach((item) => {
      const lineKey = item.lineInfo.name;
      if (!groupedMap[lineKey]) {
        groupedMap[lineKey] = {
          lineInfo: item.lineInfo,
          rawLine: item.rawLine,
          items: [],
        };
      }
      groupedMap[lineKey].items.push(item);
    });

    const groups = Object.values(groupedMap).map((grp) => {
      const sorted = [...grp.items].sort((a, b) => (a.startMs || 0) - (b.startMs || 0));
      const laneEnds = [];

      const positioned = sorted.map((item) => {
        const left = Math.max(0, toPx(item.startMs));
        const rawWidth = item.endMs ? toPx(item.endMs) - left : 80;
        const width = Math.max(rawWidth, 75);

        let lane = 0;
        while (lane < laneEnds.length && laneEnds[lane] > (item.startMs || 0)) {
          lane++;
        }
        laneEnds[lane] = (item.endMs || item.startMs || 0) + 15 * 60 * 1000; // 15m gap buffer

        const durationHrs = item.startMs && item.endMs
          ? ((item.endMs - item.startMs) / 3600000).toFixed(1)
          : '0.8';

        return {
          ...item,
          left,
          width,
          lane,
          durationHrs,
        };
      });

      return {
        ...grp,
        items: positioned,
        totalLanes: Math.max(laneEnds.length, 1),
      };
    });

    return {
      filteredGroups: groups,
      timelineStart: tStart,
      timelineEnd: tEnd,
      timeSteps: steps,
      totalPxWidth: totalPx,
    };
  }, [sanitizedItems, selectedDay, selectedLine, selectedStatus, filterRange, pxPerHour]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[380px] bg-white rounded-none border border-slate-200 shadow-sm p-12">
        <Spin size="large" />
        <span className="text-slate-600 font-bold mt-4 tracking-wide text-sm">
          Loading Packing Plan Timeline...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-none border border-red-200 shadow-sm p-12 text-center">
        <Empty description="Failed to load packing plan timeline data. Please check backend connection." />
      </div>
    );
  }

  if (sanitizedItems.length === 0) {
    return (
      <div className="bg-white rounded-none border border-slate-200 shadow-sm p-12 text-center">
        <Empty description="No packing plan data available to display." />
      </div>
    );
  }

  const queryLower = searchQuery.toLowerCase().trim();

  return (
    <div className="bg-white border border-slate-200 shadow-xl overflow-hidden mb-10 w-full flex flex-col">
      {/* ── Header: Metrics & Color Theme Legend ────────────────────── */}
      <div className="px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Summary Metrics */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center font-black shadow-md rounded-none">
            <FiLayers size={18} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Packing Plan Visual Timeline
            </div>
            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-2 mt-0.5">
              <span className="text-blue-700 font-bold">{stats.batches} Batches</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">{stats.lines} Lines</span>
              <span>•</span>
              <span className="text-purple-700 font-bold">{stats.qty.toLocaleString()} Units</span>
            </div>
          </div>
        </div>

        {/* Right: Color Theme Legend */}
        <div className="flex items-center gap-3 flex-wrap text-xs font-bold">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Theme:</span>
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setSelectedStatus(selectedStatus === 'ready' ? 'ALL' : 'ready')}>
            <span className="w-3 h-3 rounded-full bg-linear-to-r from-blue-500 to-blue-600 inline-block shadow-sm" />
            <span className={selectedStatus === 'ready' ? 'text-blue-600 font-black underline' : 'text-slate-600'}>Ready</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setSelectedStatus(selectedStatus === 'running' ? 'ALL' : 'running')}>
            <span className="w-3 h-3 rounded-full bg-linear-to-r from-emerald-500 to-emerald-600 inline-block shadow-sm" />
            <span className={selectedStatus === 'running' ? 'text-emerald-600 font-black underline' : 'text-slate-600'}>Running</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setSelectedStatus(selectedStatus === 'conflict' ? 'ALL' : 'conflict')}>
            <span className="w-3 h-3 rounded-full bg-linear-to-r from-rose-500 to-rose-600 inline-block shadow-sm" />
            <span className={selectedStatus === 'conflict' ? 'text-rose-600 font-black underline' : 'text-slate-600'}>Conflict</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setSelectedStatus(selectedStatus === 'warning' ? 'ALL' : 'warning')}>
            <span className="w-3 h-3 rounded-full bg-linear-to-r from-amber-500 to-amber-600 inline-block shadow-sm" />
            <span className={selectedStatus === 'warning' ? 'text-amber-600 font-black underline' : 'text-slate-600'}>Warning</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Day Selector & Controls ─────────────────────────── */}
      <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
        {/* Day Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 border border-slate-200 overflow-x-auto">
          <Button
            size="small"
            type={selectedDay === 'ALL' ? 'primary' : 'text'}
            className="font-bold text-xs h-7 px-3 rounded-none"
            onClick={() => setSelectedDay('ALL')}
          >
            All Days ({availableDates.length})
          </Button>
          {availableDates.map((dateStr) => (
            <Button
              key={dateStr}
              size="small"
              type={selectedDay === dateStr ? 'primary' : 'text'}
              className="font-bold text-xs h-7 px-3 rounded-none"
              onClick={() => setSelectedDay(dateStr)}
            >
              {dayjs(dateStr).format('DD MMM (ddd)')}
            </Button>
          ))}
        </div>

        {/* Filters & Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="w-32 text-xs"
            size="middle"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ready', label: 'Ready' },
              { value: 'running', label: 'Running' },
              { value: 'conflict', label: 'Conflict' },
              { value: 'warning', label: 'Warning' },
            ]}
          />

          {/* Line Filter */}
          <Select
            value={selectedLine}
            onChange={setSelectedLine}
            className="w-44 text-xs"
            size="middle"
            options={[
              { value: 'ALL', label: 'All Production Lines' },
              ...availableLines.map((l) => ({
                value: l,
                label: getLineInfo(l).name,
              })),
            ]}
          />

          {/* Search Box */}
          <Input
            prefix={<FiSearch className="text-slate-400" />}
            placeholder="Search Batch / SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className="w-44 text-xs h-8"
          />

          {/* Zoom Buttons */}
          <div className="flex items-center border border-slate-200 bg-white">
            <Tooltip title="Compact Zoom">
              <Button
                type="text"
                size="small"
                icon={<FiZoomOut size={13} />}
                className={`h-8 w-8 ${pxPerHour === 80 ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => setPxPerHour(80)}
              />
            </Tooltip>
            <Tooltip title="Standard Zoom">
              <Button
                type="text"
                size="small"
                icon={<FiMaximize2 size={13} />}
                className={`h-8 w-8 ${pxPerHour === 130 ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => setPxPerHour(130)}
              />
            </Tooltip>
            <Tooltip title="Wide Zoom">
              <Button
                type="text"
                size="small"
                icon={<FiZoomIn size={13} />}
                className={`h-8 w-8 ${pxPerHour === 190 ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => setPxPerHour(190)}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* ── Scrollable Gantt Canvas ─────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="overflow-auto custom-scrollbar"
        style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '450px' }}
      >
        <div style={{ width: LABEL_WIDTH + totalPxWidth, position: 'relative' }}>
          {/* ── Header: Time Axis (Sticky Top) ────────────────────────── */}
          <div
            className="flex border-b-2 border-slate-300 bg-slate-100 sticky top-0 z-40 select-none shadow-sm"
            style={{ height: 52 }}
          >
            {/* Corner Label (Sticky Left & Sticky Top) */}
            <div
              className="shrink-0 flex items-center justify-center font-black text-slate-700 text-xs tracking-wider uppercase border-r-2 border-slate-300 bg-slate-200 sticky left-0 z-50 shadow-[2px_0_5px_rgba(0,0,0,0.05)]"
              style={{ width: LABEL_WIDTH }}
            >
              <div className="flex items-center gap-1.5">
                <FiClock className="text-blue-600" />
                <span>Line / Resource</span>
              </div>
            </div>

            {/* Time Ticks */}
            <div className="relative" style={{ width: totalPxWidth, flexShrink: 0 }}>
              {timeSteps.map((step) => {
                const left = step.index * pxPerHour;
                return (
                  <div
                    key={step.index}
                    className={`absolute top-0 bottom-0 border-r flex flex-col justify-between py-1.5 px-1 text-center transition-colors ${
                      step.isMidnight
                        ? 'border-blue-500 bg-blue-100/60 font-black'
                        : step.isShiftStart
                        ? 'border-slate-300 bg-slate-50 font-bold'
                        : 'border-slate-200 text-slate-500 font-semibold'
                    }`}
                    style={{ left, width: pxPerHour }}
                  >
                    {/* Top: Date / Shift Banner */}
                    <div className="text-[10px] leading-tight truncate">
                      {step.isMidnight ? (
                        <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wider">
                          {step.dateLabel}
                        </span>
                      ) : step.shiftName ? (
                        <span className="text-slate-600 font-bold text-[9px] uppercase tracking-wider">
                          {step.shiftName}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[9px]">{step.index === 0 ? step.dateLabel : ''}</span>
                      )}
                    </div>

                    {/* Bottom: Hour Time */}
                    <div
                      className={`text-[11px] font-bold ${
                        step.isMidnight ? 'text-blue-700 font-black text-xs' : 'text-slate-600'
                      }`}
                    >
                      {step.hourLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Rows: Production Lines ────────────────────────────────── */}
          {filteredGroups.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-semibold">
              No batches match the selected day, line, or status filter.
            </div>
          ) : (
            filteredGroups.map((group) => {
              const rowHeight = Math.max(group.totalLanes * ROW_HEIGHT + 20, 110);
              return (
                <div
                  key={group.lineInfo.name}
                  className="flex border-b border-slate-200 hover:bg-slate-50/40 transition-colors"
                  style={{ minHeight: rowHeight, height: rowHeight }}
                >
                  {/* Left Column: Sticky Line Header */}
                  <div
                    className="shrink-0 flex flex-col justify-center px-4 border-r-2 border-slate-300 bg-slate-50/80 sticky left-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.03)]"
                    style={{ width: LABEL_WIDTH }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <div className="font-black text-slate-800 text-sm leading-tight truncate" title={group.lineInfo.name}>
                        {group.lineInfo.name}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 rounded">
                        {group.lineInfo.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {group.items.length} {group.items.length === 1 ? 'batch' : 'batches'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Timeline Canvas with Bars */}
                  <div className="relative" style={{ width: totalPxWidth, flexShrink: 0 }}>
                    {/* Background Hour Grid Lines */}
                    {timeSteps.map((step) => {
                      const left = step.index * pxPerHour;
                      return (
                        <div
                          key={step.index}
                          className={`absolute top-0 bottom-0 pointer-events-none ${
                            step.isMidnight
                              ? 'border-r-2 border-blue-300/80 bg-blue-50/15'
                              : step.isShiftStart
                              ? 'border-r border-slate-200/90'
                              : 'border-r border-slate-100'
                          }`}
                          style={{ left, width: pxPerHour }}
                        />
                      );
                    })}

                    {/* Batch Bars using statusColors theme */}
                    {group.items.map((item) => {
                      const top = 10 + item.lane * ROW_HEIGHT;
                      const barHeight = ROW_HEIGHT - 16;
                      const isHovered = hoveredUid === item._uid;
                      const isSearched =
                        queryLower &&
                        (item.batch.toLowerCase().includes(queryLower) ||
                          item.pCode.toLowerCase().includes(queryLower) ||
                          item.description.toLowerCase().includes(queryLower));

                      const startFormatted = item.startMs ? dayjs(item.startMs).format('DD MMM, HH:mm') : '—';
                      const endFormatted = item.endMs ? dayjs(item.endMs).format('DD MMM, HH:mm') : '—';
                      const barColorClass = statusColors[item.status] || statusColors.ready;

                      return (
                        <Tooltip
                          key={item._uid}
                          color="#0f172a"
                          placement="top"
                          title={
                            <div className="p-2 min-w-[220px] text-xs">
                              <div className="flex items-center justify-between border-b border-white/20 pb-1.5 mb-2">
                                <span className="font-black text-sm text-white tracking-wide">
                                  Batch #{item.batch}
                                </span>
                                <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                                  {item.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="font-bold text-blue-200 text-xs mb-1">
                                {item.pCode} — {item.description}
                              </div>
                              <div className="grid grid-cols-2 gap-y-1 text-[11px] text-white/80 my-2">
                                <span className="text-white/50">Order No:</span>
                                <span className="font-bold">{item.orderNo}</span>
                                <span className="text-white/50">Scheduled Start:</span>
                                <span className="font-bold">{startFormatted}</span>
                                <span className="text-white/50">Scheduled End:</span>
                                <span className="font-bold">{endFormatted}</span>
                                <span className="text-white/50">Duration:</span>
                                <span className="font-bold text-amber-300">{item.durationHrs} Hours</span>
                                <span className="text-white/50">Planned Qty:</span>
                                <span className="font-bold text-emerald-300">
                                  {item.qty.toLocaleString()} {item.uom}
                                </span>
                                {item.remarks && (
                                  <>
                                    <span className="text-white/50">Remarks:</span>
                                    <span className="font-semibold text-rose-300">{item.remarks}</span>
                                  </>
                                )}
                              </div>
                              <div className="text-[10px] text-white/50 italic text-center pt-1 border-t border-white/10">
                                Click to view full details
                              </div>
                            </div>
                          }
                        >
                          <div
                            onClick={() => setActiveDetailItem(item)}
                            onMouseEnter={() => setHoveredUid(item._uid)}
                            onMouseLeave={() => setHoveredUid(null)}
                            style={{
                              left: item.left,
                              width: item.width,
                              top,
                              height: barHeight,
                            }}
                            className={`absolute rounded-xl px-3 py-1.5 cursor-pointer select-none text-white shadow-md border border-white/30 ${barColorClass} transition-all duration-150 flex flex-col justify-between overflow-hidden ${
                              isHovered
                                ? 'shadow-2xl scale-[1.02] z-30 ring-2 ring-white brightness-110'
                                : 'z-10'
                            } ${
                              isSearched
                                ? 'ring-4 ring-yellow-400 shadow-yellow-500/50 scale-[1.03] z-20 animate-pulse'
                                : ''
                            }`}
                          >
                            {/* Top Row: Batch & Line Pill */}
                            <div className="flex items-center justify-between gap-1 overflow-hidden leading-tight">
                              <span className="font-black text-xs tracking-tight truncate drop-shadow-sm">
                                {item.batch}
                              </span>
                              <span className="bg-black/25 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0">
                                {item.qty ? `${item.qty.toLocaleString()} ${item.uom}` : item.lineInfo.code}
                              </span>
                            </div>

                            {/* Middle Row: Description / P-Code */}
                            <div className="text-[11px] font-semibold text-white/90 truncate leading-tight mt-0.5">
                              {item.description || item.pCode}
                            </div>

                            {/* Bottom Row: Time and Duration */}
                            <div className="flex items-center justify-between text-[10px] text-white/80 font-bold mt-auto pt-0.5 border-t border-white/15">
                              <div className="flex items-center gap-1 truncate">
                                <FiClock size={10} className="shrink-0 text-white/70" />
                                <span className="truncate">
                                  {item.startMs ? dayjs(item.startMs).format('HH:mm') : '—'} →{' '}
                                  {item.endMs ? dayjs(item.endMs).format('HH:mm') : '—'}
                                </span>
                              </div>
                              <span className="bg-white/20 px-1 py-0.2 rounded text-[9px] font-black ml-1 shrink-0">
                                {item.durationHrs}h
                              </span>
                            </div>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
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
              <FiBox className="text-blue-600 text-lg" />
              <span className="font-black text-slate-800 text-base">
                Batch Details: {activeDetailItem?.batch}
              </span>
            </div>
            {activeDetailItem && (
              <span className={`text-xs px-2 py-0.5 rounded font-black uppercase border ${statusBadgeColors[activeDetailItem.status] || statusBadgeColors.ready}`}>
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
                {activeDetailItem.description || 'No Description'}
              </div>
              <div className="text-xs text-blue-700 font-bold mt-0.5">
                Product Code (P_CODE): {activeDetailItem.pCode}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Production Line
                </span>
                <span className="text-slate-800 font-bold text-sm">{activeDetailItem.lineInfo.name}</span>
                <span className="text-slate-500 ml-1">({activeDetailItem.lineInfo.code})</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Order Number
                </span>
                <span className="text-slate-800 font-bold text-sm">{activeDetailItem.orderNo}</span>
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
                  {activeDetailItem.qty.toLocaleString()} {activeDetailItem.uom}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Duration
                </span>
                <span className="text-blue-700 font-black text-sm">
                  {activeDetailItem.durationHrs} Hours
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

export default PackingPlanGantt;
