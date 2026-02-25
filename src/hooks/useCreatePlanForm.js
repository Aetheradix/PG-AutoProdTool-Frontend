import { useState } from 'react';
import { Form, notification } from 'antd';

/**
 * Hook to manage create plan form logic and downtime sub-form.
 */
export const useCreatePlanForm = () => {
    const [form] = Form.useForm();
    const [downtimeForm] = Form.useForm();
    const [downtimes, setDowntimes] = useState([]);

    const onFinish = (values) => {
        const finalData = {
            ...values,
            plannedDowntimes: downtimes,
        };
        notification.success({
            message: 'Plan Generated',
            description: `Production plan has been generated with ${downtimes.length} downtimes.`,
            placement: 'topRight',
        });
        return finalData;
    };

    const addDowntime = async () => {
        try {
            const values = await downtimeForm.validateFields();
            const newDowntime = {
                id: Date.now(),
                reason: values.reason,
                startTime: values.startTime.format('DD/MM/YYYY, hh:mm A'),
                duration: values.duration,
            };

            setDowntimes([...downtimes, newDowntime]);
            downtimeForm.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const removeDowntime = (id) => {
        setDowntimes(downtimes.filter((d) => d.id !== id));
    };

    return {
        form,
        downtimeForm,
        downtimes,
        onFinish,
        addDowntime,
        removeDowntime,
    };
};
