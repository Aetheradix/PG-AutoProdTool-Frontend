/**
 * tableUtils.js
 * Pure utility functions shared by all editable table components.
 */

/**
 * Normalises various API response shapes into a plain array.
 * Handles: { data: [] }, plain [], or null/undefined → fallback.
 */
export function extractApiData(apiResponse, fallback = []) {
    if (!apiResponse) return fallback;
    if (Array.isArray(apiResponse.data)) return apiResponse.data;
    if (Array.isArray(apiResponse)) return apiResponse;
    return fallback;
}

/**
 * Auto-detects the primary key field from the first record.
 * Priority: id → bulk_id → first key in object.
 */
export function detectRowKey(data) {
    if (!data || data.length === 0) return 'id';
    const first = data[0];
    if (first.id !== undefined) return 'id';
    if (first.bulk_id !== undefined) return 'bulk_id';
    return Object.keys(first)[0];
}

/**
 * Builds Ant Design column definitions dynamically from the data shape.
 * @param {Array}  data    - The data array (uses first record's keys)
 * @param {string} rowKey  - The primary key field name (pinned left)
 * @returns {Array} column definitions (without the Actions column)
 */
export function buildDynamicColumns(data, rowKey) {
    if (!data || data.length === 0) return [];

    return Object.keys(data[0]).map((key) => ({
        title: key.toUpperCase().replace(/_/g, ' '),
        dataIndex: key,
        key,
        editable: true,
        width:
            key === 'id' || key === 'bulk_id'
                ? 100
                : key === 'description' || key === 'name'
                    ? 300
                    : 200,
        ellipsis: true,
        fixed: key === rowKey ? 'left' : undefined,
        sorter: (a, b) => {
            const valA = a[key] ?? '';
            const valB = b[key] ?? '';
            if (typeof valA === 'number' && typeof valB === 'number') return valA - valB;
            return String(valA).localeCompare(String(valB));
        },
    }));
}

/**
 * Filters a data array against a search string by checking all field values.
 */
export function filterBySearch(data, searchText) {
    if (!searchText) return data;
    const lower = searchText.toLowerCase();
    return data.filter((item) =>
        Object.values(item).some((val) => val?.toString().toLowerCase().includes(lower))
    );
}

/**
 * Extracts a human-readable error message from RTK Query error objects.
 */
export function parseApiError(err, fallback = 'An unexpected error occurred') {
    if (err?.data?.detail) {
        return Array.isArray(err.data.detail)
            ? err.data.detail.map((e) => e.msg).join(', ')
            : err.data.detail;
    }
    if (err?.message) return err.message;
    if (err?.errorFields) return 'Please check the highlighted fields';
    return fallback;
}
