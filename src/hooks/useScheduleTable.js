import { useState, useMemo } from 'react';
import { useGetProductionScheduleQuery } from '@/store/api/planApi';

/**
 * Hook to manage production schedule table logic
 */
export const useScheduleTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');

    const {
        data: responseData,
        isLoading,
        isError,
        error,
    } = useGetProductionScheduleQuery({
        page: 1,
        limit: 1000,
    });

    const scheduleItems = responseData?.data ?? [];

    const formatTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return 0;
        const diff = new Date(end) - new Date(start);
        return (diff / (1000 * 60 * 60)).toFixed(1);
    };

    const processedData = useMemo(() => {
        return scheduleItems
            .map((item, index) => ({
                ...item,
                key: item.id || index,
                title: item.description,
                batch: item.batch_id,
                resource: item.system,
                startTime: formatTime(item.mkg_start_time),
                endTime: formatTime(item.pkg_end_time),
                duration: calculateDuration(item.mkg_start_time, item.pkg_end_time),
                status: 'ready',
            }))
            .sort((a, b) => new Date(a.mkg_start_time) - new Date(b.mkg_start_time));
    }, [scheduleItems]);

    const filteredData = useMemo(() => {
        if (!searchText) return processedData;
        const lowerSearch = searchText.toLowerCase();
        return processedData.filter((item) =>
            Object.values(item).some((val) => val?.toString().toLowerCase().includes(lowerSearch))
        );
    }, [processedData, searchText]);

    const handleSearchChange = (value) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const handlePaginationChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    return {
        filteredData,
        isLoading,
        isError,
        error,
        searchText,
        currentPage,
        pageSize,
        handleSearchChange,
        handlePaginationChange,
    };
};
