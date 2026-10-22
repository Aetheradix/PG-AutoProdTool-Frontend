import React, { useState } from 'react';
import { Modal, Upload, Select, Button, Table, Tag, Alert, message, Spin, Radio, Tooltip } from 'antd';
import { FiUploadCloud, FiCheckCircle, FiFileText, FiRefreshCw, FiDatabase, FiLayers, FiInfo } from 'react-icons/fi';
import {
  readWorkbookSheets,
  parseWashoutSheet,
  parseAllWashoutSheets,
  detectMatrixType,
  selectBestSheet,
} from '../utils/parseWashoutExcel';
import { useUploadWashoutMatrixMutation } from '../../../store/api/statusApi';

const MATRIX_OPTIONS = [
  { value: 'FMT', label: 'FMT Matrix (fmt_wo_matrix)' },
  { value: 'MMT_6T', label: 'MMT 6T Matrix (mmt_6t_matrix)' },
  { value: 'MMT_12T', label: 'MMT 12T Matrix (mmt_12t_matrix)' },
  { value: 'PST', label: 'PST Matrix (pst_wo_matrix)' },
];

export const WashoutMatrixUploadModal = ({ visible, onClose, initialMatrix = 'FMT', onSuccess }) => {
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [targetMatrixType, setTargetMatrixType] = useState(initialMatrix);
  const [parsedResult, setParsedResult] = useState(null);
  const [multiSheetResult, setMultiSheetResult] = useState(null);
  const [uploadScope, setUploadScope] = useState('single'); // 'all' or 'single'
  const [parseError, setParseError] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const [uploadWashoutMatrix, { isLoading: isSaving }] = useUploadWashoutMatrixMutation();

  const handleFileChange = (file) => {
    setIsParsing(true);
    setParseError('');
    setParsedResult(null);
    setMultiSheetResult(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const binaryData = e.target.result;
        const { workbook: wb, sheetNames: sheets } = readWorkbookSheets(binaryData);
        setWorkbook(wb);
        setSheetNames(sheets);

        // 1. Multi-sheet detection
        const allParsed = parseAllWashoutSheets(wb, file.name);
        setMultiSheetResult(allParsed);

        if (allParsed.sheets.length > 1) {
          setUploadScope('all');
        } else {
          setUploadScope('single');
        }

        // 2. Pick preferred active sheet for single view
        const preferredSheet = selectBestSheet(sheets);
        setSelectedSheet(preferredSheet);

        // Auto-detect matrix type
        const detected = detectMatrixType(file.name, preferredSheet);
        setTargetMatrixType(detected);

        // Parse chosen sheet
        if (wb.Sheets[preferredSheet]) {
          const res = parseWashoutSheet(wb.Sheets[preferredSheet]);
          setParsedResult(res);
        }
      } catch (err) {
        console.error('Washout matrix parse error:', err);
        setParseError(err.message || 'Failed to parse Excel file.');
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setParseError('Failed to read file from disk.');
      setIsParsing(false);
    };

    reader.readAsBinaryString(file);
    return false; // Prevent auto upload by antd
  };

  const handleSheetChange = (sheet) => {
    setSelectedSheet(sheet);
    if (!workbook || !workbook.Sheets[sheet]) return;
    setIsParsing(true);
    setParseError('');
    try {
      const res = parseWashoutSheet(workbook.Sheets[sheet]);
      setParsedResult(res);
      const detected = detectMatrixType(fileName, sheet);
      setTargetMatrixType(detected);
    } catch (err) {
      console.error('Sheet switch parse error:', err);
      setParsedResult(null);
      setParseError(err.message || 'Error parsing sheet.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveToDb = async () => {
    try {
      let payload = null;
      let totalRulesCount = 0;

      if (uploadScope === 'all' && multiSheetResult && Object.keys(multiSheetResult.matrices).length > 0) {
        payload = {
          matrices: multiSheetResult.matrices,
        };
        totalRulesCount = multiSheetResult.stats.totalRules;
      } else {
        if (!parsedResult || !parsedResult.rules.length) {
          message.error('No valid matrix rules to upload.');
          return;
        }
        payload = {
          matrix_type: targetMatrixType,
          rows: parsedResult.rules,
        };
        totalRulesCount = parsedResult.rules.length;
      }

      const res = await uploadWashoutMatrix(payload).unwrap();

      message.success(
        res?.message || `Successfully synchronized matrix tables with ${totalRulesCount} rules!`,
        5
      );

      if (onSuccess) {
        onSuccess(targetMatrixType);
      }
      handleClose();
    } catch (err) {
      console.error('Upload error:', err);
      const errorDetail =
        err?.data?.detail || err?.data?.message || err?.message || 'Failed to update database.';
      message.error(errorDetail, 6);
    }
  };

  const handleClose = () => {
    setWorkbook(null);
    setSheetNames([]);
    setSelectedSheet('');
    setParsedResult(null);
    setMultiSheetResult(null);
    setParseError('');
    setFileName('');
    setUploadScope('single');
    onClose();
  };

  const previewColumns = [
    {
      title: '#',
      render: (_, __, i) => <span className="text-slate-400 font-mono text-xs">{i + 1}</span>,
      width: 45,
    },
    {
      title: 'Source Description (Brand/Variant)',
      dataIndex: 'source_description',
      key: 'source_description',
      ellipsis: true,
      render: (text) => <span className="font-semibold text-xs text-slate-700">{text || '-'}</span>,
    },
    {
      title: 'Source GCAS',
      dataIndex: 'source_gcas',
      key: 'source_gcas',
      width: 120,
      render: (code) => <span className="font-mono text-xs font-bold text-blue-700">{code}</span>,
    },
    {
      title: 'Target GCAS',
      dataIndex: 'target_gcas',
      key: 'target_gcas',
      width: 120,
      render: (code) => <span className="font-mono text-xs font-bold text-indigo-700">{code}</span>,
    },
    {
      title: 'Rule',
      dataIndex: 'washout_type',
      key: 'washout_type',
      width: 90,
      align: 'center',
      render: (type) =>
        type === 'WASH' ? (
          <Tag color="error" className="font-bold font-mono text-xs px-2">
            WASH
          </Tag>
        ) : (
          <Tag color="success" className="font-bold font-mono text-xs px-2">
            X
          </Tag>
        ),
    },
  ];

  const hasMultiMatrices = multiSheetResult && multiSheetResult.sheets.length > 1;

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      width={900}
      footer={null}
      title={
        <div className="flex items-center gap-2.5 py-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <FiUploadCloud size={18} />
          </div>
          <div>
            <span className="font-bold text-base text-[#002060]">Upload Washout Matrix (Excel)</span>
            <p className="text-xs text-slate-400 m-0 font-normal">
              Full replace: all existing rows are deleted and replaced from Excel. PST auto-synced.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        {/* Upload Drop Zone */}
        <Upload.Dragger
          accept=".xlsx,.xls"
          beforeUpload={handleFileChange}
          showUploadList={false}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 bg-slate-50/60 transition-all cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center py-2">
            <FiUploadCloud className="text-blue-500 mb-2" size={32} />
            <p className="font-bold text-sm text-slate-700 m-0">Click or drag Excel matrix file here</p>
            <p className="text-xs text-slate-400 m-0 mt-1">
              Supports single or multi-sheet matrices (.xlsx, .xls) for FMT, MMT (6T/12T), and PST
            </p>
            {fileName && (
              <div className="mt-2.5 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded-md text-xs font-semibold">
                <FiFileText />
                <span>{fileName}</span>
              </div>
            )}
          </div>
        </Upload.Dragger>

        {isParsing && (
          <div className="flex justify-center items-center py-8 gap-3 text-slate-500 text-sm">
            <Spin size="small" />
            <span>Analyzing Excel sheets and cross-tabulation rules...</span>
          </div>
        )}

        {parseError && (
          <Alert
            type="error"
            showIcon
            message="Matrix Parsing Error"
            description={parseError}
            className="rounded-lg text-xs"
          />
        )}

        {/* Multi-matrix detection banner */}
        {hasMultiMatrices && !isParsing && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <FiLayers className="text-indigo-600" /> Multiple Washout Sheets Detected ({multiSheetResult.sheets.length} sheets)
              </div>
              <div className="text-[11px] text-indigo-700 mt-0.5">
                Found matrices:{' '}
                {multiSheetResult.sheets.map((s) => (
                  <Tag key={s.sheetName} color="blue" className="text-[10px] font-mono mr-1">
                    {s.matrixType} ({s.sheetName})
                  </Tag>
                ))}
              </div>
            </div>
            <Radio.Group
              value={uploadScope}
              onChange={(e) => setUploadScope(e.target.value)}
              size="small"
              className="shrink-0"
            >
              <Radio.Button value="all" className="text-xs font-bold">
                Update All Sheets ({multiSheetResult.stats.totalRules} rules)
              </Radio.Button>
              <Radio.Button value="single" className="text-xs font-medium">
                Single Sheet Only
              </Radio.Button>
            </Radio.Group>
          </div>
        )}

        {/* Replace Strategy Note */}
        {!isParsing && (parsedResult || multiSheetResult) && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-[11px] text-amber-900 flex items-start gap-2">
            <FiRefreshCw className="text-amber-600 shrink-0 mt-0.5" size={14} />
            <span>
              <b>Full Replace Mode:</b> All existing rows in the target table(s) will be{' '}
              <b>deleted</b> and replaced with data from this Excel file. This ensures the DB matches
              exactly what is in your spreadsheet. <b>PST Matrix</b> is then automatically re-synced.
            </span>
          </div>
        )}

        {/* Single Sheet Selectors & Preview */}
        {uploadScope === 'single' && parsedResult && !isParsing && (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                  <FiLayers className="text-blue-600" /> Excel Sheet Name:
                </label>
                <Select
                  value={selectedSheet}
                  onChange={handleSheetChange}
                  className="w-full text-xs font-semibold"
                  options={sheetNames.map((s) => ({ label: s, value: s }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                  <FiDatabase className="text-indigo-600" /> Target Database Table:
                </label>
                <Select
                  value={targetMatrixType}
                  onChange={setTargetMatrixType}
                  className="w-full text-xs font-semibold"
                  options={MATRIX_OPTIONS}
                />
              </div>
            </div>

            {/* Statistics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                <div className="text-[10px] uppercase font-bold text-blue-600">Total Rules</div>
                <div className="text-base font-black text-blue-950 font-mono mt-0.5">
                  {parsedResult.stats.totalRules}
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">Sources</div>
                <div className="text-base font-black text-slate-800 font-mono mt-0.5">
                  {parsedResult.stats.sourceCount}
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">Targets</div>
                <div className="text-base font-black text-slate-800 font-mono mt-0.5">
                  {parsedResult.stats.targetCount}
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                <div className="text-[10px] uppercase font-bold text-red-600">WASH (Required)</div>
                <div className="text-base font-black text-red-700 font-mono mt-0.5">
                  {parsedResult.stats.washCount}
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase font-bold text-emerald-600">X (No Wash)</div>
                <div className="text-base font-black text-emerald-700 font-mono mt-0.5">
                  {parsedResult.stats.xCount}
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Extracted Rules Preview (First 10 rows)
                </span>
                <span className="text-xs text-slate-500">
                  Target table: <b className="text-indigo-700 font-mono">{targetMatrixType}</b>
                </span>
              </div>
              <Table
                dataSource={parsedResult.rules.slice(0, 10).map((r, i) => ({ ...r, key: i }))}
                columns={previewColumns}
                pagination={false}
                size="small"
                className="border border-slate-200 rounded-lg overflow-hidden"
              />
            </div>
          </div>
        )}

        {/* Multi Sheet All Summary */}
        {uploadScope === 'all' && multiSheetResult && !isParsing && (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Summary of Matrices to be Synchronized:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {multiSheetResult.sheets.map((s) => (
                <div key={s.sheetName} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-800">{s.sheetName}</span>
                      <Tag color="indigo" className="font-mono text-[10px] font-bold">
                        {s.matrixType}
                      </Tag>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Sources: <b>{s.stats.sourceCount}</b> | Targets: <b>{s.stats.targetCount}</b>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-xs font-mono">
                    <span className="text-slate-600">{s.stats.totalRules} rules</span>
                    <span>
                      <span className="text-red-600 font-bold">{s.stats.washCount} WASH</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-emerald-600 font-bold">{s.stats.xCount} X</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        {!isParsing && (parsedResult || multiSheetResult) && (
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button onClick={handleClose} disabled={isSaving} className="font-semibold text-xs">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSaveToDb}
              loading={isSaving}
              icon={<FiCheckCircle />}
              className="bg-[#002060] hover:bg-blue-900 border-none font-bold text-xs px-5 h-9"
            >
              {uploadScope === 'all'
                ? `Replace All: ${multiSheetResult.stats.totalRules} Rules`
                : `Replace ${targetMatrixType} (${parsedResult?.stats?.totalRules ?? 0} rules)`}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
