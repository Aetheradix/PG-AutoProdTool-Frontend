import React from 'react';
import RMTankCard from './RMTankCard';
import { ResourceStatusGrid } from './ResourceStatusGrid';
import { useRmStatus } from '../hooks/useRmStatus';

const RMTank = ({ lastRefreshRM }) => {
  const { rmTankData, latestRefreshTime, isLoading, isError, error } = useRmStatus();

  return (
    <ResourceStatusGrid
      title="LIVE RM TANK STATUS"
      lastRefresh={latestRefreshTime || lastRefreshRM}
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={rmTankData}
      columns={{ xs: 12, sm: 8, md: 6, lg: 4, xl: 3 }}
      renderItem={(tank) => (
        <RMTankCard tank={tank} />
      )}
    />
  );
};

export default RMTank;
