import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '@/context/AuthContext';


export const useLoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            console.log('Login form submitted with values:', values);
            const success = await login(values);
            if (success) {
                message.success('Login successful!');
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            message.error(err.message || 'Invalid email or password.');
        }
    };

    return {
        onFinish,
    };
};
