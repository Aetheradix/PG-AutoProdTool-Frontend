import React, { useState, useMemo } from 'react';
import { Table, Form, Input, Button, Space, message, Typography } from 'antd';
import { FiEdit2, FiSearch, FiPlus } from 'react-icons/fi';
import { useGetBulkDetailsQuery, useUpdateBulkDetailMutation, useCreateBulkDetailMutation } from '../../../store/api/masterDataApi';
import EditableCell from '../../excel-upload/components/EditableCell';

const { Text } = Typography;

export function BulkDetailTable() {
    const [form] = Form.useForm();
    const { data: bulkData, isLoading, isError } = useGetBulkDetailsQuery();
    const [updateBulkDetail, { isLoading: isUpdating }] = useUpdateBulkDetailMutation();
    const [createBulkDetail, { isLoading: isCreating }] = useCreateBulkDetailMutation();
    const [editingKey, setEditingKey] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [searchText, setSearchText] = useState('');

    const baseDataSource = useMemo(() => {
        return Array.isArray(bulkData)
            ? bulkData
            : (bulkData && Array.isArray(bulkData.data) ? bulkData.data : []);
    }, [bulkData]);

    const rowKey = useMemo(() => {
        if (baseDataSource.length === 0) return 'id';
        if (baseDataSource[0].id !== undefined) return 'id';
        if (baseDataSource[0].bulk_id !== undefined) return 'bulk_id';
        return Object.keys(baseDataSource[0])[0];
    }, [baseDataSource]);

    const dataSource = useMemo(() => {
        if (!isAdding) return baseDataSource;

        const emptyRow = baseDataSource.length > 0 ? { ...baseDataSource[0] } : { id: 'NEW_RECORD' };
        Object.keys(emptyRow).forEach(k => emptyRow[k] = '');
        emptyRow[rowKey] = 'NEW_RECORD';

        return [emptyRow, ...baseDataSource];
    }, [baseDataSource, isAdding, rowKey]);

    const isEditing = (record) => record[rowKey] === editingKey;

    const handleAdd = () => {
        setIsAdding(true);
        setEditingKey('NEW_RECORD');
        form.resetFields();
    };

    const edit = (record) => {
        form.setFieldsValue({ ...record });
        setEditingKey(record[rowKey]);
    };

    const cancel = () => {
        setEditingKey('');
        setIsAdding(false);
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            if (key === 'NEW_RECORD') {
                await createBulkDetail(row).unwrap();
                message.success('Bulk detail created successfully');
                setIsAdding(false);
            } else {
                await updateBulkDetail({ [rowKey]: key, ...row }).unwrap();
                message.success('Bulk detail updated successfully');
            }
            setEditingKey('');
        } catch (err) {
            console.error('Save failed:', err);
            let errorMessage = 'Failed to save bulk detail';

            if (err.data && err.data.detail) {
                // Backend string error
                errorMessage = Array.isArray(err.data.detail)
                    ? err.data.detail.map(e => e.msg).join(', ')
                    : err.data.detail;
            } else if (err.message) {
                // JS Error
                errorMessage = err.message;
            } else if (err.errorFields) {
                // Form validation error
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
            width: key === 'description' || key === 'name' ? 300 : 150,
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
                    <Button
                        type="link"
                        disabled={editingKey !== ''}
                        onClick={() => edit(record)}
                        className="text-blue-600 font-bold p-0 flex items-center gap-1"
                    >
                        <FiEdit2 size={14} /> Edit
                    </Button>
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
    }, [dataSource, editingKey, isUpdating, isCreating, rowKey, isAdding]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between px-1">
                <Button
                    type="primary"
                    onClick={handleAdd}
                    disabled={isAdding || editingKey !== ''}
                    icon={<FiPlus />}
                    className="bg-blue-600 hover:bg-blue-700 font-medium"
                >
                    Add Item
                </Button>
                <Input
                    placeholder="Search Bulk Details..."
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
                    rowClassName="editable-row"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        className: "px-4"
                    }}
                    scroll={{ x: 'max-content', y: 600 }}
                    className="border-slate-100 shadow-sm rounded-lg overflow-hidden"
                />
            </Form>
        </div>
    );
}
