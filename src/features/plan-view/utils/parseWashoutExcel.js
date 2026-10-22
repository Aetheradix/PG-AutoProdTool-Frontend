import * as XLSX from 'xlsx';

/**
 * Clean and extract a standard GCAS number (7-10 digits).
 * Handles multi-line or slashed values like "21080372/\n21432817" by taking the active/last GCAS.
 */
export const cleanGcas = (val) => {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (!s || s.toLowerCase() === 'nan' || s.toLowerCase() === 'null') return '';

  const matches = s.match(/\b\d{7,10}\b/g);
  if (matches && matches.length > 0) {
    return matches[matches.length - 1];
  }

  // Fallback: strip whitespace/newlines
  const clean = s.split(/[\/\n\r]/)[0].trim().replace(/\D/g, '');
  return clean.length >= 7 ? clean : '';
};

/**
 * Extract GCAS: Prioritizes the exact value written in the Excel GCAS cell (cellVal).
 * Falls back to description only if the cell is empty or doesn't have a valid GCAS.
 */
export const extractGcasFromTextOrCell = (desc, cellVal) => {
  // 1. Direct cell value from the Excel sheet (what was actually uploaded)
  const cellClean = cleanGcas(cellVal);
  if (cellClean && /^\d{7,10}$/.test(cellClean)) {
    return cellClean;
  }

  // 2. Fallback to description only if cell is empty or has no numeric GCAS
  const descMatch = String(desc || '').match(/\b\d{7,10}\b/g);
  if (descMatch && descMatch.length > 0) {
    return descMatch[descMatch.length - 1];
  }

  return '';
};

/**
 * Auto-detect the matrix type (FMT, MMT_6T, MMT_12T, PST) from filename and sheet name.
 * Sheet name is prioritized as it is more specific.
 */
export const detectMatrixType = (filename = '', sheetName = '') => {
  const sUpper = String(sheetName || '').toUpperCase();
  const fUpper = String(filename || '').toUpperCase();

  // 1. Check sheet name first (most specific)
  if (sUpper.includes('PST') || sUpper.includes('PORTABLE') || sUpper.includes('STORAGE')) {
    return 'PST';
  }
  if (sUpper.includes('12T') || sUpper.includes('12 TON') || sUpper.includes('12TON')) {
    return 'MMT_12T';
  }
  if (sUpper.includes('6T') || sUpper.includes('6 TON') || sUpper.includes('6TON')) {
    return 'MMT_6T';
  }
  if (sUpper.includes('FMT')) {
    return 'FMT';
  }

  // 2. Check filename
  if (fUpper.includes('PST') || fUpper.includes('PORTABLE') || fUpper.includes('STORAGE')) {
    return 'PST';
  }
  if (fUpper.includes('12T') || fUpper.includes('12 TON') || fUpper.includes('12TON')) {
    return 'MMT_12T';
  }
  if (fUpper.includes('6T') || fUpper.includes('6 TON') || fUpper.includes('6TON')) {
    return 'MMT_6T';
  }
  if (fUpper.includes('FMT')) {
    return 'FMT';
  }
  if (sUpper.includes('MMT') || fUpper.includes('MMT')) {
    return 'MMT_6T';
  }

  return 'FMT';
};

/**
 * Pick the most relevant sheet from a workbook, skipping scratch/archive sheets (e.g. 'SCR FMT').
 */
export const selectBestSheet = (sheetNames = []) => {
  if (!sheetNames || sheetNames.length === 0) return '';

  // Filter out scratch/archive/pointer sheets
  const valid = sheetNames.filter((s) => {
    const l = s.toLowerCase();
    return !l.startsWith('scr') && !l.includes('pointer') && !l.includes('sheet1');
  });

  const candidates = valid.length > 0 ? valid : sheetNames;

  // Prioritize active sheets: 'new', 'wom', 'matrix', '151', 'dcom'
  const best =
    candidates.find((s) => {
      const l = s.toLowerCase();
      return l.includes('new') || l.includes('dcom') || l.includes('151');
    }) ||
    candidates.find((s) => {
      const l = s.toLowerCase();
      return l.includes('matrix') || l.includes('wom') || l.includes('pst') || l.includes('mmt');
    }) ||
    candidates[0];

  return best;
};

/**
 * Read the Excel workbook and return available sheet names.
 */
export const readWorkbookSheets = (binaryData) => {
  const wb = XLSX.read(binaryData, { type: 'binary', cellDates: true });
  return {
    workbook: wb,
    sheetNames: wb.SheetNames || [],
  };
};

/**
 * Parse a specific sheet from the workbook into normalized washout matrix rules.
 */
