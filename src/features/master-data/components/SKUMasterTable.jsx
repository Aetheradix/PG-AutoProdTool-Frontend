import React, { useState, useMemo } from 'react';
import { Table, Form, Input, Button, Space, message, Typography } from 'antd';
import { FiEdit2, FiSearch, FiPlus } from 'react-icons/fi';
import { useGetSkuMasterQuery, useUpdateSkuMasterMutation, useCreateSkuMasterMutation } from '../../../store/api/masterDataApi';
import EditableCell from '../../excel-upload/components/EditableCell';

const { Text } = Typography;

export function SKUMasterTable() {
    const [form] = Form.useForm();
    const { data: skuData, isLoading, isError } = useGetSkuMasterQuery();
    const [updateSkuMaster, { isLoading: isUpdating }] = useUpdateSkuMasterMutation();
    const [createSkuMaster, { isLoading: isCreating }] = useCreateSkuMasterMutation();
    const [editingKey, setEditingKey] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [searchText, setSearchText] = useState('');

    const isEditing = (record) => record.gcas === editingKey;

    const handleAdd = () => {
        setIsAdding(true);
        setEditingKey('NEW_RECORD');
        form.resetFields();
    };

    const edit = (record) => {
        form.setFieldsValue({ ...record });
        setEditingKey(record.gcas);
    };

    const cancel = () => {
        setEditingKey('');
        setIsAdding(false);
    };

    const save = async (gcas) => {
        try {
            const row = await form.validateFields();
            if (gcas === 'NEW_RECORD') {
                await createSkuMaster(row).unwrap();
                message.success('SKU created successfully');
                setIsAdding(false);
            } else {
                await updateSkuMaster({ gcas, ...row }).unwrap();
                message.success('SKU updated successfully');
            }
            setEditingKey('');
        } catch (err) {
            console.error('Save failed:', err);
            let errorMessage = 'Failed to save SKU';

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

    const baseDataSource = useMemo(() => {
        return Array.isArray(skuData)
            ? skuData
            : (skuData && Array.isArray(skuData.data) ? skuData.data : []);
    }, [skuData]);

    const dataSource = useMemo(() => {
        if (!isAdding) return baseDataSource;

        const emptyRow = baseDataSource.length > 0 ? { ...baseDataSource[0] } : { gcas: 'NEW_RECORD' };
        Object.keys(emptyRow).forEach(k => emptyRow[k] = '');
        emptyRow.gcas = 'NEW_RECORD';

        return [emptyRow, ...baseDataSource];
    }, [baseDataSource, isAdding]);

    const filteredData = useMemo(() => {
        if (!searchText) return dataSource;
        const lowerSearch = searchText.toLowerCase();
        return dataSource.filter(item =>
            (item.gcas?.toString().toLowerCase().includes(lowerSearch)) ||
            (item.technology?.toString().toLowerCase().includes(lowerSearch)) ||
            (item.description?.toString().toLowerCase().includes(lowerSearch))
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
            width: key === 'description' ? 300 : (key === 'gcas' ? 150 : 120),
            ellipsis: true,
            fixed: key === 'gcas' ? 'left' : undefined,
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
                            onClick={() => save(record.gcas)}
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
    }, [dataSource, editingKey, isUpdating, isCreating, isAdding]);

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
                    placeholder="Search GCAS, Technology or Description..."
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
                    rowKey="gcas"
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
