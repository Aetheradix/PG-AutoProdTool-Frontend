import { Empty, Spin } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetGanttEditQuery,
  useGetProductionScheduleGanttQuery,
} from '../../store/api/statusApi';
import { setActiveTab } from '../../store/slices/uiSlice';
import { exportTableToExcel } from '../../utils/exportUtils';
import PackingPlanScheduleView from '../packing-plan/components/PackingPlanScheduleView';
import DraggableGanttChart from './components/DraggableGanttChart';
import GanttChart from './components/GanttChart';
import PlanHeader from './components/PlanHeader';
import ScheduleTable from './components/ScheduleTable';
import TankTimeline from './components/TankTimeline';
import { useScheduleTable } from './hooks/useScheduleTable';


const flattenGanttResponse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  const flat = [];
  if (typeof data === 'object') {
    Object.entries(data).forEach(([key, val]) => {
      if (key === 'Tanks') return;
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          flat.push(...val);
        } else {
          Object.values(val).forEach((batches) => {
            if (Array.isArray(batches)) {
              flat.push(...batches);
            }
          });
        }
      }
    });
  }

  return flat;
};

const mapScheduleToGanttFormat = (flatData) => {
  if (!Array.isArray(flatData)) return [];

  const grouped = {
    '6T': {},
    '12T': {},
  };

  const downtimes = [];

  flatData.forEach(b => {
    if (b.description && b.description.startsWith('DOWNTIME')) {
      downtimes.push(b);
    } else {
      const sys = b.system || 'Unknown';
      const tc = b.tank_config || 'Unknown';
      if (!grouped[sys]) grouped[sys] = {};
      if (!grouped[sys][tc]) grouped[sys][tc] = [];
      grouped[sys][tc].push(b);
    }
  });

  const rows = [];

  const systemsToProcess = Array.from(new Set(['6T', '12T', ...Object.keys(grouped)]));
  systemsToProcess.forEach(system => {
    const configs = grouped[system] || {};

    // Duplicate Dual batches from FMT+MMT into FMT
    const processedConfigs = { ...configs };
    if (processedConfigs['FMT+MMT'] && processedConfigs['FMT']) {
      const dualBatches = processedConfigs['FMT+MMT'].filter(b => b.tech_type === 'Dual');
      if (dualBatches.length > 0) {
        const existingFmtIds = new Set(processedConfigs['FMT'].map(b => b.batch_id));
        const uniqueDuals = dualBatches.filter(b => !existingFmtIds.has(b.batch_id));
        processedConfigs['FMT'] = [...processedConfigs['FMT'], ...uniqueDuals];
      }
    } else if (processedConfigs['FMT+MMT'] && !processedConfigs['FMT']) {
      const dualBatches = processedConfigs['FMT+MMT'].filter(b => b.tech_type === 'Dual');
      if (dualBatches.length > 0) {
        processedConfigs['FMT'] = [...dualBatches];
      }
    }

    // Prepare downtimes applicable to this system
    const systemDowntimes = downtimes.filter(dt =>
      dt.system === system || dt.system === 'ALL_SYSTEMS' || dt.system?.toUpperCase() === 'ALL'
    ).map(b => ({
      id: b.batch_id + '-' + system,
      title: b.description,
      batch: b.batch_id || '',
      start_time: b.mkg_start_time,
      end_time: b.mkg_end_time,
      tech_type: 'Single',
      system: b.system,
      status: 'downtime'
    }));

    Object.entries(processedConfigs).forEach(([tankConfig, batches]) => {
      const items = batches.map(b => ({
        ...b,
        id: b.batch_id,
        title: b.description,
        batch: b.batch_id,
        start_time: b.mkg_start_time,
        end_time: b.mkg_end_time,
        tech_type: b.tech_type,
        system: b.system,
        status: b.tech_type === 'Dual' ? 'warning' : 'ready'
      }));

      // Inject downtimes into this lane
      items.push(...systemDowntimes.map(dt => ({ ...dt, id: dt.id + '-' + tankConfig })));

      rows.push({
        resource: `${system} / ${tankConfig}`,
        system,
        tankConfig,
        items
      });
    });
  });

  return rows;
};

