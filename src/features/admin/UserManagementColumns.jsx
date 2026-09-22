import React from 'react';
import { Tag, Switch, Typography, Space, Button, Popconfirm, Avatar, Tooltip, message } from 'antd';
import { 
  FiEdit2, 
  FiTrash2, 
  FiShield, 
  FiUser, 
  FiMail, 
  FiCopy 
} from 'react-icons/fi';

const { Text } = Typography;

export const getUserManagementColumns = ({ 
  handleUpdateField, 
  handleEditUser, 
  handleConfirmDelete, 
  isUpdating, 
  isDeleting 
}) => [
  {
    title: 'User Profile',
    key: 'user_profile',
    width: 260,
    render: (_, record) => {
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.username || 'user'}`;
      const isActive = Boolean(record.is_active);
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="relative shrink-0">
            <Avatar 
              size={42} 
              src={avatarUrl} 
              className="border-2 border-slate-100 shadow-sm bg-slate-50"
            />
            <span 
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isActive ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-sm hover:text-blue-600 transition-colors">
              {record.full_name || record.username}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              @{record.username}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    title: 'Email Address',
    dataIndex: 'email',
    key: 'email',
    width: 240,
    render: (email) => {
      if (!email) {
        return <span className="text-slate-400 italic text-xs">No email set</span>;
      }
      return (
        <div className="flex items-center gap-2 text-slate-600 group">
          <FiMail className="text-slate-400 shrink-0 text-sm" />
          <span className="text-xs font-medium truncate max-w-[180px]">{email}</span>
          <Tooltip title="Copy Email">
            <button
              onClick={() => {
                navigator.clipboard.writeText(email);
                message.success('Email copied to clipboard');
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            >
              <FiCopy size={12} />
            </button>
          </Tooltip>
        </div>
      );
    },
  },
  {
    title: 'Role & Access',
    key: 'role_access',
    width: 220,
    render: (_, record) => {
      const isAdmin = record.role === 'admin' || Boolean(record.is_admin);
      return (
        <div className="flex items-center gap-2.5">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/80 shadow-xs">
              <FiShield className="text-blue-600 shrink-0" size={13} />
              <span>Administrator</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <FiUser className="text-slate-500 shrink-0" size={13} />
              <span>Standard User</span>
            </span>
          )}
          <Tooltip title={isAdmin ? 'Demote to Standard User' : 'Promote to Administrator'}>
            <Switch
              checked={isAdmin}
              onChange={(checked) => {
                handleUpdateField(record.id, 'role', checked ? 'admin' : 'user');
                handleUpdateField(record.id, 'is_admin', checked ? 1 : 0);
              }}
              loading={isUpdating}
              size="small"
              className={isAdmin ? 'bg-blue-600!' : ''}
            />
          </Tooltip>
        </div>
      );
    },
  },
  {
    title: 'Account Status',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 190,
    render: (active, record) => {
      const isActive = Boolean(active);
      return (
        <div className="flex items-center gap-2.5">
          <span 
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isActive 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>{isActive ? 'Active' : 'Inactive'}</span>
          </span>
          <Tooltip title={isActive ? 'Deactivate user login access' : 'Activate user login access'}>
            <Switch
              checked={isActive}
              onChange={(checked) => handleUpdateField(record.id, 'is_active', checked ? 1 : 0)}
              loading={isUpdating}
              size="small"
              className={isActive ? 'bg-emerald-500!' : ''}
            />
          </Tooltip>
        </div>
      );
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 110,
    fixed: 'right',
    render: (_, record) => (
      <div className="flex items-center gap-1">
        <Tooltip title="Edit User Details">
          <Button
            type="text"
            icon={<FiEdit2 size={15} />}
            onClick={() => handleEditUser(record)}
            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg h-8 w-8 flex items-center justify-center transition-colors"
          />
        </Tooltip>
        <Popconfirm
          title="Delete Account"
          description={`Are you sure you want to delete @${record.username}? This action cannot be undone.`}
          onConfirm={() => handleConfirmDelete(record.id)}
          okText="Delete User"
          cancelText="Cancel"
          okButtonProps={{ danger: true, loading: isDeleting }}
        >
          <Tooltip title="Delete Account">
            <Button
              type="text"
              danger
              icon={<FiTrash2 size={15} />}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-lg h-8 w-8 flex items-center justify-center transition-colors"
            />
          </Tooltip>
        </Popconfirm>
      </div>
    ),
  },
];
