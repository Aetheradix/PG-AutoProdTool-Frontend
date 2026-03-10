import React from 'react';
import { Table, Typography, Input, ConfigProvider } from 'antd';
import { FiSearch, FiActivity, FiCalendar } from 'react-icons/fi';
import { useScheduleTable } from '../hooks/useScheduleTable';

const { Title, Text } = Typography;

const ScheduleTable = () => {
  const {
    groupedData,
    sortedDates,
    isLoading,
    searchText,
    systemFilter,
    handleSearchChange,
    handleSystemFilterChange,
  } = useScheduleTable();

  const getColumns = (shift) => {
    // Row cell styles - light cream/white like Excel
    const cellBase = 'border-r border-[#806000] text-xs font-semibold';
    return [
      {
        title: 'S.No',
        dataIndex: 'sn',
        key: 'sn',
        width: 48,
        align: 'center',
        className: `${cellBase}`,
      },
      {
        title: 'GCAS',
        dataIndex: 'gcas',
        key: 'gcas',
        width: 100,
        className: `${cellBase}`,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        className: `${cellBase}`,
        render: (text) => <span className="whitespace-nowrap">{text}</span>,
      },
      {
        title: 'Line',
        dataIndex: 'production_line',
        key: 'production_line',
        width: 70,
        align: 'center',
        className: `${cellBase} uppercase`,
      },
      {
        title: 'Batch No',
        dataIndex: 'batch_id',
        key: 'batch_id',
        width: 90,
        className: `${cellBase}`,
      },
      {
        title: 'Start Time',
        dataIndex: 'startTime',
        key: 'startTime',
        width: 68,
        align: 'center',
        className: `${cellBase}`,
      },
      {
        title: 'End Time',
        dataIndex: 'endTime',
        key: 'endTime',
        width: 68,
        align: 'center',
        className: `${cellBase}`,
      },
      {
        title: 'Remarks',
        dataIndex: 'remarks',
        key: 'remarks',
        width: 160,
        className: `text-xs font-medium text-red-600 italic`,
        render: (text) => text ? <span className="text-red-500 font-semibold">{text}</span> : '',
      },
    ];
  };

  // Excel-matching shift sidebar colors
  const shiftColors = {
    A: { bg: '#FFFF00', text: '#000', label: '#FFFF00' },   // Bright yellow
    B: { bg: '#00B050', text: '#FFF', label: '#00B050' },   // Green
    C: { bg: '#FFC000', text: '#000', label: '#FFC000' },   // Orange/amber
  };

  // Pad with empty rows up to target count
  const padRows = (batches, target = 9) => {
    const rows = [...batches];
    for (let i = batches.length; i < target; i++) {
      rows.push({
        key: `empty-${i}`,
        sn: i + 1,
        gcas: '', description: '', production_line: '',
        batch_id: '', startTime: '', endTime: '', remarks: '',
      });
    }
    return rows;
  };

  const hasData = Object.keys(groupedData).length > 0;

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: '#1a1a2e',
            headerColor: '#ffffff',
            headerSplitColor: '#2d2d44',
            borderRadius: 0,
            fontSize: 12,
            cellPaddingBlock: 4,
            cellPaddingInline: 6,
            borderColor: '#806000',
            rowHoverBg: '#fffde6',
          },
        },
      }}
    >
      <div className=" p-3 lg:p-5 flex flex-col h-full gap-3 overflow-hidden mt-20">

        {/* Title - dark background with white text like Excel */}
        <div className="bg-[#1a1a2e] text-white text-center py-3 rounded font-black uppercase tracking-widest text-sm border border-[#333]">
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
            <div className="flex  p-0.5 rounded border border-[#444]">
              {['All', '6T', '12T'].map((f) => (
                <button
                  key={f}
                  onClick={() => handleSystemFilterChange(f)}
                  className={`px-3 py-1 rounded text-xs font-black transition-all cursor-pointer ${systemFilter === f
                    ? 'bg-[#FFC000] text-black shadow'
                    : 'text-gray-400 '
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Table Area */}
        <div className="grow overflow-auto border-2 border-[#806000] ">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-20 opacity-50">
              <div className="w-10 h-10 border-4 border-[#333] border-t-[#FFC000] rounded-full animate-spin" />
              <Text className="mt-3 font-black text-[#FFC000] uppercase tracking-widest text-xs">Loading...</Text>
            </div>
          ) : !hasData ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <FiSearch size={48} className="text-[#333] mb-4" />
              <Title level={4} className="text-[#666] m-0! font-black uppercase">No Data Found</Title>
            </div>
          ) : (
            <div className="min-w-max">
              {/* Loop: System (12T, 6T) → Shifts (A, B, C) */}
              {Object.entries(groupedData).map(([system, shifts]) => (
                <div key={system} className="border-b-4 border-[#806000] last:border-0">

                  {/* ── System-level Date Headers (side by side) ── */}
                  <div className="flex">
                    {sortedDates.map((dk, idx) => (
                      <div key={dk} className={`flex-1 ${idx < sortedDates.length - 1 ? 'border-r-4 border-[#806000]' : ''}`}>
                        {/* System Name - dark navy like Excel */}
                        <div className="bg-[#1a1a2e] text-white text-center py-2 font-black uppercase tracking-widest text-sm border-b border-[#333]">
                          <FiActivity className="inline-block mr-2 text-[#FFC000]" />
                          {system} System
                        </div>
                        {/* Date - bright yellow like Excel */}
                        <div className="bg-[#FFC000] text-black flex items-center justify-center gap-2 py-1.5 font-black text-xs border-b-2 border-[#806000]">
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

                  {/* ── Shifts within this system ── */}
                  {Object.entries(shifts).map(([shift, byDate]) => {
                    const colors = shiftColors[shift] || shiftColors.A;
                    return (
                      <div key={shift} className="flex border-b-2 border-[#806000] last:border-0">

                        {/* Vertical Shift Label */}
                        <div
                          className="w-10 flex items-center justify-center border-r-2 border-[#806000] shrink-0"
                          style={{ backgroundColor: colors.label }}
                        >
                          <span
                            className="rotate-180 [writing-mode:vertical-lr] font-black uppercase tracking-[0.2em] text-sm select-none"
                            style={{ color: colors.text, textShadow: colors.text === '#FFF' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}
                          >
                            SHIFT {shift}
                          </span>
                        </div>

                        {/* Date columns side by side */}
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
                                {/* Table with Excel-style formatting */}
                                <div className="border-b border-[#806000]">
                                  <Table
                                    dataSource={padRows(batches, maxRows)}
                                    columns={getColumns(shift)}
                                    pagination={false}
                                    size="small"
                                    bordered
                                    className="excel-dark-theme [&_.ant-table]:bg-transparent! [&_.ant-table-thead_th]:rounded-none! [&_.ant-table-thead_th]:font-black! [&_.ant-table-thead_th]:uppercase! [&_.ant-table-thead_th]:tracking-wide! [&_.ant-table-thead_th]:text-[11px]! [&_.ant-table-thead_th]:py-2! [&_.ant-table-thead_th]:border-b-2! [&_.ant-table-thead_th]:border-[#806000]! [&_.ant-table-tbody_td]:bg-[#fff8e1]! [&_.ant-table-tbody_td]:text-black! [&_.ant-table-tbody_td]:border-[#c0a040]!"
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
