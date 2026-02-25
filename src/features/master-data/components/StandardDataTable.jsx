import React, { useMemo } from 'react';
import { Table, Form, Input, Button, Space, Popconfirm, Modal } from 'antd';
import { FiEdit2, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import EditableCell from '../../excel-upload/components/EditableCell';
import { useEditableTable } from '../../../hooks/useEditableTable';
import { buildDynamicColumns } from '../../../utils/tableUtils';

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
export function StandardDataTable(props) {
    const {
        title = "Item",
        searchPlaceholder = "Search...",
        readOnly = false,
    } = props;

    const table = useEditableTable(props);

    const columns = useMemo(() => {
        if (table.dataSource.length === 0) return [];

        const dynamicCols = buildDynamicColumns(table.dataSource, table.rowKey);

        if (!readOnly) {
            dynamicCols.push({
                title: 'ACTIONS',
                dataIndex: 'operation',
                fixed: 'right',
                width: 150,
                render: (_, record) => {
                    const editable = table.isEditing(record);
                    return editable ? (
                        <Space size="middle">
                            <Button
                                type="link"
                                onClick={() => table.save(record[table.rowKey])}
                                className="text-blue-600 font-bold p-0"
                                loading={table.isUpdating}
                            >
                                Save
                            </Button>
                            <Button type="link" onClick={table.cancel} className="font-bold p-0">
                                Cancel
                            </Button>
                        </Space>
                    ) : (
                        <Space size="middle">
                            <Button
                                type="link"
                                disabled={table.editingKey !== ''}
                                onClick={() => table.edit(record)}
                                className="text-blue-600 font-bold p-0 flex items-center gap-1"
                            >
                                <FiEdit2 size={14} /> Edit
                            </Button>
                            <Popconfirm
                                title={`Delete this ${title.toLowerCase()}?`}
                                description={`Are you sure you want to delete this record?`}
                                onConfirm={() => table.handleDelete(record)}
                                okText="Yes"
                                cancelText="No"
                                disabled={table.editingKey !== ''}
                            >
                                <Button
                                    type="link"
                                    danger
                                    disabled={table.editingKey !== ''}
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
                    editing: table.isEditing(record),
                }),
            };
        });
    }, [table, readOnly, title]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between px-1">
                {!readOnly ? (
                    <Button
                        type="primary"
                        onClick={table.handleAdd}
                        disabled={table.editingKey !== ''}
                        icon={<FiPlus />}
                        className="bg-blue-600 hover:bg-blue-700 font-medium"
                    >
                        Add {title}
                    </Button>
                ) : <div />}
                <Input
                    placeholder={searchPlaceholder}
                    prefix={<FiSearch className="text-slate-400" />}
                    onChange={e => table.setSearchText(e.target.value)}
                    value={table.searchText}
                    allowClear
                    className="max-w-md h-10 rounded-lg border-slate-200 shadow-sm focus:border-blue-500 transition-all font-medium"
                />
            </div>
            <Form form={table.form} component={false}>
                <Table
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    bordered
                    dataSource={table.filteredData}
                    columns={columns}
                    rowKey={table.rowKey}
                    loading={table.isLoading}
                    rowClassName={(record, index) => index % 2 === 1 ? 'editable-row even-row' : 'editable-row'}
                    pagination={{
                        current: table.currentPage,
                        pageSize: table.pageSize,
                        showSizeChanger: true,
                        className: "px-4",
                        onChange: table.onPageChange,
                    }}
                    scroll={{ x: 'max-content', y: 600 }}
                    className="premium-table border-slate-100 shadow-sm rounded-lg overflow-hidden"
                />
            </Form>

            <Modal
                title={`Add New ${title}`}
                open={table.isAddModalOpen}
                onOk={table.handleAddOk}
                onCancel={() => table.setIsAddModalOpen(false)}
                okText="Create"
                confirmLoading={table.isCreating}
                width={1200}
                className="premium-modal"
            >
                <Form
                    form={table.addForm}
                    layout="vertical"
                    className="grid grid-cols-4 gap-x-6 gap-y-2 py-4"
                >
                    {table.addModalFields.map(key => (
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
