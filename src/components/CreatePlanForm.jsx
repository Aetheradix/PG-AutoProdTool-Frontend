import { FormDatePicker } from '@/components/shared/FormDatePicker';
import { FormInput } from '@/components/shared/FormInput';
import { FormSelect } from '@/components/shared/FormSelect';
import { Button, Divider, Form, Spin, Typography, Tag } from 'antd';
import { FiCalendar, FiClock, FiTrash2, FiPlus, FiAlertTriangle } from 'react-icons/fi';
import { useCreatePlanForm } from '../features/create-production-plan/hooks/useCreatePlanForm';

const { Title, Text } = Typography;

// Color map for reason tags
const REASON_COLORS = {
  'CIL + Deep Cleaning': 'orange',
  'TBM (6h)': 'red',
  'TBM (8h)': 'red',
  Startup: 'blue',
  'Culture Connect': 'purple',
  Shutdown: 'volcano',
  Changeover: 'cyan',
  Breakdown: 'magenta',
  Maintenance: 'gold',
};

export function CreatePlanForm() {
  const {
    form,
    downtimeForm,
    downtimes,
    isLoading,
    reasonOptions,
    isOtherReason,
    onFinish,
    handleReasonChange,
    addDowntime,
    removeDowntime,
  } = useCreatePlanForm();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-4xl mx-auto mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <FiCalendar className="text-white text-lg" />
        </div>
        <div>
          <Title level={3} className="m-0! text-slate-800 font-bold">
            New Plan Parameters
          </Title>
          <Text type="secondary" className="text-xs">
            Set planning date and any planned downtime before generating
          </Text>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
        <div className="space-y-6">

          {/* Planning Date */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <Text strong className="text-slate-700 block mb-4 text-sm uppercase tracking-wide">
              Planning Date
            </Text>
            <div className="max-w-xs">
              <FormDatePicker
                name="planningDate"
                label=""
                // rules={[{ required: true, message: 'Please select a planning date' }]}
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Select date"
              />
            </div>
          </div>

          <Divider className="my-2" />

          {/* Downtime Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="text-orange-500 text-lg" />
              <div>
                <Title level={4} className="m-0! text-slate-800 font-bold">
                  Planned Downtime
                </Title>
                <Text type="secondary" className="text-xs">
                  Add any planned downtime not already in master data — these will appear as blocks on the Gantt chart
                </Text>
              </div>
            </div>

            {/* Downtime Input Row */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5">
              <Form
                form={downtimeForm}
                layout="vertical"
                requiredMark={false}
                component={false}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <FormSelect
                      name="line"
                      label="Line / Operation"
                      placeholder="Select Line"
                      options={[
                        { value: '6T', label: '6T' },
                        { value: '12T', label: '12T' },
                        { value: 'Both', label: 'Both Lines' },
                      ]}
                    />
                  </div>
                  <div>
                    <FormDatePicker
                      name="startTime"
                      label="Start Time"
                      showTime={{ use12Hours: true, format: 'hh:mm A' }}
                      format="DD/MM/YYYY, hh:mm A"
                      placeholder="dd/mm/yyyy, --:-- --"
                    />
                  </div>
                  <div>
                    <FormInput
                      name="duration"
                      label="Duration (mins)"
                      type="number"
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div>
                    <FormSelect
                      name="reason"
                      label="Reason"
                      placeholder="Select Reason"
                      options={reasonOptions}
                      onChange={handleReasonChange}
                      showSearch
                    />
                  </div>

                  {isOtherReason && (
                    <div className="col-span-1 md:col-span-4">
                      <FormInput
                        name="customReason"
                        label="Specify Reason"
                        placeholder="e.g., Boiler Maintenance, Steam Leakage..."
                        rules={[{ required: true, message: 'Please enter the reason' }]}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    onClick={addDowntime}
                    icon={<FiPlus />}
                    className="bg-orange-500 hover:bg-orange-600 text-white border-none font-semibold rounded-lg px-6"
                  >
                    Add Downtime
                  </Button>
                </div>
              </Form>
            </div>

            {/* Added Downtimes List */}
            {downtimes.length > 0 && (
              <div className="space-y-2">
                <Text strong className="text-slate-700 text-sm">
                  {downtimes.length} downtime{downtimes.length > 1 ? 's' : ''} added:
                </Text>
                <div className="space-y-2">
                  {downtimes.map((d, idx) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 bg-white border border-orange-200 rounded-lg group hover:border-orange-400 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                          {idx + 1}
                        </div>
                        <FiClock className="text-orange-400 flex-shrink-0" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag color={REASON_COLORS[d.reason] || 'default'} className="m-0">
                            {d.reason}
                          </Tag>
                          <Text className="text-slate-600 text-sm">
                            <span className="font-semibold">[{d.line || 'All'}]</span>
                            {' '}
                            {d.startTimeDisplay || d.startTime}
                            {' '}
                            <span className="text-slate-400">({d.duration} mins)</span>
                          </Text>
                        </div>
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<FiTrash2 />}
                        onClick={() => removeDowntime(d.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              size="large"
              className="rounded-lg px-8 border-slate-200"
              disabled={isLoading}
              onClick={() => {
                form.resetFields();
                downtimeForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 px-10 rounded-lg font-bold border-none min-w-[160px]"
            >
              {isLoading ? 'Generating...' : 'Generate Plan'}
            </Button>
          </div>

          {/* Loading overlay hint */}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Spin size="small" />
              <Text className="text-blue-700 text-sm">
                Running simulation — this may take 30–60 seconds. Please wait...
              </Text>
            </div>
          )}
        </div>
      </Form>
    </div>
  );
}
