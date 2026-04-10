import React from 'react';
import { Table, Input, Button } from 'antd';
import { FiPlus, FiSearch } from 'react-icons/fi';
import useEquipmentManagement from './hooks/useEquipmentManagement';
import useEquipmentColumns from './hooks/useEquipmentColumns';
import EquipmentFormModal from './components/EquipmentFormModal';


// ── Summary Badge ─────────────────────────────────────────────────────────────
function SummaryBadge({ label, value, color, bg }) {
  return (
    <div
      style={{
        background:     bg,
        border:         `1px solid ${color}22`,
        borderRadius:   10,
        padding:        '8px 18px',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        minWidth:       100,
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginTop: 2 }}>{label}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function EquipmentManagement({ type = 'Tank' }) {
  const {
    isAdmin,
    isLoading,
    equipments,
    filteredEquipments,
    editingRecord,
    designationOptions,
    isOptionsLoading,
    isCreating,
    isUpdating,
    addForm,
    editForm,
    isAddModalOpen,
    isEditModalOpen,
    setIsAddModalOpen,
    openAddModal,
    openEditModal,
    closeEditModal,
    handleAdd,
    handleEdit,
    handleDelete,
    searchText,
    setSearchText,
  } = useEquipmentManagement(type);

  const columns = useEquipmentColumns({
    type,
    isAdmin,
    onEdit:   openEditModal,
    onDelete: handleDelete,
  });

  // Shared modal props to avoid repetition
  const sharedModalProps = { designationOptions, isOptionsLoading };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {isAdmin && (
          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={openAddModal}
            style={{
              background:   'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border:       'none',
              borderRadius: 10,
              fontWeight:   600,
              height:       40,
              boxShadow:    '0 2px 8px rgba(37,99,235,0.25)',
            }}
          >
            Add {type}
          </Button>
        )}
        <Input
          placeholder={`Search by ${type.toLowerCase()} name or resource group...`}
          prefix={<FiSearch className="text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{
            maxWidth:    340,
            height:      40,
            borderRadius: 10,
            borderColor: '#e2e8f0',
            boxShadow:   '0 1px 4px rgba(0,0,0,0.05)',
          }}
        />
      </div>

      {/* ── Summary Badges ── */}
      <div className="flex gap-3 flex-wrap">
        <SummaryBadge
          label={`Total ${type}s`}
          value={equipments.length}
          color="#2563eb" bg="#eff6ff"
        />
        <SummaryBadge
          label="Active"
          value={equipments.filter((t) => t.status === 'Active').length}
          color="#16a34a" bg="#f0fdf4"
        />
        <SummaryBadge
          label="Inactive"
          value={equipments.filter((t) => t.status !== 'Active').length}
          color="#dc2626" bg="#fef2f2"
        />
      </div>

      {/* ── Table ── */}
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

      {/* ── Add Modal ── */}
      <EquipmentFormModal
        {...sharedModalProps}
        type={type}
        title={`Add New ${type}`}
        open={isAddModalOpen}
        form={addForm}
        onOk={handleAdd}
        onCancel={() => setIsAddModalOpen(false)}
        okText="Create"
        confirmLoading={isCreating}
      />

      {/* ── Edit Modal ── */}
      <EquipmentFormModal
        {...sharedModalProps}
        type={type}
        title={`Edit ${type} — ${editingRecord?.equipment_name ?? ''}`}
        open={isEditModalOpen}
        form={editForm}
        onOk={handleEdit}
        onCancel={closeEditModal}
        okText="Save Changes"
        confirmLoading={isUpdating}
      />

    </div>
  );
}