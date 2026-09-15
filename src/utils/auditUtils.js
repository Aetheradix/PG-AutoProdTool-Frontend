/**
 * auditUtils.js
 * Utility to record, persist, and query audit trail logs for plan edits.
 */
import dayjs from 'dayjs';

const AUDIT_STORAGE_KEY = 'plan_audit_trail_logs';

/**
 * Get all audit logs from storage
 */
export function getAuditLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read audit logs from storage:', e);
    return [];
  }
}

/**
 * Get audit logs for a specific batch or record ID
 * @param {string|number} batchOrRecordId
 */
export function getAuditLogsForRecord(batchOrRecordId) {
  if (!batchOrRecordId) return [];
  const logs = getAuditLogs();
  const searchStr = String(batchOrRecordId).trim().toLowerCase();
  return logs.filter(
    (log) =>
      String(log.recordId).trim().toLowerCase() === searchStr ||
      String(log.batchId).trim().toLowerCase() === searchStr
  );
}

/**
 * Log an audit entry when a field is changed
 * @param {Object} entry
 * @param {string} entry.userName - Name of user who edited
 * @param {string|number} entry.userId - User ID / username
 * @param {string|number} entry.recordId - Unique record ID
 * @param {string|number} entry.batchId - Batch ID or Order No
 * @param {string} entry.planType - 'Making Plan' | 'Packing Plan'
 * @param {Object} entry.oldValues - Object containing original values
 * @param {Object} entry.newValues - Object containing updated form values
 */
export function recordAuditLog({
  userName = 'Unknown User',
  userId = 'guest',
  recordId,
  batchId,
  planType = 'Packing Plan',
  oldValues = {},
  newValues = {},
}) {
  const timestamp = new Date().toISOString();
  const dateFormatted = dayjs(timestamp).format('DD-MMM-YYYY');
  const timeFormatted = dayjs(timestamp).format('hh:mm A');

  const changedFields = [];

  Object.keys(newValues).forEach((key) => {
    // Skip internal fields and unchanged values
    if (key.startsWith('_') || key === 'key' || key === 'sn' || key === 'operation') return;
    
    const oldVal = oldValues[key];
    const newVal = newValues[key];

    if (String(oldVal ?? '').trim() !== String(newVal ?? '').trim()) {
      changedFields.push({
        field: key.replace(/_/g, ' ').toUpperCase(),
        fieldKey: key,
        oldValue: oldVal ?? '—',
        newValue: newVal ?? '—',
      });
    }
  });

  if (changedFields.length === 0) return null;

  const newLogEntries = changedFields.map((change) => ({
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userName,
    userId,
    recordId: recordId || batchId,
    batchId: batchId || recordId,
    planType,
    field: change.field,
    fieldKey: change.fieldKey,
    oldValue: change.oldValue,
    newValue: change.newValue,
    date: dateFormatted,
    time: timeFormatted,
    timestamp,
  }));

  try {
    const existing = getAuditLogs();
    const updated = [...newLogEntries, ...existing].slice(0, 1000); // Keep last 1000 logs
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save audit logs:', e);
  }

  return newLogEntries;
}
