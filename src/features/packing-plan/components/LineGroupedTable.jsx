import { useAuth } from '@/context/AuthContext';
import { useEditableTable } from '@/hooks/useEditableTable';
import { Button, ConfigProvider, DatePicker, Form, Input, Modal, Popconfirm, Space, Table, TimePicker, Typography, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { FiEdit2, FiPackage, FiPlus, FiSearch, FiTrash2, FiClock } from 'react-icons/fi';
import { buildDynamicColumns } from '../../../utils/tableUtils';
import EditableCell from '../../excel-upload/components/EditableCell';
import PlanAuditModal from '@/components/common/PlanAuditModal';

const { Title, Text } = Typography;

const LINE_NAMES = {
  INC1: 'Sachet Line 1',
  INC2: 'Sachet Line 2',
  INC4: 'Sachet Line 4',
  INT2: 'Ronchi',
  INT3: 'Tube Line 1',
};

const LineGroupedTable = (props) => {
  const { title = 'Plan', searchPlaceholder = 'Search...', className, excludeFields = [] } = props;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const table = useEditableTable({ ...props, planType: 'Packing Plan' });

  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState(null);

  const openAuditHistory = (record) => {
    setSelectedAuditRecord(record);
    setAuditModalOpen(true);
  };

  const columns = useMemo(() => {
    if (table.dataSource.length === 0) return [];

    // Build dynamic columns and filter out 'line' and other excluded fields
    const dynamicCols = buildDynamicColumns(table.dataSource, table.rowKey)
      .filter(col => col.dataIndex !== 'line' && col.dataIndex !== '_uniqueKey' && !excludeFields.includes(col.dataIndex))
      .map(col => {
        const isRemarks = col.dataIndex.toLowerCase().includes('remark');
        return {
          ...col,
          sorter: false,
          ...(isRemarks && {
            width: 180,
            render: (text) => (
              text ? <span className="text-red-600 font-black text-xs">{text}</span> : <span className="text-slate-400 italic text-xs font-normal">Add remark...</span>
            ),
          }),
        };
      });

    // Check if remarks column is present; if not, add it dynamically
    const hasRemarksCol = dynamicCols.some(col => col.dataIndex.toLowerCase().includes('remark'));
    if (!hasRemarksCol) {
      dynamicCols.push({
        title: 'REMARKS',
        dataIndex: 'remarks',
        key: 'remarks',
        width: 180,
        editable: true,
        inputType: 'text',
        render: (text) => (
          text ? <span className="text-red-600 font-black text-xs">{text}</span> : <span className="text-slate-400 italic text-xs font-normal">Add remark...</span>
        ),
      });
    }

    const finalCols = [
      {
        title: 'LINE',
        dataIndex: 'line',
        width: 80,
        align: 'center',
        fixed: 'left',
        render: (text) => <span className="font-bold text-slate-500">{text}</span>
      },
      ...dynamicCols.map(col => ({
        ...col,
        onCell: (record) => ({
          record,
          inputType: col.inputType || 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: table.isEditing(record),
        }),
      }))
    ];

    finalCols.push({
      title: 'ACTIONS',
      dataIndex: 'operation',
      fixed: 'right',
      width: 180,
      align: 'center',
      render: (_, record) => {
        const editable = table.isEditing(record);
        const isPlaceholder = record.isPlaceholder;

        if (isPlaceholder) return null;

        return editable ? (
          <Space size="middle" className="justify-center">
            <Button
              type="link"
              onClick={() => table.save(record[table.rowKey])}
              className="text-blue-600 font-bold p-0"
              loading={table.isUpdating}
            >
              Save
            </Button>
            <Button type="link" onClick={table.cancel} className="font-bold p-0 text-slate-400">
              Cancel
            </Button>
          </Space>
        ) : (
          <Space size="middle" className="justify-center items-center">
            <Tooltip title="View Edit Audit History">
              <Button
                type="link"
                onClick={() => openAuditHistory(record)}
                className="text-amber-600 font-bold p-0 flex items-center gap-1 text-xs hover:text-amber-700"
              >
                <FiClock size={13} /> History
              </Button>
            </Tooltip>
            {isAdmin && (
              <>
                <Button
                  type="link"
                  disabled={table.editingKey !== ''}
                  onClick={() => table.edit(record)}
                  className="text-blue-600 font-bold p-0 flex items-center gap-1"
                >
                  <FiEdit2 size={13} /> Edit
                </Button>
                <Popconfirm
                  title="Delete this item?"
                  onConfirm={() => table.handleDelete(record)}
                  okText="Yes"
                  cancelText="No"
                  disabled={table.editingKey !== ''}
                >
                  <Button
                    type="link"
                    danger
                    disabled={table.editingKey !== ''}
                    className="font-bold p-0 flex items-center gap-1"
                  >
                    <FiTrash2 size={13} /> Delete
                  </Button>
                </Popconfirm>
              </>
            )}
          </Space>
        );
      },
    });

    return finalCols;
  }, [table, isAdmin, excludeFields]);

  // Group data by line
  const groupedData = useMemo(() => {
    const groups = {};
    table.filteredData.forEach((item) => {
      const lineId = item.line || 'Unknown';
      const lineName = LINE_NAMES[lineId] || lineId;
      if (!groups[lineName]) groups[lineName] = { rows: [], lineId: lineId };
      groups[lineName].rows.push({ ...item, sn: groups[lineName].rows.length + 1 });
    });

    const sortedOrder = ['Sachet Line 1', 'Sachet Line 2', 'Sachet Line 4', 'Ronchi', 'Tube Line 1'];
    const sortedGroups = {};
    sortedOrder.forEach(name => {
      if (groups[name]) sortedGroups[name] = groups[name];
    });
    Object.keys(groups).forEach(name => {
      if (!sortedGroups[name]) sortedGroups[name] = groups[name];
    });

    return sortedGroups;
  }, [table.filteredData]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: '#e2e8f0', // Light Gray (Slate 200)
            headerColor: '#0f172a', // Dark Slate 900
            headerSortHoverBg: '#e2e8f0', // Disable hover effect by keeping same bg
            headerSortActiveBg: '#e2e8f0',
            borderRadius: 0,
            fontSize: 12,
            cellPaddingBlock: 8,
            cellPaddingInline: 12,
            borderColor: '#94a3b8', // Slightly lighter border
          },
        },
      }}
    >
      <div className={`flex flex-col gap-6 ${className || ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-1">
          {/* {isAdmin && (
            <Button
              type="primary"
              onClick={table.handleAdd}
              disabled={table.editingKey !== ''}
              icon={<FiPlus />}
              className="bg-blue-600 hover:bg-blue-700 font-medium h-10 px-6 rounded-none shadow-sm"
            >
              Add {title}
            </Button>
          )} */}
          <Input
            placeholder={searchPlaceholder}
            prefix={<FiSearch className="text-slate-400" />}
            onChange={(e) => table.setSearchText(e.target.value)}
            value={table.searchText}
            allowClear
            className="max-w-md h-10 rounded-none border-[#666] shadow-none font-bold text-sm bg-white"
          />
        </div>

        <Form form={table.form} component={false}>
          {Object.entries(groupedData).map(([lineName, { rows: dataSource, lineId }]) => (
            <div key={lineName} className="mb-6 animate-fade-in group">
              <div className="bg-[#002060] text-white py-2.5 px-5 rounded-none font-bold uppercase tracking-wider text-xs flex items-center justify-between border-b border-blue-900/50">
                <div className="flex items-center gap-2.5">
                  <FiPackage className="text-blue-200" size={16} />
                  <span>{lineName} - PACKING PLAN</span>
                  {isAdmin && (
                    <Button
                      size="small"
                      type="primary"
                      icon={<FiPlus />}
                      onClick={() => table.handleAdd({ line: lineId })}
                      className="ml-4 h-6 text-[10px] rounded-none bg-blue-500 hover:bg-blue-400 border-none shadow-sm flex items-center gap-1 font-black"
                    >
                      ADD TO {lineId}
                    </Button>
                  )}
                </div>
                <div className="text-[10px] opacity-70 font-medium">
                  {dataSource.length} BATCHES
                </div>
              </div>
              <Table
                components={{ body: { cell: EditableCell } }}
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                bordered
                rowKey={table.rowKey}
                scroll={{ x: 'max-content' }}
                showSorterTooltip={false}
                className="excel-style-table border-x border-b border-slate-400"
                rowClassName={() => 'bg-[#FFF2CC] hover:bg-[#FFF2CC]! font-medium !rounded-none'}
              />
            </div>
          ))}
        </Form>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-[#002060] border-b border-slate-100 pb-3 mb-0">
            <FiPackage size={20} />
            <span className="font-black uppercase tracking-tight text-lg">Add New {title}</span>
          </div>
        }
        open={table.isAddModalOpen}
        onOk={table.handleAddOk}
        onCancel={() => table.setIsAddModalOpen(false)}
        okText="CREATE PLAN"
        cancelText="CANCEL"
        confirmLoading={table.isCreating}
        width={1100}
        centered
        className="premium-modal"
        styles={{
          body: { padding: '24px 32px' },
          mask: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 32, 96, 0.15)' }
        }}
        okButtonProps={{ className: 'bg-[#002060] hover:bg-[#003080] rounded-none h-10 px-8 font-black tracking-widest' }}
        cancelButtonProps={{ className: 'rounded-none h-10 px-8 font-bold' }}
      >
        <Form
          form={table.addForm}
          layout="vertical"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4"
        >
          {table.addModalFields.map((key) => {
            const isDate = key.toLowerCase().endsWith('_date');
            const isTime = key.toLowerCase().includes('time') && !key.toLowerCase().includes('date');
            const isDatetime = key.toLowerCase().includes('datetime');

            return (
              <Form.Item
                key={key}
                name={key}
                label={
                  <span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">
                    {key.replace(/_/g, ' ')}
                  </span>
                }
                {...(isDate && {
                  getValueProps: (value) => ({ value: value ? dayjs(value) : null }),
                  normalize: (value) => (value ? (dayjs.isDayjs(value) ? value.format('YYYY-MM-DD') : value) : null),
                })}
                {...(isTime && {
                  getValueProps: (value) => ({ value: value ? dayjs(value, 'HH:mm') : null }),
                  normalize: (value) => (value ? (dayjs.isDayjs(value) ? value.format('HH:mm') : value) : null),
                })}
                {...(isDatetime && {
                  getValueProps: (value) => ({ value: value ? dayjs(value) : null }),
                  normalize: (value) => (value ? (dayjs.isDayjs(value) ? value.format('YYYY-MM-DD HH:mm:ss') : value) : null),
                })}
              >
                {isDate ? (
                  <DatePicker
                    format="YYYY-MM-DD"
                    className="w-full rounded-none border-slate-300 h-10 font-medium"
                    placeholder={`Select ${key.replace(/_/g, ' ')}`}
                  />
                ) : isTime ? (
                  <TimePicker
                    format="HH:mm"
                    className="w-full rounded-none border-slate-300 h-10 font-medium"
                    placeholder={`Select ${key.replace(/_/g, ' ')}`}
                  />
                ) : isDatetime ? (
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    className="w-full rounded-none border-slate-300 h-10 font-medium"
                    placeholder={`Select ${key.replace(/_/g, ' ')}`}
                  />
                ) : (
                  <Input
                    type="text"
                    placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                    className="rounded-none border-slate-300 h-10 font-bold bg-slate-50 focus:bg-white transition-all shadow-inner"
                  />
                )}
              </Form.Item>
            );
          })}
        </Form>
      </Modal>

      <PlanAuditModal
        open={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        record={selectedAuditRecord}
        title="Packing Plan Batch Audit History"
      />
    </ConfigProvider>
  );
};

export default LineGroupedTable;
