import React from 'react';
import StatusCard from './StatusCard';
import { ResourceStatusGrid } from './ResourceStatusGrid';
import { useRmStatus } from '@/hooks/useRmStatus';

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
      renderItem={(tank) => (
        <StatusCard
          title={tank.name}
          value={tank.value}
          hexCode={tank.hexCode}
          status={tank.status}
          unit={tank.unit}
          deadStock={tank.dead_stock}
        />
      )}
    />
  );
};

export default RMTank;
