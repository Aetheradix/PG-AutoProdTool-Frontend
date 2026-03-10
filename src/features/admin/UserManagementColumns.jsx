import React from 'react';
import { Tag, Switch, Typography, Space, Button, Popconfirm } from 'antd';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const { Text } = Typography;

export const getUserManagementColumns = ({ 
  handleUpdateField, 
  handleEditUser, 
  handleConfirmDelete, 
  isUpdating, 
  isDeleting 
}) => [
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
    render: (text) => <Text strong>{text}</Text>,
  },
  {
    title: 'Full Name',
    dataIndex: 'full_name',
    key: 'full_name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Active',
    dataIndex: 'is_active',
    key: 'is_active',
    render: (active, record) => (
      <Switch
        checked={active}
        onChange={(checked) => handleUpdateField(record.id, 'is_active', checked)}
        loading={isUpdating}
        size="small"
      />
    ),
  },
  {
    title: 'Admin',
    dataIndex: 'is_admin',
    key: 'is_admin',
    render: (isAdmin, record) => (
      <Switch
        checked={isAdmin}
        onChange={(checked) => handleUpdateField(record.id, 'is_admin', checked)}
        loading={isUpdating}
        size="small"
      />
    ),
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    render: (role, record) => (
      <Space>
        <Tag color={role === 'admin' ? 'blue' : 'default'} className="uppercase font-bold">
          {role}
        </Tag>
        <Switch
          checked={role === 'admin'}
          onChange={(checked) => handleUpdateField(record.id, 'role', checked ? 'admin' : 'user')}
          loading={isUpdating}
          size="small"
        />
      </Space>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space size="small">
        <Button
          type="text"
          icon={<FiEdit2 />}
          onClick={() => handleEditUser(record)}
          className="hover:bg-blue-50 text-blue-500"
        />
        <Popconfirm
          title="Delete user"
          description="Are you sure you want to delete this user?"
          onConfirm={() => handleConfirmDelete(record.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true, loading: isDeleting }}
        >
          <Button
            type="text"
            danger
            icon={<FiTrash2 />}
            className="hover:bg-red-50"
          />
        </Popconfirm>
      </Space>
    ),
  },
];
