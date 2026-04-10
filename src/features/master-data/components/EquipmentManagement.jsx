import React, { useState } from 'react';
import {
  Table,
  Form,
  Input,
  Select,
  Button,
  Popconfirm,
  Switch,
  Tag,
  Modal,
  message,
  Tooltip,
  Badge,
  Space,
} from 'antd';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDroplet, FiActivity, FiX, FiCheck } from 'react-icons/fi';
import {
  useGetEquipmentsMasterQuery,
  useCreateEquipmentMasterMutation,
  useUpdateEquipmentMasterMutation,
  useDeleteEquipmentMasterMutation,
} from '../../../store/api/masterDataApi';
import { useAuth } from '@/context/AuthContext';
import { getDesignationOptions, designationLabel } from './equipmentConstants';

// ─── Main Component ───────────────────────────────────────────────────────────

export function EquipmentManagement({ type = 'Tank' }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTank = type === 'Tank';

  // ── API hooks ──────────────────────────────────────────────────────────────
  const { data: apiData, isLoading } = useGetEquipmentsMasterQuery({ page: 1, limit: 1000 });
  const [createEquipment, { isLoading: isCreating }] = useCreateEquipmentMasterMutation();
  const [updateEquipment, { isLoading: isUpdating }] = useUpdateEquipmentMasterMutation();
  const [deleteEquipment] = useDeleteEquipmentMasterMutation();

  const allEquipments = Array.isArray(apiData?.data) ? apiData.data : Array.isArray(apiData) ? apiData : [];
  
  // Filter by equipment type
  const equipments = allEquipments.filter(e => e.equip_type === type);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // ── Constants ──────────────────────────────────────────────────────────────
  const DESIGNATION_OPTIONS = getDesignationOptions(type);
  const Icon = isTank ? FiDroplet : FiActivity;

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredEquipments = equipments.filter((t) => {
    if (!searchText) return true;
    const s = searchText.toLowerCase();
    return (
      t.equipment_name?.toLowerCase().includes(s) || t.resource_group?.toLowerCase().includes(s)
    );
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  function openAddModal() {
    addForm.resetFields();
    setIsAddModalOpen(true);
  }

  async function handleAddOk() {
    try {
      const values = await addForm.validateFields();
      const payload = {
        equipment_name: values.name,
        resource_group: values.designation,
        status: values.is_active ? 'Active' : 'Inactive',
        equip_type: type,
        description: '',
      };
      await createEquipment(payload).unwrap();
      message.success(`${type} added successfully!`);
      setIsAddModalOpen(false);
      addForm.resetFields();
    } catch (err) {
      if (err?.data?.detail) {
        message.error(err.data.detail);
      } else if (!err?.errorFields) {
        message.error(`Failed to add ${type.toLowerCase()}. Please try again.`);
      }
    }
  }

  function openEditModal(record) {
    setEditingRecord(record);
    editForm.setFieldsValue({
      name: record.equipment_name,
      designation: record.resource_group,
      is_active: record.status === 'Active',
    });
    setIsEditModalOpen(true);
  }

  async function handleEditOk() {
    try {
      const values = await editForm.validateFields();
      const payload = {
        equipment_id: editingRecord.equipment_id,
        equipment_name: values.name,
        resource_group: values.designation,
        status: values.is_active ? 'Active' : 'Inactive',
        equip_type: type,
      };
      await updateEquipment(payload).unwrap();
      message.success(`${type} updated successfully!`);
      setIsEditModalOpen(false);
      setEditingRecord(null);
    } catch (err) {
      if (err?.data?.detail) {
        message.error(err.data.detail);
      } else if (!err?.errorFields) {
        message.error(`Failed to update ${type.toLowerCase()}. Please try again.`);
      }
    }
  }

  async function handleDelete(record) {
    try {
      await deleteEquipment(record.equipment_id).unwrap();
      message.success(`${type} deleted successfully!`);
    } catch (err) {
      message.error(err?.data?.detail || `Failed to delete ${type.toLowerCase()}.`);
    }
  }

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: '#',
      dataIndex: 'equipment_id',
      key: 'equipment_id',
      width: 64,
      render: (_, __, idx) => <span className="text-slate-400 font-mono text-xs">{idx + 1}</span>,
    },
    {
      title: `${type.toUpperCase()} NAME`,
      dataIndex: 'equipment_name',
      key: 'equipment_name',
      sorter: (a, b) => (a.equipment_name ?? '').localeCompare(b.equipment_name ?? ''),
      render: (name) => (
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-500">
            <Icon size={14} />
          </span>
          <span className="font-semibold text-slate-800">{name}</span>
        </div>
      ),
    },
    {
      title: 'DESIGNATION',
      dataIndex: 'resource_group',
      key: 'resource_group',
      sorter: (a, b) => (a.resource_group ?? '').localeCompare(b.resource_group ?? ''),
      render: (val) => {
        const colorMap = {
          Portable: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
          Ronchi: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
          Unused: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
          Sachet: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
          Tube: { bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' },
        };
        const style = colorMap[val] || { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        return (
          <span
            style={{
              background: style.bg,
              color: style.color,
              border: `1px solid ${style.border}`,
              padding: '2px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {designationLabel(val, type)}
          </span>
        );
      },
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (val, record) => record.status === val,
      render: (status) =>
        status === 'Active' ? (
          <Tag
            style={{
              color: '#16a34a',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              fontWeight: 600,
              borderRadius: 999,
              padding: '2px 10px',
            }}
          >
            Active
          </Tag>
        ) : (
          <Tag
            style={{
              color: '#dc2626',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              fontWeight: 600,
              borderRadius: 999,
              padding: '2px 10px',
            }}
          >
            Inactive
          </Tag>
        ),
    },
    ...(isAdmin
      ? [
          {
            title: 'ACTIONS',
            key: 'actions',
            fixed: 'right',
            width: 130,
            render: (_, record) => (
              <Space size="middle">
                <Tooltip title="Edit">
                  <Button
                    type="link"
                    icon={<FiEdit2 size={14} />}
                    onClick={() => openEditModal(record)}
                    className="text-blue-600 font-bold p-0 flex items-center gap-1"
                  >
                    Edit
                  </Button>
                </Tooltip>
                <Popconfirm
                  title={`Delete this ${type.toLowerCase()}?`}
                  description="This action cannot be undone."
                  onConfirm={() => handleDelete(record)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="link"
                    danger
                    icon={<FiTrash2 size={14} />}
                    className="font-bold p-0 flex items-center gap-1"
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {isAdmin && (
          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={openAddModal}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: 10,
              fontWeight: 600,
              height: 40,
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
            }}
          >
            Add {type}
          </Button>
        )}
        <Input
          placeholder={`Search by ${type.toLowerCase()} name or designation...`}
          prefix={<FiSearch className="text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{
            maxWidth: 340,
            height: 40,
            borderRadius: 10,
            borderColor: '#e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        />
      </div>

      {/* ── Summary badges ───────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        <SummaryBadge label={`Total ${type}s`} value={equipments.length} color="#2563eb" bg="#eff6ff" />
        <SummaryBadge
          label="Active"
          value={equipments.filter((t) => t.status === 'Active').length}
          color="#16a34a"
          bg="#f0fdf4"
        />
        <SummaryBadge
          label="Inactive"
          value={equipments.filter((t) => t.status !== 'Active').length}
          color="#dc2626"
          bg="#fef2f2"
        />
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <Table
        dataSource={filteredEquipments}
        columns={columns}
        rowKey="equipment_id"
        loading={isLoading}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        scroll={{ x: 'max-content' }}
        rowClassName={(_, idx) => (idx % 2 === 1 ? 'editable-row even-row' : 'editable-row')}
        className="premium-table border-slate-100 shadow-sm rounded-xl overflow-hidden"
      />

      {/* ── Add Modal ───────────────────────────────────────────────────── */}
      <EquipmentFormModal
        type={type}
        title={`Add New ${type}`}
        open={isAddModalOpen}
        form={addForm}
        onOk={handleAddOk}
        onCancel={() => setIsAddModalOpen(false)}
        okText="Create"
        confirmLoading={isCreating}
      />

      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
      <EquipmentFormModal
        type={type}
        title={`Edit ${type} — ${editingRecord?.equipment_name ?? ''}`}
        open={isEditModalOpen}
        form={editForm}
        onOk={handleEditOk}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
        }}
        okText="Save Changes"
        confirmLoading={isUpdating}
      />
    </div>
  );
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function SummaryBadge({ label, value, color, bg }) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${color}22`,
        borderRadius: 10,
        padding: '8px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 100,
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginTop: 2 }}>{label}</span>
    </div>
  );
}

function EquipmentFormModal({ type, title, open, form, onOk, onCancel, okText, confirmLoading }) {
  const isTank = type === 'Tank';
  const Icon = isTank ? FiDroplet : FiActivity;
  const DESIGNATION_OPTIONS = getDesignationOptions(type);

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
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      }}
      cancelButtonProps={{ style: { borderRadius: 8 } }}
      width={500}
      className="premium-modal"
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="py-3" initialValues={{ is_active: true }}>
        {/* Name */}
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
            placeholder={`e.g. ${isTank ? 'Tank A1' : 'Line 1'}`}
            style={{ borderRadius: 8, height: 40 }}
            prefix={<Icon className="text-slate-300" />}
          />
        </Form.Item>

        {/* Designation */}
        <Form.Item
          name="designation"
          label={
            <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
              Designation
            </span>
          }
          rules={[{ required: true, message: 'Please select a designation' }]}
        >
          <Select
            placeholder="Select designation..."
            options={DESIGNATION_OPTIONS}
            style={{ height: 40 }}
            className="w-full"
            showSearch
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* Active Status */}
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
