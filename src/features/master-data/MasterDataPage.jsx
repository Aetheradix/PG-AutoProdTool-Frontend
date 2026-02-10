import React, { useState } from 'react';
import { Card } from 'antd';
import { useExcelUpload } from '../excel-upload/hooks/useExcelUpload';
import { UploadSection } from './components/UploadSection';
import { UploadModal } from './components/UploadModal';

export function MasterDataPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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

  return (
    <div className="fade-in pb-10">
      <div className="flex flex-col items-start w-full">
        <div className="flex-1 w-full">
          <Card
            className="border-none shadow-sm rounded-xl overflow-hidden min-h-125"
            styles={{ body: { padding: '24px' } }}
          >
            <UploadSection onOpenModal={() => setIsUploadModalOpen(true)} />
          </Card>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadData={uploadData}
        uploadColumns={uploadColumns}
        uploadForm={uploadForm}
        editingKey={editingKey}
        isUploading={isUploading}
        isEditing={isEditing}
        edit={edit}
        cancel={cancel}
        save={save}
        handleFileUpload={handleFileUpload}
        handleSubmit={handleSubmit}
        clearData={clearData}
      />
    </div>
  );
}

