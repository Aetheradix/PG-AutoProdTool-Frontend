import React from 'react';
import { Button } from 'antd';
import { FiBarChart, FiPackage } from 'react-icons/fi';
import PackingPlanTable from './packing-plan-table';
import PackingPlanGantt from './PackingPlanGantt';

const TIME_INTERVALS = [
  '07:30-11:30',
  '11:30-15:30',
  '15:30-19:30',
  '19:30-23:30',
  '23:30-03:30',
  '03:30-07:30',
];

export default function getPackingPlanTabItems({
  handleExport,
  activeFilter,
  setActiveFilter,
  filterRange,
  useGetPackingPlanQuery,
  useCreatePackingPlanMutation,
  useUpdatePackingPlanMutation,
  useDeletePackingPlanMutation,
}) {
  return [
    {
      key: 'packing-plan',
      label: (
        <span className="flex items-center gap-2 px-1">
          <FiPackage /> Packing Plan
        </span>
      ),
      children: (
        <PackingPlanTable
          handleExport={handleExport}
          useGetPackingPlanQuery={useGetPackingPlanQuery}
          useCreatePackingPlanMutation={useCreatePackingPlanMutation}
          useUpdatePackingPlanMutation={useUpdatePackingPlanMutation}
          useDeletePackingPlanMutation={useDeletePackingPlanMutation}
        />
      ),
    },
    {
      key: 'dead-stock',
      label: (
        <span className="flex items-center gap-2 px-1">
          <FiBarChart /> Packing Plan Gantt Chart
        </span>
      ),
      children: (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white p-4 rounded-none border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-none text-blue-600">
                <FiBarChart size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 m-0 leading-tight">
                  Packing Plan Timeline
                </h3>
                <p className="text-[11px] text-slate-500 m-0 uppercase tracking-tighter font-semibold">
                  Production Line Efficiency View
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-none shadow-inner border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-widest hidden sm:inline">
                Time Filter
              </span>
              <Button
                size="middle"
                type={!activeFilter ? 'primary' : 'text'}
                className="text-xs rounded-none h-9 px-4 font-bold"
                onClick={() => setActiveFilter(null)}
              >
                Full
              </Button>
              {TIME_INTERVALS.map((interval) => (
                <Button
                  key={interval}
                  size="middle"
                  type={activeFilter === interval ? 'primary' : 'text'}
                  className="text-xs rounded-none h-9 px-4 font-bold"
                  onClick={() => setActiveFilter(interval)}
                >
                  {interval}
                </Button>
              ))}
            </div>
          </div>
          <PackingPlanGantt filterRange={filterRange} />
        </div>
      ),
    },
  ];
}
