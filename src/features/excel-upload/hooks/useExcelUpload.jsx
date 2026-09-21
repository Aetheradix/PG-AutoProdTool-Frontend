import { useUploadExcelDataMutation } from '@/store/api/excelApi';
import { Form, message } from 'antd';
import { useState } from 'react';
import * as XLSX from 'xlsx';

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
      console.error('Validation failed:', errInfo);
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
        // Find the actual header row by scanning for typical table columns (line, order, material, batch, etc.)
        // or the row with the most non-empty columns in the first 15 rows
        let headerRowIndex = 0;
        let maxCols = 0;

        for (let r = 0; r < Math.min(jsonData.length, 15); r++) {
          const row = jsonData[r] || [];
          const rowLower = row.map((cell) =>
            String(cell || '')
              .trim()
              .toLowerCase()
          );
          const hasKeyHeader = rowLower.some(
            (c) =>
              c === 'line' ||
              c === 'order' ||
              c === 'order no' ||
              c === 'material' ||
              c === 'p-code' ||
              c === 'p_code' ||
              c === 'p code' ||
              c === 'batch' ||
              c.includes('production line') ||
              c.includes('planned qty') ||
              c.includes('start date')
          );
          const nonEmptyCount = row.filter(
            (c) => c !== undefined && c !== null && String(c).trim() !== ''
          ).length;

          if (hasKeyHeader && nonEmptyCount >= 3) {
            headerRowIndex = r;
            break;
          }
          if (nonEmptyCount > maxCols) {
            maxCols = nonEmptyCount;
            headerRowIndex = r;
          }
        }

        const rawHeaders = jsonData[headerRowIndex] || [];
        const validHeaders = [];
        const seen = new Set();

        rawHeaders.forEach((h, idx) => {
          const name = String(h || '').trim();
          if (name) {
            // Ensure unique header key
            let key = name;
            let counter = 1;
            while (seen.has(key)) {
              key = `${name}_${counter++}`;
            }
            seen.add(key);
            validHeaders.push({ title: name, dataIndex: key, colIdx: idx });
          }
        });

        if (validHeaders.length === 0) {
          message.error('Could not find column headers in the uploaded file');
          return;
        }

        const rows = [];
        let rowCounter = 0;

        for (let r = headerRowIndex + 1; r < jsonData.length; r++) {
          const row = jsonData[r] || [];
          const rowData = { key: (rowCounter++).toString() };
          let hasValue = false;

          validHeaders.forEach(({ dataIndex, colIdx }) => {
            const cellVal = row[colIdx] !== undefined ? String(row[colIdx]).trim() : '';
            rowData[dataIndex] = cellVal;
            if (cellVal) hasValue = true;
          });

          // Skip completely empty rows or repeated subheaders
          const firstVal = String(row[validHeaders[0]?.colIdx] || '')
            .trim()
            .toLowerCase();
          if (hasValue && firstVal !== 'line' && firstVal !== 'production line') {
            rows.push(rowData);
          }
        }

        const dynamicColumns = validHeaders.map(({ title, dataIndex }) => ({
          title,
          dataIndex,
          editable: true,
          width: 150,
          ellipsis: true,
        }));

        setColumns(dynamicColumns);
        setData(rows);
        message.success(
          `File uploaded: parsed ${rows.length} rows across ${dynamicColumns.length} columns`
        );
      }
    };
    reader.readAsBinaryString(file);
    return false;
  };

  const handleSubmit = async (onSuccess) => {
    if (data.length === 0) {
      message.warning('No data to upload');
      return;
    }
    try {
      const cleanedData = data.map(({ key, ...rest }) => rest);
      const response = await uploadExcelData(cleanedData).unwrap();
      message.success(response.message || 'Data sent to backend successfully');
      if (onSuccess && typeof onSuccess === 'function') onSuccess(response);
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
