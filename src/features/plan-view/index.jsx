import React, { useState, useMemo } from 'react';
import GanttChart from './components/GanttChart';
import PlanHeader from './components/PlanHeader';
import ScheduleTable from './components/ScheduleTable';
import TankTimeline from './components/TankTimeline';
import { useGetGhanttChartQuery } from '../../store/api/statusApi';
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
        status: item.event_type.includes('WASH') ? 'warning' : 'ready',
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
  const [activeTab, setActiveTab] = useState('tank');
  const { data: apiResponse, isLoading, error } = useGetGhanttChartQuery(100);

  const { tasks, tankTasks } = useMemo(() => {
    if (!apiResponse?.data) return { tasks: [], tankTasks: [] };

    return {
      tasks: mapToGanttFormat(apiResponse.data),
      tankTasks: mapToTankFormat(apiResponse.data.Tanks),
    };
  }, [apiResponse]);

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
        return <TankTimeline tasks={tankTasks} />;
      default:
        return <GanttChart tasks={tasks} />;
    }
  };

  return (
    <div className="space-y-6">
      <PlanHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
};

export default PlanView;
