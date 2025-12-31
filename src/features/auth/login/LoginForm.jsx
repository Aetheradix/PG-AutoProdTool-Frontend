import React from 'react';
import { Form, Button, Typography, message } from 'antd';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { FormInput } from '@/components/shared/FormInput';
import { Link } from 'react-router-dom';

const { Text } = Typography;

export function LoginForm() {
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    const success = login(values);
    if (!success) {
      message.error('Invalid email or password. Use admin@admin.com / admin123');
    }
  };

  return (
    <div className="w-full max-w-sm">
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
          prefix={<FiMail className="text-slate-400" />}
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
          prefix={<FiLock className="text-slate-400" />}
          placeholder="••••••••"
        />

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<FiLogIn />}
            className="w-full h-11"
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
