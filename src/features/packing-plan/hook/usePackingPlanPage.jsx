import { message } from 'antd';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    useCreatePackingPlanMutation,
    useDeletePackingPlanMutation,
    useGetPackingPlanQuery,
    useUpdatePackingPlanMutation,
} from '@/store/api/packingPlanApi';
// import { exportDataTableToExcel } from '../../utils/exportUtils';
// import { extractApiData } from '../../utils/tableUtils';
import { setActiveTab } from '@/store/slices/uiSlice';
import { exportDataTableToExcel } from '@/utils/exportUtils';
import { extractApiData, combineDateAndDuration } from '@/utils/tableUtils';

export default function usePackingPlanPage() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.ui.activeTabs.packingPlan);
  const { data: apiData } = useGetPackingPlanQuery({ page: 1, limit: 1000 });
  const [activeFilter, setActiveFilter] = React.useState(null);

  const filterRange = useMemo(() => {
    if (!activeFilter || !apiData?.data) return null;

    let minDate = null;
    apiData.data.forEach((item) => {
      const combined = combineDateAndDuration(item.start_date, item.start_time);
      if (combined) {
        const d = new Date(combined);
        if (!minDate || d < minDate) minDate = d;
      }
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

  const handleTabChange = (key) => dispatch(setActiveTab({ view: 'packingPlan', tab: key }));

  return {
    activeTab,
    activeFilter,
    setActiveFilter,
    filterRange,
    handleExport,
    handleTabChange,
    // expose mutations for passing into tabItems
    useGetPackingPlanQuery,
    useCreatePackingPlanMutation,
    useUpdatePackingPlanMutation,
    useDeletePackingPlanMutation,
  };
}
