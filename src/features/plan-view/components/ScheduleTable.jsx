import React, { useMemo } from 'react';
import { Table, Typography, Input, ConfigProvider, Tooltip } from 'antd';
import { FiSearch, FiActivity, FiCalendar } from 'react-icons/fi';
import { useScheduleTable } from '../hooks/useScheduleTable';

const { Title, Text } = Typography;

// ─── Constants ───
const SHIFT_COLORS = {
  A: { bg: '#FFFF00', text: '#000', label: '#FFFF00' },
  B: { bg: '#00B050', text: '#FFF', label: '#00B050' },
  C: { bg: '#FFC000', text: '#000', label: '#FFC000' },
};

const CELL_BG = {
  GREEN: 'bg-[#D4EDDA]',
  RED: 'bg-[#F4837D]',
  YELLOW: 'bg-[#FFF2CC]',
};

const BASE_CELL_CLASS = 'border-r border-[#666] text-xs font-bold text-black';

const COLUMN_CONFIG = [
  { title: 'S.No', dataIndex: 'sn', width: 48, align: 'center', bg: 'GREEN' },
  { title: 'GCAS', dataIndex: 'gcas', width: 100, bg: 'GREEN' },
  { title: 'Description', dataIndex: 'description', width: 200, bg: 'GREEN', type: 'truncated' },
  { title: 'Line', dataIndex: 'production_line', width: 70, align: 'center', bg: 'GREEN', className: 'uppercase' },
  { title: 'Batch No', dataIndex: 'batch_id', width: 90, bg: 'RED' },
  { title: 'Start Time', dataIndex: 'startTime', width: 68, align: 'center', bg: 'YELLOW' },
  { title: 'End Time', dataIndex: 'endTime', width: 68, align: 'center', bg: 'YELLOW' },
  { title: 'Remarks', dataIndex: 'remarks', width: 160, bg: 'YELLOW', type: 'remarks' },
];


const renderTruncatedText = (text) => (
  <Tooltip title={text} placement="topLeft">
    <div className="truncate w-full cursor-default">
      {text}
    </div>
  </Tooltip>
);

const padRows = (batches, target = 9) => {
  const rows = [...batches];
  for (let i = batches.length; i < target; i++) {
    rows.push({
      key: `empty-${i}`,
      sn: i + 1,
      gcas: '',
      description: '',
      production_line: '',
      batch_id: '',
      startTime: '',
      endTime: '',
      remarks: '',
    });
  }
  return rows;
};

