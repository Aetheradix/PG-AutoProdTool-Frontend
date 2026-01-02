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
      >
        <FormInput
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Invalid email address!' },
          ]}
          prefix={<FiMail className="form-input-prefix" />}
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
          prefix={<FiLock className="form-input-prefix" />}
          placeholder="••••••••"
        />

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<FiLogIn />}
            block
            className="h-11 rounded-xl"
          >
            Sign In
          </Button>
        </Form.Item>

        <div className="text-center mt-4">
          <Text className="text-text-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign Up
            </Link>
          </Text>
        </div>
      </Form>
    </div>

  );
}
