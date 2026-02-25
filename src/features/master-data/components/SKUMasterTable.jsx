import React from 'react';
import { StandardDataTable } from './StandardDataTable';
import {
  useGetSkuMasterQuery,
  useUpdateSkuMasterMutation,
  useCreateSkuMasterMutation,
  useDeleteSkuMasterMutation,
} from '../../../store/api/masterDataApi';

export function SKUMasterTable() {
  return (
    <StandardDataTable
      useGetQuery={useGetSkuMasterQuery}
      useUpdateMutation={useUpdateSkuMasterMutation}
      useCreateMutation={useCreateSkuMasterMutation}
      useDeleteMutation={useDeleteSkuMasterMutation}
      title="SKU Master"
      searchPlaceholder="Search GCAS, Technology or Description..."
      excludeFields={['id', 'created_at', 'updated_at']}
    />
  );
}
