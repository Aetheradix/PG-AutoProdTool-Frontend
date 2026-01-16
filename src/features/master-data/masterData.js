export const masterData = {
    bct: [
        { key: '1', variant: 'BC128O - Sachet', time: '3.5' },
        { key: '2', variant: 'BC162 - Ronchi', time: '3' },
        { key: '3', variant: 'BC128C - Ronchi', time: '3' },
    ],
    washout: [
        { key: '1', source: 'Shampoo', target: 'Conditioner', time: '1.5 hours' },
        { key: '2', source: 'Conditioner', target: 'Shampoo', time: '2 hours' },
        { key: '3', source: 'Any', target: 'Washout', time: '45 minutes' },
    ],
    buffers: [
        { key: '1', rule: 'Sachet: 2 hours' },
        { key: '2', rule: 'Ronchi: 30 minutes' },
    ],
    variantMappings: [
        { key: '1', variant: 'H&S Daily Clean', mapped: 'BC128O' },
        { key: '2', variant: 'Pantene Pro-V', mapped: 'BC162' },
        { key: '3', variant: 'Rejoice Rich', mapped: 'BC128C' },
    ]
};
