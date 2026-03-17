import { useState } from 'react';
import { Form, notification } from 'antd';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to manage profile page logic.
 */
export const useProfile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    const onFinish = (values) => {
        updateUser(values);
        setIsEditing(false);
        notification.success({
            message: 'Profile Updated',
            description: 'Your profile information has been successfully updated.',
            placement: 'topRight',
        });
    };

    const toggleEdit = (value) => {
        setIsEditing(value ?? !isEditing);
    };

    const handleCancel = () => {
        setIsEditing(false);
        form.resetFields();
    };

    return {
        user,
        isEditing,
        form,
        onFinish,
        toggleEdit,
        handleCancel
    };
};
