import React from 'react';
import { Card, Button, message } from 'antd';
import { FiDownload } from 'react-icons/fi';
import { StandardDataTable } from '../master-data/components/StandardDataTable';
import {
  useGetPackingPlanQuery,
  useCreatePackingPlanMutation,
  useUpdatePackingPlanMutation,
  useDeletePackingPlanMutation,
} from '../../store/api/packingPlanApi';
import { extractApiData } from '../../utils/tableUtils';
import { exportDataTableToExcel } from '../../utils/exportUtils';

export default function PackingPlanPage() {
  const { data: apiData } = useGetPackingPlanQuery({ page: 1, limit: 1000 });

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

  return (
    <div className="fade-in pb-10">
      <div className="flex flex-col items-start w-full">
        <div className="flex-1 w-full">
          <Card
            title={
              <div className="flex items-center gap-2 py-1">
                <span className="text-xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Packing Plan Management
                </span>
              </div>
            }
            extra={
              <Button
                icon={<FiDownload />}
                onClick={handleExport}
                className="flex items-center gap-1.5 font-medium text-slate-600 border-slate-300 hover:text-blue-600 hover:border-blue-400 transition-all"
              >
                Export Excel
              </Button>
            }
            className="border-none shadow-md rounded-2xl overflow-hidden min-h-125"
            styles={{
              header: { borderBottom: '1px solid #f1f5f9', padding: '16px 24px' },
              body: { padding: '24px' },
            }}
          >
            <StandardDataTable
              useGetQuery={useGetPackingPlanQuery}
              useUpdateMutation={useUpdatePackingPlanMutation}
              useCreateMutation={useCreatePackingPlanMutation}
              useDeleteMutation={useDeletePackingPlanMutation}
              title="Packing Plan"
              searchPlaceholder="Search PO number, SKU, description..."
              excludeFields={['id', 'created_at', 'updated_at']}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