// ─── Main Component ───
const ScheduleTable = ({ groupedData: propsGrouped, sortedDates: propsDates }) => {
  const hookData = useScheduleTable();
  
  const groupedData = propsGrouped || hookData.groupedData;
  const sortedDates = propsDates || hookData.sortedDates;
  const {
    isLoading,
    searchText,
    systemFilter,
    handleSearchChange,
    handleSystemFilterChange,
  } = hookData;

  // Dynamically build columns based on config
  const columns = useMemo(() => {
    return COLUMN_CONFIG.map((col) => ({
      title: col.title,
      dataIndex: col.dataIndex,
      key: col.dataIndex,
      width: col.width,
      align: col.align,
      className: `${BASE_CELL_CLASS} ${CELL_BG[col.bg]} ${col.className || ''}`,
      render: (text) => {
        if (col.type === 'truncated') return renderTruncatedText(text);
        if (col.type === 'remarks') return text ? <span className="text-red-600 font-extrabold">{text}</span> : '';
        return text;
      },
    }));
  }, []);

  const hasData = Object.keys(groupedData).length > 0;

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: '#9EB3C8',
            headerColor: '#000',
            headerSplitColor: '#666',
            borderRadius: 0,
            fontSize: 11,
            cellPaddingBlock: 4,
            cellPaddingInline: 6,
            borderColor: '#666',
            rowHoverBg: 'transparent',
          },
        },
      }}
    >
      <div className=" p-3 lg:p-5 flex flex-col h-full gap-3 overflow-hidden mt-20">
        {/* Title */}
        <div className="bg-[#8FA8C8] text-black text-center py-3 rounded font-black uppercase tracking-widest text-sm border border-[#666]">
          DAILY PRODUCTION PLAN FOR HAIR CARE MAKING
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
          <Input
            placeholder="Search GCAS, Batch, Line..."
            prefix={<FiSearch className="text-gray-400 mr-1" />}
            onChange={(e) => handleSearchChange(e.target.value)}
            value={searchText}
            allowClear
            className="h-9 rounded border-[#444] text-white lg:w-72 text-sm"
          />
          <div className="flex gap-2 items-center">
            <div className="flex p-0.5 rounded border border-[#444]">
              {['All', '6T', '12T'].map((f) => (
                <button
                  key={f}
                  onClick={() => handleSystemFilterChange(f)}
                  className={`px-3 py-1 rounded text-xs font-black transition-all cursor-pointer ${
                    systemFilter === f ? 'bg-[#FFC000] text-black shadow' : 'text-gray-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Table Area */}
        <div className="grow overflow-auto border-2 border-[#806000]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-20 opacity-50">
              <div className="w-10 h-10 border-4 border-[#333] border-t-[#FFC000] rounded-full animate-spin" />
              <Text className="mt-3 font-black text-[#FFC000] uppercase tracking-widest text-xs">
                Loading...
              </Text>
            </div>
          ) : !hasData ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <FiSearch size={48} className="text-[#333] mb-4" />
              <Title level={4} className="text-[#666] m-0! font-black uppercase">
                No Data Found
              </Title>
            </div>
          ) : (
            <div className="min-w-max">
              {Object.entries(groupedData).map(([system, shifts]) => (
                <div key={system} className="border-b-4 border-[#806000] last:border-0">
                  {/* System Header */}
                  <div className="flex bg-[#9EB3C8] border-b-2 border-[#666]">
                    <div className="w-10 shrink-0 border-r-2 border-[#666]" />
                    <div className="grow flex">
                      {sortedDates.map((dk, idx) => (
                        <div
                          key={dk}
                          className={`flex-1 ${idx < sortedDates.length - 1 ? 'border-r-4 border-[#666]' : ''}`}
                        >
                          <div className="text-black text-center py-2 font-black uppercase tracking-widest text-sm border-b border-[#666]">
                            <FiActivity className="inline-block mr-2 text-blue-800" />
                            {system} System
                          </div>
                          <div className="bg-[#8FA8C8] text-black flex items-center justify-center gap-2 py-1.5 font-black text-xs border-b-2 border-[#666]">
                            <FiCalendar className="text-black text-xs" />
                            {(() => {
                              for (const shiftData of Object.values(shifts)) {
                                if (shiftData[dk]) return shiftData[dk].label;
                              }
                              return dk;
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shifts */}
                  {Object.entries(shifts).map(([shift, byDate]) => {
                    const colors = SHIFT_COLORS[shift] || SHIFT_COLORS.A;
                    return (
                      <div key={shift} className="flex border-b-2 border-[#806000] last:border-0">
                        {/* Vertical Shift Label Sidebar */}
                        <div
                          className="w-10 flex items-center justify-center border-r-2 border-[#666] shrink-0"
                          style={{ backgroundColor: colors.label }}
                        >
                          <span
                            className="rotate-180 [writing-mode:vertical-lr] font-black uppercase tracking-[0.2em] text-sm select-none"
                            style={{
                              color: colors.text,
                              textShadow:
                                colors.text === '#FFF' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                            }}
                          >
                            SHIFT {shift}
                          </span>
                        </div>

                        <div className="grow flex">
                          {sortedDates.map((dk, idx) => {
                            const dateData = byDate[dk];
                            const batches = dateData ? dateData.batches : [];
                            const maxRows = Math.max(batches.length, 5);

                            return (
                              <div
                                key={dk}
                                className={`flex-1 ${idx < sortedDates.length - 1 ? 'border-r-4 border-[#806000]' : ''}`}
                              >
                                <div className="border-b border-[#806000]">
                                  <Table
                                    dataSource={padRows(batches, maxRows)}
                                    columns={columns}
                                    pagination={false}
                                    size="small"
                                    bordered
                                    className="excel-custom-theme [&_.ant-table]:bg-transparent! [&_.ant-table-thead_th]:rounded-none! [&_.ant-table-thead_th]:font-black! [&_.ant-table-thead_th]:uppercase! [&_.ant-table-thead_th]:tracking-wide! [&_.ant-table-thead_th]:text-[10px]! [&_.ant-table-thead_th]:py-2! [&_.ant-table-thead_th]:border-b-2! [&_.ant-table-thead_th]:border-[#666]! [&_.ant-table-tbody_td]:border-[#666]!"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ScheduleTable;
