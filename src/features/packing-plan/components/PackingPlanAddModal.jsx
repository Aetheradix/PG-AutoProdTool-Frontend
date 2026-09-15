import { DatePicker, Form, Input, Modal, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { FiPackage } from 'react-icons/fi';
import { useGetEquipmentsMasterQuery } from '@/store/api/masterDataApi';

const PackingPlanAddModal = ({ open, onCancel, onOk, confirmLoading, initialValues }) => {
  const [form] = Form.useForm();
  
  // Fetch dynamic line options
  const { data: equipmentData, isLoading: isLinesLoading } = useGetEquipmentsMasterQuery({ page: 1, limit: 1000 });
  
  const lineOptions = useMemo(() => {
    const raw = Array.isArray(equipmentData?.data) ? equipmentData.data : Array.isArray(equipmentData) ? equipmentData : [];
    return raw
      .filter(item => item.equip_type === 'Line')
      .map(item => ({
        value: (item.equipment_name || '').trim(),
        label: (item.description || item.equipment_name || '').trim()
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [equipmentData]);

  // Reset and set values when modal opens
  React.useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
        const values = { ...initialValues };
        if (values.start_date) values.start_date = dayjs(values.start_date);
        if (values.end_date) values.end_date = dayjs(values.end_date);
        if (values.start_time) values.start_time = dayjs(values.start_time, 'HH:mm');
        if (values.end_time) values.end_time = dayjs(values.end_time, 'HH:mm');
        form.setFieldsValue(values);
      }
    }
  }, [open, initialValues, form]);

  const onFinish = (values) => {
    console.log('onFinish received values:', values);
    
    const submissionData = {
      line: values.line,
      order_no: values.order_no,
      p_code: values.p_code,
      description: values.description,
      batch_no: values.batch_no,
      planned_qty: values.planned_qty !== undefined && values.planned_qty !== null && values.planned_qty !== ''
        ? (isNaN(Number(values.planned_qty)) ? String(values.planned_qty) : Number(values.planned_qty))
        : undefined,
      start_date: values.start_date?.format('YYYY-MM-DD'),
      start_time: values.start_time?.format('HH:mm'),
      end_date: values.end_date?.format('YYYY-MM-DD'),
      end_time: values.end_time?.format('HH:mm'),
    };
    
    // Filter out undefined values but keep the object non-empty
    const filteredData = Object.fromEntries(
      Object.entries(submissionData).filter(([_, v]) => v !== undefined)
    );

    console.log('Submitting final payload from onFinish:', filteredData);
    onOk(filteredData);
  };

  const handleOk = () => {
    form.submit();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-[#002060] border-b border-slate-100 pb-3 mb-0">
          <FiPackage size={20} />
          <span className="font-black uppercase tracking-tight text-lg">Add New Packing Plan</span>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="CREATE PLAN"
      cancelText="CANCEL"
      confirmLoading={confirmLoading}
      width={1100}
      centered
      className="premium-modal"
      styles={{
        body: { padding: '24px 32px' },
        mask: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 32, 96, 0.15)' }
      }}
      okButtonProps={{ className: 'bg-[#002060] hover:bg-[#003080] rounded-none h-10 px-8 font-black tracking-widest' }}
      cancelButtonProps={{ className: 'rounded-none h-10 px-8 font-bold' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4"
      >
        <Form.Item
          name="line"
          label={<span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Line</span>}
        >
          <Select 
            placeholder="Select Line" 
            className="h-10 rounded-none w-full"
            loading={isLinesLoading}
            options={lineOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="order_no"
          label={<span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Order No</span>}
        >
          <Input placeholder="Enter order no" className="h-10 rounded-none font-bold bg-slate-50" />
        </Form.Item>

        <Form.Item
          name="p_code"
          label={<span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">P Code</span>}
        >
          <Input placeholder="Enter p code" className="h-10 rounded-none font-bold bg-slate-50" />
        </Form.Item>

        <Form.Item
          name="description"
          label={<span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Description</span>}
          className="lg:col-span-2"
        >
          <Input placeholder="Enter description" className="h-10 rounded-none font-bold bg-slate-50" />
        </Form.Item>

        <Form.Item
          name="batch_no"
          label={<span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Batch No</span>}
        >
          <Input placeholder="Enter batch no" className="h-10 rounded-none font-bold bg-slate-50" />
        </Form.Item>

        <Form.Item
          name="planned_qty"
          label={<span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Planned Qty</span>}
        >
          <Input type="text" placeholder="Enter planned qty (e.g. 6000 or 6T / 12T)" className="h-10 rounded-none font-bold bg-slate-50" />
        </Form.Item>

        <Form.Item
          name="start_date"
          label={<span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Start Date</span>}
        >
          <DatePicker format="YYYY-MM-DD" className="w-full h-10 rounded-none" placeholder="Select start date" />
        </Form.Item>

        <Form.Item
          name="start_time"
          label={<span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Start Time</span>}
        >
          <TimePicker format="HH:mm" className="w-full h-10 rounded-none" placeholder="Select start time" />
        </Form.Item>

        <Form.Item
          name="end_date"
          label={<span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">End Date</span>}
        >
          <DatePicker format="YYYY-MM-DD" className="w-full h-10 rounded-none" placeholder="Select end date" />
        </Form.Item>

        <Form.Item
          name="end_time"
          label={<span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">End Time</span>}
        >
          <TimePicker format="HH:mm" className="w-full h-10 rounded-none" placeholder="Select end time" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PackingPlanAddModal;
