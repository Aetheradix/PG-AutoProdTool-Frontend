import React, { useState } from 'react';
import GanttChart from './components/GanttChart';
import PlanHeader from './components/PlanHeader';
import ScheduleTable from './components/ScheduleTable';
import TankTimeline from './components/TankTimeline';
import { defaultTasks, tankTasks } from './planData';

const PlanView = ({ tasks = defaultTasks }) => {
  const [activeTab, setActiveTab] = useState('tank'); // Default to tank for testing or as per user focus

  const renderContent = () => {
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