const mapScheduleToTankFormat = (flatData) => {
  if (!Array.isArray(flatData)) return [];

  const grouped = {};

  flatData.forEach(b => {
    // Ignore down/maintenance tasks for tank timeline
    if (b.description && b.description.startsWith('DOWNTIME')) return;

    if (!b.storage_tank || b.storage_tank === 'N/A') return;

    // Split combined tanks if exist
    const tanksArr = b.storage_tank.split('+').map(s => s.trim());

    tanksArr.forEach(tankRaw => {
      if (!tankRaw) return;

      let tankName = tankRaw;
      let hasWash = false;
      let washMatch = tankRaw.match(/\[Wash (\d+)m\]/i);
      let washDuration = 0;

      if (washMatch) {
        hasWash = true;
        washDuration = parseInt(washMatch[1], 10);
        tankName = tankName.replace(/\[Wash \d+m\]/i, '').trim();
      }

      if (!grouped[tankName]) grouped[tankName] = [];

      const washStart = b.pkg_end_time ? new Date(b.pkg_end_time) : null;
      const washEnd = washStart ? new Date(washStart.getTime() + washDuration * 60000) : null;

      grouped[tankName].push({
        id: `${b.batch_id}-${tankName}`,
        title: b.description,
        batch: b.batch_id,
        start_time: b.mkg_end_time || b.mkg_start_time,
        end_time: b.pkg_end_time || b.mkg_end_time,
        type: b.description.toLowerCase().includes('cond')
          ? 'conditioner'
          : b.description.toLowerCase().includes('shm') || b.description.toLowerCase().includes('h&s')
            ? 'shampoo'
            : b.description.toLowerCase().includes('base')
              ? 'premix'
              : 'shampoo'
      });

      if (hasWash && b.pkg_end_time) {
        grouped[tankName].push({
          id: `${b.batch_id}-${tankName}-wash`,
          title: 'Washout',
          batch: 'WASH',
          start_time: washStart.toISOString(),
          end_time: washEnd.toISOString(),
          type: 'washout'
        });
      }
    });
  });

  return Object.entries(grouped).map(([resource, items]) => ({
    resource,
    items,
  }));
};

