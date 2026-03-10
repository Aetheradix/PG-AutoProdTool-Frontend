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

    />
  );
};

export default RMStatusDeadStock;
