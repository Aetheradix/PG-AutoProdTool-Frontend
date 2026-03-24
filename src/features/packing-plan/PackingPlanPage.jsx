import React, { useMemo } from 'react';
import { message, Tabs, Button } from 'antd';
import { FiBarChart, FiPackage } from 'react-icons/fi';
import {
  useCreatePackingPlanMutation,
  useDeletePackingPlanMutation,
  useGetPackingPlanQuery,
  useUpdatePackingPlanMutation,
} from '../../store/api/packingPlanApi';
import { exportDataTableToExcel } from '../../utils/exportUtils';
import { extractApiData } from '../../utils/tableUtils';
import PackingPlanTable from './components/packing-plan-table';
import PackingPlanGantt from './components/PackingPlanGantt';

export default function PackingPlanPage() {
  const { data: apiData } = useGetPackingPlanQuery({ page: 1, limit: 1000 });
  const [activeFilter, setActiveFilter] = React.useState(null);

  const filterRange = useMemo(() => {
    if (!activeFilter || !apiData?.data) return null;
    
    // Find the min date in the data to anchor the filter
    let minDate = null;
    apiData.data.forEach((item) => {
      const d = new Date(item.start_datetime);
      if (!minDate || d < minDate) minDate = d;
    });
    
    if (!minDate) return null;

    const start = new Date(minDate);
    const end = new Date(minDate);
    const parts = activeFilter.split('-');
    if (parts.length === 2) {
      const [startH, startM] = parts[0].split(':').map(Number);
      const [endH, endM] = parts[1].split(':').map(Number);
      start.setHours(startH, startM, 0, 0);
      end.setHours(endH, endM, 0, 0);
      if (endH < startH || (endH === startH && endM <= startM)) {
        end.setDate(end.getDate() + 1);
      }
    }
    return { start, end };
  }, [activeFilter, apiData]);

  const handleExport = async () => {
    const dataSource = extractApiData(apiData, []);
    if (!dataSource || dataSource.length === 0) {
      message.warning('No data available to export');
      return;
    }
    try {
      await exportDataTableToExcel(dataSource, {
        fileName: 'Packing_Plan.xlsx',
        sheetName: 'Packing Plan',
        title: 'Packing Plan',
        excludeFields: ['id', 'created_at', 'updated_at'],
      });
      message.success('Packing Plan exported successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      message.error('Failed to export Packing Plan');
    }
  };
  const tabItems = [
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
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <FiBarChart size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 m-0 leading-tight">Packing Plan Timeline</h3>
                <p className="text-[11px] text-slate-500 m-0 uppercase tracking-tighter font-semibold">Production Line Efficiency View</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg shadow-inner border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-widest hidden sm:inline">
                Time Filter
              </span>
              <Button
                size="middle"
                type={!activeFilter ? 'primary' : 'text'}
                className="text-xs rounded-md h-9 px-4 font-bold"
                onClick={() => setActiveFilter(null)}
              >
                Full
              </Button>
              {['07:30-11:30', '11:30-15:30', '15:30-19:30', '19:30-23:30', '23:30-03:30', '03:30-07:30'].map((interval) => (
                <Button
                  key={interval}
                  size="middle"
                  type={activeFilter === interval ? 'primary' : 'text'}
                  className="text-xs rounded-md h-9 px-4 font-bold"
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

  return (
    <div className="p-4 bg-slate-50/30 min-h-screen">
      <Tabs defaultActiveKey="packing-plan" items={tabItems} className="premium-tabs" />
    </div>
  );
}
