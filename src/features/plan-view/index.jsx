import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/uiSlice';
import dayjs from 'dayjs';
import GanttChart from './components/GanttChart';
import PlanHeader from './components/PlanHeader';
import ScheduleTable from './components/ScheduleTable';
import TankTimeline from './components/TankTimeline';
import DraggableGanttChart from './components/DraggableGanttChart';
import { exportTableToExcel } from '../../utils/exportUtils';
import {
  useGetProductionScheduleGanttQuery,
} from '../../store/api/statusApi';
import { useScheduleTable } from './hooks/useScheduleTable';
import { Spin, Empty } from 'antd';


const mapScheduleToGanttFormat = (ganttData) => {
  if (!ganttData) return [];
  const rows = [];

 
  ['6T', '12T'].forEach((system) => {
    const configs = ganttData[system] || {};
    
    // Create a modified configs object that duplicates Dual batches from FMT+MMT into FMT
    const processedConfigs = { ...configs };
    if (processedConfigs['FMT+MMT'] && processedConfigs['FMT']) {
        // Find dual batches in FMT+MMT
        const dualBatches = processedConfigs['FMT+MMT'].filter(b => b.tech_type === 'Dual');
        if (dualBatches.length > 0) {
            // Append them to FMT (checking for duplicates just in case)
            const existingFmtIds = new Set(processedConfigs['FMT'].map(b => b.batch_id));
            const uniqueDuals = dualBatches.filter(b => !existingFmtIds.has(b.batch_id));
            processedConfigs['FMT'] = [...processedConfigs['FMT'], ...uniqueDuals];
        }
    }

    Object.entries(processedConfigs).forEach(([tankConfig, batches]) => {
      rows.push({
        resource: `${system} / ${tankConfig}`,
        system,
        tankConfig,
        items: (batches || []).map((b) => ({
          id: b.batch_id,
          title: b.description,
          batch: b.batch_id,
          start_time: b.mkg_start_time,
          end_time: b.mkg_end_time,
          tech_type: b.tech_type, // 'Single' or 'Dual'
          system: b.system,
          status: b.tech_type === 'Dual' ? 'warning' : 'ready',
        })),
      });
    });
  });

  return rows;
};

const mapScheduleToTankFormat = (tanksData) => {
  if (!tanksData || !Array.isArray(tanksData)) return [];
  
  // Group the flat list by resource_name (tank id)
  const grouped = tanksData.reduce((acc, b) => {
    const res = b.resource_name || 'Unknown';
    if (!acc[res]) acc[res] = [];
    acc[res].push({
      id: b.id,
      title: b.description,
      batch: b.description, // For tooltip/display
      start_time: b.start_time,
      end_time: b.end_time,
      type: b.description.toLowerCase().includes('wash')
        ? 'washout'
        : b.description.toLowerCase().includes('cond')
          ? 'conditioner'
          : b.description.toLowerCase().includes('shm') || b.description.toLowerCase().includes('h&s')
            ? 'shampoo'
            : b.description.toLowerCase().includes('base')
              ? 'premix'
              : 'shampoo',
    });
    return acc;
  }, {});

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
  const { groupedData, sortedDates } = useScheduleTable();

  // Tasks for the normal GanttChart — from new API (hierarchical)
  const tasks = useMemo(() => {
    if (!scheduleGanttResponse?.data) return [];
    return mapScheduleToGanttFormat(scheduleGanttResponse.data);
  }, [scheduleGanttResponse]);

  // Tank tasks — NOW from new API (flat list grouped on fly)
  const tankTasks = useMemo(() => {
    if (!scheduleGanttResponse?.data?.Tanks) return [];
    return mapScheduleToTankFormat(scheduleGanttResponse.data.Tanks);
  }, [scheduleGanttResponse]);

  // Draggable Gantt — derive from new API by flattening the 6T/12T config groups
  const draggableTasks = useMemo(() => {
    if (!scheduleGanttResponse?.data) return [];
    const data = scheduleGanttResponse.data;
    
    return ['6T', '12T'].map(system => {
      const configs = data[system] || {};
      // Flatten all batches from different tank_configs into one array for this system
      const allBatches = Object.values(configs).flat();
      
      return {
        resource: system,
        items: allBatches.map(b => ({
          id: b.batch_id,
          title: b.description,
          batch: b.batch_id,
          start_time: b.mkg_start_time,
          end_time: b.mkg_end_time,
          status: b.tech_type === 'Dual' ? 'warning' : 'ready',
        }))
      };
    });
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
        return <ScheduleTable groupedData={groupedData} sortedDates={sortedDates} />;
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

