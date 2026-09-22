import React, { useMemo, useState } from 'react';
import { Table, Typography, Input, ConfigProvider, Tooltip, Button, Space, Tag } from 'antd';
import { FiSearch, FiPackage, FiCalendar, FiDownload, FiClock } from 'react-icons/fi';
import { useGetPackingPlanQuery } from '@/store/api/packingPlanApi';
import { extractApiData, combineDateAndDuration } from '@/utils/tableUtils';
import { exportPackingPlanToExcel } from '@/utils/exportUtils';
import PlanAuditModal from '@/components/common/PlanAuditModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SHIFT_COLORS = {
  A: { bg: '#FFFF00', text: '#000', label: '#FFFF00' },
  B: { bg: '#00B050', text: '#FFF', label: '#00B050' },
  C: { bg: '#FFC000', text: '#000', label: '#FFC000' },
};

const LINE_NAMES = {
  INC1: 'Sachet Line 1',
  INC2: 'Sachet Line 2',
  INC4: 'Sachet Line 4',
  INT2: 'Ronchi',
  INT3: 'Tube Line 1',
};

const CELL_BG = {
  GREEN: 'bg-[#D4EDDA]',
  RED: 'bg-[#F4837D]',
  YELLOW: 'bg-[#FFF2CC]',
};

const BASE_CELL_CLASS = 'border-r border-[#666] text-xs font-bold text-black';

