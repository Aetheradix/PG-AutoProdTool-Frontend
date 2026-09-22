import { useState } from 'react';
import { Form, message } from 'antd';
import {
  useGetUsersQuery,
  useGetAuditLogsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/store/api/userApi';
import { useSignupMutation } from '@/store/api/authApi';

export const useUserManagement = () => {
  const { data: users, isLoading, isError, refetch } = useGetUsersQuery();
  const { data: auditLogs, isLoading: isLoadingAudit, refetch: refetchAudit } = useGetAuditLogsQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [signupUser, { isLoading: isCreating }] = useSignupMutation();

  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

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
    form.setFieldsValue({
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      is_admin: Boolean(user.is_admin),
      is_active: Boolean(user.is_active),
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Sync role field with is_admin toggle
      const payload = {
        ...values,
        role: values.is_admin ? 'admin' : 'user',
      };
      await updateUser({ userId: editingUser.id, ...payload }).unwrap();
      message.success('User details updated successfully');
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

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      
      // Step 1: Create normal user
      await signupUser({
        username: values.username,
        full_name: values.full_name,
        email: values.email,
        password: values.password,
      }).unwrap();

      // Step 2: Refetch to get new user list
      const freshUsersRes = await refetch();
      const freshUsers = freshUsersRes.data;
      
      // Step 3: Find user and update role if requested to be Admin
      if (values.is_admin && freshUsers) {
        // Because creation just happened, finding by username is most robust
        const newUser = freshUsers.find(u => u.username === values.username);
        if (newUser) {
          await updateUser({ userId: newUser.id, role: 'admin', is_admin: true }).unwrap();
        }
      }

      message.success('User created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.data?.detail || err.message || 'Failed to create user');
    }
  };

  return {
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
  };
};

