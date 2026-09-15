import React, { useState, useMemo } from 'react';
import { Input, Space, Tag } from 'antd';
import { FiSearch, FiFilter } from 'react-icons/fi';
import BatchCard from './BatchCard';
import { ResourceStatusGrid } from './ResourceStatusGrid';

const TTSTank = ({ isLoading, lastRefreshTTS, productionData = [], error, isError }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Compute unique statuses and their counts
  const statusCounts = useMemo(() => {
    const counts = { ALL: productionData.length };
    productionData.forEach((item) => {
      const s = (item.status || 'OTHER').toUpperCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [productionData]);

  // Filter items by search query and selected status
  const filteredData = useMemo(() => {
    return productionData.filter((item) => {
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (item.status || '').toUpperCase() === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.batchId && item.batchId.toLowerCase().includes(q)) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.id && String(item.id).toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [productionData, searchQuery, selectedStatus]);

  const extraHeader = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
      {/* Search Input */}
      <div className="w-full sm:w-72">
        <Input
          prefix={<FiSearch className="text-slate-400 mr-1" />}
          placeholder="Search Batch ID, Variant, or Tank #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="rounded-xl h-9 text-xs"
        />
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1 shrink-0">
          <FiFilter size={12} /> Status:
        </span>
        {Object.entries(statusCounts).map(([statusKey, count]) => {
          const isSelected = selectedStatus === statusKey;
          return (
            <button
              key={statusKey}
              type="button"
              onClick={() => setSelectedStatus(statusKey)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
              }`}
            >
              {statusKey} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <ResourceStatusGrid
      title="LIVE PRODUCTION DATA (RECENT)"
      lastRefresh={lastRefreshTTS}
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={filteredData}
      extraHeader={extraHeader}
      columns={{ xs: 24, sm: 12, md: 8, lg: 4 }}
      titleColor="bg-amber-400"
      renderItem={(item, index) => {
        return (
          <div className="w-full h-full flex">
            <BatchCard
              id={item.id}
              batchId={item.batchId}
              brand={item.brand}
              quantity={item.quantity}
              bulkPercent={item.bulkPercent}
              gcas={item.gcas}
              ph={item.ph}
              viscosity={item.viscosity}
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
