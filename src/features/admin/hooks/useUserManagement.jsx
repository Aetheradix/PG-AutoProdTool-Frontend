import { useState } from 'react';
import { Form, message } from 'antd';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/store/api/userApi';

export const useUserManagement = () => {
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

  return {
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
  };
};
