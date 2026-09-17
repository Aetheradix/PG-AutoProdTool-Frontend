import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { parseDuration } from './tableUtils';

/**
 * Exports Table View data to a styled Excel file.
 * @param {Object} groupedData - Data grouped by System -> Shift -> DateKey
 * @param {Array} sortedDates - Array of sorted date keys
 * @param {string} fileName - Name of the file to save.
 */
export const exportTableToExcel = async (groupedData, sortedDates, fileName = 'production schedule.xlsx') => {
  if (!groupedData || Object.keys(groupedData).length === 0) {
    console.warn('No data to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Production Schedule');

  // Define Styles
  const mainTitleStyle = {
    font: { bold: true, size: 14, color: { argb: 'FF000000' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8FA8C8' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  const systemHeaderStyle = {
    font: { bold: true, size: 12, color: { argb: 'FF000000' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9EB3C8' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  const dateHeaderStyle = {
    font: { bold: true, size: 10, color: { argb: 'FF000000' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8FA8C8' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  const tableHeaderStyle = {
    font: { bold: true, size: 10, color: { argb: 'FF000000' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9EB3C8' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  const shiftStyles = {
    A: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }, font: { bold: true, color: { argb: 'FF000000' } } },
    B: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } }, font: { bold: true, color: { argb: 'FFFFFFFF' } } },
    C: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } }, font: { bold: true, color: { argb: 'FF000000' } } },
  };

  const columnBgColors = {
    SNo: 'FFD4EDDA',
    GCAS: 'FFD4EDDA',
    Description: 'FFD4EDDA',
    Line: 'FFD4EDDA',
    BatchNo: 'FFF4837D',
    StartTime: 'FFFFF2CC',
    EndTime: 'FFFFF2CC',
    Remarks: 'FFFFF2CC',
  };

  const getCellBorder = () => ({
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  });

  // Set column widths
  worksheet.columns = [
    { header: 'Shift', key: 'shift', width: 10 },
    { header: 'S.No', key: 'sn', width: 6 },
    { header: 'GCAS', key: 'gcas', width: 15 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Line', key: 'line', width: 10 },
    { header: 'Batch No', key: 'batch_id', width: 12 },
    { header: 'Start Time', key: 'startTime', width: 10 },
    { header: 'End Time', key: 'endTime', width: 10 },
    { header: 'Remarks', key: 'remarks', width: 25 },
  ];

  let currentRow = 1;

  // Main Title
  worksheet.mergeCells(currentRow, 1, currentRow, 9);
  const titleCell = worksheet.getCell(currentRow, 1);
  titleCell.value = 'DAILY PRODUCTION PLAN FOR HAIR CARE MAKING';
  titleCell.style = mainTitleStyle;
  currentRow += 2; // Gap after title

  Object.entries(groupedData).forEach(([system, shifts]) => {
    // System Header
    worksheet.mergeCells(currentRow, 1, currentRow, 9);
    const sysCell = worksheet.getCell(currentRow, 1);
    sysCell.value = `${system} System`;
    sysCell.style = systemHeaderStyle;
    currentRow++;

    Object.entries(shifts).forEach(([shift, byDate]) => {
      sortedDates.forEach((dateKey) => {
        const dateData = byDate[dateKey];
        if (!dateData) return;

        // Date Header
        worksheet.mergeCells(currentRow, 1, currentRow, 9);
        const dateCell = worksheet.getCell(currentRow, 1);
        dateCell.value = dateData.label;
        dateCell.style = dateHeaderStyle;
        currentRow++;

        // Table Header row for this section
        const headerRow = worksheet.getRow(currentRow);
        ['Shift', 'S.No', 'GCAS', 'Description', 'Line', 'Batch No', 'Start Time', 'End Time', 'Remarks'].forEach((h, i) => {
          const cell = headerRow.getCell(i + 1);
          cell.value = h;
          cell.style = tableHeaderStyle;
        });
        currentRow++;

        const batches = dateData.batches || [];
        const maxRows = Math.max(batches.length, 5); // Match padRows(batches, 5)

        for (let i = 0; i < maxRows; i++) {
          const batch = batches[i] || {};
          const rowData = {
            shift: i === 0 ? `SHIFT ${shift}` : '',
            sn: i + 1,
            gcas: batch.gcas || '',
            description: batch.description || '',
            line: batch.production_line || '',
            batch_id: batch.batch_id || '',
            startTime: batch.startTime || '',
            endTime: batch.endTime || '',
            remarks: batch.remarks || '',
          };

          const row = worksheet.addRow(rowData);
          
          // Apply styling to each cell in the row
          row.eachCell((cell, colNumber) => {
            cell.border = getCellBorder();
            cell.font = { size: 10 };
            cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 || colNumber === 2 || colNumber > 6 ? 'center' : 'left' };

            // Shift Column
            if (colNumber === 1) {
              const sStyle = shiftStyles[shift] || shiftStyles.A;
              cell.fill = sStyle.fill;
              cell.font = sStyle.font;
            } else {
              // Data Columns bg colors
              const colKey = ['sn', 'gcas', 'description', 'line', 'batch_id', 'startTime', 'endTime', 'remarks'][colNumber - 2];
              const colorKeyMap = {
                sn: 'SNo', gcas: 'GCAS', description: 'Description', line: 'Line',
                batch_id: 'BatchNo', startTime: 'StartTime', endTime: 'EndTime', remarks: 'Remarks'
              };
              const bg = columnBgColors[colorKeyMap[colKey]];
              if (bg) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
              }
              if (colKey === 'remarks' && batch.remarks) {
                cell.font = { bold: true, color: { argb: 'FFFF0000' } }; // Red text for remarks matching UI
              }
            }
          });
          currentRow++;
        }
        
        // Merge shift cells for the section
        if (maxRows > 1) {
           worksheet.mergeCells(currentRow - maxRows, 1, currentRow - 1, 1);
        }

        currentRow++; // Gap between dates/sections
      });
    });
    currentRow++; // Gap between systems
  });

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
};

