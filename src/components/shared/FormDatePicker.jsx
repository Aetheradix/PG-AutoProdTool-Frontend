import React from 'react';
import { Form, DatePicker, Typography } from 'antd';

const { Text } = Typography;

export const FormDatePicker = ({ name, label, rules, placeholder, suffixIcon, showTime, format, ...props }) => {
    return (
        <Form.Item
            name={name}
            label={label && <Text strong>{label}</Text>}
            rules={rules}
            {...props}
        >
            <DatePicker
                showTime={showTime}
                placeholder={placeholder}
                suffixIcon={suffixIcon}
                format={format}
                className="w-full"
                {...props}
            />
        </Form.Item>
    );
};
