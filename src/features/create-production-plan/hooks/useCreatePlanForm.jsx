import { useState } from 'react';
import { Form, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useRunSimulationMutation } from '@/store/api/planApi';
import { DOWNTIME_DURATIONS, REASON_OPTIONS } from '../constants';

/**
 * Hook to manage create plan form logic and downtime sub-form.
 */
export const useCreatePlanForm = () => {
    const [form] = Form.useForm();
    const [downtimeForm] = Form.useForm();
    const [downtimes, setDowntimes] = useState([]);
    const navigate = useNavigate();
    const [runSimulation, { isLoading }] = useRunSimulationMutation();

    const onFinish = async (values) => {
        const targetDate = values.planningDate
            ? values.planningDate.format('YYYY-MM-DD')
            : null;

        if (!targetDate) {
            notification.error({
                message: 'Invalid Date',
                description: 'Please select a valid planning date.',
                placement: 'topRight',
            });
            return;
        }

        try {
            const result = await runSimulation({
                target_date: targetDate,
                start_date: targetDate, // Added this just in case backend prefers it!
                downtimes: downtimes
            }).unwrap();

            notification.success({
                message: 'Plan Generated',
                description:
                    result.message ||
                    `Simulation complete! Generated ${result.total_batches ?? 0} batches.`,
                placement: 'topRight',
            });

            // Navigate to plan-view after successful generation
            navigate('/plan-view');
        } catch (error) {
            notification.error({
                message: 'Simulation Failed',
                description:
                    error?.data?.detail ||
                    'An error occurred while running the simulation.',
                placement: 'topRight',
            });
        }
    };

    const handleReasonChange = (value) => {
        if (DOWNTIME_DURATIONS[value]) {
            downtimeForm.setFieldsValue({ duration: DOWNTIME_DURATIONS[value] });
        }
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
        isLoading,
        reasonOptions: REASON_OPTIONS,
        onFinish,
        handleReasonChange,
        addDowntime,
        removeDowntime,
    };
};
