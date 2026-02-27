import { useState, useMemo } from 'react';
import { useGetProductionScheduleQuery } from '@/store/api/planApi';

export const useScheduleTable = () => {
    const [searchText, setSearchText] = useState('');
    const [systemFilter, setSystemFilter] = useState('All');

    const {
        data: responseData,
        isLoading,
        isError,
        error,
    } = useGetProductionScheduleQuery({
        page: 1,
        limit: 1000,
    });

    const formatTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const formatDate = (isoString) => {
        if (!isoString) return null;
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getDateKey = (isoString) => {
        if (!isoString) return 'unknown';
        const date = new Date(isoString);
        return date.toISOString().split('T')[0];
    };

    const processBatch = (batch, index) => ({
        ...batch,
        key: batch.batch_id || `batch-${index}`,
        startTime: formatTime(batch.mkg_start_time),
        endTime: formatTime(batch.mkg_end_time),
        dateLabel: formatDate(batch.mkg_start_time),
        dateKey: getDateKey(batch.mkg_start_time),
        sn: index + 1,
    });

    // Restructure: System → Shift → DateKey → { label, batches }
    // API returns: Shift → System → batches[]
    // We flip to: System → Shift → DateKey → { label, batches[] }
    const { groupedData, sortedDates } = useMemo(() => {
        if (!responseData?.data) return { groupedData: {}, sortedDates: [] };

        const lowerSearch = searchText.toLowerCase();
        const allDates = new Set();

        // result: { "12T": { "A": { "2025-12-07": { label, batches } }, "B": {...}, "C": {...} }, "6T": {...} }
        const result = {};

        Object.entries(responseData.data).forEach(([shift, systems]) => {
            Object.entries(systems).forEach(([system, batches]) => {
                if (systemFilter !== 'All' && system !== systemFilter) return;

                const filteredBatches = batches
                    .filter(batch => {
                        if (!searchText) return true;
                        return Object.values(batch).some(val =>
                            val?.toString().toLowerCase().includes(lowerSearch)
                        );
                    })
                    .map((batch, index) => processBatch(batch, index));

                if (filteredBatches.length === 0) return;

                if (!result[system]) result[system] = {};
                if (!result[system][shift]) result[system][shift] = {};

                filteredBatches.forEach(batch => {
                    const dk = batch.dateKey;
                    allDates.add(dk);
                    if (!result[system][shift][dk]) {
                        result[system][shift][dk] = { label: batch.dateLabel, batches: [] };
                    }
                    result[system][shift][dk].batches.push(batch);
                });
            });
        });

        // Sort systems: 12T first, then 6T
        const systemOrder = ['12T', '6T'];
        const sorted = {};
        systemOrder.forEach(sys => {
            if (result[sys]) {
                // Sort shifts: A, B, C
                const shiftOrder = ['A', 'B', 'C'];
                const sortedShifts = {};
                shiftOrder.forEach(s => {
                    if (result[sys][s]) sortedShifts[s] = result[sys][s];
                });
                sorted[sys] = sortedShifts;
            }
        });
        // Add any remaining systems
        Object.keys(result).forEach(sys => {
            if (!sorted[sys]) sorted[sys] = result[sys];
        });

        const sortedDates = Array.from(allDates).sort();
        return { groupedData: sorted, sortedDates };
    }, [responseData, searchText, systemFilter]);

    const handleSearchChange = (value) => {
        setSearchText(value);
    };

    return {
        groupedData,
        sortedDates,
        rawData: responseData?.data,
        isLoading,
        isError,
        error,
        searchText,
        systemFilter,
        handleSearchChange,
        handleSystemFilterChange: (val) => {
            setSystemFilter(val);
        },
    };
};
