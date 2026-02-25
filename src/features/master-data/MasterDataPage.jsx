import { Card, Tabs } from 'antd';
import { AiOutlineStock } from "react-icons/ai";
import { FiDatabase, FiPackage, FiUpload } from 'react-icons/fi';
import { useExcelUpload } from '../excel-upload/hooks/useExcelUpload';
import { BulkDetailTable } from './components/BulkDetailTable';
import RMStatusDeadStock from './components/RMStatusDeadStock';
import { SKUMasterTable } from './components/SKUMasterTable';
import { UploadActionButtons } from './components/UploadActionButtons';
import { UploadDataTable } from './components/UploadDataTable';
import { getUploadColumns } from './utils/uploadColumns';


export function MasterDataPage() {
  // Excel upload hook
  const {
    data: uploadData,
    columns: uploadColumns,
    form: uploadForm,
    editingKey,
    isUploading,
    isEditing,
    edit,
    cancel,
    save,
    handleFileUpload,
    handleSubmit,
    clearData,
  } = useExcelUpload();

  const columns = getUploadColumns(
    uploadColumns,
    isEditing,
    save,
    cancel,
    edit,
    editingKey
  );

  const tabItems = [
    {
      key: 'upload',
      label: (
        <span className="flex items-center gap-2 px-1">
          <FiUpload /> Upload Master Data
        </span>
      ),
      children: (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-700">Upload Data</h3>
            <UploadActionButtons
              handleFileUpload={handleFileUpload}
              handleSubmit={handleSubmit}
              clearData={clearData}
              isUploading={isUploading}
              hasData={uploadData.length > 0}
            />
          </div>
          <UploadDataTable
            uploadData={uploadData}
            columns={columns}
            uploadForm={uploadForm}
          />
        </div>
      )
    },
    {
      key: 'sku-master',
      label: (
        <span className="flex items-center gap-2 px-1">
          <FiDatabase /> SKU Master
        </span>
      ),
      children: (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-700">Manage SKU Master</h3>
          </div>
          <SKUMasterTable />
        </div>
      )
    },
    {
      key: 'bulk-detail',
      label: (
        <span className="flex items-center gap-2 px-1">
          <FiPackage /> Bulk Detail
        </span>
      ),
      children: (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-700">Manage Bulk Details</h3>
          </div>
          <BulkDetailTable />
        </div>
      )
    },
    {
      key: 'dead-stock',
      label: (
        <span className="flex items-center gap-2 px-1">
          <AiOutlineStock /> Dead Stock
        </span>
      ),
      children: (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-700">Manage Dead Stock</h3>
          </div>
          <RMStatusDeadStock />
        </div>
      )
    },
  ];

  return (
    <div className="fade-in pb-10">
      <div className="flex flex-col items-start w-full">
        <div className="flex-1 w-full">
          <Card
            title={
              <div className="flex items-center gap-2 py-1">
                <span className="text-xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Master Data Management
                </span>
              </div>
            }
            className="border-none shadow-md rounded-2xl overflow-hidden min-h-125"
            styles={{
              header: { borderBottom: '1px solid #f1f5f9', padding: '16px 24px' },
              body: { padding: '24px' }
            }}
          >
            <Tabs defaultActiveKey="sku-master" items={tabItems} className="custom-tabs" />
          </Card>
        </div>
      </div>
    </div>
  );
}

