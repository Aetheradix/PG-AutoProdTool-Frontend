import React from 'react';
import { GenericMasterTable } from './GenericMasterTable';
import {
    useGetEaBnaaQuery,
    useUpdateEaBnaaMutation,
    useCreateEaBnaaMutation,
    useDeleteEaBnaaMutation
} from '../../../store/api/masterDataApi';

const DUMMY_EA_BNAA = [
    { id: 1, region: 'North', category: 'Category A', target_value: 15000, current_value: 12000, gap: -3000 },
    { id: 2, region: 'South', category: 'Category B', target_value: 20000, current_value: 21000, gap: 1000 },
    { id: 3, region: 'East', category: 'Category C', target_value: 18000, current_value: 17500, gap: -500 },
];

export function EABNAATable() {
    return (
        <GenericMasterTable
            useGetQuery={useGetEaBnaaQuery}
            title="EA BNAA"
            searchPlaceholder="Search EA BNAA..."
            readOnly={true}
            mockData={DUMMY_EA_BNAA}
        />
    );
}

export default EABNAATable;