export default function PackingPlanScheduleView() {
  const [searchText, setSearchText] = useState('');
  const [lineFilter, setLineFilter] = useState('All');
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState(null);

  const { data: apiData, isLoading } = useGetPackingPlanQuery({ page: 1, limit: 1000 });

  const rawData = useMemo(() => extractApiData(apiData, []), [apiData]);

  const openAuditHistory = (record) => {
    setSelectedAuditRecord(record);
    setAuditModalOpen(true);
  };

  const formatTime = (timeStr, dateStr) => {
    if (!timeStr) return '—';
    const combined = combineDateAndDuration(dateStr, timeStr);
    if (combined) {
      return dayjs(combined).format('HH:mm');
    }
    return timeStr;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Current Date';
    return dayjs(dateStr).format('DD MMMM YYYY');
  };

  const getDateKey = (dateStr) => {
    if (!dateStr) return 'default-date';
    return dayjs(dateStr).format('YYYY-MM-DD');
  };

  // Group by: Line -> Shift -> DateKey -> { label, batches }
  const { groupedData, sortedDates, allLines } = useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
    const result = {};
    const datesSet = new Set();
    const linesSet = new Set();

    rawData.forEach((item, index) => {
      const lineKey = item.line || 'Unassigned';
      const lineName = LINE_NAMES[lineKey] || lineKey;
      linesSet.add(lineName);

      if (lineFilter !== 'All' && lineName !== lineFilter && lineKey !== lineFilter) {
        return;
      }

      // Filter search
      if (
        searchText &&
        !Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(lowerSearch)
        )
      ) {
        return;
      }

      const shift = item.shift || (index % 3 === 0 ? 'A' : index % 3 === 1 ? 'B' : 'C');
      const dateKey = getDateKey(item.start_date || item.created_at);
      const dateLabel = formatDate(item.start_date || item.created_at);
      datesSet.add(dateKey);

      if (!result[lineName]) result[lineName] = {};
      if (!result[lineName][shift]) result[lineName][shift] = {};
      if (!result[lineName][shift][dateKey]) {
        result[lineName][shift][dateKey] = { label: dateLabel, batches: [] };
      }

      result[lineName][shift][dateKey].batches.push({
        ...item,
        sn: result[lineName][shift][dateKey].batches.length + 1,
        startTime: formatTime(item.start_time, item.start_date),
        endTime: formatTime(item.end_time, item.end_date || item.start_date),
        batch_id: item.batch_no || item.order_no || item.batch_id || `BATCH-${index + 1}`,
        gcas: item.p_code || item.gcas || item.sku || '—',
        planned_qty: item.planned_qty || item.quantity || '—',
        remarks: item.remarks || '',
      });
    });

    const sortedDatesArr = Array.from(datesSet).sort();
    return {
      groupedData: result,
      sortedDates: sortedDatesArr.length > 0 ? sortedDatesArr : ['default-date'],
      allLines: Array.from(linesSet),
    };
  }, [rawData, searchText, lineFilter]);

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'sn',
      width: 45,
      align: 'center',
      className: `${BASE_CELL_CLASS} ${CELL_BG.GREEN}`,
    },
    {
      title: 'GCAS / CODE',
      dataIndex: 'gcas',
      width: 100,
      className: `${BASE_CELL_CLASS} ${CELL_BG.GREEN}`,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 200,
      className: `${BASE_CELL_CLASS} ${CELL_BG.GREEN}`,
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <div className="truncate w-full cursor-default">{text || '—'}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Line',
      dataIndex: 'line',
      width: 70,
      align: 'center',
      className: `${BASE_CELL_CLASS} ${CELL_BG.GREEN} uppercase`,
    },
    {
      title: 'Batch / Order No',
      dataIndex: 'batch_id',
      width: 110,
      className: `${BASE_CELL_CLASS} ${CELL_BG.RED}`,
    },
    {
      title: 'Planned Qty',
      dataIndex: 'planned_qty',
      width: 90,
      align: 'center',
      className: `${BASE_CELL_CLASS} ${CELL_BG.YELLOW}`,
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      width: 75,
      align: 'center',
      className: `${BASE_CELL_CLASS} ${CELL_BG.YELLOW}`,
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      width: 75,
      align: 'center',
      className: `${BASE_CELL_CLASS} ${CELL_BG.YELLOW}`,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      width: 150,
      className: `${BASE_CELL_CLASS} ${CELL_BG.YELLOW}`,
      render: (text) => (
        text ? <span className="text-red-600 font-extrabold">{text}</span> : <span className="text-slate-400 italic font-normal text-[11px]">—</span>
      ),
    },
    {
      title: 'Audit',
      key: 'audit',
      width: 65,
      align: 'center',
      className: `${BASE_CELL_CLASS} bg-white`,
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          onClick={() => openAuditHistory(r)}
          className="text-amber-600 p-0 font-bold text-xs"
        >
          <FiClock size={12} />
        </Button>
      ),
    },
  ];

  const handleExport = () => {
    exportPackingPlanToExcel(groupedData, sortedDates, 'Daily_Packing_Plan_Schedule.xlsx');
  };

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
      <div className="flex flex-col gap-4">
        {/* Header Title Bar */}
        <div className="bg-[#002060] text-white text-center py-3 rounded-none font-black uppercase tracking-widest text-sm border border-[#001040] shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <FiPackage className="text-blue-300" size={18} />
            <span>DAILY PRODUCTION PLAN FOR PACKING</span>
          </div>
          <Button
            icon={<FiDownload />}
            onClick={handleExport}
            className="bg-emerald-600 hover:bg-emerald-500 text-white border-none font-bold rounded-none h-8 px-4 flex items-center gap-1.5 shadow-sm"
          >
            Export Packing Schedule
          </Button>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3 bg-white p-3 border border-slate-200">
          <Input
            placeholder="Search SKU, Batch, Line, Description..."
            prefix={<FiSearch className="text-gray-400 mr-1" />}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            allowClear
            className="h-9 rounded-none border-[#444] lg:w-80 text-sm font-medium"
          />

          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-xs font-bold text-slate-500 mr-1 uppercase">Line Filter:</span>
            {['All', ...allLines].map((line) => (
              <button
                key={line}
                onClick={() => setLineFilter(line)}
                className={`px-3 py-1 rounded-none text-xs font-black transition-all cursor-pointer border border-[#666] ${
                  lineFilter === line
                    ? 'bg-[#FFC000] text-black shadow-none'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {line}
              </button>
            ))}
          </div>
        </div>

        {/* Tables Section */}
        <div className="overflow-auto border-2 border-[#806000] bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-60">
              <div className="w-10 h-10 border-4 border-[#333] border-t-[#002060] rounded-full animate-spin" />
              <Text className="mt-3 font-black text-[#002060] uppercase tracking-widest text-xs">
                Loading Packing Plan...
              </Text>
            </div>
          ) : !hasData ? (
            <div className="flex flex-col items-center justify-center py-24">
              <FiSearch size={48} className="text-slate-300 mb-4" />
              <Title level={4} className="text-slate-400 font-black uppercase">
                No Packing Batches Found
              </Title>
            </div>
          ) : (
            <div className="min-w-max">
              {Object.entries(groupedData).map(([lineName, shifts]) => (
                <div key={lineName} className="border-b-4 border-[#806000] last:border-0">
                  {/* Line Header */}
                  <div className="flex bg-[#9EB3C8] border-b-2 border-[#666]">
                    <div className="w-10 shrink-0 border-r-2 border-[#666]" />
                    <div className="grow flex">
                      {sortedDates.map((dk, idx) => (
                        <div
                          key={dk}
                          className={`flex-1 ${idx < sortedDates.length - 1 ? 'border-r-4 border-[#666]' : ''}`}
                        >
                          <div className="text-black text-center py-2 font-black uppercase tracking-widest text-sm border-b border-[#666]">
                            <FiPackage className="inline-block mr-2 text-blue-900" />
                            {lineName} — PACKING LINE
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
                        {/* Shift Label Sidebar */}
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

                            return (
                              <div
                                key={dk}
                                className={`flex-1 ${idx < sortedDates.length - 1 ? 'border-r-4 border-[#806000]' : ''}`}
                              >
                                <div className="border-b border-[#806000]">
                                  <Table
                                    dataSource={batches}
                                    columns={columns}
                                    pagination={false}
                                    rowKey={(r) => r.id || r._uniqueKey || `${r.batch_id}-${r.sn}`}
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

      <PlanAuditModal
        open={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        record={selectedAuditRecord}
        title="Packing Batch Audit History"
      />
    </ConfigProvider>
  );
}
