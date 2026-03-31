import { ExcelUpload } from '@/features/excel-upload/ExcelUpload';
import { StandardDataTable } from '@/features/master-data/components/StandardDataTable';
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
            className="excel-packing-table"
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
