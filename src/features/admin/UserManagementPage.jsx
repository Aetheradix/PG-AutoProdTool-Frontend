import React from 'react';
import { Table, Card, Typography, Space, Modal, Form, Input } from 'antd';
import { FiShield } from 'react-icons/fi';
import { useUserManagement } from './hooks/useUserManagement';
import { getUserManagementColumns } from './UserManagementColumns';

const { Title, Text } = Typography;

export default function UserManagementPage() {
  const {
    users,
    isLoading,
    isError,
    isUpdating,
    isDeleting,
    isEditModalOpen,
    setIsEditModalOpen,
    editingUser,
    form,
    handleUpdateField,
    handleEditUser,
    handleEditSubmit,
    handleConfirmDelete,
  } = useUserManagement();

  const columns = getUserManagementColumns({
    handleUpdateField,
    handleEditUser,
    handleConfirmDelete,
    isUpdating,
    isDeleting,
  });

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
