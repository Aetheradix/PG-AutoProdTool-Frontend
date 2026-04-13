import React from 'react';
import { Modal, Form, Input, Select, Switch } from 'antd';
import { FiDroplet, FiActivity, FiCpu } from 'react-icons/fi';

export default function EquipmentFormModal({
  type,
  title,
  open,
  form,
  onOk,
  onCancel,
  okText,
  confirmLoading,
  designationOptions = [],
  isOptionsLoading = false,
}) {
  const Icon = type === 'Tank' ? FiDroplet : type === 'Line' ? FiActivity : FiCpu;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 py-1">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-500">
            <Icon size={16} />
          </span>
          <span className="font-bold text-slate-800 text-base">{title}</span>
        </div>
      }
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      confirmLoading={confirmLoading}
      okButtonProps={{
        style: {
          background:   'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          border:       'none',
          borderRadius: 8,
          fontWeight:   600,
        },
      }}
      cancelButtonProps={{ style: { borderRadius: 8 } }}
      width={500}
      className="premium-modal"
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="py-3" initialValues={{ is_active: true }}>

        {/* ── Name ── */}
        <Form.Item
          name="name"
          label={
            <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
              {type} Name
            </span>
          }
          rules={[{ required: true, message: `Please enter ${type.toLowerCase()} name` }]}
        >
          <Input
            placeholder={`e.g. ${type === 'Tank' ? 'Tank A1' : 'Line 1'}`}
            style={{ borderRadius: 8, height: 40 }}
            prefix={<Icon className="text-slate-300" />}
          />
        </Form.Item>

        {/* ── Resource Group (dynamic) ── */}
        <Form.Item
          name="designation"
          label={
            <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
              Resource Group
            </span>
          }
          rules={[{ required: true, message: 'Please select a resource group' }]}
        >
          <Select
            placeholder="Select resource group..."
            options={designationOptions}
            loading={isOptionsLoading}
            style={{ height: 40 }}
            className="w-full"
            showSearch
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* ── Active Status ── */}
        <Form.Item
          name="is_active"
          label={
            <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
              Active Status
            </span>
          }
          valuePropName="checked"
        >
          <div className="flex items-center gap-3">
            <Form.Item name="is_active" valuePropName="checked" noStyle>
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                style={{ minWidth: 80 }}
              />
            </Form.Item>
            <span className="text-xs text-slate-500">
              Toggle to set whether this {type.toLowerCase()} is currently in operation
            </span>
          </div>
        </Form.Item>

      </Form>
    </Modal>
  );
}