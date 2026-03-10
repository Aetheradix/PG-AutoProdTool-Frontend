import { Table, Tag, Switch, Card, Typography, message, Space, Button, Popconfirm, Modal, Form, Input } from 'antd';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/store/api/userApi';
import { FiUsers, FiShield, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { useState } from 'react';

const { Title, Text } = Typography;

export function UserManagementPage() {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const handleUpdateField = async (userId, field, value) => {
    try {
      await updateUser({ userId, [field]: value }).unwrap();
      message.success('User updated successfully');
    } catch (err) {
      message.error(err.data?.detail || 'Failed to update user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateUser({ userId: editingUser.id, ...values }).unwrap();
      message.success('User details updated');
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.data?.detail || 'Failed to update user');
    }
  };

  const handleConfirmDelete = async (userId) => {
    try {
      await deleteUser(userId).unwrap();
      message.success('User deleted successfully');
    } catch (err) {
      message.error(err.data?.detail || 'Failed to delete user');
    }
  };

  const columns = [
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

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
        <Text type="danger">Error loading users. Make sure you have admin privileges.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
          <FiShield size={24} />
        </div>
        <div>
          <Title level={2} className="m-0">
            User Management
          </Title>
          <Text type="secondary">Manage user roles and system access permissions</Text>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          className="custom-table"
        />
      </Card>

      <Modal
        title="Edit User Details"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        okButtonProps={{ loading: isUpdating }}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username is required' }]}>
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item name="full_name" label="Full Name">
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Please enter a valid email' }]}>
            <Input placeholder="Enter email address" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
