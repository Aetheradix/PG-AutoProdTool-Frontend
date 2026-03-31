import React, { useMemo } from 'react';
import { Table, Typography, ConfigProvider, Button, Space, Popconfirm, Form, Input } from 'antd';
import { FiEdit2, FiTrash2, FiPlus, FiPackage, FiSearch } from 'react-icons/fi';
import EditableCell from '../../excel-upload/components/EditableCell';
import { useAuth } from '@/context/AuthContext';
import { useEditableTable } from '@/hooks/useEditableTable';
import { buildDynamicColumns } from '../../../utils/tableUtils';

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
  const table = useEditableTable(props);

  const columns = useMemo(() => {
    if (table.dataSource.length === 0) return [];

    // Build dynamic columns and filter out 'line' and other excluded fields
    const dynamicCols = buildDynamicColumns(table.dataSource, table.rowKey)
      .filter(col => col.dataIndex !== 'line' && !excludeFields.includes(col.dataIndex));

    const finalCols = [
      { 
        title: 'S.NO', 
        dataIndex: 'sn', 
        width: 60, 
        align: 'center',
        fixed: 'left',
        render: (text) => <span className="font-bold text-slate-500">{text}</span>
      },
      ...dynamicCols.map(col => ({
        ...col,
        onCell: (record) => ({
          record,
          inputType: col.inputType,
          dataIndex: col.dataIndex,
          title: col.title,
          editing: table.isEditing(record),
        }),
      }))
    ];

    if (isAdmin) {
      finalCols.push({
        title: 'ACTIONS',
        dataIndex: 'operation',
        fixed: 'right',
        width: 150,
        render: (_, record) => {
          const editable = table.isEditing(record);
          const isPlaceholder = record.isPlaceholder;
          
          if (isPlaceholder) return null;

          return editable ? (
            <Space size="middle">
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
            <Space size="middle">
              <Button
                type="link"
                disabled={table.editingKey !== ''}
                onClick={() => table.edit(record)}
                className="text-blue-600 font-bold p-0 flex items-center gap-1"
              >
                <FiEdit2 size={14} /> Edit
              </Button>
              <Popconfirm
                title="Delete this item?"
                onConfirm={() => table.handleDelete(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  danger
                  disabled={table.editingKey !== ''}
                  className="font-bold p-0 flex items-center gap-1"
                >
                  <FiTrash2 size={14} /> Delete
                </Button>
              </Popconfirm>
            </Space>
          );
        },
      });
    }

    return finalCols;
  }, [table, isAdmin, excludeFields]);

  // Group data by line
  const groupedData = useMemo(() => {
    const groups = {};
    table.filteredData.forEach((item) => {
      const lineId = item.line || 'Unknown';
      const lineName = LINE_NAMES[lineId] || lineId;
      if (!groups[lineName]) groups[lineName] = [];
      groups[lineName].push({ ...item, sn: groups[lineName].length + 1 });
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
            headerBg: '#002060', // Dark Blue from Excel headers
            headerColor: '#ffffff',
            borderRadius: 0,
            fontSize: 12,
            cellPaddingBlock: 8,
            cellPaddingInline: 12,
            borderColor: '#666', // Added darker border for Excel look
          },
        },
      }}
    >
      <div className={`flex flex-col gap-6 ${className || ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-1">
          {isAdmin && (
            <Button
              type="primary"
              onClick={table.handleAdd}
              disabled={table.editingKey !== ''}
              icon={<FiPlus />}
              className="bg-blue-600 hover:bg-blue-700 font-medium h-10 px-6 rounded-none shadow-sm"
            >
              Add {title}
            </Button>
          )}
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
          {Object.entries(groupedData).map(([lineName, dataSource]) => (
            <div key={lineName} className="mb-6 animate-fade-in group">
              <div className="bg-[#002060] text-white py-2.5 px-5 rounded-none font-bold uppercase tracking-wider text-xs flex items-center justify-between border-b border-blue-900/50">
                <div className="flex items-center gap-2.5">
                  <FiPackage className="text-blue-200" size={16} />
                  <span>{lineName} - PACKING PLAN</span>
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
                className="excel-style-table border-x border-b border-slate-400"
                rowClassName={() => 'bg-[#FFF2CC] hover:bg-[#FFF2CC]! font-medium !rounded-none'}
              />
            </div>
          ))}
        </Form>
      </div>
    </ConfigProvider>
  );
};

export default LineGroupedTable;
