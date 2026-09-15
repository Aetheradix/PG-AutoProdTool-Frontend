import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Typography, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Avatar, 
  Divider, 
  Tag, 
  Tabs, 
  Badge, 
  Tooltip 
} from 'antd';
import { 
  FiShield, 
  FiUserPlus, 
  FiUser, 
  FiMail, 
  FiAtSign, 
  FiUsers, 
  FiClock, 
  FiRefreshCw,
  FiActivity 
} from 'react-icons/fi';
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
    isCreating,
    isEditModalOpen,
    setIsEditModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingUser,
    form,
    createForm,
    auditLogs,
    isLoadingAudit,
    refetchAudit,
    handleUpdateField,
    handleEditUser,
    handleEditSubmit,
    handleConfirmDelete,
    handleCreateSubmit,
  } = useUserManagement();

  const [activeTab, setActiveTab] = useState('users');

  const columns = getUserManagementColumns({
    handleUpdateField,
    handleEditUser,
    handleConfirmDelete,
    isUpdating,
    isDeleting,
  });

  const auditColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (ts) => (
        <Space orientation="horizontal" size="small">
          <FiClock className="text-slate-400" orientation="horizontal" />
          <span style={{ fontSize: 13, color: '#334155' }}>
            {ts ? new Date(ts).toLocaleString() : 'N/A'}
          </span>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (action) => {
        let color = 'blue';
        let label = action;
        if (action === 'CREATE_USER') {
          color = 'green';
          label = 'Created';
        } else if (action === 'DELETE_USER') {
          color = 'red';
          label = 'Deleted';
        } else if (action === 'UPDATE_USER') {
          color = 'blue';
          label = 'Updated';
        }
        return (
          <Tag color={color} style={{ fontWeight: 600, borderRadius: 6, textTransform: 'uppercase', fontSize: 11 }}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Performed By',
      dataIndex: 'performed_by',
      key: 'performed_by',
      width: 150,
      render: (by) => (
        <Space size="small">
          <Avatar size={24} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${by || 'admin'}`} />
          <Text strong style={{ color: '#1e293b' }}>{by || 'admin'}</Text>
        </Space>
      ),
    },
    {
      title: 'Target User',
      dataIndex: 'target_user',
      key: 'target_user',
      width: 140,
      render: (user) => <Tag style={{ fontWeight: 600 }}>{user}</Tag>,
    },
    {
      title: 'Change Details',
      dataIndex: 'details',
      key: 'details',
      render: (details) => (
        <span style={{ color: '#475569', fontSize: 13 }}>
          {details || 'No additional details'}
        </span>
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

  const tabItems = [
    {
      key: 'users',
      label: (
        <span className="flex items-center gap-2 px-1 font-semibold">
          <FiUsers size={16} />
          <span>Users</span>
          <Badge 
            count={users?.length || 0} 
            overflowCount={999}
            style={{ 
              backgroundColor: '#3b82f6', 
              fontSize: 11, 
              marginLeft: 4 
            }} 
          />
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text type="secondary">
              Total {users?.length || 0} registered user account{users?.length === 1 ? '' : 's'}
            </Text>
            <Button 
              type="primary" 
              icon={<FiUserPlus />} 
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl h-10 px-5 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              Add New User
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            className="custom-table"
          />
        </div>
      ),
    },
    {
      key: 'audit',
      label: (
        <span className="flex items-center gap-2 px-1 font-semibold">
          <FiActivity size={16} />
          <span>Audit Trail</span>
          <Badge 
            count={auditLogs?.length || 0} 
            overflowCount={999}
            style={{ 
              backgroundColor: '#10b981', 
              fontSize: 11, 
              marginLeft: 4 
            }} 
          />
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text type="secondary">
              Real-time audit log of administrative updates, creation, and deletions
            </Text>
            <Tooltip title="Refresh audit log">
              <Button
                icon={<FiRefreshCw className={isLoadingAudit ? 'animate-spin' : ''} />}
                onClick={() => refetchAudit?.()}
                loading={isLoadingAudit}
                className="rounded-xl flex items-center gap-1 font-medium"
              >
                Refresh Log
              </Button>
            </Tooltip>
          </div>
          <Table
            columns={auditColumns}
            dataSource={auditLogs}
            rowKey="id"
            loading={isLoadingAudit}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            className="custom-table"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <FiShield size={24} />
          </div>
          <div>
            <Title level={2} className="m-0">
              User Management
            </Title>
            <Text type="secondary">Manage user roles, system access permissions, and audit logs</Text>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems}
          tabBarStyle={{ marginBottom: 20 }}
        />
      </Card>

      {/* Edit User Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 10, padding: '6px 8px', display: 'flex' }}>
              <FiUser size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Edit User Details</div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>Update user profile information</div>
            </div>
          </div>
        }
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Save Changes"
        okButtonProps={{ loading: isUpdating, style: { borderRadius: 8, fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        width={480}
        styles={{ body: { paddingTop: 8 } }}
      >
        {editingUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 16px', borderBottom: '1px solid #f1f5f9', marginBottom: 20 }}>
            <Avatar
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${editingUser.username || 'user'}`}
              size={48}
              style={{ border: '2px solid #e2e8f0', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{editingUser.full_name || editingUser.username}</div>
              <Tag color={editingUser.role === 'admin' ? 'blue' : 'default'} style={{ marginTop: 2, textTransform: 'capitalize', fontWeight: 600, fontSize: 11 }}>
                {editingUser.role}
              </Tag>
            </div>
          </div>
        )}
        <Form
          form={form}
          layout="vertical"
          className="mt-2"
        >
          <Form.Item
            name="username"
            label={<span style={{ fontWeight: 600, color: '#374151' }}>Username</span>}
            rules={[
              { required: true, message: 'Username is required' },
              { min: 3, message: 'Username must be at least 3 characters' },
              { pattern: /^[a-zA-Z0-9._-]+$/, message: 'Only letters, numbers, dots, dashes allowed' }
            ]}
          >
            <Input
              prefix={<FiAtSign size={14} style={{ color: '#94a3b8' }} />}
              placeholder="e.g. john.doe"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="full_name"
            label={<span style={{ fontWeight: 600, color: '#374151' }}>Full Name</span>}
          >
            <Input
              prefix={<FiUser size={14} style={{ color: '#94a3b8' }} />}
              placeholder="Enter full name"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 600, color: '#374151' }}>Email</span>}
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input
              prefix={<FiMail size={14} style={{ color: '#94a3b8' }} />}
              placeholder="Enter email address"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', gap: 24 }}>
            <Form.Item
              name="is_admin"
              label={<span style={{ fontWeight: 600, color: '#374151' }}>Administrator</span>}
              valuePropName="checked"
              style={{ marginBottom: 0, flex: 1 }}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="is_active"
              label={<span style={{ fontWeight: 600, color: '#374151' }}>Active</span>}
              valuePropName="checked"
              style={{ marginBottom: 0, flex: 1 }}
            >
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Add New User Modal */}
      <Modal
        title="Add New User"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => setIsCreateModalOpen(false)}
        okButtonProps={{ loading: isCreating || isUpdating }}
        okText="Create User"
      >
        <Form
          form={createForm}
          layout="vertical"
          className="mt-4"
          initialValues={{ is_admin: false }}
        >
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username is required' }]}>
            <Input placeholder="Enter username (e.g. johndoe)" />
          </Form.Item>
          <Form.Item name="full_name" label="Full Name" rules={[{ required: true, message: 'Full name is required' }]}>
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Please enter a valid email' }]}>
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Form.Item name="password" label="Temporary Password" rules={[{ required: true, message: 'Password is required' }, { min: 6, message: 'Password must be at least 6 characters' }]}>
            <Input.Password placeholder="Enter a secure temporary password" />
          </Form.Item>
          <Form.Item name="is_admin" label="Make Administrator" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
