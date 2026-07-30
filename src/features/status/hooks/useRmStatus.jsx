import { useMemo } from 'react';
import { useGetRmStatusQuery } from '@/store/api/statusApi';

export const useRmStatus = () => {
    const { data, isLoading, isError, error } = useGetRmStatusQuery();

    const latestRefreshTime = useMemo(() => {
        if (data?.DateandTime) return data.DateandTime;
        if (data?.DateAndTime) return data.DateAndTime;
        // Fallback: If data is loaded, display localized current time or last updated time
        if (data && data.success) {
            return new Date().toLocaleString('en-US', {
                dateStyle: 'short',
                timeStyle: 'medium'
            });
        }
        return null;
    }, [data]);


    const rmTankData = useMemo(() => {
        return data?.data?.map((tank) => ({
            id: tank.tank_name,
            name: tank.tank_name,
            value: tank.current_value,
            unit: tank.unit,
            status: tank.status,
            hexCode: tank.hex_code,
            dead_stock: tank.deadstock_value,
        })) || [];
    }, [data]);
    return {
        rmTankData,
        latestRefreshTime,
        isLoading,
        isError,
        error
    };
};