export const parseWashoutSheet = (worksheet) => {
  const rawRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: '',
  });

  if (!rawRows || rawRows.length < 5) {
    throw new Error('Sheet data is too short or empty to be a valid Washout Matrix.');
  }

  // Step 1: Find anchor header row (usually contains 'Tech', 'FIL', 'GCAS', 'Varient', 'Group')
  let anchorIdx = -1;
  for (let r = 0; r < Math.min(rawRows.length, 25); r++) {
    const row = rawRows[r] || [];
    const lower = row.map((c) => String(c || '').trim().toLowerCase());
    const hasGcas = lower.some((c) => c === 'gcas' || c.includes('gcas'));
    const hasTechOrFil = lower.some(
      (c) =>
        c.includes('tech') ||
        c.includes('fil') ||
        c.includes('brand') ||
        c.includes('varient') ||
        c.includes('tank')
    );
    if (hasGcas && hasTechOrFil) {
      anchorIdx = r;
      break;
    }
  }

  // Fallback anchor search: search for row with multiple GCAS numbers
  let targetGcasRow = [];
  let targetDescRow = [];

  if (anchorIdx !== -1) {
    targetGcasRow = rawRows[anchorIdx - 1] || [];
    targetDescRow = anchorIdx >= 2 ? rawRows[anchorIdx - 2] || [] : [];
  } else {
    // Look for a row that has at least 5 numeric GCAS cells
    for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
      const row = rawRows[r] || [];
      const gcasCount = row.filter((c) => cleanGcas(c).length >= 7).length;
      if (gcasCount >= 5) {
        targetGcasRow = row;
        targetDescRow = r > 0 ? rawRows[r - 1] || [] : [];
        anchorIdx = r + 1; // Assume next row is column headers
        break;
      }
    }
  }

  if (!targetGcasRow.length && !targetDescRow.length) {
    throw new Error('Could not detect the Target GCAS header row in this sheet.');
  }

  // Step 2: Find starting column and collect all Target columns
  let startCol = -1;
  const maxCols = Math.max(targetGcasRow.length, targetDescRow.length);
  for (let c = 0; c < maxCols; c++) {
    const gcas = extractGcasFromTextOrCell(targetDescRow[c], targetGcasRow[c]);
    if (gcas && /^\d{7,10}$/.test(gcas)) {
      startCol = c;
      break;
    }
  }

  if (startCol === -1) {
    throw new Error('Could not find any valid Target GCAS columns in the header.');
  }

  const targets = [];
  for (let c = startCol; c < maxCols; c++) {
    const desc = String(targetDescRow[c] || '').trim();
    const gcas = extractGcasFromTextOrCell(desc, targetGcasRow[c]);
    if (gcas && /^\d{7,10}$/.test(gcas)) {
      targets.push({
        colIndex: c,
        gcas,
        description: desc,
      });
    }
  }

  if (targets.length === 0) {
    throw new Error('No valid Target products found.');
  }

  // Step 3: Parse source rows below anchorIdx
  const rules = [];
  const sourcesMap = new Map();
  let currentTank = '';

  for (let r = anchorIdx + 1; r < rawRows.length; r++) {
    const row = rawRows[r] || [];
    if (!row.some((c) => String(c || '').trim() !== '')) continue;

    // Col 0: Tank / Tech (with forward-fill)
    if (row[0] && String(row[0]).trim()) {
      currentTank = String(row[0]).trim();
    }

    // Col 1: Description / Brand / Variant
    const desc = String(row[1] || '').trim();

    // Prefer FOP GCAS from description, fallback to GCAS column (col 2, or col 3)
    let srcGcas = extractGcasFromTextOrCell(desc, row[2]);
    if (!srcGcas) {
      srcGcas = cleanGcas(row[1]) || cleanGcas(row[3]);
    }

    if (!srcGcas || !/^\d{7,10}$/.test(srcGcas)) {
      continue; // Skip non-data rows (e.g. revision history or notes)
    }

    if (!sourcesMap.has(srcGcas)) {
      sourcesMap.set(srcGcas, { gcas: srcGcas, description: desc, tank: currentTank });
    }

    // Cross with all targets
    for (const tgt of targets) {
      const rawVal = String(row[tgt.colIndex] || '').trim().toUpperCase();
      const isWash = rawVal.includes('WASH');
      const washoutType = isWash ? 'WASH' : 'X';

      rules.push({
        source_description: desc || sourcesMap.get(srcGcas)?.description || '',
        source_gcas: srcGcas,
        target_description: tgt.description || '',
        target_gcas: tgt.gcas,
        washout_type: washoutType,
      });
    }
  }

  if (rules.length === 0) {
    throw new Error('No washout rules could be extracted from this sheet.');
  }

  const washCount = rules.filter((r) => r.washout_type === 'WASH').length;
  const xCount = rules.length - washCount;

  return {
    targets,
    sources: Array.from(sourcesMap.values()),
    rules,
    stats: {
      totalRules: rules.length,
      washCount,
      xCount,
      sourceCount: sourcesMap.size,
      targetCount: targets.length,
    },
  };
};

/**
 * Parse all eligible washout sheets from a single workbook.
 * Useful when an uploaded workbook contains sheets for FMT, MMT 6T, MMT 12T, and/or PST.
 */
export const parseAllWashoutSheets = (workbook, fileName = '') => {
  if (!workbook || !workbook.SheetNames) {
    return { sheets: [], matrices: {}, stats: { totalRules: 0, sheetCount: 0, detectedTypes: [] } };
  }

  const results = [];
  const matrices = {};
  const ignoredSheets = [];

  for (const sheetName of workbook.SheetNames) {
    const sLower = sheetName.toLowerCase().trim();
    // Skip known scratch/pointer sheets
    if (
      sLower.startsWith('scr') ||
      sLower.includes('pointer') ||
      sLower === 'sheet1' ||
      sLower === 'master data' ||
      sLower === 'bulk variant'
    ) {
      ignoredSheets.push(sheetName);
      continue;
    }

    try {
      const parsed = parseWashoutSheet(workbook.Sheets[sheetName]);
      const matrixType = detectMatrixType(fileName, sheetName);
      results.push({
        sheetName,
        matrixType,
        ...parsed,
      });

      if (!matrices[matrixType]) {
        matrices[matrixType] = [];
      }
      matrices[matrixType] = parsed.rules;
    } catch (err) {
      // Not a valid washout matrix sheet, ignore safely
      ignoredSheets.push(sheetName);
    }
  }

  const totalRules = Object.values(matrices).reduce((sum, rules) => sum + rules.length, 0);

  return {
    sheets: results,
    matrices,
    ignoredSheets,
    stats: {
      totalRules,
      sheetCount: results.length,
      detectedTypes: Object.keys(matrices),
    },
  };
};
