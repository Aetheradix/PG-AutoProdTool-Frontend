import React from 'react';
import { Card } from 'antd';
import { useExcelUpload } from '../excel-upload/hooks/useExcelUpload';
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

  return (
    <div className="fade-in pb-10">
      <div className="flex flex-col items-start w-full">
        <div className="flex-1 w-full">
          <Card
            title={
              <div className="flex items-center gap-2 py-1">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Master Data Upload
                </span>
              </div>
            }
            extra={
              <UploadActionButtons
                handleFileUpload={handleFileUpload}
                handleSubmit={handleSubmit}
                clearData={clearData}
                isUploading={isUploading}
                hasData={uploadData.length > 0}
              />
            }
            className="border-none shadow-md rounded-2xl overflow-hidden min-h-125"
            styles={{
              header: { borderBottom: '1px solid #f1f5f9', padding: '16px 24px' },
              body: { padding: '24px' }
            }}
          >
            <UploadDataTable
              uploadData={uploadData}
              columns={columns}
              uploadForm={uploadForm}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

