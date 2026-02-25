import React from 'react';
import { Card, Form, Input, Button, Avatar, Typography, Divider, Badge } from 'antd';
import { FiUser, FiMail, FiShield, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useProfile } from '@/hooks/useProfile';

const { Title, Text } = Typography;

export function ProfilePage() {
    const {
        user,
        isEditing,
        form,
        onFinish,
        toggleEdit,
        handleCancel
    } = useProfile();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="mb-8">
                <Title level={2} className="m-0! font-bold text-slate-800">Account Settings</Title>
                <Text type="secondary">Manage your profile information and account preferences</Text>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Sidebar */}
                <div className="lg:col-span-1">
                    <Card
                        className="text-center overflow-hidden border-none shadow-sm"
                        styles={{ body: { padding: '40px 24px' } }}
                    >
                        <div className="relative inline-block mb-6">
                            <Badge
                                overlap="circular"
                                offset={[-5, 75]}
                                count={
                                    <div className="bg-blue-600 p-1.5 rounded-full border-2 border-white text-white cursor-pointer hover:bg-blue-700 transition-colors">
                                        <FiEdit2 size={12} />
                                    </div>
                                }
                            >
                                <Avatar
                                    size={100}
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                                    className="border-4 border-slate-50 shadow-sm"
                                />
                            </Badge>
                        </div>
                        <Title level={4} className="m-0! font-bold text-slate-800">{user?.name}</Title>
                        <Text type="secondary" className="capitalize block mb-4">{user?.role || 'User'}</Text>
                        <Divider className="my-6" />
                        <div className="text-left space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <FiMail size={16} />
                                </div>
                                <div>
                                    <Text className="text-[10px] font-bold text-slate-400 block uppercase leading-none mb-1">Email</Text>
                                    <Text className="text-sm font-semibold text-slate-700">{user?.email}</Text>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                    <FiShield size={16} />
                                </div>
                                <div>
                                    <Text className="text-[10px] font-bold text-slate-400 block uppercase leading-none mb-1">Role</Text>
                                    <Text className="text-sm font-semibold text-slate-700 capitalize">{user?.role || 'Guest'}</Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                    <Card
                        className="border-none shadow-sm"
                        title={
                            <div className="flex items-center justify-between w-full py-2">
                                <Text strong className="text-lg">Profile Information</Text>
                                {!isEditing ? (
                                    <Button
                                        type="primary"
                                        icon={<FiEdit2 />}
                                        onClick={() => toggleEdit(true)}
                                        className="bg-blue-600 flex items-center gap-2"
                                    >
                                        Edit Profile
                                    </Button>
                                ) : null}
                            </div>
                        }
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={user}
                            onFinish={onFinish}
                            disabled={!isEditing}
                            requiredMark={false}
                            size="large"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <Form.Item
                                    name="name"
                                    label={<Text strong className="text-slate-600">Full Name</Text>}
                                    rules={[{ required: true, message: 'Please enter your name' }]}
                                >
                                    <Input prefix={<FiUser className="text-slate-400" />} placeholder="Enter your full name" className="rounded-xl!" />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label={<Text strong className="text-slate-600">Email Address</Text>}
                                    rules={[
                                        { required: true, message: 'Please enter your email' },
                                        { type: 'email', message: 'Please enter a valid email' }
                                    ]}
                                >
                                    <Input prefix={<FiMail className="text-slate-400" />} placeholder="Enter your email" className="rounded-xl!" />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <Form.Item
                                    name="role"
                                    label={<Text strong className="text-slate-600">Role</Text>}
                                >
                                    <Input prefix={<FiShield className="text-slate-400" />} disabled className="rounded-xl!" />
                                </Form.Item>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                                    <Button
                                        icon={<FiX />}
                                        onClick={handleCancel}
                                        className="rounded-xl h-12 px-6 flex items-center gap-2"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<FiSave />}
                                        className="bg-blue-600 rounded-xl h-12 px-8 flex items-center gap-2"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </Form>
                    </Card>

                    {/* Security Card */}
                    <Card className="mt-8 border-none shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <Title level={5} className="m-0! font-bold">Privacy & Security</Title>
                                <Text type="secondary" className="text-xs">Manage your password and security settings</Text>
                            </div>
                            <Button type="link" className="font-semibold text-blue-600">Manage</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
