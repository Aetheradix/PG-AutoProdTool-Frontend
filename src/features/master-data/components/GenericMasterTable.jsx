import React, { useState, useMemo } from 'react';
import { Table, Form, Input, Button, Space, message, Typography, Popconfirm, Modal } from 'antd';
import { FiEdit2, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import EditableCell from '../../excel-upload/components/EditableCell';

const { Text } = Typography;

/**
 * GenericMasterTable Component
 * 
 * @param {Object} props
 * @param {Function} props.useGetQuery - Redux query hook (e.g., useGetSkuMasterQuery)
 * @param {Function} props.useUpdateMutation - Redux mutation hook for update
 * @param {Function} props.useCreateMutation - Redux mutation hook for create
 * @param {Function} props.useDeleteMutation - Redux mutation hook for delete
 * @param {string} props.title - Title for the Add Modal
 * @param {string} props.searchPlaceholder - Placeholder for the search input
 * @param {Array} props.excludeFields - Fields to exclude from the Add Modal form
 * @param {boolean} [props.readOnly=false] - If true, disables editing, creating, and deleting actions.
 */
export function GenericMasterTable({
    useGetQuery,
    useUpdateMutation,
    useCreateMutation,
    useDeleteMutation,
    title = "Item",
    searchPlaceholder = "Search...",
    excludeFields = ['id', 'created_at', 'updated_at'],
    readOnly = false,
    mockData = []
}) {
    const [form] = Form.useForm();
    const { data: apiData, isLoading, isError } = useGetQuery({
        page: 1,
        limit: 1000
    });

    const [updateItem, { isLoading: isUpdating }] = useUpdateMutation ? useUpdateMutation() : [() => { }, { isLoading: false }];
    const [createItem, { isLoading: isCreating }] = useCreateMutation ? useCreateMutation() : [() => { }, { isLoading: false }];
    const [deleteItem] = useDeleteMutation ? useDeleteMutation() : [() => { }];

    const [editingKey, setEditingKey] = useState('');
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm] = Form.useForm();

    const baseDataSource = useMemo(() => {
        if (!apiData) return mockData;
        const data = Array.isArray(apiData.data) ? apiData.data : (Array.isArray(apiData) ? apiData : []);
        return data.length > 0 ? data : mockData;
    }, [apiData, mockData]);

    const rowKey = useMemo(() => {
        if (baseDataSource.length === 0) return 'id';
        if (baseDataSource[0].id !== undefined) return 'id';
        // Fallback to first key
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
            await updateItem({ [rowKey]: key, ...row }).unwrap();
            message.success(`${title} updated successfully`);
            setEditingKey('');
        } catch (err) {
            console.error('Save failed:', err);
            let errorMessage = `Failed to save ${title.toLowerCase()}`;

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
            await createItem(row).unwrap();
            message.success(`${title} created successfully`);
            setIsAddModalOpen(false);
            addForm.resetFields();
        } catch (err) {
            console.error('Create failed:', err);
            let errorMessage = `Failed to create ${title.toLowerCase()}`;
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

        if (!readOnly) {
            dynamicCols.push({
                title: 'ACTIONS',
                dataIndex: 'operation',
                fixed: 'right',
                width: 150,
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
                                title={`Delete this ${title.toLowerCase()}?`}
                                description={`Are you sure you want to delete this record?`}
                                onConfirm={async () => {
                                    try {
                                        await deleteItem(record[rowKey]).unwrap();
                                        message.success(`${title} deleted successfully`);
                                    } catch (err) {
                                        console.error('Delete failed:', err);
                                        message.error(`Failed to delete ${title.toLowerCase()}`);
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
        }

        return dynamicCols.map((col) => {
            if (!col.editable || readOnly) {
                return { ...col, editable: false };
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
    }, [dataSource, editingKey, isUpdating, isCreating, rowKey, title]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between px-1">
                {!readOnly ? (
                    <Button
                        type="primary"
                        onClick={handleAdd}
                        disabled={editingKey !== ''}
                        icon={<FiPlus />}
                        className="bg-blue-600 hover:bg-blue-700 font-medium"
                    >
                        Add {title}
                    </Button>
                ) : <div />}
                <Input
                    placeholder={searchPlaceholder}
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
                title={`Add New ${title}`}
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
                        .filter(key => !excludeFields.includes(key))
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
