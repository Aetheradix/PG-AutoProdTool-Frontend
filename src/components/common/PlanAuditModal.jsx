import React, { useMemo } from 'react';
import { Modal, Table, Tag, Typography, Empty, Button, Space, Tooltip } from 'antd';
import { FiClock, FiUser, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { getAuditLogsForRecord, getAuditLogs } from '../../utils/auditUtils';
import { useAuth } from '../../context/AuthContext';

const { Text, Title } = Typography;

export default function PlanAuditModal({
  open,
  onClose,
  record,
  batchId,
  title = 'Batch Audit History',
}) {
  const { user } = useAuth();
  const currentUserName = user?.name || user?.full_name;


  // Prioritize actual batch identifier over surrogate table row id
  const targetId =
    record?.batch_no || record?.batch_id || record?.order_no || record?.id || batchId;

  const logs = useMemo(() => {
    if (!targetId) {
      return getAuditLogs();
    }
    return getAuditLogsForRecord(targetId, record);
  }, [open, targetId, record]);

  const columns = [
    {
      title: 'DATE & TIME',
      key: 'datetime',
      width: 200,
      render: (_, r) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-slate-800 text-xs">{r.date}</span>
          <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
            <FiClock size={11} className="text-blue-500" /> {r.time}
          </span>
        </div>
      ),
    },
    {
      title: 'USER',
      dataIndex: 'userName',
      key: 'userName',
      width: 140,
      render: (text) => {
        // Show the stored userName from the log entry; fall back to current user name
        const resolvedName = text || currentUserName || '—';

        return (
          <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5 whitespace-nowrap">
            <FiUser size={13} className="text-blue-600" /> {resolvedName}
          </span>
        );
      },
    },
    {
      title: 'FIELD CHANGED',
      dataIndex: 'field',
      key: 'field',
      width: 160,
      render: (text) => (
        <Tag
          color="blue"
          className="font-bold uppercase text-[10px] tracking-wider rounded-none whitespace-nowrap px-2 py-0.5"
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'PREVIOUS VALUE',
      dataIndex: 'oldValue',
      key: 'oldValue',
      width: 200,
      render: (text) => (
        <Tooltip title={String(text ?? '')}>
          <span className="text-slate-500 bg-red-50 border border-red-100 text-red-600 px-2.5 py-1 rounded-sm text-xs font-mono line-through whitespace-nowrap inline-block max-w-45 truncate">
            {String(text || '—')}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'NEW VALUE',
      dataIndex: 'newValue',
      key: 'newValue',
      width: 220,
      render: (text) => (
        <Tooltip title={String(text ?? '')}>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-sm text-xs font-mono font-bold whitespace-nowrap inline-block max-w-50 truncate">
            {String(text || '—')}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'BATCH / ID',
      dataIndex: 'batchId',
      key: 'batchId',
      width: 140,
      render: (text) => (
        <span className="text-slate-700 font-bold text-xs whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded">
          {text || '—'}
        </span>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button
          key="close"
          type="primary"
          onClick={onClose}
          className="rounded-none bg-[#002060] font-bold px-8 h-9 shadow-sm hover:bg-[#001040]"
        >
          Close
        </Button>,
      ]}
      width={1180}
      centered
      title={
        <div className="flex items-center gap-2.5 text-[#002060] pb-3 border-b border-slate-100">
          <FiFileText size={20} className="text-blue-600" />
          <span className="font-black uppercase tracking-tight text-base">
            {title} {targetId ? `— ${targetId}` : ''}
          </span>
        </div>
      }
    >
      <div className="py-4">
        {logs.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center bg-slate-50/50 border border-dashed border-slate-200">
            <FiClock size={40} className="text-slate-300 mb-2.5" />
            <Text className="text-slate-600 font-bold text-sm">No edit history recorded yet</Text>
            <Text className="text-slate-400 text-xs mt-1">
              Changes made to this batch will automatically appear here with user & timestamp
              details.
            </Text>
          </div>
        ) : (
          <Table
            dataSource={logs}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 6, size: 'small' }}
            size="middle"
            bordered
            scroll={{ x: 'max-content' }}
            className="border border-slate-200 shadow-none text-xs rounded-none overflow-hidden [&_.ant-table-thead_th]:!bg-slate-100 [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!text-[11px] [&_.ant-table-thead_th]:!text-slate-600"
          />
        )}
      </div>
    </Modal>
  );
}
