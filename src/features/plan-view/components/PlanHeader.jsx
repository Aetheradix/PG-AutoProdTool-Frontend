import React from 'react';
import { Button } from 'antd';
import { FiDownload } from 'react-icons/fi';

const PlanHeader = ({ activeTab, onTabChange, activeFilter, onFilterChange }) => {
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

      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1 rounded-lg shrink-0">
        <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">
          Shift Filter
        </span>
        <Button
          size="small"
          type={!activeFilter ? 'primary' : 'text'}
          className="text-[11px] rounded-md h-7"
          onClick={() => onFilterChange(null)}
        >
          Full
        </Button>
        <Button
          size="small"
          type={activeFilter === 'morning' ? 'primary' : 'text'}
          className="text-[11px] rounded-md h-7"
          onClick={() => onFilterChange('morning')}
        >
          Morning (8-16)
        </Button>
        <Button
          size="small"
          type={activeFilter === 'evening' ? 'primary' : 'text'}
          className="text-[11px] rounded-md h-7"
          onClick={() => onFilterChange('evening')}
        >
          Evening (16-24)
        </Button>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
        <Button icon={<FiDownload />} className="rounded-lg border-slate-200 flex-1 sm:flex-none">
          Export PDF
        </Button>
        <Button
          type="primary"
          className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-lg font-bold flex-1 sm:flex-none"
        >
          Lock & Release Plan
        </Button>
      </div>
    </div>
  );
};

export default PlanHeader;
