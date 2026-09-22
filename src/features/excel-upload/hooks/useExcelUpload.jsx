import { useUploadExcelDataMutation } from '@/store/api/excelApi';
import { Form, message } from 'antd';
import { useState, useCallback } from 'react';
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
        // Find the actual header row
        let headerRowIndex = 0;
        let maxCols = 0;

        for (let r = 0; r < Math.min(jsonData.length, 15); r++) {
          const row = jsonData[r] || [];
          const rowLower = row.map((cell) =>
            String(cell || '').trim().toLowerCase()
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
              c.includes('planned quantity') ||
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

        // Identify key columns for filtering
        const orderKey = validHeaders.find((h) =>
          ['order no', 'order', 'order_no', 'process order'].includes(h.title.toLowerCase())
        );
        const pCodeKey = validHeaders.find((h) =>
          ['p-code', 'p_code', 'p code', 'material', 'material number'].includes(h.title.toLowerCase())
        );

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

          // Skip completely empty rows
          if (!hasValue) continue;

          // Skip repeated subheader rows (e.g. "Line", "Production Line")
          const firstVal = String(row[validHeaders[0]?.colIdx] || '').trim().toLowerCase();
          if (firstVal === 'line' || firstVal === 'production line') continue;

          // Skip section header rows like "Sachet Line 2 - Production Plan" (no order or p_code)
          const orderVal = orderKey ? String(rowData[orderKey.dataIndex] || '').trim() : '';
          const pCodeVal = pCodeKey ? String(rowData[pCodeKey.dataIndex] || '').trim() : '';
          if (!orderVal && !pCodeVal) continue;

          rows.push(rowData);
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
          `File uploaded: ${rows.length} valid rows across ${dynamicColumns.length} columns`
        );
      }
    };
    reader.readAsBinaryString(file);
    return false;
  };

  /**
   * Returns the earliest start_date found in the uploaded data (ISO format YYYY-MM-DD).
   * Used to pass target_date to the simulation after upload.
   */
  const getMinStartDate = useCallback(() => {
    if (!data || data.length === 0) return null;
    const startDateCol = columns.find((col) =>
      ['start date', 'start_date', 'startdate'].includes(
        col.dataIndex.toLowerCase().replace(/ /g, '_')
      )
    )?.dataIndex;
    if (!startDateCol) return null;

    let minDate = null;
    for (const row of data) {
      const val = row[startDateCol];
      if (!val) continue;

      // DD.MM.YYYY
      const dmyDot = String(val).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if (dmyDot) {
        const iso = `${dmyDot[3]}-${dmyDot[2].padStart(2, '0')}-${dmyDot[1].padStart(2, '0')}`;
        if (!minDate || iso < minDate) minDate = iso;
        continue;
      }
      // DD/MM/YYYY
      const dmySlash = String(val).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dmySlash) {
        const iso = `${dmySlash[3]}-${dmySlash[2].padStart(2, '0')}-${dmySlash[1].padStart(2, '0')}`;
        if (!minDate || iso < minDate) minDate = iso;
        continue;
      }
      // YYYY-MM-DD or ISO
      const isoMatch = String(val).match(/^(\d{4}-\d{2}-\d{2})/);
      if (isoMatch) {
        const iso = isoMatch[1];
        if (!minDate || iso < minDate) minDate = iso;
      }
    }
    return minDate;
  }, [data, columns]);

  const handleSubmit = async (onSuccess, onError) => {
    if (data.length === 0) {
      message.warning('No data to upload');
      if (typeof onError === 'function') onError(new Error('No data to upload'));
      return;
    }
    try {
      const cleanedData = data.map(({ key, ...rest }) => rest);
      const response = await uploadExcelData(cleanedData).unwrap();
      message.success(response.message || 'Data sent to backend successfully');
      if (typeof onSuccess === 'function') onSuccess(response);
    } catch (err) {
      message.error(err.data?.detail || 'Failed to send data to backend');
      console.error(err);
      if (typeof onError === 'function') onError(err);
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
    getMinStartDate,
  };
};
