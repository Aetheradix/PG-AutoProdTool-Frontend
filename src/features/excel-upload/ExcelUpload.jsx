import { DeleteOutlined, SaveOutlined, UploadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Card, Form, Space, Table, Upload, Alert, Steps } from 'antd';
import EditableCell from './components/EditableCell';
import { useExcelUpload } from './hooks/useExcelUpload';
import { useRunSimulationMutation } from '@/store/api/planApi';
import { useState } from 'react';

export const ExcelUpload = ({ onSuccess }) => {
  const {
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
  } = useExcelUpload();

  const [runSimulation, { isLoading: isSimulating }] = useRunSimulationMutation();
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error'|'info', text }
  const [currentStep, setCurrentStep] = useState(-1); // -1 = idle

  const handleUploadAndGenerate = async () => {
    setStatusMsg(null);
    setCurrentStep(0); // Step 0: Uploading data

    // Step 1: Upload Excel rows to packing_po
    let uploadRes;
    try {
      uploadRes = await new Promise((resolve, reject) => {
        handleSubmit((res) => resolve(res), (err) => reject(err));
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Upload failed: ${err?.message || 'Unknown error'}` });
      setCurrentStep(-1);
      return;
    }

    // Step 2: Run simulation / plan generation
    setCurrentStep(1);
    const targetDate = getMinStartDate ? getMinStartDate() : null;

    try {
      const simRes = await runSimulation({
        target_date: targetDate || new Date().toISOString().split('T')[0],
        start_date: targetDate || new Date().toISOString().split('T')[0],
        downtimes: [],
      }).unwrap();

      setCurrentStep(2); // Done
      const msg = simRes?.message || 'Plan generated successfully!';
      const skipped = simRes?.skipped_batches || 0;
      setStatusMsg({
        type: skipped > 0 ? 'warning' : 'success',
        text: msg + (skipped > 0 ? ` (${skipped} orders had unmapped GCAS)` : ''),
      });

      clearData();
      if (onSuccess && typeof onSuccess === 'function') onSuccess(simRes);
    } catch (simErr) {
      setCurrentStep(-1);
      setStatusMsg({
        type: 'error',
        text: `Plan generation failed: ${simErr?.data?.detail || simErr?.message || 'Unknown error'}`,
      });
    }
  };

  const isBusy = isUploading || isSimulating;

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const actionColumn = {
    title: 'Actions',
    dataIndex: 'operation',
    fixed: 'right',
    width: 120,
    render: (_, record) => {
      const editable = isEditing(record);
      return (
        <>
          {editable ? (
            <Space>
              <Button type="link" onClick={() => save(record.key)}>Save</Button>
              <Button type="link" onClick={cancel}>Cancel</Button>
            </Space>
          ) : (
            <Button type="link" disabled={editingKey !== ''} onClick={() => edit(record)}>
              Edit
            </Button>
          )}
        </>
      );
    },
  };

  const finalColumns = [...mergedColumns, actionColumn];

  const steps = [
    { title: 'Uploading Data' },
    { title: 'Generating Plan' },
    { title: 'Done' },
  ];

  return (
    <Card
      title="Excel Data Upload"
      extra={
        <>
          <Space>
            <Upload beforeUpload={handleFileUpload} showUploadList={false} accept=".xlsx, .xls">
              <Button icon={<UploadOutlined />} disabled={isBusy}>Click to Upload Excel</Button>
            </Upload>

            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleUploadAndGenerate}
              loading={isBusy}
              disabled={data.length === 0}
            >
              {isUploading ? 'Uploading...' : isSimulating ? 'Generating Plan...' : 'Submit and Create Plan'}
            </Button>

            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => { clearData(); setStatusMsg(null); setCurrentStep(-1); }}
              disabled={data.length === 0 || isBusy}
            >
              Clear
            </Button>
          </Space>
        </>
      }
    >
      {/* Status Steps */}
      {currentStep >= 0 && (
        <div className="mb-4">
          <Steps
            current={currentStep}
            status={statusMsg?.type === 'error' ? 'error' : currentStep === 2 ? 'finish' : 'process'}
            items={steps}
            size="small"
          />
        </div>
      )}

      {/* Result Alert */}
      {statusMsg && currentStep !== 0 && currentStep !== 1 && (
        <Alert
          type={statusMsg.type === 'warning' ? 'warning' : statusMsg.type === 'error' ? 'error' : 'success'}
          message={statusMsg.text}
          showIcon
          closable
          className="mb-4"
          onClose={() => setStatusMsg(null)}
        />
      )}

      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell } }}
          bordered
          dataSource={data}
          columns={data.length > 0 ? finalColumns : []}
          rowClassName="editable-row"
          pagination={{ defaultPageSize: 10, showSizeChanger: true }}
          scroll={{ x: 'max-content', y: 600 }}
        />
      </Form>
    </Card>
  );
};
