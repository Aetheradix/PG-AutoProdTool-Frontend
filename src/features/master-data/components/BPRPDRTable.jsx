import React, { useMemo, useState } from 'react';
import {
    Table, Form, Input, Button, Space, Popconfirm,
    Modal, DatePicker, Select, Tag, Tooltip, message
} from 'antd';
import {
    FiEdit2, FiTrash2, FiPlus, FiSearch,
    FiRefreshCw, FiDownload, FiFileText
} from 'react-icons/fi';
import { MdOutlineFactCheck } from 'react-icons/md';
import dayjs from 'dayjs';
import {
    useGetBprPdrQuery,
    useCreateBprPdrMutation,
    useUpdateBprPdrMutation,
    useDeleteBprPdrMutation,
} from '../../../store/api/masterDataApi';
import { useAuth } from '@/context/AuthContext';
import { exportDataTableToExcel } from '../../../utils/exportUtils';
import EditableCell from '../../excel-upload/components/EditableCell';

// ─── Field Config ────────────────────────────────────────────────────────────
const FIELD_CONFIG = [
    { key: 'sr_no',            label: 'Sr. No',           width: 70,  align: 'center', editable: false },
    { key: 'date',             label: 'Date',             width: 110, align: 'center', inputType: 'date' },
    { key: 'batch_no',         label: 'Batch No',         width: 100, align: 'center' },
    { key: 'fc_gcas',          label: 'FC GCAS',          width: 110, align: 'center' },
    { key: 'p_code',           label: 'P Code',           width: 110, align: 'center' },
    { key: 'bulk_description', label: 'Bulk Description', width: 200 },
    { key: 'line',             label: 'Line',             width: 90,  align: 'center' },
    { key: 'mkg_system',       label: 'Mkg System',       width: 100, align: 'center' },
    { key: 'issued_by_1',      label: 'Issued By',        width: 130 },
    { key: 'issued_to_1',      label: 'Issued To',        width: 130 },
];

const ADD_FIELDS = FIELD_CONFIG.filter(f => f.key !== 'sr_no');

const LINE_OPTIONS   = ['INT2', 'INT3', 'INC1', 'INC2', 'INC4', 'INC6'].map(v => ({ label: v, value: v }));
const SYSTEM_OPTIONS = ['12T', '6T', '1.25T'].map(v => ({ label: v, value: v }));

const SYSTEM_COLORS = { '12T': 'blue', '6T': 'green', '1.25T': 'orange' };

const normDate = (v) => (v ? (dayjs.isDayjs(v) ? v.format('DD-MMM-YY') : v) : null);

