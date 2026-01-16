import React, { useState } from 'react';
import { Card, Typography, Space, Button, Table, Modal, Form, Input, Popconfirm, message } from 'antd';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { masterData as initialData } from './masterData';

const { Title, Text } = Typography;

const categories = [
  { id: 'bct', label: 'Batch Cycle Times (BCT)' },
  { id: 'washout', label: 'Washout Matrices' },
  { id: 'buffers', label: 'Buffers' },
  { id: 'variantMappings', label: 'Variant Mappings' },
];

export function MasterDataPage() {
  const [activeCategory, setActiveCategory] = useState('bct');
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (key) => {
    const newData = { ...data };
    newData[activeCategory] = newData[activeCategory].filter((item) => item.key !== key);
    setData(newData);
    message.success('Entry deleted successfully');
  };

  const handleSave = (values) => {
    const newData = { ...data };
    if (editingRecord) {
      // Edit logic
      newData[activeCategory] = newData[activeCategory].map((item) =>
        item.key === editingRecord.key ? { ...item, ...values } : item
      );
      message.success('Entry updated successfully');
    } else {
      // Add logic
      const newEntry = {
        key: Date.now().toString(),
        ...values,
      };
      newData[activeCategory] = [...newData[activeCategory], newEntry];
      message.success('New entry added successfully');
    }
    setData(newData);
    setIsModalOpen(false);
  };

  const getColumns = () => {
    const actionColumn = {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            className="text-blue-600 font-bold p-0 flex items-center gap-1"
            onClick={() => handleEdit(record)}
          >
            <FiEdit2 size={14} /> Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this entry?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              className="font-bold p-0 flex items-center gap-1"
            >
              <FiTrash2 size={14} /> Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    };

    switch (activeCategory) {
      case 'bct':
        return [
          { title: 'VARIANT', dataIndex: 'variant', key: 'variant' },
          { title: 'TIME (HOURS)', dataIndex: 'time', key: 'time' },
          actionColumn,
        ];
      case 'washout':
        return [
          { title: 'SOURCE PRODUCT', dataIndex: 'source', key: 'source' },
          { title: 'TARGET PRODUCT', dataIndex: 'target', key: 'target' },
          { title: 'CLEANING TIME', dataIndex: 'time', key: 'time' },
          actionColumn,
        ];
      case 'buffers':
        return [
          { title: 'BUFFER RULE', dataIndex: 'rule', key: 'rule' },
          actionColumn,
        ];
      case 'variantMappings':
        return [
          { title: 'PRODUCT VARIANT', dataIndex: 'variant', key: 'variant' },
          { title: 'MAPPED BCT TYPE', dataIndex: 'mapped', key: 'mapped' },
          actionColumn,
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fade-in pb-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-1 mt-4 lg:mt-16 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap lg:w-full text-left px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm font-semibold transition-all ${activeCategory === cat.id
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full">
          <Card
            className="border-none shadow-sm rounded-xl overflow-hidden min-h-[500px]"
            styles={{ body: { padding: '24px' } }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 lg:mb-10">
              <Title level={4} className="m-0! font-bold text-slate-800">
                {categories.find(c => c.id === activeCategory)?.label}
              </Title>
              <Button
                type="primary"
                icon={<FiPlus />}
                onClick={handleAdd}
                className="bg-blue-600 h-11 px-6 rounded-lg font-bold border-none shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
              >
                Add New Entry
              </Button>
            </div>

            <Table
              columns={getColumns()}
              dataSource={data[activeCategory]}
              pagination={false}
              className="master-data-table-custom"
              rowClassName="group"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </div>
      </div>

      {/* CRUD Modal */}
      <Modal
        title={
          <span className="text-lg font-bold text-slate-800">
            {editingRecord ? 'Edit Entry' : 'Add New Entry'}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Save Entry"
        okButtonProps={{ className: 'bg-blue-600 font-bold h-10 rounded-lg' }}
        cancelButtonProps={{ className: 'rounded-lg h-10' }}
        centered
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="mt-6"
        >
          {activeCategory === 'bct' && (
            <>
              <Form.Item name="variant" label="Product Variant" rules={[{ required: true }]}>
                <Input placeholder="e.g. BC128O - Sachet" size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item name="time" label="Time (Hours)" rules={[{ required: true }]}>
                <Input placeholder="e.g. 3.5" size="large" className="rounded-lg" />
              </Form.Item>
            </>
          )}
          {activeCategory === 'washout' && (
            <>
              <Form.Item name="source" label="Source Product" rules={[{ required: true }]}>
                <Input placeholder="e.g. Shampoo" size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item name="target" label="Target Product" rules={[{ required: true }]}>
                <Input placeholder="e.g. Conditioner" size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item name="time" label="Cleaning Time" rules={[{ required: true }]}>
                <Input placeholder="e.g. 1.5 hours" size="large" className="rounded-lg" />
              </Form.Item>
            </>
          )}
          {activeCategory === 'buffers' && (
            <Form.Item name="rule" label="Buffer Rule" rules={[{ required: true }]}>
              <Input placeholder="e.g. Sachet: 2 hours" size="large" className="rounded-lg" />
            </Form.Item>
          )}
          {activeCategory === 'variantMappings' && (
            <>
              <Form.Item name="variant" label="Product Variant" rules={[{ required: true }]}>
                <Input placeholder="e.g. H&S Daily Clean" size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item name="mapped" label="Mapped BCT Type" rules={[{ required: true }]}>
                <Input placeholder="e.g. BC128O" size="large" className="rounded-lg" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
