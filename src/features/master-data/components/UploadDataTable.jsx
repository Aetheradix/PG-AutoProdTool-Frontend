import React from 'react';
import { Table, Form, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import EditableCell from '../../excel-upload/components/EditableCell';

const { Text } = Typography;

export function UploadDataTable({
    uploadData,
    columns,
    uploadForm,
}) {
    if (uploadData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <UploadOutlined style={{ fontSize: '80px', color: '#cbd5e1', marginBottom: '16px' }} />
                <Text className="text-slate-400 text-lg">
                    No data uploaded yet. Click "Upload Excel" to get started.
                </Text>
            </div>
        );
    }

    return (
        <Form form={uploadForm} component={false}>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                bordered
                dataSource={uploadData}
                columns={columns}
                rowClassName="group"
                pagination={{
                    pageSize: 15,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '15', '20', '50'],
                }}
                scroll={{ x: 'max-content', y: 'calc(70vh - 200px)' }}
            />
        </Form>
    );
}
