import { Table, Tag, Switch, Card, Typography, message, Space, Button, Popconfirm } from 'antd';
import { useGetUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation } from '@/store/api/userApi';
import { FiUsers, FiShield, FiTrash2 } from 'react-icons/fi';

const { Title, Text } = Typography;

export function UserManagementPage() {
    const { data: users, isLoading, isError } = useGetUsersQuery();
    const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    const handleRoleChange = async (userId, checked) => {
        const newRole = checked ? 'admin' : 'user';
        try {
            await updateUserRole({ userId, role: newRole }).unwrap();
            message.success(`User role updated to ${newRole}`);
        } catch (err) {
            message.error(err.data?.detail || 'Failed to update role');
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
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Current Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'blue' : 'default'} className="uppercase font-bold">
                    {role}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <div className="flex items-center gap-2">
                        {/* <Text type="secondary" style={{ fontSize: '12px' }}>Admin Toggle:</Text> */}
                        <Switch
                            checked={record.role === 'admin'}
                            onChange={(checked) => handleRoleChange(record.id, checked)}
                            loading={isUpdating}
                            checkedChildren="On"
                            unCheckedChildren="Off"
                        />
                    </div>
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
                            className="hover:bg-red-50 flex items-center justify-center"
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
                    <Title level={2} className="m-0">User Management</Title>
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
        </div>
    );
}
