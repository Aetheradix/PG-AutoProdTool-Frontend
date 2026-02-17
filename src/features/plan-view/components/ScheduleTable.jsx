import React, { useState, useMemo } from 'react';
import { Table, Tag, Typography, Space, Input } from 'antd';
import { FiClock, FiSearch } from 'react-icons/fi';
import { useGetProductionScheduleQuery } from '@/store/api/planApi';

const { Title, Text } = Typography;

const ScheduleTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const { data: responseData, isLoading, isError } = useGetProductionScheduleQuery({
    page: currentPage,
    limit: pageSize
  });

  const scheduleItems = responseData?.data ?? [];
  const totalCount = responseData?.pagination?.total || scheduleItems.length;

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return (diff / (1000 * 60 * 60)).toFixed(1);
  };

  const processedData = useMemo(() => {
    return scheduleItems.map((item, index) => ({
      ...item,
      key: item.id || index,
      title: item.description,
      batch: item.batch_id,
      resource: item.system,
      startTime: formatTime(item.mkg_start_time),
      endTime: formatTime(item.pkg_end_time),
      duration: calculateDuration(item.mkg_start_time, item.pkg_end_time),
      status: 'ready',
    })).sort((a, b) => new Date(a.mkg_start_time) - new Date(b.mkg_start_time));
  }, [scheduleItems]);

  const filteredData = useMemo(() => {
    if (!searchText) return processedData;
    const lowerSearch = searchText.toLowerCase();
    return processedData.filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [processedData, searchText]);

  const columns = [
    {
      title: 'Task / Product',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <Space>
          <Text strong className="text-slate-700">
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Batch Code',
      dataIndex: 'batch',
      key: 'batch',
      render: (text) => <Text type="secondary">{text || 'N/A'}</Text>,
    },
    {
      title: 'Production Line',
      dataIndex: 'production_line',
      key: 'production_line',
      render: (text) => (
        <Tag color="cyan" className="rounded-md font-medium px-3">
          {text}
        </Tag>
      ),
    },
    {
      title: 'System',
      dataIndex: 'resource',
      key: 'resource',
      render: (text) => (
        <Tag color="blue" className="rounded-md font-bold px-3">
          {text}
        </Tag>
      ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      render: (_, record) => (
        <Space className="text-slate-500 text-xs">
          <FiClock size={14} />
          <span>
            {record.startTime} - {record.endTime}
          </span>
          <span className="text-slate-300">({record.duration}h)</span>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
        <div>
          <Title level={4} className="m-0! text-slate-800">
            Production Schedule Table
          </Title>
          <Text type="secondary" className="text-sm">
            Total {totalCount} items found
          </Text>
        </div>
        <Input
          placeholder="Search items..."
          prefix={<FiSearch className="text-slate-400" />}
          onChange={e => setSearchText(e.target.value)}
          value={searchText}
          allowClear
          className="max-w-xs h-10 rounded-lg border-slate-200 shadow-xs focus:border-blue-500 transition-all font-medium"
        />
      </div>
      <Table
        dataSource={filteredData}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalCount,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          className: "px-6 py-4"
        }}
        loading={isLoading}
        className="modern-table"
        rowClassName="hover:bg-blue-50/30 transition-colors"
      />
    </div>
  );
};

export default ScheduleTable;