// Keep old function for backward compatibility if needed, but update it to use production schedule name
export const exportGanttToExcel = (tasks, fileName = 'production schedule.xlsx') => {
  // Kept for backward compatibility
};

/**
 * Generic utility to export a flat data array (e.g. from StandardDataTable) to a styled Excel file.
 * @param {Array<Object>} dataSource - Array of row objects
 * @param {Object} options
 * @param {string}   [options.fileName]       - Output file name (default: 'export.xlsx')
 * @param {string}   [options.sheetName]      - Worksheet name (default: 'Sheet1')
 * @param {string}   [options.title]          - Optional title row at the top
 * @param {string[]} [options.excludeFields]  - Keys to exclude from output
 */
export const exportDataTableToExcel = async (dataSource, options = {}) => {
  const {
    fileName = 'export.xlsx',
    sheetName = 'Sheet1',
    title = '',
    excludeFields = ['id', 'created_at', 'updated_at'],
  } = options;

  if (!dataSource || dataSource.length === 0) {
    console.warn('No data to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Determine visible columns
  const allKeys = Object.keys(dataSource[0]);
  const visibleKeys = allKeys.filter((k) => !excludeFields.includes(k));

  // --- Styles ---
  const headerStyle = {
    font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } },
    },
  };

  const cellBorder = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  const evenRowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  const oddRowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

  let currentRow = 1;

  // Optional title row
  if (title) {
    worksheet.mergeCells(currentRow, 1, currentRow, visibleKeys.length);
    const tCell = worksheet.getCell(currentRow, 1);
    tCell.value = title;
    tCell.style = {
      font: { bold: true, size: 14, color: { argb: 'FF1E293B' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
    };
    worksheet.getRow(currentRow).height = 30;
    currentRow += 1;
  }

  // Header row
  const headerRow = worksheet.getRow(currentRow);
  visibleKeys.forEach((key, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = key.replace(/_/g, ' ').toUpperCase();
    cell.style = headerStyle;
  });
  headerRow.height = 24;
  currentRow += 1;

  // Data rows
  dataSource.forEach((record, rowIdx) => {
    const row = worksheet.getRow(currentRow);
    visibleKeys.forEach((key, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = record[key] ?? '';
      cell.border = cellBorder;
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.fill = rowIdx % 2 === 0 ? oddRowFill : evenRowFill;
      cell.font = { size: 10, color: { argb: 'FF334155' } };
    });
    currentRow += 1;
  });

  // Auto-fit column widths (approximate)
  visibleKeys.forEach((key, idx) => {
    const maxLen = Math.max(
      key.length,
      ...dataSource.map((r) => String(r[key] ?? '').length)
    );
    worksheet.getColumn(idx + 1).width = Math.min(Math.max(maxLen + 4, 12), 40);
  });

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, fileName);
};

