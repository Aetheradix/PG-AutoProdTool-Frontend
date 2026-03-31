import { ExcelUpload } from '@/features/excel-upload/ExcelUpload';
import LineGroupedTable from './LineGroupedTable';
import { Button, Card } from 'antd';
import { FiDownload } from 'react-icons/fi';

const PackingPlanTable = ({
  handleExport,
  useGetPackingPlanQuery,
  useCreatePackingPlanMutation,
  useUpdatePackingPlanMutation,
  useDeletePackingPlanMutation,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex-1 w-full">
        <Card
          title={
            <div className="flex items-center gap-2 py-1">
              <span className="text-xl font-black text-[#002060] uppercase tracking-tight">
                Packing Plan Management
              </span>
            </div>
          }
          extra={
            <Button
              icon={<FiDownload />}
              onClick={handleExport}
              className="flex items-center gap-1.5 font-medium text-slate-600 border-slate-300 hover:text-blue-600 hover:border-blue-400 transition-all rounded-none"
            >
              Export Excel
            </Button>
          }
          className="border border-slate-200 shadow-none rounded-none min-h-125"
          styles={{
            header: { borderBottom: '1px solid #f1f5f9', padding: '16px 24px' },
            body: { padding: '24px' },
          }}
        >
          <LineGroupedTable
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

      <div className="mt-12">
        <ExcelUpload />
      </div>
    </div>
  );
};

export default PackingPlanTable;
