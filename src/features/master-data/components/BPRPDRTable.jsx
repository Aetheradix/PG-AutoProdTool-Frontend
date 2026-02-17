import React from 'react';
import { GenericMasterTable } from './GenericMasterTable';
import {
    useGetBprPdrQuery,
    useUpdateBprPdrMutation,
    useCreateBprPdrMutation,
    useDeleteBprPdrMutation
} from '../../../store/api/masterDataApi';

export function BPRPDRTable() {
    return (
        <GenericMasterTable
            useGetQuery={useGetBprPdrQuery}
            title="BPR-PDR"
            searchPlaceholder="Search BPR-PDR..."
            readOnly={true}
        />
    );
}

export default BPRPDRTable;
