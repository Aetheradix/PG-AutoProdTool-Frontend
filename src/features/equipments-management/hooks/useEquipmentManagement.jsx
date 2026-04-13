import { useState, useMemo } from 'react';
import { Form, message } from 'antd';
import {
  useGetEquipmentsMasterQuery,
  useCreateEquipmentMasterMutation,
  useUpdateEquipmentMasterMutation,
  useDeleteEquipmentMasterMutation,
} from '@/store/api/masterDataApi';
import { useAuth } from '@/context/AuthContext';
import useResourceGroupOptions from './useResourceGroupOptions';

export default function useEquipmentManagement(type) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // ── API ──────────────────────────────────────────────────────────────────
  const { data: apiData, isLoading } = useGetEquipmentsMasterQuery({ page: 1, limit: 1000 });
  const [createEquipment, { isLoading: isCreating }] = useCreateEquipmentMasterMutation();
  const [updateEquipment, { isLoading: isUpdating }] = useUpdateEquipmentMasterMutation();
  const [deleteEquipment]                             = useDeleteEquipmentMasterMutation();

  // ── Dynamic designation options (derived from cached API data) ────────────
  const { options: designationOptions, isLoading: isOptionsLoading } = useResourceGroupOptions(type);

  // ── Data ─────────────────────────────────────────────────────────────────
  const allEquipments = useMemo(() => {
    const raw = Array.isArray(apiData?.data) ? apiData.data : Array.isArray(apiData) ? apiData : [];
    return raw.map(item => {
      const cleaned = {};
      Object.keys(item).forEach(key => {
        const val = item[key];
        // Clean both key and value (if string)
        cleaned[key.trim()] = typeof val === 'string' ? val.trim() : val;
      });
      return cleaned;
    });
  }, [apiData]);

  const equipments = allEquipments.filter((e) => e.equip_type === type);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [addForm]                              = Form.useForm();
  const [editForm]                             = Form.useForm();
  const [searchText,      setSearchText]       = useState('');
  const [isAddModalOpen,  setIsAddModalOpen]   = useState(false);
  const [isEditModalOpen, setIsEditModalOpen]  = useState(false);
  const [editingRecord,   setEditingRecord]    = useState(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredEquipments = equipments.filter((t) => {
    if (!searchText) return true;
    const s = searchText.toLowerCase();
    return (
      t.equipment_name?.toLowerCase().includes(s) ||
      t.resource_group?.toLowerCase().includes(s)
    );
  });

  // ── Modal handlers ────────────────────────────────────────────────────────
  function openAddModal() {
    setIsAddModalOpen(true);
    // Defer reset to ensure form is connected
    setTimeout(() => {
      addForm.resetFields();
    }, 0);
  }

  function openEditModal(record) {
    console.log('Opening Edit Modal with cleaned record:', record);
    setEditingRecord(record);

    editForm.setFieldsValue({
      name:        record.equipment_name,
      designation: record.resource_group,
      is_active:   record.status === 'Active',
    });
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
    setEditingRecord(null);
  }

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  async function handleAdd() {
    try {
      const values = await addForm.validateFields();
      await createEquipment({
        equipment_name: values.name,
        resource_group: values.designation,
        status:         values.is_active ? 'Active' : 'Inactive',
        equip_type:     type,
        description:    '',
      }).unwrap();
      message.success(`${type} added successfully!`);
      setIsAddModalOpen(false);
      addForm.resetFields();
    } catch (err) {
      if (err?.data?.detail)      message.error(err.data.detail);
      else if (!err?.errorFields) message.error(`Failed to add ${type.toLowerCase()}.`);
    }
  }

  async function handleEdit() {
    try {
      const values = await editForm.validateFields();
      console.log('Proceeding with handleEdit. editingRecord:', editingRecord);
      const originalName = editingRecord.equipment_name || editingRecord['equipment_name '];

      if (!originalName) {
        console.error('Cannot find equipment name in:', editingRecord);
        message.error('Selection error: Original name not found.');
        return;
      }

      const payload = {
        originalName:   originalName,
        equipment_name: values.name,
        resource_group: values.designation,
        status:         values.is_active ? 'Active' : 'Inactive',
        equip_type:     type,
      };

      console.log('Sending Update Payload:', payload);
      await updateEquipment(payload).unwrap();
      message.success(`${type} updated successfully!`);
      closeEditModal();
    } catch (err) {
      if (err?.data?.detail)      message.error(err.data.detail);
      else if (!err?.errorFields) message.error(`Failed to update ${type.toLowerCase()}.`);
    }
  }

  async function handleDelete(record) {
    try {
      console.log('Deleting equipment:', record);
      if (!record?.equipment_name) {
        throw new Error('Equipment name is missing.');
      }
      await deleteEquipment(record.equipment_name).unwrap();
      console.log('Delete successful:', record.equipment_name);
      message.success(`${type} deleted successfully!`);
    } catch (err) {
      message.error(err?.data?.detail || `Failed to delete ${type.toLowerCase()}.`);
    }
  }

  return {
    // auth
    isAdmin,
    // data
    isLoading,
    equipments,
    filteredEquipments,
    editingRecord,
    // designation options
    designationOptions,
    isOptionsLoading,
    // loading states
    isCreating,
    isUpdating,
    // forms
    addForm,
    editForm,
    // modal state
    isAddModalOpen,
    isEditModalOpen,
    setIsAddModalOpen,
    // handlers
    openAddModal,
    openEditModal,
    closeEditModal,
    handleAdd,
    handleEdit,
    handleDelete,
    // search
    searchText,
    setSearchText,
  };
}