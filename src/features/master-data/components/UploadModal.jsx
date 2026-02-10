import React from 'react';
import { Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadActionButtons } from './UploadActionButtons';
import { UploadDataTable } from './UploadDataTable';
import { getUploadColumns } from '../utils/uploadColumns';

export function UploadModal({
  isOpen,
  onClose,
  uploadData,
  uploadColumns,
  uploadForm,
  editingKey,
  isUploading,
  isEditing,
  edit,
  cancel,
  save,
  handleFileUpload,
  handleSubmit,
  clearData,
}) {
  // Handlers defined at the top for clarity
  const handleCancelModal = () => {
    onClose();
    clearData();
  };

  const handleDataSubmit = async () => {
    await handleSubmit();
    if (uploadData.length > 0) {
      onClose();
    }
  };

  const columns = getUploadColumns(
    uploadColumns,
    isEditing,
    save,
    cancel,
    edit,
    editingKey
  );

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <UploadOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
          <span className="text-xl font-bold text-slate-800">Upload Excel Data</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancelModal}
      footer={null}
      width="95vw"
      style={{ top: 20, maxWidth: '1600px' }}
      styles={{ body: { padding: '24px', minHeight: '70vh' } }}
    >
      <div className="flex flex-col gap-6">
        <UploadActionButtons
          handleFileUpload={handleFileUpload}
          handleSubmit={handleDataSubmit}
          clearData={clearData}
          isUploading={isUploading}
          hasData={uploadData.length > 0}
        />

        <UploadDataTable
          uploadData={uploadData}
          columns={columns}
          uploadForm={uploadForm}
        />
      </div>
    </Modal>
  );
}
