import React from 'react';
import { GenericMasterTable } from './GenericMasterTable';
import {
    useGetBprPdrQuery,
    useUpdateBprPdrMutation,
    useCreateBprPdrMutation,
    useDeleteBprPdrMutation
} from '../../../store/api/masterDataApi';

const DUMMY_BPRPDR = [
    { id: 1, gcas: '12345678', description: 'Sample BPR-PDR Item 1', quantity: 500, status: 'Active', bottleneck: 'Mixer A' },
    { id: 2, gcas: '87654321', description: 'Sample BPR-PDR Item 2', quantity: 1200, status: 'Pending', bottleneck: 'None' },
    { id: 3, gcas: '11223344', description: 'Sample BPR-PDR Item 3', quantity: 800, status: 'In Progress', bottleneck: 'Packing Line 2' },
];

export function BPRPDRTable() {
    return (
        <GenericMasterTable
            useGetQuery={useGetBprPdrQuery}
            title="BPR-PDR"
            searchPlaceholder="Search BPR-PDR..."
            readOnly={true}
            mockData={DUMMY_BPRPDR}
        />
    );
}

export default BPRPDRTable;
