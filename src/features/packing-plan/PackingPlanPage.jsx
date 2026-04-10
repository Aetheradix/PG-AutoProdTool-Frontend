import React from 'react';
import { Tabs } from 'antd';
import usePackingPlanPage from './hook/usePackingPlanPage';
import getPackingPlanTabItems from './components/packing-plan-table-column';


export default function PackingPlanPage() {
  const {
    activeTab,
    activeFilter,
    setActiveFilter,
    filterRange,
    handleExport,
    handleTabChange,
    useGetPackingPlanQuery,
    useCreatePackingPlanMutation,
    useUpdatePackingPlanMutation,
    useDeletePackingPlanMutation,
  } = usePackingPlanPage();

  const tabItems = getPackingPlanTabItems({
    handleExport,
    activeFilter,
    setActiveFilter,
    filterRange,
    useGetPackingPlanQuery,
    useCreatePackingPlanMutation,
    useUpdatePackingPlanMutation,
    useDeletePackingPlanMutation,
  });

  return (
    <div className="p-4 lg:p-8 bg-slate-50/30 min-h-screen">
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        className="premium-tabs rounded-none"
      />
    </div>
  );
}