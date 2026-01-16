import { FormDatePicker } from '@/components/shared/FormDatePicker';
import { FormInput } from '@/components/shared/FormInput';
import { FormSelect } from '@/components/shared/FormSelect';
import { Button, Divider, Form, notification, Typography } from 'antd';
import { useState } from 'react';
import { FiCalendar, FiClock, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

export function CreatePlanForm() {
  const [form] = Form.useForm();
  const [downtimeForm] = Form.useForm();
  const [downtimes, setDowntimes] = useState([]);

  const onFinish = (values) => {
    const finalData = {
      ...values,
      plannedDowntimes: downtimes,
    };
    console.log('Final Plan Data:', finalData);
    notification.success({
      message: 'Plan Generated',
      description: 'Production plan has been generated with ' + downtimes.length + ' downtimes.',
      placement: 'topRight',
    });
  };

  const addDowntime = async () => {
    try {
      const values = await downtimeForm.validateFields();
      const newDowntime = {
        id: Date.now(),
        reason: values.reason,
        startTime: values.startTime.format('DD/MM/YYYY, HH:mm:ss'),
        endTime: values.endTime.format('DD/MM/YYYY, HH:mm:ss'),
      };
      setDowntimes([...downtimes, newDowntime]);
      downtimeForm.resetFields();
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const removeDowntime = (id) => {
    setDowntimes(downtimes.filter((d) => d.id !== id));
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-4xl mx-auto mt-8">
      <Title level={3} className="mb-8 text-slate-800 font-bold">
        New Plan Parameters
      </Title>

      <Form form={form} layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
        <div className="space-y-6">
          {/* Main Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormDatePicker
              name="planningDate"
              label="Planning Date"
              rules={[{ required: true, message: 'Required' }]}
              className="w-full"
              format="DD/MM/YYYY"
              icon={<FiCalendar />}
            />
            <FormSelect
              name="system"
              label="Select System"
              rules={[{ required: true, message: 'Required' }]}
              placeholder="Select System"
              options={[
                { value: 'system1', label: 'System 1' },
                { value: 'system2', label: 'System 2' },
              ]}
            />
          </div>

          <Divider className="my-8" />

          {/* Downtime Section */}
          <div className="space-y-4">
            <div>
              <Title level={4} className="m-0! text-slate-800 font-bold">
                Planned Downtime
              </Title>
              <Text type="secondary">Add any planned downtime not already in the master data.</Text>
            </div>

            <Form
              form={downtimeForm}
              layout="vertical"
              className="bg-transparent"
              requiredMark={false}
              component={false}
            >
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-end">
                <div className="md:col-span-3">
                  <FormDatePicker
                    name="startTime"
                    label="Start Time"
                    showTime
                    format="DD/MM/YYYY, HH:mm:ss"
                    className=" h-10"
                    placeholder="dd/mm/yyyy, --:-- --"
                  />
                </div>
                <div className="md:col-span-3">
                  <FormDatePicker
                    name="endTime"
                    label="End Time"
                    showTime
                    format="DD/MM/YYYY, HH:mm:ss"
                    className=" h-10"
                    placeholder="dd/mm/yyyy, --:-- --"
                  />
                </div>
                <div className="md:col-span-4">
                  <FormInput
                    name="reason"
                    label="Reason"
                    placeholder="e.g., CIL"
                    className=" h-10 placeholder:text-gray-400!"
                  />
                </div>
              </div>
              <div className="mt-12">
                <Button
                  onClick={addDowntime}
                  className="px-12 py-12  bg-slate-100 border-none font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Add Downtime
                </Button>
              </div>
            </Form>

            {/* Added Downtimes List */}
            {downtimes.length > 0 && (
              <div className="mt-12 space-y-3">
                <Text strong className="text-slate-700">
                  Added Downtimes:
                </Text>
                {downtimes.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <FiClock className="text-slate-400" />
                      <Text className="text-slate-600">
                        <span className="font-bold">{d.reason}:</span> {d.startTime} - {d.endTime}
                      </Text>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<FiTrash2 />}
                      onClick={() => removeDowntime(d.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-8">
            <Button size="large" className="rounded-lg px-8 border-slate-200">
              Cancel
            </Button>
            <Link to="/plan-view">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="bg-blue-600 px-8 rounded-lg font-bold border-none"
              >
                Generate Plan
              </Button>
            </Link>
          </div>
        </div>
      </Form>
    </div>
  );
}
