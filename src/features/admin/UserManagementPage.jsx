import React, { useState, useMemo } from 'react';
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
  Tooltip,
  Select,
  Row,
  Col,
  Statistic
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
  FiActivity,
  FiSearch,
  FiDownload,
  FiCheckCircle,
  FiLock,
  FiArrowRight,
  FiAlertTriangle,
  FiLayers
} from 'react-icons/fi';
import { useUserManagement } from './hooks/useUserManagement';
import { getUserManagementColumns } from './UserManagementColumns';

const { Title, Text } = Typography;

/**
 * Parses raw audit log details like:
 * "Full Name: 'ABC' -> 'XYZ'; Role: 'user' -> 'admin'; Admin: False -> True"
 * into beautiful visual diff chips.
 */
const renderChangeDetails = (details) => {
  if (!details || typeof details !== 'string' || details.trim() === '') {
    return <span className="text-slate-400 text-xs italic">No additional details recorded</span>;
  }

  // Split multiple changes separated by semicolon
  const parts = details.split(';').map(p => p.trim()).filter(Boolean);

  return (
    <div className="flex flex-wrap gap-1.5 py-0.5 max-w-xl">
      {parts.map((part, idx) => {
        if (part.includes('->')) {
          const [leftPart, newValRaw] = part.split('->').map(s => s.trim());
          const colonIdx = leftPart.indexOf(':');
          
          let fieldName = 'Change';
          let oldValRaw = leftPart;
          
          if (colonIdx !== -1) {
            fieldName = leftPart.substring(0, colonIdx).trim();
            oldValRaw = leftPart.substring(colonIdx + 1).trim();
          }

          // Strip surrounding quotes
          const oldVal = oldValRaw.replace(/^['"]|['"]$/g, '');
          const newVal = newValRaw.replace(/^['"]|['"]$/g, '');

          return (
            <div 
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-50 border border-slate-200/80 shadow-2xs"
            >
              <span className="font-semibold text-slate-700">{fieldName}:</span>
              <span className="line-through text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                {oldVal || 'empty'}
              </span>
              <FiArrowRight className="text-blue-500 shrink-0" size={11} />
              <span className="font-semibold text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                {newVal || 'empty'}
              </span>
            </div>
          );
        }

        // Fallback for non-diff strings
        return (
          <span 
            key={idx} 
            className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
          >
            {part}
          </span>
        );
      })}
    </div>
  );
};

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
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const columns = getUserManagementColumns({
    handleUpdateField,
    handleEditUser,
    handleConfirmDelete,
    isUpdating,
    isDeleting,
  });

  // Calculate high-level metrics
  const stats = useMemo(() => {
    const totalUsers = users?.length || 0;
    const adminCount = users?.filter(u => u.role === 'admin' || u.is_admin)?.length || 0;
    const activeCount = users?.filter(u => u.is_active)?.length || 0;
    const totalAudits = auditLogs?.length || 0;
    return { totalUsers, adminCount, activeCount, totalAudits };
  }, [users, auditLogs]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const q = searchTerm.toLowerCase();
      const matchSearch = 
        !q ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));

      const isAdmin = u.role === 'admin' || u.is_admin;
      const matchRole = 
        roleFilter === 'ALL' ||
        (roleFilter === 'ADMIN' && isAdmin) ||
        (roleFilter === 'USER' && !isAdmin);

      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    if (!auditLogs) return [];
    return auditLogs.filter(log => {
      const q = searchTerm.toLowerCase();
      const matchSearch = 
        !q ||
        (log.performed_by && log.performed_by.toLowerCase().includes(q)) ||
        (log.target_user && log.target_user.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q));

      const matchAction = 
        actionFilter === 'ALL' ||
        (log.action && log.action.toUpperCase().includes(actionFilter.toUpperCase()));

      return matchSearch && matchAction;
    });
  }, [auditLogs, searchTerm, actionFilter]);

  // Export audit logs to CSV
  const handleExportAuditCSV = () => {
    if (!auditLogs || auditLogs.length === 0) return;
    const headers = ['Timestamp', 'Action', 'Performed By', 'Target User', 'Change Details'];
    const rows = auditLogs.map(l => [
      l.timestamp ? `"${new Date(l.timestamp).toISOString()}"` : '""',
      `"${l.action || ''}"`,
      `"${l.performed_by || ''}"`,
      `"${l.target_user || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const auditColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 190,
      render: (ts) => {
        if (!ts) return <span className="text-slate-400">N/A</span>;
        const d = new Date(ts);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return (
          <div className="flex items-center gap-2 text-slate-700">
            <FiClock className="text-slate-400 shrink-0" size={14} />
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-slate-800">{dateStr}</span>
              <span className="text-[11px] text-slate-400">{timeStr}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Action Type',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (action) => {
        const act = String(action || '').toUpperCase();
        if (act.includes('CREATE')) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Created</span>
            </span>
          );
        }
        if (act.includes('DELETE')) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Deleted</span>
            </span>
          );
        }
        if (act.includes('ROLE')) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>Role Updated</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Updated</span>
          </span>
        );
      },
    },
    {
      title: 'Performed By',
      dataIndex: 'performed_by',
      key: 'performed_by',
      width: 170,
      render: (by) => (
        <div className="flex items-center gap-2">
          <Avatar 
            size={28} 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${by || 'admin'}`} 
            className="border border-slate-200 bg-slate-50"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-slate-800">{by || 'admin'}</span>
            <span className="text-[10px] text-blue-600 font-medium">Administrator</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Target User',
      dataIndex: 'target_user',
      key: 'target_user',
      width: 150,
      render: (user) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100/80 text-slate-700 border border-slate-200">
          <FiUser size={11} className="text-slate-400" />
          <span>@{user || 'unknown'}</span>
        </span>
      ),
    },
    {
      title: 'Audit Change Details',
      dataIndex: 'details',
      key: 'details',
      render: (details) => renderChangeDetails(details),
    },
  ];

  if (isError) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-200 max-w-xl mx-auto my-12 shadow-sm">
        <FiAlertTriangle className="text-rose-500 text-3xl mx-auto mb-3" />
        <Title level={4} className="text-rose-800 m-0 mb-1">Access Restricted or Load Error</Title>
        <Text type="secondary" className="text-rose-600">
          Unable to fetch user management data. Ensure you have administrator privileges.
        </Text>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'users',
      label: (
        <span className="flex items-center gap-2 px-1 font-semibold text-sm">
          <FiUsers size={16} />
          <span>Users Directory</span>
          <Badge 
            count={filteredUsers.length} 
            overflowCount={999}
            style={{ backgroundColor: '#3b82f6', fontSize: 11, fontWeight: 700 }} 
          />
        </span>
      ),
      children: (
        <div className="pt-2">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <Input
                prefix={<FiSearch className="text-slate-400" />}
                placeholder="Search by name, username, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                className="rounded-xl w-full sm:w-72 h-10 shadow-2xs border-slate-200"
              />
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                className="w-36 h-10"
                options={[
                  { value: 'ALL', label: 'All Roles' },
                  { value: 'ADMIN', label: 'Admins Only' },
                  { value: 'USER', label: 'Standard Users' },
                ]}
              />
            </div>
            
            <Button 
              type="primary" 
              icon={<FiUserPlus size={16} />} 
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl h-10 px-5 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              Add New User
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} users` }}
            className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs"
            scroll={{ x: 900 }}
          />
        </div>
      ),
    },
    {
      key: 'audit',
      label: (
        <span className="flex items-center gap-2 px-1 font-semibold text-sm">
          <FiActivity size={16} className="text-emerald-500" />
          <span>Audit Trail</span>
          <Badge 
            count={filteredAuditLogs.length} 
            overflowCount={999}
            style={{ backgroundColor: '#10b981', fontSize: 11, fontWeight: 700 }} 
          />
        </span>
      ),
      children: (
        <div className="pt-2">
          {/* Audit Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <Input
                prefix={<FiSearch className="text-slate-400" />}
                placeholder="Search audit trail by user, action, detail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                className="rounded-xl w-full sm:w-80 h-10 shadow-2xs border-slate-200"
              />
              <Select
                value={actionFilter}
                onChange={setActionFilter}
                className="w-36 h-10"
                options={[
                  { value: 'ALL', label: 'All Actions' },
                  { value: 'UPDATE', label: 'Updated' },
                  { value: 'CREATE', label: 'Created' },
                  { value: 'DELETE', label: 'Deleted' },
                ]}
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Tooltip title="Export Audit Trail to CSV">
                <Button
                  icon={<FiDownload size={14} />}
                  onClick={handleExportAuditCSV}
                  disabled={!auditLogs || auditLogs.length === 0}
                  className="rounded-xl h-10 flex items-center gap-1.5 font-medium border-slate-200 hover:border-slate-300"
                >
                  Export Log
                </Button>
              </Tooltip>

              <Tooltip title="Refresh audit log">
                <Button
                  icon={<FiRefreshCw className={isLoadingAudit ? 'animate-spin' : ''} size={14} />}
                  onClick={() => refetchAudit?.()}
                  loading={isLoadingAudit}
                  className="rounded-xl h-10 flex items-center gap-1.5 font-medium border-slate-200 hover:border-slate-300"
                >
                  Refresh
                </Button>
              </Tooltip>
            </div>
          </div>

          <Table
            columns={auditColumns}
            dataSource={filteredAuditLogs}
            rowKey="id"
            loading={isLoadingAudit}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} audit records` }}
            className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs"
            scroll={{ x: 1000 }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Hero Section */}
   
    
      {/* Main Card with Tabs */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden p-2 sm:p-4">
        <Tabs 
          activeKey={activeTab} 
          onChange={(k) => { setActiveTab(k); setSearchTerm(''); }} 
          items={tabItems}
          tabBarStyle={{ 
            marginBottom: 16,
            borderBottom: '1px solid #f1f5f9'
          }}
        />
      </Card>

      {/* Edit User Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiUser size={18} />
            </div>
            <div>
              <div className="font-bold text-base text-slate-800">Edit User Details</div>
              <div className="text-xs text-slate-500 font-normal">Update user profile and access privileges</div>
            </div>
          </div>
        }
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Save Changes"
        okButtonProps={{ loading: isUpdating, className: "rounded-xl h-10 font-semibold" }}
        cancelButtonProps={{ className: "rounded-xl h-10" }}
        width={480}
        centered
      >
        {editingUser && (
          <div className="flex items-center gap-3.5 p-3 bg-slate-50/80 rounded-xl border border-slate-100 my-3">
            <Avatar
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${editingUser.username || 'user'}`}
              size={48}
              className="border border-slate-200 bg-white shrink-0"
            />
            <div>
              <div className="font-bold text-slate-800 text-sm">{editingUser.full_name || editingUser.username}</div>
              <div className="text-xs text-slate-500 font-mono">@{editingUser.username}</div>
              <Tag color={editingUser.role === 'admin' ? 'blue' : 'default'} className="mt-1 text-[11px] font-semibold uppercase">
                {editingUser.role}
              </Tag>
            </div>
          </div>
        )}
        <Form
          form={form}
          layout="vertical"
          className="mt-3 space-y-2"
        >
          <Form.Item
            name="username"
            label={<span className="font-semibold text-slate-700 text-xs">Username</span>}
            rules={[
              { required: true, message: 'Username is required' },
              { min: 3, message: 'Username must be at least 3 characters' },
              { pattern: /^[a-zA-Z0-9._-]+$/, message: 'Only letters, numbers, dots, dashes allowed' }
            ]}
          >
            <Input
              prefix={<FiAtSign size={14} className="text-slate-400" />}
              placeholder="e.g. john.doe"
              className="rounded-xl h-10"
            />
          </Form.Item>

          <Form.Item
            name="full_name"
            label={<span className="font-semibold text-slate-700 text-xs">Full Name</span>}
          >
            <Input
              prefix={<FiUser size={14} className="text-slate-400" />}
              placeholder="Enter full name"
              className="rounded-xl h-10"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="font-semibold text-slate-700 text-xs">Email Address</span>}
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input
              prefix={<FiMail size={14} className="text-slate-400" />}
              placeholder="Enter email address"
              className="rounded-xl h-10"
            />
          </Form.Item>

          <Divider className="my-3" />

          <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
            <div>
              <div className="font-semibold text-xs text-slate-800">Administrator Role</div>
              <div className="text-[11px] text-slate-500 mb-1.5">Full administrative privileges</div>
              <Form.Item
                name="is_admin"
                valuePropName="checked"
                className="m-0"
              >
                <Switch />
              </Form.Item>
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-800">Account Active</div>
              <div className="text-[11px] text-slate-500 mb-1.5">Allow login to planner</div>
              <Form.Item
                name="is_active"
                valuePropName="checked"
                className="m-0"
              >
                <Switch />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Add New User Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiUserPlus size={18} />
            </div>
            <div>
              <div className="font-bold text-base text-slate-800">Add New User Account</div>
              <div className="text-xs text-slate-500 font-normal">Create an enterprise credential with assigned role</div>
            </div>
          </div>
        }
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => setIsCreateModalOpen(false)}
        okButtonProps={{ loading: isCreating || isUpdating, className: "rounded-xl h-10 font-semibold bg-emerald-600 hover:bg-emerald-700" }}
        cancelButtonProps={{ className: "rounded-xl h-10" }}
        okText="Create User"
        width={480}
        centered
      >
        <Form
          form={createForm}
          layout="vertical"
          className="mt-3 space-y-2"
          initialValues={{ is_admin: false }}
        >
          <Form.Item 
            name="username" 
            label={<span className="font-semibold text-slate-700 text-xs">Username</span>} 
            rules={[{ required: true, message: 'Username is required' }]}
          >
            <Input 
              prefix={<FiAtSign className="text-slate-400" />} 
              placeholder="e.g. johndoe" 
              className="rounded-xl h-10"
            />
          </Form.Item>
          <Form.Item 
            name="full_name" 
            label={<span className="font-semibold text-slate-700 text-xs">Full Name</span>} 
            rules={[{ required: true, message: 'Full name is required' }]}
          >
            <Input 
              prefix={<FiUser className="text-slate-400" />} 
              placeholder="e.g. John Doe" 
              className="rounded-xl h-10"
            />
          </Form.Item>
          <Form.Item 
            name="email" 
            label={<span className="font-semibold text-slate-700 text-xs">Email Address</span>} 
            rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input 
              prefix={<FiMail className="text-slate-400" />} 
              placeholder="e.g. john.doe@company.com" 
              className="rounded-xl h-10"
            />
          </Form.Item>
          <Form.Item 
            name="password" 
            label={<span className="font-semibold text-slate-700 text-xs">Temporary Password</span>} 
            rules={[{ required: true, message: 'Password is required' }, { min: 6, message: 'Password must be at least 6 characters' }]}
          >
            <Input.Password 
              prefix={<FiLock className="text-slate-400" />} 
              placeholder="Minimum 6 characters" 
              className="rounded-xl h-10"
            />
          </Form.Item>

          <Divider className="my-3" />

          <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div>
              <div className="font-semibold text-xs text-slate-800">Grant Administrator Access</div>
              <div className="text-[11px] text-slate-500">Enables management of users, schedules, and simulation configs</div>
            </div>
            <Form.Item name="is_admin" valuePropName="checked" className="m-0">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
