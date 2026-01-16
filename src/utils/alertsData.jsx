import React from 'react';
import { FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';

export const alertsData = [
    {
        id: 1,
        message: 'Premix/RM deadstock breach projected for Batch B002. Check material availability.',
        type: 'warning',
        icon: <FiAlertTriangle className="text-amber-600" size={20} />,
    },
    {
        id: 2,
        message: 'Unresolved conflict: Tank T04 is unavailable for Batch B005 start time. Please adjust the schedule.',
        type: 'error',
        icon: <FiAlertCircle className="text-rose-600" size={20} />,
    },
];
