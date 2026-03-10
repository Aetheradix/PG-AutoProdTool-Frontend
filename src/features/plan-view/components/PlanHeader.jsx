import React from 'react';
import { Button } from 'antd';
import { FiDownload, FiPlay } from 'react-icons/fi';
import { AdminGate } from '@/components/shared/PermissionGate';
import { useRunSimulationMutation } from '@/store/api/planApi';
import { message } from 'antd';

const PlanHeader = ({ activeTab, onTabChange, activeFilter, onFilterChange, targetDate = '2026-03-09' }) => {
  const [runSimulation, { isLoading }] = useRunSimulationMutation();

  const handleRunSimulation = async () => {
    try {
      await runSimulation({ target_date: targetDate }).unwrap();
      message.success('Simulation started successfully!');
    } catch (err) {
      message.error(err.data?.detail || 'Failed to start simulation');
    }
  };
  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex bg-slate-50 gap-2 sm:gap-4 p-1 rounded-lg overflow-x-auto custom-scrollbar shrink-0">
        <Button
          type={activeTab === 'gantt' ? 'primary' : 'text'}
          className="rounded-md shadow-none"
          onClick={() => onTabChange('gantt')}
        >
          Gantt Chart
        </Button>
        <Button
          type={activeTab === 'table' ? 'primary' : 'text'}
          className="rounded-md shadow-none"
          onClick={() => onTabChange('table')}
        >
          Table View
        </Button>
        <Button
          type={activeTab === 'tank' ? 'primary' : 'text'}
          className="rounded-md shadow-none"
          onClick={() => onTabChange('tank')}
        >
          Tank Timeline
        </Button>
      </div>

      {activeTab !== 'table' && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-50 p-2 rounded-lg shrink-0 overflow-x-auto max-w-full shadow-inner border border-slate-100">
          <span className="text-xs font-black text-slate-500 px-2 uppercase tracking-widest hidden sm:inline">
            Time Filter
          </span>
          <Button
            size="middle"
            type={!activeFilter ? 'primary' : 'text'}
            className="text-xs sm:text-sm rounded-md h-9 px-4 font-bold"
            onClick={() => onFilterChange(null)}
          >
            Full
          </Button>
          {['07:30-11:30', '11:30-15:30', '15:30-19:30', '19:30-23:30', '23:30-03:30', '03:30-07:30'].map((interval) => (
            <Button
              key={interval}
              size="middle"
              type={activeFilter === interval ? 'primary' : 'text'}
              className="text-xs sm:text-sm rounded-md h-9 px-4 font-bold"
              onClick={() => onFilterChange(interval)}
            >
              {interval}
            </Button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
        <AdminGate>
          <Button
            type="primary"
            icon={<FiPlay />}
            loading={isLoading}
            onClick={handleRunSimulation}
            className="bg-blue-600 hover:bg-blue-700 border-none rounded-lg font-bold flex-1 sm:flex-none"
          >
            Run Simulation
          </Button>
        </AdminGate>
        {/* <Button icon={<FiDownload />} className="rounded-lg border-slate-200 flex-1 sm:flex-none">
          Export PDF
        </Button>
        <Button
          type="primary"
          className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-lg font-bold flex-1 sm:flex-none"
        >
          Lock & Release Plan
        </Button> */}
      </div>
    </div>
  );
};

export default PlanHeader;
