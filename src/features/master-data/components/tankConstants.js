export const DESIGNATION_OPTIONS = [
    { value: 'storage',       label: 'Storage' },
    { value: 'portable_tank', label: 'Portable Tank' },
];

export function designationLabel(val) {
    return DESIGNATION_OPTIONS.find(o => o.value === val)?.label ?? val ?? '—';
}
