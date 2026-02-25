import React from 'react';
import { StandardDataTable } from './StandardDataTable';
import {
    useGetBprPdrQuery,
    useUpdateBprPdrMutation,
    useCreateBprPdrMutation,
    useDeleteBprPdrMutation
} from '../../../store/api/masterDataApi';

export function BPRPDRTable() {
    return (
        <StandardDataTable
            useGetQuery={useGetBprPdrQuery}
            title="BPR-PDR"
            searchPlaceholder="Search BPR-PDR..."
            readOnly={true}
        />
    );
}

export default BPRPDRTable;
