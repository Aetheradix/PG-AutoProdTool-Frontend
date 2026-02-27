import React from 'react';
import { Table, Typography, Input, ConfigProvider } from 'antd';
import { FiSearch, FiActivity, FiCalendar } from 'react-icons/fi';
import { useScheduleTable } from '@/hooks/useScheduleTable';

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
    const rowClass = shift === 'C' ? 'bg-amber-50' : 'bg-emerald-50';
    return [
      {
        title: 'S.No',
        dataIndex: 'sn',
        key: 'sn',
        width: 48,
        align: 'center',
        className: `${rowClass} border-r border-slate-300 font-bold text-slate-700 text-xs`,
      },
      {
        title: 'GCAS',
        dataIndex: 'gcas',
        key: 'gcas',
        width: 100,
        className: `${rowClass} border-r border-slate-300 font-bold text-slate-800 text-xs`,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        className: `${rowClass} border-r border-slate-300 font-bold text-slate-800 text-xs`,
        render: (text) => <span className="whitespace-nowrap">{text}</span>,
      },
      {
        title: 'Line',
        dataIndex: 'production_line',
        key: 'production_line',
        width: 70,
        align: 'center',
        className: `${rowClass} border-r border-slate-300 font-bold text-slate-700 text-xs uppercase`,
      },
      {
        title: 'Batch No',
        dataIndex: 'batch_id',
        key: 'batch_id',
        width: 90,
        className: `${rowClass} border-r border-slate-300 font-bold text-blue-700 text-xs`,
      },
      {
        title: 'Start Time',
        dataIndex: 'startTime',
        key: 'startTime',
        width: 68,
        align: 'center',
        className: `${rowClass} border-r border-slate-300 font-bold text-slate-700 text-xs`,
      },
      {
        title: 'End Time',
        dataIndex: 'endTime',
        key: 'endTime',
        width: 68,
        align: 'center',
        className: `${rowClass} border-r border-slate-300 font-bold text-slate-700 text-xs`,
      },
      {
        title: 'Remarks',
        dataIndex: 'remarks',
        key: 'remarks',
        width: 160,
        className: `${rowClass} font-medium text-red-500 italic text-xs`,
        render: (text) => text || '',
      },
    ];
  };

  const shiftColors = {
    A: { bg: 'bg-yellow-100', text: 'text-yellow-900', label: 'bg-yellow-400' },
    B: { bg: 'bg-green-100', text: 'text-green-900', label: 'bg-green-400' },
    C: { bg: 'bg-orange-100', text: 'text-orange-900', label: 'bg-orange-400' },
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
            headerBg: '#334155',
            headerColor: '#f8fafc',
            headerSplitColor: '#475569',
            borderRadius: 0,
            fontSize: 12,
            cellPaddingBlock: 4,
            cellPaddingInline: 6,
          },
        },
      }}
    >
      <div className="bg-slate-100 p-3 lg:p-5 flex flex-col h-full gap-3 overflow-hidden mt-20">

        {/* Title */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-center py-3 rounded-lg shadow-lg font-black uppercase tracking-widest text-sm">
          📋 DAILY PRODUCTION PLAN FOR HAIR CARE MAKING
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
          <Input
            placeholder="Search GCAS, Batch, Line..."
            prefix={<FiSearch className="text-slate-400 mr-1" />}
            onChange={(e) => handleSearchChange(e.target.value)}
            value={searchText}
            allowClear
            className="h-9 rounded-lg border-slate-200 shadow-sm lg:w-72 text-sm"
          />
          <div className="flex gap-2 items-center">
            <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
              {['All', '6T', '12T'].map((f) => (
                <button
                  key={f}
                  onClick={() => handleSystemFilterChange(f)}
                  className={`px-3 py-1 rounded-md text-xs font-black transition-all ${systemFilter === f
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {['A', 'B', 'C'].map((s) => (
              <div key={s} className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 bg-white shadow-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${shiftColors[s]?.label || 'bg-gray-400'}`} />
                <span className="text-[10px] font-black text-slate-700 uppercase">Shift {s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Table Area */}
        <div className="grow overflow-auto border border-slate-400 rounded-lg shadow-xl bg-white">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-20 opacity-50">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
              <Text className="mt-3 font-black text-slate-600 uppercase tracking-widest text-xs">Loading...</Text>
            </div>
          ) : !hasData ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <FiSearch size={48} className="text-slate-200 mb-4" />
              <Title level={4} className="text-slate-400 m-0! font-black uppercase">No Data Found</Title>
            </div>
          ) : (
            <div className="min-w-max">
              {/* Loop: System (12T, 6T) → Shifts (A, B, C) */}
              {Object.entries(groupedData).map(([system, shifts]) => (
                <div key={system} className="border-b-4 border-slate-500 last:border-0">

                  {/* ── System-level Date Headers (side by side) ── */}
                  <div className="flex">
                    {sortedDates.map((dk, idx) => (
                      <div key={dk} className={`flex-1 ${idx < sortedDates.length - 1 ? 'border-r-4 border-slate-500' : ''}`}>
                        {/* System Name */}
                        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white text-center py-2 font-black uppercase tracking-widest text-sm border-b border-teal-800">
                          <FiActivity className="inline-block mr-2 text-teal-200" />
                          {system} System
                        </div>
                        {/* Date */}
                        <div className="bg-yellow-300 text-slate-900 flex items-center justify-center gap-2 py-1.5 font-black text-xs border-b border-yellow-500">
                          <FiCalendar className="text-slate-600 text-xs" />
                          {(() => {
                            // Find date label from any shift's data
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
                      <div key={shift} className="flex border-b-2 border-slate-300 last:border-0">

                        {/* Vertical Shift Label */}
                        <div className={`${colors.label} w-10 flex items-center justify-center border-r-2 border-slate-400 shrink-0`}>
                          <span className="rotate-180 [writing-mode:vertical-lr] font-black uppercase tracking-[0.2em] text-sm text-white select-none drop-shadow">
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
                                className={`flex-1 ${idx < sortedDates.length - 1 ? 'border-r-4 border-slate-500' : ''}`}
                              >
                                {/* Column Header Row */}
                                <div className={`${colors.bg} border-b border-slate-300`}>
                                  <Table
                                    dataSource={padRows(batches, maxRows)}
                                    columns={getColumns(shift)}
                                    pagination={false}
                                    size="small"
                                    bordered
                                    className="excel-table-style [&_.ant-table]:bg-transparent! [&_.ant-table-thead_th]:rounded-none! [&_.ant-table-thead_th]:font-black! [&_.ant-table-thead_th]:uppercase! [&_.ant-table-thead_th]:tracking-wide! [&_.ant-table-thead_th]:text-[11px]! [&_.ant-table-thead_th]:py-2!"
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