// ─── Component ───────────────────────────────────────────────────────────────
export function BPRPDRTable() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // ── API ──────────────────────────────────────────────────────────────────
    const { data: apiData, isLoading, refetch } = useGetBprPdrQuery({ page: 1, limit: 1000 });
    const [createBprPdr, { isLoading: isCreating }] = useCreateBprPdrMutation();
    const [updateBprPdr, { isLoading: isUpdating }] = useUpdateBprPdrMutation();
    const [deleteBprPdr] = useDeleteBprPdrMutation();

    // ── State ─────────────────────────────────────────────────────────────────
    const [form]    = Form.useForm();
    const [addForm] = Form.useForm();
    const [editingKey, setEditingKey]       = useState('');
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchText, setSearchText]       = useState('');
    const [addOpen, setAddOpen]             = useState(false);
    const [currentPage, setCurrentPage]     = useState(1);
    const pageSize = 10;

    // ── Derived data ──────────────────────────────────────────────────────────
    const rawData = useMemo(() => {
        if (Array.isArray(apiData?.data)) return apiData.data;
        if (Array.isArray(apiData))       return apiData;
        return [];
    }, [apiData]);

    const dataSource = useMemo(() =>
        rawData.map((item, i) => ({ ...item, _key: String(item.id ?? i) })),
    [rawData]);

    const filteredData = useMemo(() => {
        if (!searchText.trim()) return dataSource;
        const q = searchText.toLowerCase();
        return dataSource.filter(row =>
            Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q))
        );
    }, [dataSource, searchText]);

    // ── Edit helpers ──────────────────────────────────────────────────────────
    const isEditing = (r) => r._key === editingKey;

    const startEdit = (record) => {
        form.setFieldsValue({ ...record });
        setEditingRecord(record);
        setEditingKey(record._key);
    };

    const cancelEdit = () => { setEditingKey(''); setEditingRecord(null); };

    const saveEdit = async (key) => {
        try {
            const row      = await form.validateFields();
            const original = dataSource.find(r => r._key === key) || editingRecord;
            const payload  = { ...original, ...row, id: original.id };
            delete payload._key;
            await updateBprPdr(payload).unwrap();
            message.success('BPR-PDR record updated');
            cancelEdit();
        } catch (err) {
            if (err?.errorFields) return;
            message.error(err?.data?.message || 'Failed to update record');
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteBprPdr(record.id).unwrap();
            message.success('BPR-PDR record deleted');
        } catch (err) {
            message.error(err?.data?.message || 'Failed to delete record');
        }
    };

    const handleAdd = async () => {
        try {
            const values = await addForm.validateFields();
            if (values.date) values.date = normDate(values.date);
            await createBprPdr(values).unwrap();
            message.success('BPR-PDR record created successfully');
            setAddOpen(false);
            addForm.resetFields();
        } catch (err) {
            if (err?.errorFields) return;
            message.error(err?.data?.message || 'Failed to create record');
        }
    };

    const handleExport = () => {
        const exportData = filteredData.map(({ _key, ...rest }) => rest);
        exportDataTableToExcel(exportData, {
            fileName: 'BPR_PDR_Export.xlsx',
            sheetName: 'BPR-PDR',
            title: 'BPR-PDR — Batch Production Record',
            excludeFields: ['id', 'created_at', 'updated_at'],
        });
    };

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = useMemo(() => {
        const cols = FIELD_CONFIG.map(fc => ({
            title: fc.label,
            dataIndex: fc.key,
            key: fc.key,
            width: fc.width,
            align: fc.align || 'left',
            editable: fc.editable !== false,
            inputType: fc.inputType || 'text',
            ellipsis: true,
            render: (val) => {
                if (fc.key === 'mkg_system') {
                    return val
                        ? <Tag color={SYSTEM_COLORS[val] || 'default'}>{val}</Tag>
                        : <span className="text-slate-300">—</span>;
                }
                if (fc.key === 'date') {
                    return val
                        ? <span className="font-mono text-xs">{val}</span>
                        : <span className="text-slate-300">—</span>;
                }
                if (fc.key === 'batch_no') {
                    return val
                        ? <span className="font-bold text-blue-700">{val}</span>
                        : <span className="text-slate-300">—</span>;
                }
                return val != null && val !== ''
                    ? val
                    : <span className="text-slate-300">—</span>;
            },
            onCell: (record) => ({
                record,
                inputType: fc.inputType || 'text',
                dataIndex: fc.key,
                title: fc.label,
                editing: fc.editable !== false && isEditing(record),
            }),
        }));

        if (isAdmin) {
            cols.push({
                title: 'Actions',
                dataIndex: 'operation',
                fixed: 'right',
                width: 150,
                align: 'center',
                render: (_, record) => {
                    const editable = isEditing(record);
                    return editable ? (
                        <Space>
                            <Button
                                type="link"
                                onClick={() => saveEdit(record._key)}
                                className="text-blue-600 font-bold p-0"
                                loading={isUpdating}
                            >
                                Save
                            </Button>
                            <Button type="link" onClick={cancelEdit} className="p-0">
                                Cancel
                            </Button>
                        </Space>
                    ) : (
                        <Space>
                            <Tooltip title="Edit record">
                                <Button
                                    type="link"
                                    icon={<FiEdit2 size={13} />}
                                    disabled={editingKey !== ''}
                                    onClick={() => startEdit(record)}
                                    className="text-blue-600 p-0"
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Delete this BPR-PDR record?"
                                description="This action cannot be undone."
                                onConfirm={() => handleDelete(record)}
                                okText="Yes, Delete"
                                cancelText="No"
                                disabled={editingKey !== ''}
                                okButtonProps={{ danger: true }}
                            >
                                <Tooltip title="Delete record">
                                    <Button
                                        type="link"
                                        danger
                                        icon={<FiTrash2 size={13} />}
                                        disabled={editingKey !== ''}
                                        className="p-0"
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </Space>
                    );
                },
            });
        }

        return cols;
    }, [editingKey, isUpdating, isAdmin]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-4">

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <Button
                            type="primary"
                            icon={<FiPlus />}
                            onClick={() => { addForm.resetFields(); setAddOpen(true); }}
                            disabled={editingKey !== ''}
                            className="bg-blue-600 hover:bg-blue-700 font-medium"
                        >
                            Add Record
                        </Button>
                    )}
                    <Button
                        icon={<FiRefreshCw size={13} />}
                        onClick={() => refetch()}
                        loading={isLoading}
                        className="font-medium text-slate-600 hover:text-blue-600"
                    >
                        Refresh
                    </Button>
                    <Button
                        icon={<FiDownload size={13} />}
                        onClick={handleExport}
                        className="font-medium text-green-700 border-green-300 hover:border-green-500"
                    >
                        Export Excel
                    </Button>
                </div>

                <Input
                    placeholder="Search batch, GCAS, description..."
                    prefix={<FiSearch className="text-slate-400" />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                    className="max-w-sm h-10 rounded-lg border-slate-200 shadow-sm font-medium"
                />
            </div>

            {/* ── Stats bar ── */}
            <div className="flex items-center gap-4 px-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <MdOutlineFactCheck className="text-blue-500" size={15} />
                    Total Records:&nbsp;
                    <span className="text-blue-600 font-bold">{filteredData.length}</span>
                </span>
                {searchText && (
                    <span className="text-xs text-slate-400">
                        (filtered from {dataSource.length} total)
                    </span>
                )}
            </div>

            {/* ── Table ── */}
            <Form form={form} component={false}>
                <Table
                    components={{ body: { cell: EditableCell } }}
                    bordered
                    dataSource={filteredData}
                    columns={columns}
                    rowKey="_key"
                    loading={isLoading}
                    rowClassName={(_, i) => i % 2 === 1 ? 'editable-row even-row' : 'editable-row'}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        showSizeChanger: false,
                        showTotal: (total) => `${total} records`,
                        onChange: setCurrentPage,
                        className: 'px-4',
                    }}
                    scroll={{ x: 'max-content' }}
                    className="premium-table border-slate-100 shadow-sm rounded-lg overflow-hidden"
                />
            </Form>

            {/* ── Add Modal ── */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-slate-800">
                        <FiFileText className="text-blue-600" />
                        Add New BPR-PDR Record
                    </div>
                }
                open={addOpen}
                onOk={handleAdd}
                onCancel={() => { setAddOpen(false); addForm.resetFields(); }}
                okText="Create"
                confirmLoading={isCreating}
                width={900}
                className="premium-modal"
                okButtonProps={{ className: 'bg-blue-600' }}
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    className="grid grid-cols-3 gap-x-5 gap-y-1 pt-4"
                >
                    {ADD_FIELDS.map(fc => (
                        <Form.Item
                            key={fc.key}
                            name={fc.key}
                            label={
                                <span className="font-semibold text-slate-700 uppercase text-xs tracking-wider">
                                    {fc.label}
                                </span>
                            }
                            rules={
                                ['batch_no', 'fc_gcas'].includes(fc.key)
                                    ? [{ required: true, message: `${fc.label} is required` }]
                                    : []
                            }
                            {...(fc.inputType === 'date' && {
                                getValueProps: v => ({
                                    value: v ? dayjs(v, ['DD-MMM-YY', 'YYYY-MM-DD']) : null
                                }),
                                normalize: normDate,
                            })}
                        >
                            {fc.key === 'line' ? (
                                <Select
                                    options={LINE_OPTIONS}
                                    placeholder="Select line"
                                    className="w-full"
                                    allowClear
                                />
                            ) : fc.key === 'mkg_system' ? (
                                <Select
                                    options={SYSTEM_OPTIONS}
                                    placeholder="Select system"
                                    className="w-full"
                                    allowClear
                                />
                            ) : fc.inputType === 'date' ? (
                                <DatePicker
                                    format="DD-MMM-YY"
                                    className="w-full h-10 rounded-lg border-slate-200"
                                    placeholder={`Select ${fc.label}`}
                                />
                            ) : (
                                <Input
                                    placeholder={`Enter ${fc.label}`}
                                    className="rounded-lg border-slate-200 h-10"
                                />
                            )}
                        </Form.Item>
                    ))}
                </Form>
            </Modal>
        </div>
    );
}

export default BPRPDRTable;
