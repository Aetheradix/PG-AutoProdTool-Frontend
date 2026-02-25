import React, { useState, useMemo } from 'react';
import GanttChart from './components/GanttChart';
import PlanHeader from './components/PlanHeader';
import ScheduleTable from './components/ScheduleTable';
import TankTimeline from './components/TankTimeline';
import DraggableGanttChart from './components/DraggableGanttChart';
import { useGetGhanttChartQuery, useGetTimelineDataQuery } from '../../store/api/statusApi';
import { Spin, Empty } from 'antd';

const mapToGanttFormat = (groupedData) => {
  if (!groupedData) return [];

  const resources = ['6T', '12T'];
  return resources.map((res) => ({
    resource: res,
    items: (groupedData[res] || []).map((item) => {
      return {
        id: item.id,
        title: item.description,
        batch: item.event_type,
        start_time: item.start_time,
        end_time: item.end_time,
        status: (item.event_type.includes('WASH') || item.event_type.includes('COND')) ? 'warning' : 'ready',
      };
    }),
  }));
};

const mapToTankFormat = (tanksData) => {
  if (!tanksData) return [];

  const groupedByTank = tanksData.reduce((acc, item) => {
    const res = item.resource_name || 'Unknown';
    if (!acc[res]) acc[res] = [];

    acc[res].push({
      id: item.id,
      title: item.description,
      type: item.event_type.includes('WASH')
        ? 'washout'
        : item.description.toLowerCase().includes('cond')
          ? 'conditioner'
          : item.description.toLowerCase().includes('shm')
            ? 'shampoo'
            : 'shampoo',
      start_time: item.start_time,
      end_time: item.end_time,
    });
    return acc;
  }, {});

  return Object.entries(groupedByTank).map(([resource, items]) => ({
    resource,
    items,
  }));
};

const PlanView = () => {
  const [activeTab, setActiveTab] = useState('gantt');
  const [activeFilter, setActiveFilter] = useState(null);

  const { data: apiResponse, isLoading, error } = useGetGhanttChartQuery(100);
  const { data: timelineResponse, isLoading: isTimelineLoading } = useGetTimelineDataQuery(100);

  const filterRange = useMemo(() => {
    if (!activeFilter || !apiResponse?.data) return null;


    let minDate = null;
    Object.values(apiResponse.data).forEach(list => {
      list.forEach(item => {
        const d = new Date(item.start_time);
        if (!minDate || d < minDate) minDate = d;
      });
    });

    if (!minDate) return null;

    const start = new Date(minDate);
    const end = new Date(minDate);

    if (activeFilter === 'morning') {
      start.setHours(8, 0, 0, 0);
      end.setHours(16, 0, 0, 0);
    } else {
      start.setHours(16, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }, [activeFilter, apiResponse]);

  const { tasks, tankTasks } = useMemo(() => {
    if (!apiResponse?.data) return { tasks: [], tankTasks: [] };

    return {
      tasks: mapToGanttFormat(apiResponse.data),
      tankTasks: mapToTankFormat(apiResponse.data.Tanks),
    };
  }, [apiResponse]);

  const draggableTasks = useMemo(() => {
    if (!timelineResponse?.data) return [];
    return mapToGanttFormat(timelineResponse.data);
  }, [timelineResponse]);

  const renderContent = () => {
    if (isLoading)
      return (
        <div className="flex justify-center p-20">
          <Spin size="large" />
        </div>
      );
    if (error)
      return (
        <div className="p-10">
          <Empty description="Error loading timeline data" />
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
        return <ScheduleTable tasks={tasks} />;
      case 'tank':
        return <TankTimeline tasks={tankTasks} filterRange={filterRange} />;
      default:
        return <GanttChart tasks={tasks} filterRange={filterRange} />;
    }
  };

  return (
    <div className="space-y-6">
      <PlanHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      {renderContent()}

      {/* Draggable Gantt Chart Section */}
      {activeTab === 'gantt' && (
        <div className="mt-12">
          <DraggableGanttChart tasks={draggableTasks} filterRange={filterRange} />
        </div>
      )}
    </div>
  );
};

export default PlanView;
