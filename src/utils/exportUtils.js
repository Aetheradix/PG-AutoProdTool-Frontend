import * as XLSX from 'xlsx';

/**
 * Exports Gantt chart data to an Excel file.
 * @param {Array} tasks - Array of resources with their task items.
 * @param {string} fileName - Name of the file to save.
 */
export const exportGanttToExcel = (tasks, fileName = 'Gantt_Chart_Data.xlsx') => {
  if (!tasks || tasks.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Flatten the tasks into a structure suitable for Excel
  const excelData = [];

  tasks.forEach((resourceGroup) => {
    const resourceName = resourceGroup.resource;
    resourceGroup.items.forEach((item) => {
      const startTime = new Date(item.start_time || item.start);
      const endTime = new Date(item.end_time || item.end);
      const durationHrs = ((endTime - startTime) / 3600000).toFixed(2);

      excelData.push({
        'Resource': resourceName,
        'Task Description': item.title || item.description,
        'Event/Batch': item.batch || item.event_type || '-',
        'Start Time': startTime.toLocaleString(),
        'End Time': endTime.toLocaleString(),
        'Duration (Hrs)': durationHrs,
        'Status': item.status || 'ready'
      });
    });
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Auto-size columns (basic implementation)
  const colWidths = [
    { wch: 15 }, // Resource
    { wch: 30 }, // Task Description
    { wch: 15 }, // Event/Batch
    { wch: 25 }, // Start Time
    { wch: 25 }, // End Time
    { wch: 15 }, // Duration
    { wch: 10 }  // Status
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gantt Schedule');

  // Export the file
  XLSX.writeFile(workbook, fileName);
};
