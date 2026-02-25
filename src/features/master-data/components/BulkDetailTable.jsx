import React from 'react';
import { StandardDataTable } from './StandardDataTable';
import {
    useGetBulkDetailsQuery,
    useUpdateBulkDetailMutation,
    useCreateBulkDetailMutation,
    useDeleteBulkDetailMutation
} from '../../../store/api/masterDataApi';

export function BulkDetailTable() {
    return (
        <StandardDataTable
            useGetQuery={useGetBulkDetailsQuery}
            useUpdateMutation={useUpdateBulkDetailMutation}
            useCreateMutation={useCreateBulkDetailMutation}
            useDeleteMutation={useDeleteBulkDetailMutation}
            title="Bulk Detail"
            searchPlaceholder="Search Bulk Details..."
        />
    );
}
