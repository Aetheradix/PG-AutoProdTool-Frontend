import { useState, useEffect } from 'react';
import { Form, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { useRunSimulationMutation } from '@/store/api/planApi';
import { useGetPackingPlanQuery } from '@/store/api/packingPlanApi';
import { setDowntimes } from '@/store/slices/downtimeSlice';
import { DOWNTIME_DURATIONS, REASON_OPTIONS } from '../constants';

/**
 * Hook to manage create plan form logic and downtime sub-form.
 */
export const useCreatePlanForm = () => {
    const [form] = Form.useForm();
    const [downtimeForm] = Form.useForm();
    const [downtimes, setDowntimesLocal] = useState([]);
    const [reasonOptions, setReasonOptions] = useState(REASON_OPTIONS);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [runSimulation, { isLoading }] = useRunSimulationMutation();
    const { data: packingPlanRes } = useGetPackingPlanQuery({ page: 1, limit: 1000 });

    const selectedReason = Form.useWatch('reason', downtimeForm);
    const isOtherReason = selectedReason === 'Other';

    // Auto-prefill planning date from uploaded packing plan if not manually set
    useEffect(() => {
        if (!form.getFieldValue('planningDate') && packingPlanRes?.data?.length > 0) {
            let earliest = null;
            packingPlanRes.data.forEach((row) => {
                const rawDate = row.start_date;
                if (rawDate) {
                    const parsed = dayjs(rawDate);
                    if (parsed.isValid() && (!earliest || parsed.isBefore(earliest))) {
                        earliest = parsed;
                    }
                }
            });
            if (earliest) {
                form.setFieldsValue({ planningDate: earliest });
            }
        }
    }, [packingPlanRes, form]);

    const onFinish = async (values) => {
        let targetDate = values?.planningDate
            ? (values.planningDate.format ? values.planningDate.format('YYYY-MM-DD') : String(values.planningDate))
            : null;

        if (!targetDate) {
            let earliest = null;
            if (packingPlanRes?.data?.length > 0) {
                packingPlanRes.data.forEach((row) => {
                    const rawDate = row.start_date;
                    if (rawDate) {
                        const parsed = dayjs(rawDate);
                        if (parsed.isValid() && (!earliest || parsed.isBefore(earliest))) {
                            earliest = parsed;
                        }
                    }
                });
            }
            targetDate = earliest ? earliest.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
        }

        try {
            // Check if user filled in downtime fields without clicking "Add Downtime"
            let allDowntimes = [...downtimes];
            const draft = downtimeForm.getFieldsValue();
            if (draft.startTime && (draft.duration || draft.reason)) {
                const finalReason = draft.reason === 'Other'
                    ? (draft.customReason?.trim() || 'Other')
                    : (draft.reason || 'Maintenance');

                const startVal = draft.startTime;
                let startISO = '';
                let startDisplay = '';
                if (startVal) {
                    if (startVal.toDate) {
                        const d = startVal.toDate();
                        const pad = (n) => String(n).padStart(2, '0');
                        startISO = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
                        startDisplay = startVal.format('DD/MM/YYYY, hh:mm A');
                    } else if (typeof startVal === 'string') {
                        startISO = startVal;
                        startDisplay = startVal;
                    }
                }

                const draftLine = draft.line || 'Both';
                const isBoth = draftLine === 'Both' || draftLine === 'Both Lines' || draftLine === 'All';
                const targetSys = isBoth ? 'ALL' : (draftLine.includes('12T') ? '12T' : (draftLine.includes('6T') ? '6T' : draftLine));

                allDowntimes.push({
                    id: Date.now(),
                    line: targetSys === 'ALL' ? 'Both' : targetSys,
                    system: targetSys,
                    reason: finalReason,
                    startTime: startISO,
                    duration: Number(draft.duration) || 30,
                    startTimeDisplay: startDisplay,
                });
            }

            // Normalise downtime start times: force the date part to match planning date
            const pad = (n) => String(n).padStart(2, '0');
            const normalisedDowntimes = allDowntimes.map((dt) => {
                if (!dt.startTime) return dt;
                const timePart = dt.startTime.includes('T')
                    ? dt.startTime.split('T')[1]
                    : '07:30:00';
                const normalisedStart = `${targetDate}T${timePart}`;
                const dtLine = dt.line || dt.system || 'Both';
                const isBoth = dtLine === 'Both' || dtLine === 'Both Lines' || dtLine === 'All' || dtLine === 'ALL' || dtLine === 'ALL_SYSTEMS';
                const targetSystem = isBoth ? 'ALL' : (dtLine.includes('12T') ? '12T' : (dtLine.includes('6T') ? '6T' : dtLine));

                return {
                    id: dt.id || Date.now(),
                    system: targetSystem,
                    line: targetSystem === 'ALL' ? 'Both' : targetSystem,
                    reason: dt.reason || 'Maintenance',
                    startTime: normalisedStart,
                    duration: Number(dt.duration) || 30,
                    startTimeDisplay: dt.startTimeDisplay || normalisedStart,
                };
            });

            const result = await runSimulation({
                target_date: targetDate,
                start_date: targetDate,
                downtimes: normalisedDowntimes,
            }).unwrap();

            // Save normalised downtimes to Redux so plan-view charts can display them
            dispatch(setDowntimes(normalisedDowntimes));

            notification.success({
                message: 'Plan Generated',
                description:
                    result.message ||
                    `Simulation complete! Generated ${result.total_batches ?? 0} batches.`,
                placement: 'topRight',
            });

            // Clear subform
            downtimeForm.resetFields();

            // Navigate to plan-view after successful generation
            navigate('/plan-view');
        } catch (error) {
            notification.error({
                message: 'Simulation Failed',
                description:
                    error?.data?.detail ||
                    'An error occurred while running the simulation.',
                placement: 'topRight',
            });
        }
    };

    const handleReasonChange = (value) => {
        if (DOWNTIME_DURATIONS[value]) {
            downtimeForm.setFieldsValue({ duration: DOWNTIME_DURATIONS[value] });
        } else if (value === 'Other') {
            downtimeForm.setFieldsValue({ duration: undefined, customReason: '' });
        }
    };

    const addDowntime = async () => {
        try {
            const values = await downtimeForm.validateFields();
            const finalReason = values.reason === 'Other'
                ? (values.customReason?.trim() || 'Other')
                : values.reason;

            const selectedLine = values.line || 'Both';
            const isBoth = selectedLine === 'Both' || selectedLine === 'Both Lines' || selectedLine === 'All';
            const targetSys = isBoth ? 'ALL' : (selectedLine.includes('12T') ? '12T' : (selectedLine.includes('6T') ? '6T' : selectedLine));

            const newDowntime = {
                id: Date.now(),
                line: targetSys === 'ALL' ? 'Both' : targetSys,
                system: targetSys,
                reason: finalReason,
                // Store as LOCAL ISO string (no UTC conversion) so backend gets exact wall-clock time
                startTime: values.startTime
                    ? (() => {
                          const d = values.startTime.toDate();
                          const pad = (n) => String(n).padStart(2, '0');
                          return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
                      })()
                    : '',
                duration: Number(values.duration) || 30,
                startTimeDisplay: values.startTime ? values.startTime.format('DD/MM/YYYY, hh:mm A') : '',
            };

            setDowntimesLocal(prev => [...prev, newDowntime]);

            // If user entered a custom reason, add it to options so it can be re-selected
            if (values.reason === 'Other' && values.customReason?.trim()) {
                const customTrimmed = values.customReason.trim();
                setReasonOptions(prev => {
                    if (prev.some(opt => opt.value.toLowerCase() === customTrimmed.toLowerCase())) {
                        return prev;
                    }
                    const withoutOther = prev.filter(opt => opt.value !== 'Other');
                    return [
                        ...withoutOther,
                        { value: customTrimmed, label: customTrimmed },
                        { value: 'Other', label: 'Other' },
                    ];
                });
            }

            downtimeForm.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const removeDowntime = (id) => {
        setDowntimesLocal((prev) => prev.filter((d) => d.id !== id));
    };

    return {
        form,
        downtimeForm,
        downtimes,
        isLoading,
        reasonOptions,
        isOtherReason,
        onFinish,
        handleReasonChange,
        addDowntime,
        removeDowntime,
    };
};
