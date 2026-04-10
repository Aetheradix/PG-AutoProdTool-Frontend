export const TANK_DESIGNATION_OPTIONS = [
    { value: 'Portable', label: 'Portable' },
    { value: 'Ronchi', label: 'Ronchi' },
    { value: 'Unused', label: 'Unused' },
];

export const LINE_DESIGNATION_OPTIONS = [
    { value: 'Sachet', label: 'Sachet' },
    { value: 'Ronchi', label: 'Ronchi' },
    { value: 'Tube', label: 'Tube' },
];

export function getDesignationOptions(type) {
    return type === 'Tank' ? TANK_DESIGNATION_OPTIONS : LINE_DESIGNATION_OPTIONS;
}

export function designationLabel(val, type) {
    const options = getDesignationOptions(type);
    return options.find(o => o.value === val)?.label ?? val ?? '—';
}
