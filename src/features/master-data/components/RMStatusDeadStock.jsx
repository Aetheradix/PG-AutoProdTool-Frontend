import React, { useState, useMemo } from 'react';
import { Table, Form, Input, Button, Space, message, Typography, Popconfirm, Modal } from 'antd';
import { FiEdit2, FiSearch, FiPlus } from 'react-icons/fi';
import { useGetDeadstockQuery, useUpdateDeadstockMutation } from '../../../store/api/masterDataApi';
import EditableCell from '../../excel-upload/components/EditableCell';

const { Text } = Typography;

const RMStatusDeadStock = () => {
  const [form] = Form.useForm();
  const { data: deadstockData, isLoading, isError } = useGetDeadstockQuery({
    page: 1,
    limit: 1000
  });
  const [updateDeadstock, { isLoading: isUpdating }] = useUpdateDeadstockMutation();
  const [editingKey, setEditingKey] = useState('');
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const baseDataSource = useMemo(() => {
    if (!deadstockData) return [];
    return Array.isArray(deadstockData.data) ? deadstockData.data : (Array.isArray(deadstockData) ? deadstockData : []);
  }, [deadstockData]);

  const rowKey = useMemo(() => {
    if (baseDataSource.length === 0) return 'id';
    if (baseDataSource[0].id !== undefined) return 'id';
    return Object.keys(baseDataSource[0])[0];
  }, [baseDataSource]);

  const dataSource = useMemo(() => {
    return baseDataSource;
  }, [baseDataSource]);

  const isEditing = (record) => record[rowKey] === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record[rowKey]);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      await updateDeadstock({ [rowKey]: key, ...row }).unwrap();
      message.success('Deadstock updated successfully');
      setEditingKey('');
    } catch (err) {
      console.error('Save failed:', err);
      let errorMessage = 'Failed to save deadstock';

      if (err.data && err.data.detail) {
        errorMessage = Array.isArray(err.data.detail)
          ? err.data.detail.map(e => e.msg).join(', ')
          : err.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.errorFields) {
        errorMessage = 'Please check the highlighted fields';
      }

      message.error(errorMessage);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchText) return dataSource;
    const lowerSearch = searchText.toLowerCase();
    return dataSource.filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [dataSource, searchText]);

  const mergedColumns = useMemo(() => {
    if (dataSource.length === 0) return [];

    const keys = Object.keys(dataSource[0]);
    const dynamicCols = keys.map(key => ({
      title: key.toUpperCase().replace(/_/g, ' '),
      dataIndex: key,
      key: key,
      editable: true,
      width: key === 'id' ? 100 : (key === 'description' || key === 'name' ? 300 : 200),
      ellipsis: true,
      fixed: key === rowKey ? 'left' : undefined,
      sorter: (a, b) => {
        const valA = a[key] ?? '';
        const valB = b[key] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return valA - valB;
        }
        return String(valA).localeCompare(String(valB));
      },
    }));

    dynamicCols.push({
      title: 'ACTIONS',
      dataIndex: 'operation',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space size="middle">
            <Button
              type="link"
              onClick={() => save(record[rowKey])}
              className="text-blue-600 font-bold p-0"
              loading={isUpdating}
            >
              Save
            </Button>
            <Button type="link" onClick={cancel} className="font-bold p-0">
              Cancel
            </Button>
          </Space>
        ) : (
          <Space size="middle">
            <Button
              type="link"
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
              className="text-blue-600 font-bold p-0 flex items-center gap-1"
            >
              <FiEdit2 size={14} /> Edit
            </Button>
          </Space>
        );
      },
    });

    return dynamicCols.map((col) => {
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
  }, [dataSource, editingKey, isUpdating, rowKey]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between px-1">
        <div />
        <Input
          placeholder="Search Deadstock..."
          prefix={<FiSearch className="text-slate-400" />}
          onChange={e => setSearchText(e.target.value)}
          value={searchText}
          allowClear
          className="max-w-md h-10 rounded-lg border-slate-200 shadow-sm focus:border-blue-500 transition-all font-medium"
        />
      </div>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={filteredData}
          columns={mergedColumns}
          rowKey={rowKey}
          loading={isLoading}
          rowClassName={(record, index) => index % 2 === 1 ? 'editable-row even-row' : 'editable-row'}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            className: "px-4",
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            onShowSizeChange: (current, size) => {
              setPageSize(size);
            }
          }}
          scroll={{ x: 'max-content', y: 600 }}
          className="premium-table border-slate-100 shadow-sm rounded-lg overflow-hidden"
        />
      </Form>
    </div>
  );
}

export default RMStatusDeadStock;