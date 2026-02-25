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
      readOnly={false} // Allowing editing as per original file which had an Edit button
    />
  );
};

export default RMStatusDeadStock;
