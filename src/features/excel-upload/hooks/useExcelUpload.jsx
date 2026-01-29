import { useState } from 'react';
import { Form, message } from 'antd';
import * as XLSX from 'xlsx';
import { useUploadExcelDataMutation } from '@/store/api/excelApi';

export const useExcelUpload = () => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [uploadExcelData, { isLoading: isUploading }] = useUploadExcelDataMutation();

    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => {
        form.setFieldsValue({ ...record });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...row });
                setData(newData);
                setEditingKey('');
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const handleFileUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];

            const jsonData = XLSX.utils.sheet_to_json(ws, {
                header: 1,
                raw: false,
                defval: '',
            });

            if (jsonData.length > 0) {
                const headers = jsonData[0].filter((h) => h && h.toString().trim() !== '');
                const rows = jsonData.slice(1).map((row, index) => {
                    const rowData = { key: index.toString() };
                    headers.forEach((header, i) => {
                        rowData[header] = row[i] !== undefined ? row[i] : '';
                    });
                    return rowData;
                });

                const dynamicColumns = headers.map((header) => ({
                    title: header,
                    dataIndex: header,
                    editable: true,
                    width: 150,
                    ellipsis: true,
                }));

                setColumns(dynamicColumns);
                setData(rows);
                message.success('File uploaded and parsed successfully');
            }
        };
        reader.readAsBinaryString(file);
        return false;
    };

    const handleSubmit = async () => {
        if (data.length === 0) {
            message.warning('No data to upload');
            return;
        }
        try {
            const cleanedData = data.map(({ key, ...rest }) => rest);
            const response = await uploadExcelData(cleanedData).unwrap();
            message.success(response.message || 'Data sent to backend successfully');
        } catch (err) {
            message.error(err.data?.detail || 'Failed to send data to backend');
            console.error(err);
        }
    };

    const clearData = () => {
        setData([]);
        setColumns([]);
    };

    return {
        data,
        columns,
        form,
        editingKey,
        isUploading,
        isEditing,
        edit,
        cancel,
        save,
        handleFileUpload,
        handleSubmit,
        clearData,
    };
};
