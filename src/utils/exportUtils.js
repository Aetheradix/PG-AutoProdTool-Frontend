import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  // Original implementation or redirect to table export if appropriate
  // For now, let's keep it but ideally PlanView should call exportTableToExcel
  console.log('Old export function called');
};