/**
 * Exports Packing Plan data grouped by Line -> Shift -> DateKey to a styled Excel file.
 * @param {Object} groupedData - Data grouped by Line -> Shift -> DateKey
 * @param {Array} sortedDates - Array of sorted date keys
 * @param {string} fileName - Name of output file
 */
export const exportPackingPlanToExcel = async (groupedData, sortedDates, fileName = 'Daily_Packing_Plan_Schedule.xlsx') => {
  if (!groupedData || Object.keys(groupedData).length === 0) {
    console.warn('No packing plan data to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Packing Plan Schedule');

  const mainTitleStyle = {
    font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002060' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
  };

  const lineHeaderStyle = {
    font: { bold: true, size: 12, color: { argb: 'FF000000' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9EB3C8' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
  };

  const dateHeaderStyle = {
    font: { bold: true, size: 10, color: { argb: 'FF000000' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8FA8C8' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
  };

  const tableHeaderStyle = {
    font: { bold: true, size: 10, color: { argb: 'FF000000' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9EB3C8' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
  };

  const shiftStyles = {
    A: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }, font: { bold: true, color: { argb: 'FF000000' } } },
    B: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } }, font: { bold: true, color: { argb: 'FFFFFFFF' } } },
    C: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } }, font: { bold: true, color: { argb: 'FF000000' } } },
  };

  const columnBgColors = {
    SNo: 'FFD4EDDA',
    GCAS: 'FFD4EDDA',
    Description: 'FFD4EDDA',
    Line: 'FFD4EDDA',
    BatchNo: 'FFF4837D',
    PlannedQty: 'FFFFF2CC',
    StartTime: 'FFFFF2CC',
    EndTime: 'FFFFF2CC',
    Remarks: 'FFFFF2CC',
  };

  const getCellBorder = () => ({
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  });

  worksheet.columns = [
    { header: 'Shift', key: 'shift', width: 10 },
    { header: 'S.No', key: 'sn', width: 6 },
    { header: 'GCAS / Code', key: 'gcas', width: 15 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Line', key: 'line', width: 10 },
    { header: 'Batch / Order No', key: 'batch_id', width: 15 },
    { header: 'Planned Qty', key: 'planned_qty', width: 12 },
    { header: 'Start Time', key: 'startTime', width: 10 },
    { header: 'End Time', key: 'endTime', width: 10 },
    { header: 'Remarks', key: 'remarks', width: 25 },
  ];

  let currentRow = 1;

  // Title
  worksheet.mergeCells(currentRow, 1, currentRow, 10);
  const titleCell = worksheet.getCell(currentRow, 1);
  titleCell.value = 'DAILY PRODUCTION PLAN FOR PACKING';
  titleCell.style = mainTitleStyle;
  currentRow += 2;

  Object.entries(groupedData).forEach(([lineName, shifts]) => {
    worksheet.mergeCells(currentRow, 1, currentRow, 10);
    const lineCell = worksheet.getCell(currentRow, 1);
    lineCell.value = `${lineName} — PACKING LINE`;
    lineCell.style = lineHeaderStyle;
    currentRow++;

    Object.entries(shifts).forEach(([shift, byDate]) => {
      sortedDates.forEach((dateKey) => {
        const dateData = byDate[dateKey];
        if (!dateData) return;

        worksheet.mergeCells(currentRow, 1, currentRow, 10);
        const dateCell = worksheet.getCell(currentRow, 1);
        dateCell.value = dateData.label;
        dateCell.style = dateHeaderStyle;
        currentRow++;

        const headerRow = worksheet.getRow(currentRow);
        ['Shift', 'S.No', 'GCAS / Code', 'Description', 'Line', 'Batch / Order No', 'Planned Qty', 'Start Time', 'End Time', 'Remarks'].forEach((h, i) => {
          const cell = headerRow.getCell(i + 1);
          cell.value = h;
          cell.style = tableHeaderStyle;
        });
        currentRow++;

        const batches = dateData.batches || [];
        const maxRows = Math.max(batches.length, 1);

        for (let i = 0; i < maxRows; i++) {
          const batch = batches[i] || {};
          const rowData = {
            shift: i === 0 ? `SHIFT ${shift}` : '',
            sn: i + 1,
            gcas: batch.gcas || batch.p_code || '',
            description: batch.description || '',
            line: batch.line || lineName,
            batch_id: batch.batch_id || batch.batch_no || batch.order_no || '',
            planned_qty: batch.planned_qty || batch.quantity || '',
            startTime: batch.startTime || '',
            endTime: batch.endTime || '',
            remarks: batch.remarks || '',
          };

          const row = worksheet.addRow(rowData);
          row.eachCell((cell, colNumber) => {
            cell.border = getCellBorder();
            cell.font = { size: 10 };
            cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 || colNumber === 2 || colNumber > 6 ? 'center' : 'left' };

            if (colNumber === 1) {
              const sStyle = shiftStyles[shift] || shiftStyles.A;
              cell.fill = sStyle.fill;
              cell.font = sStyle.font;
            } else {
              const colKey = ['sn', 'gcas', 'description', 'line', 'batch_id', 'planned_qty', 'startTime', 'endTime', 'remarks'][colNumber - 2];
              const colorKeyMap = {
                sn: 'SNo', gcas: 'GCAS', description: 'Description', line: 'Line',
                batch_id: 'BatchNo', planned_qty: 'PlannedQty', startTime: 'StartTime', endTime: 'EndTime', remarks: 'Remarks'
              };
              const bg = columnBgColors[colorKeyMap[colKey]];
              if (bg) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
              }
              if (colKey === 'remarks' && batch.remarks) {
                cell.font = { bold: true, color: { argb: 'FFFF0000' } };
              }
            }
          });
          currentRow++;
        }

        if (maxRows > 1) {
          worksheet.mergeCells(currentRow - maxRows, 1, currentRow - 1, 1);
        }
        currentRow++;
      });
    });
    currentRow++;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
};

