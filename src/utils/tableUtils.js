/**
 * tableUtils.js
 * Pure utility functions shared by all editable table components.
 */
import dayjs from 'dayjs';

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
function isDatetimeField(key) {
    const lower = key.toLowerCase();
    return lower.includes('datetime') || lower.endsWith('_date');
}

function isDateOnlyField(key) {
    const lower = key.toLowerCase();
    return lower.endsWith('_date') && !lower.includes('datetime');
}

function isTimeField(key) {
    const lower = key.toLowerCase();
    return lower.endsWith('_time');
}

/**
 * Parses a duration-like string into {hours, minutes}.
 * Supports:
 *   PT15H43M  (ISO duration)
 *   15:43 / 15:43:00  (24-hour time)
 *   0 days 04:05:00  (pandas Timedelta string)
 *   1 days 02:19:00
 */
export function parseDuration(val) {
    let hours = 0;
    let minutes = 0;
    let isParsed = false;

    if (typeof val !== 'string') return { hours, minutes, isParsed };

    const s = val.trim();

    // Handle pandas Timedelta strings like "0 days 04:05:00" or "1 days 02:19:00"
    const daysMatch = s.match(/^(\d+)\s+days?\s+(\d+):(\d+)/i);
    if (daysMatch) {
        const extraDays = parseInt(daysMatch[1], 10);
        hours = extraDays * 24 + parseInt(daysMatch[2], 10);
        minutes = parseInt(daysMatch[3], 10);
        isParsed = true;
        return { hours, minutes, isParsed };
    }

    // Handle PT ISO Duration (e.g., PT15H43M)
    if (s.startsWith('PT')) {
        let timeStr = s.substring(2);
        if (timeStr.includes('H')) {
            const p = timeStr.split('H');
            hours = parseInt(p[0] || '0', 10);
            timeStr = p[1] || '';
        }
        if (timeStr.includes('M')) {
            const p = timeStr.split('M');
            minutes = parseInt(p[0] || '0', 10);
        }
        isParsed = true;
    }
    // Handle standard 24-hour format (e.g., 15:43 or 15:43:00)
    else if (s.includes(':')) {
        const parts = s.split(':');
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
        if (!isNaN(hours) && !isNaN(minutes)) {
            isParsed = true;
        }
    }

    return { hours, minutes, isParsed };
}

/**
 * Parses a date string that may be in YYYY-MM-DD, DD.MM.YYYY or DD/MM/YYYY.
 * Returns a dayjs object or null.
 */
function parseDateStrict(dateStr) {
    if (!dateStr) return null;
    const s = String(dateStr).trim();

    // DD.MM.YYYY  or  DD/MM/YYYY
    const dmyDot = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dmyDot) {
        return dayjs(`${dmyDot[3]}-${dmyDot[2].padStart(2,'0')}-${dmyDot[1].padStart(2,'0')}`);
    }
    const dmySlash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmySlash) {
        return dayjs(`${dmySlash[3]}-${dmySlash[2].padStart(2,'0')}-${dmySlash[1].padStart(2,'0')}`);
    }

    // Default: let dayjs try (handles ISO, YYYY-MM-DD, etc.)
    return dayjs(s);
}

/**
 * Combines a date string (YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY) with a duration-like time string.
 * Returns an ISO datetime string for the start of that time on that date.
 */
export function combineDateAndDuration(dateStr, timeStr) {
    if (!dateStr) return null;

    const baseDate = parseDateStrict(dateStr);
    if (!baseDate || !baseDate.isValid()) return null;

    if (!timeStr) return baseDate.toISOString();

    const { hours, minutes, isParsed } = parseDuration(timeStr);

    if (isParsed) {
        return baseDate.startOf('day').hour(hours).minute(minutes).second(0).toISOString();
    }

    // Fallback: If it's already a valid date-time string, return as is
    const fallback = dayjs(timeStr);
    if (fallback.isValid()) return fallback.toISOString();

    return baseDate.toISOString();
}

export function buildDynamicColumns(data, rowKey, excludeFields = []) {
    if (!data || data.length === 0) return [];

    const lowerExclude = (excludeFields || []).map((f) => String(f).toLowerCase());

    return Object.keys(data[0])
        .filter((key) => !lowerExclude.includes(key.toLowerCase()))
        .map((key) => {
        const isDatetime = isDatetimeField(key);
        const isDateOnly = isDateOnlyField(key);
        const isTime = isTimeField(key);
        const lowerKey = key.toLowerCase();

        return {
            title: key.toUpperCase().replace(/_/g, ' '),
            dataIndex: key,
            key,
            align: 'left',
            editable: true,
            inputType: isDatetime ? (isDateOnly ? 'date' : 'datetime') : isTime ? 'time' : 'text',
            width:
                lowerKey === 'description' || lowerKey.includes('desc')
                    ? 240
                    : lowerKey.includes('name') || lowerKey === 'id' || lowerKey === 'tag_name'
                        ? 180
                        : lowerKey === 'line' || lowerKey === 'bulk_id' || lowerKey === 'unit' || lowerKey === 'status'
                            ? 100
                            : isDatetime || isTime
                                ? 140
                                : 140,
            ellipsis: true,
            fixed: key === rowKey ? 'left' : undefined,
            sorter: (a, b) => {
                const valA = a[key] ?? '';
                const valB = b[key] ?? '';
                if (typeof valA === 'number' && typeof valB === 'number') return valA - valB;
                return String(valA).localeCompare(String(valB));
            },
            ...(isDatetime && {
                render: (val) => {
                    if (!val) return '—';
                    if (isDateOnly) {
                        return dayjs(val).format('YYYY-MM-DD');
                    }
                    return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
                },
            }),
            ...(isTime && {
                render: (val) => {
                    if (!val) return '—';
                    
                    const { hours, minutes, isParsed } = parseDuration(val);

                    if (isParsed) {
                        // Format to 12-hour AM/PM format genericly
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        const formattedHours = hours % 12 || 12; // Convert 0 (midnight) or 12 (noon) to 12
                        const paddedHours = String(formattedHours).padStart(2, '0');
                        const paddedMinutes = String(minutes).padStart(2, '0');
                        return `${paddedHours}:${paddedMinutes} ${ampm}`;
                    }

                    return val;
                },
            }),
        };
    });
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
