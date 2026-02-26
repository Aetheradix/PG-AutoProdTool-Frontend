import React from 'react';
import BatchCard from './BatchCard';
import { ResourceStatusGrid } from './ResourceStatusGrid';

const TTSTank = ({ isLoading, lastRefreshTTS, productionData, getLatestDate, error, isError }) => {
  return (
    <ResourceStatusGrid
      title="LIVE PRODUCTION DATA (RECENT)"
      lastRefresh={lastRefreshTTS}
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={productionData}
      columns={{ xs: 24, sm: 12, md: 4 }}
      titleColor="bg-amber-400"
      renderItem={(item, index) => {
        return (
          <div className="w-full h-full flex">
            <BatchCard
              id={item.id}
              batchId={item.batchId}
              brand={item.brand}
              date={item.timestamp > 0 ? new Date(item.timestamp).toLocaleDateString() : 'N/A'}
              color={item.colorName}
              status={item.status}
              hexCode={item.hexCode}
              index={index + 1}
            />
          </div>
        );
      }}
    />
  );
};

export default TTSTank;
