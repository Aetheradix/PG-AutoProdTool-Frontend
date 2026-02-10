import React from 'react';
import { Space, Button } from 'antd';
import { FiEdit2 } from 'react-icons/fi';

export const getUploadColumns = (uploadColumns, isEditing, save, cancel, edit, editingKey) => [
    ...uploadColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    }),
    {
        title: 'ACTIONS',
        dataIndex: 'operation',
        fixed: 'right',
        width: 150,
        render: (_, record) => {
            const editable = isEditing(record);
            return editable ? (
                <Space size="middle">
                    <Button
                        type="link"
                        onClick={() => save(record.key)}
                        className="text-blue-600 font-bold p-0"
                    >
                        Save
                    </Button>
                    <Button type="link" onClick={cancel} className="font-bold p-0">
                        Cancel
                    </Button>
                </Space>
            ) : (
                <Button
                    type="link"
                    disabled={editingKey !== ''}
                    onClick={() => edit(record)}
                    className="text-blue-600 font-bold p-0 flex items-center gap-1"
                >
                    <FiEdit2 size={14} /> Edit
                </Button>
            );
        },
    },
];
