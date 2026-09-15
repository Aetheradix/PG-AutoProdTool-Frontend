import { useState, useMemo } from 'react';
import { Form, message } from 'antd';
import {
    extractApiData,
    detectRowKey,
    filterBySearch,
    parseApiError,
} from '../utils/tableUtils';
import { useAuth } from '../context/AuthContext';
import { recordAuditLog } from '../utils/auditUtils';

/**
 * useEditableTable
 *
 * Custom hook that encapsulates all state and handlers for an inline-editable
 * Ant Design table backed by RTK Query mutations.
 */
export function useEditableTable({
    useGetQuery,
    useUpdateMutation,
    useCreateMutation,
    useDeleteMutation,
    title = 'Item',
    excludeFields = ['id', 'created_at', 'updated_at', '_uniqueKey'],
    mockData = [],
    planType,
}) {
    const { user } = useAuth();

    // ─── Forms ────────────────────────────────────────────────────────────────
    const [form] = Form.useForm();
    const [addForm] = Form.useForm();

    // ─── API hooks ────────────────────────────────────────────────────────────
    const { data: apiData, isLoading, isError } = useGetQuery({ page: 1, limit: 1000 });

    const noop = () => { };
    const [updateItem, { isLoading: isUpdating }] = useUpdateMutation
        ? useUpdateMutation()
        : [noop, { isLoading: false }];
    const [createItem, { isLoading: isCreating }] = useCreateMutation
        ? useCreateMutation()
        : [noop, { isLoading: false }];
    const [deleteItem] = useDeleteMutation ? useDeleteMutation() : [noop];

    // ─── UI state ─────────────────────────────────────────────────────────────
    const [editingKey, setEditingKey] = useState('');
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // ─── Derived data ─────────────────────────────────────────────────────────
    const rawDataSource = useMemo(() => {
        const extracted = extractApiData(apiData, mockData);
        return extracted.length > 0 ? extracted : mockData;
    }, [apiData, mockData]);

    const primaryKeyField = useMemo(() => detectRowKey(rawDataSource), [rawDataSource]);

    // Ensure every record has a guaranteed unique key (_uniqueKey)
    const dataSource = useMemo(() => {
        return rawDataSource.map((item, index) => {
            const rawId = item.id ?? item.bulk_id ?? item.batch_no ?? item.batch_id ?? item.order_no;
            const uniqueKey = item.id != null 
                ? String(item.id) 
                : `${rawId || 'row'}_${item.line || ''}_${item.start_time || ''}_${index}`;
            return {
                ...item,
                _uniqueKey: uniqueKey,
            };
        });
    }, [rawDataSource]);

    const rowKey = '_uniqueKey';

    const filteredData = useMemo(
        () => filterBySearch(dataSource, searchText),
        [dataSource, searchText]
    );

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const isEditing = (record) => String(record?.[rowKey]) === String(editingKey);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    function edit(record) {
        form.setFieldsValue({ ...record });
        setEditingRecord(record);
        setEditingKey(record[rowKey]);
    }

    function cancel() {
        setEditingKey('');
        setEditingRecord(null);
    }

    async function save(key) {
        try {
            const row = await form.validateFields();
            const originalRecord = dataSource.find((item) => String(item[rowKey]) === String(key)) || editingRecord || {};
            
            // Determine the true backend ID to send
            const backendId = originalRecord.id ?? originalRecord[primaryKeyField] ?? key;
            const payload = {
                ...originalRecord,
                ...row,
                id: backendId,
                [primaryKeyField]: backendId,
            };

            // Remove internal client-only key before sending to API
            delete payload._uniqueKey;

            await updateItem(payload).unwrap();

            // Record audit trail
            recordAuditLog({
                userName: user?.name || user?.username || 'Planner User',
                userId: user?.id || user?.username || 'user',
                recordId: backendId,
                batchId: originalRecord.batch_no || originalRecord.batch_id || originalRecord.order_no || backendId,
                planType: planType || `${title} Management`,
                oldValues: originalRecord,
                newValues: row,
            });

            message.success(`${title} updated successfully`);
            setEditingKey('');
            setEditingRecord(null);
        } catch (err) {
            console.error('Save failed:', err);
            message.error(parseApiError(err, `Failed to save ${title.toLowerCase()}`));
        }
    }

    function handleAdd(initialValues = {}) {
        setIsAddModalOpen(true);
        addForm.resetFields();
        if (initialValues) {
            addForm.setFieldsValue(initialValues);
        }
    }

    async function handleAddOk(values) {
        try {
            // values might be the MouseEvent from Ant Design Modal onOk.
            // If it has nativeEvent or is a Proxy/Event, we treat it as null to trigger form validation.
            const isEvent = values && (values.nativeEvent || values instanceof Event || (values.target && values.stopPropagation));
            const row = (values && !isEvent) ? values : await addForm.validateFields();
            
            await createItem(row).unwrap();
            message.success(`${title} created successfully`);
            setIsAddModalOpen(false);
            addForm.resetFields();
        } catch (err) {
            console.error('Create failed:', err);
            message.error(parseApiError(err, `Failed to create ${title.toLowerCase()}`));
        }
    }

    async function handleDelete(record) {
        try {
            await deleteItem(record[rowKey]).unwrap();
            message.success(`${title} deleted successfully`);
        } catch (err) {
            console.error('Delete failed:', err);
            message.error(parseApiError(err, `Failed to delete ${title.toLowerCase()}`));
        }
    }

    function onPageChange(page, size) {
        setCurrentPage(page);
        setPageSize(size);
    }

    // ─── Form field list for Add modal ────────────────────────────────────────
    const addModalFields = useMemo(
        () =>
            dataSource.length > 0
                ? Object.keys(dataSource[0]).filter((k) => !excludeFields.includes(k))
                : [],
        [dataSource, excludeFields]
    );

    return {
        // forms
        form,
        addForm,
        // api state
        isLoading,
        isError,
        isUpdating,
        isCreating,
        // data
        dataSource,
        filteredData,
        rowKey,
        addModalFields,
        // editing state
        editingKey,
        isEditing,
        // search/pagination state
        searchText,
        setSearchText,
        currentPage,
        pageSize,
        onPageChange,
        // modal state
        isAddModalOpen,
        setIsAddModalOpen,
        // handlers
        edit,
        cancel,
        save,
        handleAdd,
        handleAddOk,
        handleDelete,
    };
}
