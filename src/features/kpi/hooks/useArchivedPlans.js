import { useState, useMemo } from 'react';

/**
 * Hook to manage archived plans logic.
 */
export const useArchivedPlans = () => {
    const [selectedDate, setSelectedDate] = useState(null);

    // Simulated data fetching
    const archivedPlansItems = useMemo(() => [
        { key: '1', id: 'PLN-001', version: 'V1.0', date: '2023-12-25' },
        { key: '2', id: 'PLN-002', version: 'V1.1', date: '2023-12-26' },
    ], []);

    const filteredPlans = useMemo(() => {
        if (!selectedDate) return archivedPlansItems;
        const formattedSearch = selectedDate.format('YYYY-MM-DD');
        return archivedPlansItems.filter(plan => plan.date === formattedSearch);
    }, [archivedPlansItems, selectedDate]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return {
        archivedPlans: filteredPlans,
        handleDateChange,
        selectedDate
    };
};
