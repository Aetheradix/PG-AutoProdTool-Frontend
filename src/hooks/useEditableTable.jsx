import { useState, useMemo } from 'react';
import { Form, message } from 'antd';
import {
    extractApiData,
    detectRowKey,
    filterBySearch,
    parseApiError,
} from '../utils/tableUtils';

/**
 * useEditableTable
 *
 * Custom hook that encapsulates all state and handlers for an inline-editable
 * Ant Design table backed by RTK Query mutations.
 *
 * @param {object} options
 * @param {Function} options.useGetQuery        - RTK Query hook for fetching (required)
 * @param {Function} [options.useUpdateMutation] - RTK Query hook for update
 * @param {Function} [options.useCreateMutation] - RTK Query hook for create
 * @param {Function} [options.useDeleteMutation] - RTK Query hook for delete
 * @param {string}   [options.title]             - Human label used in success/error messages
 * @param {Array}    [options.excludeFields]     - Fields to hide from the Add modal form
 * @param {Array}    [options.mockData]          - Fallback data when API returns nothing
 */
export function useEditableTable({
    useGetQuery,
    useUpdateMutation,
    useCreateMutation,
    useDeleteMutation,
    title = 'Item',
    excludeFields = ['id', 'created_at', 'updated_at'],
    mockData = [],
}) {
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
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // ─── Derived data ─────────────────────────────────────────────────────────
    const dataSource = useMemo(() => {
        const extracted = extractApiData(apiData, mockData);
        return extracted.length > 0 ? extracted : mockData;
    }, [apiData, mockData]);

    const rowKey = useMemo(() => detectRowKey(dataSource), [dataSource]);

    const filteredData = useMemo(
        () => filterBySearch(dataSource, searchText),
        [dataSource, searchText]
    );

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const isEditing = (record) => record[rowKey] === editingKey;

    // ─── Handlers ─────────────────────────────────────────────────────────────
    function edit(record) {
        form.setFieldsValue({ ...record });
        setEditingKey(record[rowKey]);
    }

    function cancel() {
        setEditingKey('');
    }

    async function save(key) {
        try {
            const row = await form.validateFields();
            await updateItem({ [rowKey]: key, ...row }).unwrap();
            message.success(`${title} updated successfully`);
            setEditingKey('');
        } catch (err) {
            console.error('Save failed:', err);
            message.error(parseApiError(err, `Failed to save ${title.toLowerCase()}`));
        }
    }

    function handleAdd() {
        setIsAddModalOpen(true);
        addForm.resetFields();
    }

    async function handleAddOk() {
        try {
            const row = await addForm.validateFields();
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
