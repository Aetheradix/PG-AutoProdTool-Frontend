import React from 'react';
import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { FiEdit2, FiTrash2, FiDroplet, FiActivity, FiCpu } from 'react-icons/fi';
import { getDesignationStyle } from '../equipmentConstants';


export default function useEquipmentColumns({ type, isAdmin, onEdit, onDelete }) {
  const Icon = type === 'Tank' ? FiDroplet : type === 'Line' ? FiActivity : FiCpu;

  return [
    {
      title: '#',
      width: 64,
      render: (_, __, idx) => (
        <span className="text-slate-400 font-mono text-xs">{idx + 1}</span>
      ),
    },
    {
      title: `${type.toUpperCase()} NAME`,
      dataIndex: 'equipment_name',
      sorter: (a, b) => (a.equipment_name ?? '').localeCompare(b.equipment_name ?? ''),
      render: (name) => (
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-500">
            <Icon size={14} />
          </span>
          <span className="font-semibold text-slate-800">{name}</span>
        </div>
      ),
    },
    {
      title: 'RESOURCE GROUP',
      dataIndex: 'resource_group',
      sorter: (a, b) => (a.resource_group ?? '').localeCompare(b.resource_group ?? ''),
      render: (val) => {
        const { bg, color, border } = getDesignationStyle(val);
        return (
          <span
            style={{
              background:   bg,
              color,
              border:       `1px solid ${border}`,
              padding:      '2px 10px',
              borderRadius: 999,
              fontSize:     12,
              fontWeight:   600,
            }}
          >
            {val ?? '—'}
          </span>
        );
      },
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      width: 120,
      filters: [
        { text: 'Active',   value: 'Active'   },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (val, record) => record.status === val,
      render: (status) => {
        const isActive = status === 'Active';
        return (
          <Tag
            style={{
              color:        isActive ? '#16a34a' : '#dc2626',
              background:   isActive ? '#f0fdf4' : '#fef2f2',
              border:       `1px solid ${isActive ? '#bbf7d0' : '#fecaca'}`,
              fontWeight:   600,
              borderRadius: 999,
              padding:      '2px 10px',
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    ...(isAdmin
      ? [
          {
            title: 'ACTIONS',
            key: 'actions',
            fixed: 'right',
            width: 130,
            render: (_, record) => (
              <Space size="middle">
                <Tooltip title="Edit">
                  <Button
                    type="link"
                    icon={<FiEdit2 size={14} />}
                    onClick={() => onEdit(record)}
                    className="text-blue-600 font-bold p-0 flex items-center gap-1"
                  >
                    Edit
                  </Button>
                </Tooltip>
                <Popconfirm
                  title={`Delete this ${type.toLowerCase()}?`}
                  description="This action cannot be undone."
                  onConfirm={() => onDelete(record)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="link"
                    danger
                    icon={<FiTrash2 size={14} />}
                    className="font-bold p-0 flex items-center gap-1"
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];
}