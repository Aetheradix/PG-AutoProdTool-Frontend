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
        <div className="flex flex-wrap gap-3 justify-end items-center">
            <Upload beforeUpload={handleFileUpload} showUploadList={false} accept=".xlsx, .xls">
                <Button
                    icon={<UploadOutlined />}
                    className="h-10 px-5 rounded-lg font-semibold border-blue-200 text-blue-600 hover:bg-blue-50 bg-white"
                >
                    Click to Upload Excel
                </Button>
            </Upload>
            <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={isUploading}
                disabled={!hasData}
                className="bg-blue-600 h-10 px-5 rounded-lg font-semibold border-none shadow-sm hover:shadow-md transition-all"
            >
                Submit Data
            </Button>
            <Button
                danger
                icon={<DeleteOutlined />}
                onClick={clearData}
                disabled={!hasData}
                className="h-10 px-5 rounded-lg font-semibold hover:bg-red-50"
            >
                Clear All
            </Button>
        </div>
    );
}
