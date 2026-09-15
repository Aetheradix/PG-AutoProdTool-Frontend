import React from 'react';
import { StandardDataTable } from './StandardDataTable';
import { useGetDeadstockQuery, useUpdateDeadstockMutation } from '../../../store/api/masterDataApi';

const RMStatusDeadStock = () => {
  return (
    <StandardDataTable
      useGetQuery={useGetDeadstockQuery}
      useUpdateMutation={useUpdateDeadstockMutation}
      title="Deadstock"
      searchPlaceholder="Search Deadstock..."
      // "current_value" commented out / hidden from table & add modal
      excludeColumns={['current_value']}
      excludeFields={['id', 'current_value', 'created_at', 'updated_at']}
    />
  );
};

export default RMStatusDeadStock;
