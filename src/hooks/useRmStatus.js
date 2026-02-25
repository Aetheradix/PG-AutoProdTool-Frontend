import { useMemo } from 'react';
import { useGetRmStatusQuery } from '@/store/api/statusApi';

export const useRmStatus = () => {
    const { data, isLoading, isError, error } = useGetRmStatusQuery();

    const latestRefreshTime = data?.DateandTime || null;

    const rmTankData = useMemo(() => {
        return data?.data?.map((tank) => ({
            id: tank.tank_name,
            name: tank.tank_name,
            value: tank.current_value,
            unit: tank.deadstock_value > 100 ? 'KG' : '%',
            status: tank.status,
            hexCode: tank.hex_code,
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
