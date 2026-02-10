import React from 'react';
import { Button, Upload } from 'antd';
import { UploadOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';

export function UploadActionButtons({
    handleFileUpload,
    handleSubmit,
    clearData,
    isUploading,
    hasData,
}) {
    return (
        <div className="flex flex-wrap gap-4 justify-end border-b pb-4">
            <Upload beforeUpload={handleFileUpload} showUploadList={false} accept=".xlsx, .xls">
                <Button
                    icon={<UploadOutlined />}
                    size="large"
                    className="h-11 px-6 rounded-lg font-bold border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                    Click to Upload Excel
                </Button>
            </Upload>
            <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={isUploading}
                disabled={!hasData}
                className="bg-blue-600 h-11 px-6 rounded-lg font-bold border-none shadow-md hover:shadow-lg transition-all"
            >
                Submit Data
            </Button>
            <Button
                danger
                size="large"
                icon={<DeleteOutlined />}
                onClick={clearData}
                disabled={!hasData}
                className="h-11 px-6 rounded-lg font-bold"
            >
                Clear All
            </Button>
        </div>
    );
}
