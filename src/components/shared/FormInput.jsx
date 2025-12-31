import React from 'react';
import { Form, Input, Typography } from 'antd';

const { Text } = Typography;

export const FormInput = ({ name, label, rules, prefix, placeholder, type = 'text', ...props }) => {
    const InputComponent = type === 'password' ? Input.Password : Input;

    return (
        <Form.Item
            name={name}
            label={label && <Text strong>{label}</Text>}
            rules={rules}
            {...props}
        >
            <InputComponent
                prefix={prefix}
                placeholder={placeholder}
                {...props}
            />
        </Form.Item>
    );
};
