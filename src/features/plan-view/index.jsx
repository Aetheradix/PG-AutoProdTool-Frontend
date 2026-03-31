import { Empty, Spin } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetProductionScheduleGanttQuery,
} from '../../store/api/statusApi';
import { setActiveTab } from '../../store/slices/uiSlice';
import { exportTableToExcel } from '../../utils/exportUtils';
import DraggableGanttChart from './components/DraggableGanttChart';
import GanttChart from './components/GanttChart';
import PlanHeader from './components/PlanHeader';
import ScheduleTable from './components/ScheduleTable';
import TankTimeline from './components/TankTimeline';
import { useScheduleTable } from './hooks/useScheduleTable';


const mapScheduleToGanttFormat = (flatData) => {
  if (!Array.isArray(flatData)) return [];
  
  const grouped = {
    '6T': {},
    '12T': {},
    'DOWNTIME': []
  };

  flatData.forEach(b => {
    if (b.description && b.description.startsWith('DOWNTIME')) {
      grouped['DOWNTIME'].push(b);
    } else {
      const sys = b.system || 'Unknown';
      const tc = b.tank_config || 'Unknown';
      if (!grouped[sys]) grouped[sys] = {};
      if (!grouped[sys][tc]) grouped[sys][tc] = [];
      grouped[sys][tc].push(b);
    }
  });

  const rows = [];
  
  // Downtime row
  if (grouped['DOWNTIME'].length > 0) {
     rows.push({
       resource: 'DOWNTIME',
       items: grouped['DOWNTIME'].map(b => ({
          id: b.batch_id,
          title: b.description,
          batch: b.batch_id || '',
          start_time: b.mkg_start_time,
          end_time: b.mkg_end_time,
          tech_type: 'Single',
          system: 'ALL',
          status: 'downtime'
       }))
     });
  }

  ['6T', '12T'].forEach(system => {
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

    Object.entries(processedConfigs).forEach(([tankConfig, batches]) => {
      rows.push({
        resource: `${system} / ${tankConfig}`,
        system,
        tankConfig,
        items: batches.map(b => ({
          id: b.batch_id,
          title: b.description,
          batch: b.batch_id,
          start_time: b.mkg_start_time,
          end_time: b.mkg_end_time,
          tech_type: b.tech_type,
          system: b.system,
          status: b.tech_type === 'Dual' ? 'warning' : 'ready'
        }))
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
    return mapScheduleToGanttFormat(scheduleGanttResponse.data);
  }, [scheduleGanttResponse]);

 
  // Tank tasks — NOW from new API (flat list grouped on fly)
  const tankTasks = useMemo(() => {
    if (!scheduleGanttResponse?.data) return [];
    return mapScheduleToTankFormat(scheduleGanttResponse.data);
  }, [scheduleGanttResponse]);

  // Draggable Gantt — derive from new API by flattening the 6T/12T config groups
  const draggableTasks = useMemo(() => {
    if (!scheduleGanttResponse?.data) return [];
    const flatData = scheduleGanttResponse.data;
    
    const rows = [];
    ['6T', '12T'].forEach(system => {
        const sysBatches = flatData.filter(b => b.system === system && (!b.description || !b.description.startsWith('DOWNTIME')));
        if (sysBatches.length > 0) {
            rows.push({
                resource: system,
                items: sysBatches.map(b => ({
                   id: b.batch_id,
                   title: b.description,
                   batch: b.batch_id,
                   start_time: b.mkg_start_time,
                   end_time: b.mkg_end_time,
                   status: b.tech_type === 'Dual' ? 'warning' : 'ready',
                }))
            });
        }
    });

    return rows;
  }, [scheduleGanttResponse]);

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
    if (isScheduleLoading)
      return (
        <div className="flex justify-center p-20">
          <Spin size="large" />
        </div>
      );
    if (scheduleError)
      return (
        <div className="p-10">
          <Empty description="Error loading Gantt chart data" />
        </div>
      );
    if (!tasks.length && !tankTasks.length)
      return (
        <div className="p-10">
          <Empty description="No timeline data found" />
        </div>
      );

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
        return <TankTimeline tasks={tankTasks} filterRange={filterRange} />;
      default:
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

      {/* Draggable Gantt Chart Section — still uses old timeline API */}
      {activeTab === 'gantt' && (
        <div className="mt-12">
          <DraggableGanttChart tasks={draggableTasks} filterRange={filterRange} />
        </div>
      )}
    </div>
  );
};

export default PlanView;

