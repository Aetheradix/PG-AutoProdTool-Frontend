import React from 'react';
import { Form, Button, Typography, message } from 'antd';
import { FiMail, FiLock, FiUser, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { FormInput } from '@/components/shared/FormInput';
import { Link, useNavigate } from 'react-router-dom';

const { Text } = Typography;

export function SignupForm() {
  const { signup } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    const success = signup(values);
    if (success) {
      message.success('Account created successfully!');
      navigate('/');
    } else {
      message.error('Signup failed. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <Form
        form={form}
        name="signup"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <FormInput
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please input your full name!' }]}
          prefix={<FiUser className="form-input-prefix" />}
          placeholder="John Doe"
        />

        <FormInput
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Invalid email address!' },
          ]}
          prefix={<FiMail className="form-input-prefix" />}
          placeholder="user@example.com"
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
            icon={<FiCheckCircle />}
            block
            className="h-11 rounded-xl"
          >
            Create Account
          </Button>
        </Form.Item>

        <div className="text-center mt-4">
          <Text className="text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </Text>
        </div>
      </Form>
    </div>
  );
}
