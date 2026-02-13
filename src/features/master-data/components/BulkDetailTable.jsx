import React, { useState, useMemo } from 'react';
import { Table, Form, Input, Button, Space, message, Typography, Popconfirm, Modal } from 'antd';
import { FiEdit2, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useGetBulkDetailsQuery, useUpdateBulkDetailMutation, useCreateBulkDetailMutation, useDeleteBulkDetailMutation } from '../../../store/api/masterDataApi';
import EditableCell from '../../excel-upload/components/EditableCell';

const { Text } = Typography;

export function BulkDetailTable() {
    const [form] = Form.useForm();
    const { data: bulkData, isLoading, isError } = useGetBulkDetailsQuery({
        page: 1,
        limit: 1000
    });
    const [updateBulkDetail, { isLoading: isUpdating }] = useUpdateBulkDetailMutation();
    const [createBulkDetail, { isLoading: isCreating }] = useCreateBulkDetailMutation();
    const [deleteBulkDetail] = useDeleteBulkDetailMutation();
    const [editingKey, setEditingKey] = useState('');
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm] = Form.useForm();

    const baseDataSource = useMemo(() => {
        if (!bulkData) return [];
        return Array.isArray(bulkData.data) ? bulkData.data : (Array.isArray(bulkData) ? bulkData : []);
    }, [bulkData]);

    const rowKey = useMemo(() => {
        if (baseDataSource.length === 0) return 'id';
        if (baseDataSource[0].id !== undefined) return 'id';
        if (baseDataSource[0].bulk_id !== undefined) return 'bulk_id';
        return Object.keys(baseDataSource[0])[0];
    }, [baseDataSource]);

    const dataSource = useMemo(() => {
        return baseDataSource;
    }, [baseDataSource]);

    const isEditing = (record) => record[rowKey] === editingKey;

    const handleAdd = () => {
        setIsAddModalOpen(true);
        addForm.resetFields();
    };

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
            await updateBulkDetail({ [rowKey]: key, ...row }).unwrap();
            message.success('Bulk detail updated successfully');
            setEditingKey('');
        } catch (err) {
            console.error('Save failed:', err);
            let errorMessage = 'Failed to save bulk detail';

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

    const handleAddOk = async () => {
        try {
            const row = await addForm.validateFields();
            await createBulkDetail(row).unwrap();
            message.success('Bulk detail created successfully');
            setIsAddModalOpen(false);
            addForm.resetFields();
        } catch (err) {
            console.error('Create failed:', err);
            let errorMessage = 'Failed to create bulk detail';
            if (err.data && err.data.detail) {
                errorMessage = Array.isArray(err.data.detail)
                    ? err.data.detail.map(e => e.msg).join(', ')
                    : err.data.detail;
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
            width: key === 'id' || key === 'bulk_id' ? 100 : (key === 'description' || key === 'name' ? 300 : 200),
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
                        <Popconfirm
                            title="Delete this item?"
                            description="Are you sure you want to delete this record?"
                            onConfirm={async () => {
                                try {
                                    await deleteBulkDetail(record[rowKey]).unwrap();
                                    message.success('Record deleted successfully');
                                } catch (err) {
                                    console.error('Delete failed:', err);
                                    message.error('Failed to delete record');
                                }
                            }}
                            okText="Yes"
                            cancelText="No"
                            disabled={editingKey !== ''}
                        >
                            <Button
                                type="link"
                                danger
                                disabled={editingKey !== ''}
                                className="font-bold p-0 flex items-center gap-1"
                            >
                                <FiTrash2 size={14} /> Delete
                            </Button>
                        </Popconfirm>
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
    }, [dataSource, editingKey, isUpdating, isCreating, rowKey]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between px-1">
                <Button
                    type="primary"
                    onClick={handleAdd}
                    disabled={editingKey !== ''}
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

            <Modal
                title="Add New Bulk Detail"
                open={isAddModalOpen}
                onOk={handleAddOk}
                onCancel={() => setIsAddModalOpen(false)}
                okText="Create"
                confirmLoading={isCreating}
                width={1200}
                className="premium-modal"
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    className="grid grid-cols-4 gap-x-6 gap-y-2 py-4"
                >
                    {dataSource.length > 0 && Object.keys(dataSource[0])
                        .filter(key => key !== 'id' && key !== 'bulk_id' && key !== 'created_at' && key !== 'updated_at')
                        .map(key => (
                            <Form.Item
                                key={key}
                                name={key}
                                label={<span className="font-semibold text-slate-700 uppercase text-xs tracking-wider">{key.replace(/_/g, ' ')}</span>}
                                rules={[{ required: true, message: `Please input ${key.replace(/_/g, ' ')}` }]}
                            >
                                <Input
                                    placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                                    className="rounded-lg border-slate-200 h-10"
                                />
                            </Form.Item>
                        ))}
                </Form>
            </Modal>
        </div>
    );
}
