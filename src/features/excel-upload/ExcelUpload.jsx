import React from 'react';
import { Button, Table, Card, Upload, Space, Form } from 'antd';
import { UploadOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { PermissionGate, AdminGate } from '@/components/shared/PermissionGate';
import EditableCell from './components/EditableCell';
import { useExcelUpload } from './hooks/useExcelUpload';


export const ExcelUpload = () => {
  const {
    data,
    columns,
    form,
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

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });


  const actionColumn = {
    title: 'Actions',
    dataIndex: 'operation',
    fixed: 'right',
    width: 120,
    render: (_, record) => {
      const editable = isEditing(record);
      return (
        <AdminGate>
          {editable ? (
            <Space>
              <Button type="link" onClick={() => save(record.key)}>
                Save
              </Button>
              <Button type="link" onClick={cancel}>
                Cancel
              </Button>
            </Space>
          ) : (
            <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record)}>
              Edit
            </Button>
          )}
        </AdminGate>
      );
    },
  };

  const finalColumns = [...mergedColumns, actionColumn];

  return (
    <Card
      title="Excel Data Upload"
      extra={
        <AdminGate>
          <Space>
            <Upload beforeUpload={handleFileUpload} showUploadList={false} accept=".xlsx, .xls">
              <Button icon={<UploadOutlined />}>Click to Upload Excel</Button>
            </Upload>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={isUploading}
              disabled={data.length === 0}
            >
              Submit
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={clearData}
              disabled={data.length === 0}
            >
              Clear
            </Button>
          </Space>
        </AdminGate>
      }
    >
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={data.length > 0 ? finalColumns : []}
          rowClassName="editable-row"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 'max-content', y: 600 }}
        />
      </Form>
    </Card>
  );
};
