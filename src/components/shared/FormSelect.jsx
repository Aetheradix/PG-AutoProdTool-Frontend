import React from 'react';
import { Form, Select, Typography } from 'antd';

const { Text } = Typography;

export const FormSelect = ({ name, label, rules, options, placeholder, suffixIcon, ...props }) => {
    return (
        <Form.Item
            name={name}
            label={label && <Text strong>{label}</Text>}
            rules={rules}
            {...props}
        >
            <Select
                placeholder={placeholder}
                options={options}
                suffixIcon={suffixIcon}
                {...props}
            />
        </Form.Item>
    );
};
