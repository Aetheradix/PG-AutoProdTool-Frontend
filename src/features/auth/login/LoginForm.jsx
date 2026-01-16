import React from 'react';
import { Form, Button, Typography, message } from 'antd';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { FormInput } from '@/components/shared/FormInput';
import { Link, useNavigate } from 'react-router-dom';

const { Text } = Typography;

export function LoginForm() {
  const { login } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    const success = login(values);
    if (success) {
      message.success('Login successful!');
      navigate('/');
    } else {
      message.error('Invalid email or password. Use admin@admin.com / admin123');
    }
  };

  return (
    <div className="form-container">
      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        requiredMark={false}
        className="mt-4"
      >
        <FormInput
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Invalid email address!' },
          ]}
          prefix={<FiMail className="form-input-prefix text-blue-500" />}
          placeholder="admin@example.com"
        />

        <FormInput
          name="password"
          label="Password"
          type="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' },
          ]}
          prefix={<FiLock className="form-input-prefix text-blue-500" />}
          placeholder="••••••••"
        />

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            icon={<FiLogIn />}
            block
            className="h-12 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all border-none"
          >
            Sign In
          </Button>
        </Form.Item>

        <div className="text-center mt-6">
          <Text className="text-text-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:text-primary/80 transition-colors">
              Sign Up
            </Link>
          </Text>
        </div>
      </Form>
    </div>

  );
}
