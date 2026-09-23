/**
 * downtimeUtils.js
 *
 * Converts the raw downtime list (from Redux / Create Plan form) into
 * Gantt-compatible item objects and injects them into the correct rows.
 *
 * Downtime entry shape (from useCreatePlanForm):
 *   { id, line, reason, startTime: "DD/MM/YYYY, hh:mm A", duration: number (mins) }
 *
 * Gantt item shape expected by GanttChart / DraggableGanttChart:
 *   { id, title, batch, start_time (ISO), end_time (ISO), status: 'downtime', system, ... }
 */

/**
 * Parse startTime string → Date object.
 * Accepts:
 *   - ISO 8601 strings (new format): "2026-09-22T08:30:00.000Z"
 *   - Legacy display strings: "22/09/2026, 08:30 AM"
 */
function parseDowntimeStartTime(raw) {
  if (!raw) return null;

  // Local ISO string: "2026-09-11T08:00:00" — parse directly as local time
  if (typeof raw === 'string' && raw.includes('T')) {
    // Strip any TZ suffix so JS parses as LOCAL time
    const clean = raw.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
    const d = new Date(clean);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback: "DD/MM/YYYY, hh:mm A" legacy format
  const match = raw.match(/(\d{2})\/(\d{2})\/(\d{4}),\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i);
  if (!match) return null;
  const [, dd, mm, yyyy, hh, min, meridiem] = match;
  let hours = parseInt(hh, 10);
  const mins = parseInt(min, 10);
  if (meridiem.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd), hours, mins, 0);
}

/**
 * Maps a downtime "line" value from the form (e.g. "6T", "12T", "Both", "All")
 * to a list of system names used as row keys in the Gantt.
 */
function lineToSystems(line) {
  if (!line) return null; // null = ALL systems
  const val = String(line).trim().toUpperCase();
  if (val === 'BOTH' || val === 'ALL' || val === 'BOTH LINES' || val === 'ALL_SYSTEMS') return null; // ALL systems
  if (val.includes('6T') && val.includes('12T')) return null;
  if (val === '6T') return ['6T'];
  if (val === '12T') return ['12T'];
  if (val === '1.25T') return ['1.25T'];
  return null;
}

/**
 * Core function — injects downtime blocks into Gantt rows.
 *
 * @param {Array}  rows      - Output of mapScheduleToGanttFormat (array of { resource, system, items })
 * @param {Array}  downtimes - Redux downtime list
 * @returns {Array}          - Same rows structure with downtime items pushed in
 */
export function parseDowntimesToGanttItems(rows, downtimes) {
  if (!Array.isArray(rows) || !Array.isArray(downtimes) || downtimes.length === 0) {
    return rows;
  }

  // Pre-parse all downtime entries once
  const parsed = downtimes
    .map((dt) => {
      const start = parseDowntimeStartTime(dt.startTime);
      if (!start) return null;
      const durationMs = (Number(dt.duration) || 30) * 60 * 1000;
      const end = new Date(start.getTime() + durationMs);
      return {
        id: `dt-${dt.id}`,
        title: `${dt.reason}`,
        batch: 'DOWNTIME',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: 'downtime',
        reason: dt.reason,
        duration: dt.duration,
        systems: lineToSystems(dt.line || dt.system), // null = all, or ['6T'] etc.
        line: dt.line || dt.system,
      };
    })
    .filter(Boolean);

  if (parsed.length === 0) return rows;

  // Inject into rows — one copy per row so each system/tank lane shows the block
  return rows.map((row) => {
    const rowSystem = row.system || (row.resource || '').split('/')[0].trim();

    const applicable = parsed.filter((dt) => {
      // null systems means "apply to all"
      if (!dt.systems) return true;
      return dt.systems.some(
        (s) => s.toUpperCase() === rowSystem.toUpperCase()
      );
    });

    if (applicable.length === 0) return row;

    // Give each item a row-specific id to avoid key collisions across rows, and skip if already injected from backend
    const downtimeItems = applicable
      .filter((dt) => {
        const dtStartMs = new Date(dt.start_time).getTime();
        return !row.items.some((existing) => {
          if (existing.status !== 'downtime') return false;
          const exStartMs = new Date(existing.start_time).getTime();
          return Math.abs(exStartMs - dtStartMs) < 60000;
        });
      })
      .map((dt) => ({
        ...dt,
        id: `${dt.id}-${row.resource}`,
      }));

    if (downtimeItems.length === 0) return row;

    return {
      ...row,
      items: [...row.items, ...downtimeItems],
    };
  });
}