const PlanView = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector(state => state.ui.activeTabs.planView);
  const [activeFilter, setActiveFilter] = useState(null);

  // New API for GanttChart, TankTimeline, and DraggableGanttChart
  const { data: scheduleGanttResponse, isLoading: isScheduleLoading, error: scheduleError } =
    useGetProductionScheduleGanttQuery();
    
  const { data: ganttEditResponse } = useGetGanttEditQuery();

  // Added for Excel Export and Table View consistency
  const {
    groupedData,
    sortedDates,
    isLoading: isTableLoading,
    searchText,
    systemFilter,
    handleSearchChange,
    handleSystemFilterChange,
  } = useScheduleTable();

  // Tasks for the normal GanttChart — from new API (hierarchical) Only for GHANTT,not tanks
  const tasks = useMemo(() => {
    if (!scheduleGanttResponse?.data) return [];
    const flatData = flattenGanttResponse(scheduleGanttResponse.data);
    return mapScheduleToGanttFormat(flatData);
  }, [scheduleGanttResponse]);

  // console.log('Mapped Gantt tasks:', tasks);    

  // Tank tasks — NOW from new API (flat list grouped on fly)
  const tankTasks = useMemo(() => {
    if (!scheduleGanttResponse?.data) return [];
    const flatData = flattenGanttResponse(scheduleGanttResponse.data);
    return mapScheduleToTankFormat(flatData);
  }, [scheduleGanttResponse]);

  // Draggable Gantt — derive from new API (Gantt-Edit) with fallback to live data if empty
  const draggableTasks = useMemo(() => {
    const editData = ganttEditResponse?.data || [];
    const liveData = scheduleGanttResponse?.data || [];
    
    // Fallback to live data if edit data is empty (only for UI grouping check)
    const dataToMap = Array.isArray(editData) && editData.length > 0 ? editData : liveData;
    const flatData = flattenGanttResponse(dataToMap);
    
    return mapScheduleToGanttFormat(flatData);
  }, [ganttEditResponse, scheduleGanttResponse]);


  const filterRange = useMemo(() => {
    if (!activeFilter || !scheduleGanttResponse?.data) return null;

    let minDate = null;
    [...tasks, ...tankTasks].forEach((row) => {
      row.items.forEach((item) => {
        const d = dayjs(item.start_time);
        if (d.isValid() && (!minDate || d.isBefore(minDate))) minDate = d;
      });
    });

    if (!minDate) return null;

    if (activeFilter === '24h') {
      const start = minDate.startOf('day');
      return { start: start.toDate(), end: start.add(24, 'hour').toDate() };
    }

    const parts = activeFilter.split('-');
    if (parts.length === 2) {
      const [startH, startM] = parts[0].split(':').map(Number);
      const [endH, endM] = parts[1].split(':').map(Number);

      let start = minDate.hour(startH).minute(startM).second(0).millisecond(0);
      let end = minDate.hour(endH).minute(endM).second(0).millisecond(0);

      if (end.isBefore(start) || end.isSame(start)) {
        end = end.add(1, 'day');
      }
      return { start: start.toDate(), end: end.toDate() };
    }
    return null;
  }, [activeFilter, scheduleGanttResponse, tasks, tankTasks]);

  const renderContent = () => {
    // These tabs don't depend on the Gantt schedule data — render them directly
    if (activeTab === 'packing-schedule') return <PackingPlanScheduleView />;

    switch (activeTab) {
      case 'table':
        return (
          <ScheduleTable
            groupedData={groupedData}
            sortedDates={sortedDates}
            isLoading={isTableLoading}
            searchText={searchText}
            systemFilter={systemFilter}
            onSearchChange={handleSearchChange}
            onSystemFilterChange={handleSystemFilterChange}
          />
        );
      case 'tank':
        if (isScheduleLoading) {
          return (
            <div className="flex justify-center p-20">
              <Spin size="large" />
            </div>
          );
        }
        if (scheduleError) {
          return (
            <div className="p-10">
              <Empty description="Error loading tank timeline data" />
            </div>
          );
        }
        if (!tankTasks.length) {
          return (
            <div className="p-10">
              <Empty description="No tank timeline data found" />
            </div>
          );
        }
        return <TankTimeline tasks={tankTasks} filterRange={filterRange} />;
      default:
        if (isScheduleLoading) {
          return (
            <div className="flex justify-center p-20">
              <Spin size="large" />
            </div>
          );
        }
        if (scheduleError) {
          return (
            <div className="p-10">
              <Empty description="Error loading Gantt chart data" />
            </div>
          );
        }
        if (!tasks.length) {
          return (
            <div className="p-10">
              <Empty description="No timeline data found" />
            </div>
          );
        }
        return <GanttChart tasks={tasks} filterRange={filterRange} />;
    }
  };

  const handleExportExcel = () => {
    exportTableToExcel(groupedData, sortedDates, 'production schedule.xlsx');
  };

  return (
    <div className="space-y-6">
      <PlanHeader
        activeTab={activeTab}
        onTabChange={(tab) => dispatch(setActiveTab({ view: 'planView', tab }))}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onExportExcel={handleExportExcel}
      />
      {renderContent()}

      {/* Draggable Gantt Chart Section */}
      {activeTab === 'gantt' && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div>
              <h3 className="m-0 text-lg font-bold text-[#002060]">Interactive Plan</h3>
              <p className="m-0 text-xs text-slate-500">Drag items to adjust start and end times.</p>
            </div>
            <button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none font-bold shadow-md rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer transition-colors"
                onClick={() => {
                  const flatItemsMap = new Map();
                  draggableTasks.forEach(row => {
                    row.items.forEach(item => {
                       if (!flatItemsMap.has(item.batch)) {
                         flatItemsMap.set(item.batch, { ...item });
                       }
                    });
                  });

                  const allBatches = Array.from(flatItemsMap.values());
                  const grouped = {};
                  const allDates = new Set();

                  allBatches.forEach(b => {
                    if (b.status === 'downtime') return; // Skip downtime in schedule table
                    
                    const system = b.system || 'Unknown';
                    const shift = b.shift || 'Unknown';
                    const startTime = dayjs(b.start_time);
                    const dk = startTime.format('YYYY-MM-DD');
                    const label = startTime.format('DD MMMM YYYY');
                    
                    allDates.add(dk);

                    if (!grouped[system]) grouped[system] = {};
                    if (!grouped[system][shift]) grouped[system][shift] = {};
                    if (!grouped[system][shift][dk]) {
                      grouped[system][shift][dk] = { label, batches: [] };
                    }

                    grouped[system][shift][dk].batches.push({
                      ...b,
                      startTime: startTime.format('HH:mm'),
                      endTime: dayjs(b.end_time).format('HH:mm'),
                    });
                  });

                  const sorted = {};
                  ['12T', '6T'].forEach(sys => {
                    if (grouped[sys]) {
                      const sortedShifts = {};
                      ['A', 'B', 'C'].forEach(s => {
                        if (grouped[sys][s]) sortedShifts[s] = grouped[sys][s];
                      });
                      sorted[sys] = sortedShifts;
                    }
                  });

                  const sortedDates = Array.from(allDates).sort();
                  exportTableToExcel(sorted, sortedDates, 'Updated_Production_Schedule.xlsx');
                }}
            >
              Export Updated Plan
            </button>
          </div>
          <DraggableGanttChart tasks={draggableTasks} filterRange={filterRange} />
        </div>
      )}
    </div>
  );
};

export default PlanView;

