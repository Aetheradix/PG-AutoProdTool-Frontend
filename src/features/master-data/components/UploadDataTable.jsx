import React from 'react';
import { Table, Form, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import EditableCell from '../../excel-upload/components/EditableCell';

const { Text } = Typography;

export function UploadDataTable({ uploadData, columns, uploadForm }) {
  if (uploadData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
        <div className="bg-white p-6 rounded-full shadow-sm mb-6">
          <UploadOutlined style={{ fontSize: '48px', color: '#3b82f6' }} />
        </div>
        <Text className="text-slate-500 text-lg font-medium">No data uploaded yet</Text>
        <Text className="text-slate-400 mt-2">
          Click "Click to Upload Excel" above to get started.
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
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          className: 'px-4',
        }}
        scroll={{ x: 'max-content', y: 600 }}
        className="border-slate-100 shadow-sm rounded-lg overflow-hidden"
      />
    </Form>
  );
}