/**
 * Exports Packing Plan matching the exact web UI layout with line section banners,
 * formatted 12-hour times, clean dates, yellow row styling, and red remarks.
 * @param {Array} dataSource - Flat array of packing plan records
 * @param {string} fileName - Output file name
 */
export const exportLineGroupedPackingPlanToExcel = async (dataSource, fileName = 'Packing_Plan.xlsx') => {
  if (!dataSource || dataSource.length === 0) {
    console.warn('No packing plan data to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Packing Plan');

  const LINE_NAMES = {
    INC1: 'Sachet Line 1',
    INC2: 'Sachet Line 2',
    INC4: 'Sachet Line 4',
    INT2: 'Ronchi',
    INT3: 'Tube Line 1',
  };

  // Helper to format time strings (PT duration, 24-hr, ISO) to 12-hour AM/PM format
  const formatTimeToAmPm = (val) => {
    if (!val) return '';
    const { hours, minutes, isParsed } = parseDuration(val);
    if (isParsed) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const paddedHours = String(formattedHours).padStart(2, '0');
      const paddedMinutes = String(minutes).padStart(2, '0');
      return `${paddedHours}:${paddedMinutes} ${ampm}`;
    }
    const d = dayjs(val);
    if (d.isValid() && String(val).includes('T')) {
      return d.format('hh:mm A');
    }
    return val;
  };

  const formatDateOnly = (val) => {
    if (!val) return '';
    const d = dayjs(val);
    return d.isValid() ? d.format('YYYY-MM-DD') : val;
  };

  // Group data by line matching UI
  const groups = {};
  dataSource.forEach((item) => {
    const lineId = item.line || 'Unknown';
    const lineName = LINE_NAMES[lineId] || lineId;
    if (!groups[lineName]) groups[lineName] = { rows: [], lineId };
    groups[lineName].rows.push(item);
  });

  const sortedOrder = ['Sachet Line 1', 'Sachet Line 2', 'Sachet Line 4', 'Ronchi', 'Tube Line 1'];
  const sortedGroups = {};
  sortedOrder.forEach((name) => {
    if (groups[name]) sortedGroups[name] = groups[name];
  });
  Object.keys(groups).forEach((name) => {
    if (!sortedGroups[name]) sortedGroups[name] = groups[name];
  });

  // Styles
  const lineBannerStyle = {
    font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002060' } },
    alignment: { horizontal: 'left', vertical: 'middle', indent: 1 },
    border: {
      top: { style: 'thin', color: { argb: 'FF001040' } },
      left: { style: 'thin', color: { argb: 'FF001040' } },
      bottom: { style: 'thin', color: { argb: 'FF001040' } },
      right: { style: 'thin', color: { argb: 'FF001040' } },
    },
  };

  const tableHeaderStyle = {
    font: { bold: true, size: 10, color: { argb: 'FF0F172A' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } },
    },
  };

  const cellBorder = {
    top: { style: 'thin', color: { argb: 'FF94A3B8' } },
    left: { style: 'thin', color: { argb: 'FF94A3B8' } },
    bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
    right: { style: 'thin', color: { argb: 'FF94A3B8' } },
  };

  const headers = [
    'LINE',
    'ORDER NO',
    'P CODE',
    'DESCRIPTION',
    'BATCH NO',
    'PLANNED QTY',
    'START DATE',
    'START TIME',
    'END DATE',
    'END TIME',
    'REMARKS',
  ];

  worksheet.columns = [
    { key: 'line', width: 10 },
    { key: 'order_no', width: 14 },
    { key: 'p_code', width: 14 },
    { key: 'description', width: 34 },
    { key: 'batch_no', width: 15 },
    { key: 'planned_qty', width: 14 },
    { key: 'start_date', width: 14 },
    { key: 'start_time', width: 13 },
    { key: 'end_date', width: 14 },
    { key: 'end_time', width: 13 },
    { key: 'remarks', width: 26 },
  ];

  let currentRow = 1;

  Object.entries(sortedGroups).forEach(([lineName, { rows, lineId }]) => {
    // 1. Line Section Banner (e.g. SACHET LINE 1 - PACKING PLAN)
    worksheet.mergeCells(currentRow, 1, currentRow, headers.length);
    const bannerCell = worksheet.getCell(currentRow, 1);
    bannerCell.value = `${lineName.toUpperCase()} - PACKING PLAN`;
    bannerCell.style = lineBannerStyle;
    worksheet.getRow(currentRow).height = 24;
    currentRow++;

    // 2. Table Column Headers
    const headerRow = worksheet.getRow(currentRow);
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.style = tableHeaderStyle;
    });
    headerRow.height = 22;
    currentRow++;

    // 3. Data Rows matching Web UI (Yellow background #FFF2CC)
    rows.forEach((item) => {
      const row = worksheet.getRow(currentRow);

      const rowValues = [
        item.line || lineId || '',
        item.order_no || '',
        item.p_code || item.gcas || '',
        item.description || '',
        item.batch_no || item.batch_id || '',
        item.planned_qty ?? item.quantity ?? '',
        formatDateOnly(item.start_date),
        formatTimeToAmPm(item.start_time),
        formatDateOnly(item.end_date),
        formatTimeToAmPm(item.end_time),
        item.remarks || '',
      ];

      rowValues.forEach((val, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        cell.value = val;
        cell.border = cellBorder;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }; // Web UI Yellow
        cell.font = {
          size: 10,
          color: colIdx === 10 && val ? { argb: 'FFFF0000' } : { argb: 'FF000000' }, // Red for remarks
          bold: colIdx === 0 || colIdx === 10,
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: colIdx === 0 || colIdx === 5 || colIdx === 6 || colIdx === 7 || colIdx === 8 || colIdx === 9 ? 'center' : 'left',
        };
      });

      row.height = 20;
      currentRow++;
    });

    // Gap between line sections
    currentRow++;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
};

