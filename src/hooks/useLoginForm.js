import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to manage login form logic.
 */
export const useLoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const success = login(values);
            if (success) {
                message.success('Login successful!');
                navigate('/');
            } else {
                message.error('Invalid email or password. Use admin@admin.com / admin123');
            }
        } catch (err) {
            console.error('Login error:', err);
            message.error('Failed to login. Please try again.');
        }
    };

    return {
        onFinish,
    };
};
