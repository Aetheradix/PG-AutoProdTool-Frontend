import React from 'react';
import { Form, Button, notification } from 'antd';
import { FiCalendar, FiSettings, FiFileText } from 'react-icons/fi';
import { FormInput } from '@/components/shared/FormInput';
import { FormSelect } from '@/components/shared/FormSelect';
import { FormDatePicker } from '@/components/shared/FormDatePicker';

export function CreatePlanForm() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Plan Data:', values);
    notification.success({
      message: 'Plan Generated',
      description: 'Production plan has been generated successfully.',
      placement: 'topRight',
    });
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 w-full max-w-5xl mx-auto mt-8">
      <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">Create Production Plan</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="large"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5">
            <FormInput
              name="downtime"
              label="Downtime Details"
              placeholder="Shutdown/ Downtime Required"
              prefix={<FiFileText className="text-slate-400 mr-2" />}
            />
          </div>

          <div className="md:col-span-3">
            <FormDatePicker
              name="dateTime"
              label="Start Date & Time"
              rules={[{ required: true, message: 'Date/time is required' }]}
              placeholder="Select Date"
              showTime
              format="YYYY-MM-DD HH:mm"
              suffixIcon={<FiCalendar className="text-slate-400" />}
            />
          </div>

          <div className="md:col-span-4">
            <FormSelect
              name="system"
              label="Affected System"
              rules={[{ required: true, message: 'Please select a system' }]}
              placeholder="System"
              suffixIcon={<FiSettings className="text-slate-400" />}
              options={[
                { value: 'S1', label: 'System 1' },
                { value: 'S2', label: 'System 2' },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              className="h-14 px-12 rounded-2xl text-lg font-bold shadow-lg shadow-blue-200"
            >
              Generate Production Plan
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
