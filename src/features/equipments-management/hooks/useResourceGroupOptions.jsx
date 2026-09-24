import { useGetEquipmentsMasterQuery } from '@/store/api/masterDataApi';
import { useMemo } from 'react';

/**
 * Derives unique resource_group options for a given equip_type
 * directly from the existing equipment master data — no new endpoint needed.
 */
export default function useResourceGroupOptions(type) {
  const { data: apiData, isLoading } = useGetEquipmentsMasterQuery({ page: 1, limit: 1000 });

  const options = useMemo(() => {
    const all = Array.isArray(apiData) ? apiData : [];

    const normalizedType = type.trim().toLowerCase();
    const uniqueGroups = [
      ...new Set(
        all
          .filter(
            (e) =>
              (e.equip_type ?? '').trim().toLowerCase() === normalizedType &&
              e.resource_group
          )
          .map((e) => e.resource_group)
      ),
    ];

    return uniqueGroups.map((group) => ({ value: group, label: group }));
  }, [apiData, type]);

  return { options, isLoading };
}
