import React from 'react';
import { FiAlertTriangle, FiLock } from 'react-icons/fi';

export const defaultTasks = [
  {
    resource: '6T',
    items: [
      {
        id: 1,
        title: 'H&S Daily Clean',
        batch: 'BC128O - Sachet',
        start: 1,
        duration: 3,
        status: 'ready',
      },
      {
        id: 2,
        title: 'Pantene Pro-V',
        batch: 'BC162 - Ronchi',
        start: 5,
        duration: 3,
        status: 'running',
        icon: <FiAlertTriangle />,
      },
      { id: 3, title: 'Downtime', batch: '', start: 8, duration: 1, status: 'conflict' },
      {
        id: 4,
        title: 'H&S Menthol',
        batch: 'BC128O - Sachet',
        start: 9,
        duration: 3,
        status: 'ready',
      },
      {
        id: 5,
        title: 'Rejoice Frizz-Free',
        batch: 'BC128O - Sachet',
        start: 13,
        duration: 3,
        status: 'ready',
      },
    ],
  },
  {
    resource: '12T',
    items: [
      {
        id: 6,
        title: 'Climbazole ...',
        batch: 'PREMIX-C',
        start: 2,
        duration: 1.5,
        status: 'warning',
      },
      {
        id: 7,
        title: 'Rejoice Rich',
        batch: 'BC128C - Ronchi',
        start: 4,
        duration: 3,
        status: 'ready',
        icon: <FiAlertTriangle />,
      },
      {
        id: 9,
        title: 'H&S Daily Clean',
        batch: 'BC128O - Sachet',
        start: 7.5,
        duration: 3,
        status: 'ready',
        icon: <FiLock />,
      },
    ],
  },
];

export const tankTasks = [
  {
    resource: 'T01',
    items: [
      { id: 101, title: 'B001', type: 'shampoo', start: 8, duration: 3 },
      { id: 102, title: 'W...', type: 'washout', start: 11, duration: 1 },
      { id: 103, title: 'B008', type: 'shampoo', start: 18, duration: 3 },
      { id: 104, title: 'W...', type: 'washout', start: 21, duration: 1 },
    ],
  },
  {
    resource: 'T02',
    items: [
      { id: 105, title: 'B002', type: 'conditioner', start: 11, duration: 3 },
      { id: 106, title: 'W...', type: 'washout', start: 14, duration: 1 },
    ],
  },
  {
    resource: 'T03',
    items: [
      { id: 107, title: 'B003', type: 'shampoo', start: 15, duration: 3 },
      { id: 108, title: 'W...', type: 'washout', start: 18, duration: 1 },
    ],
  },
  {
    resource: 'T04',
    items: [
      { id: 109, title: 'B005', type: 'shampoo', start: 10, duration: 3 },
      { id: 110, title: 'W...', type: 'washout', start: 13, duration: 1 },
    ],
  },
  {
    resource: 'T05',
    items: [
      { id: 111, title: 'B006', type: 'shampoo', start: 13, duration: 4 },
      { id: 112, title: 'W...', type: 'washout', start: 17, duration: 1 },
    ],
  },
  {
    resource: 'P01',
    items: [
      { id: 113, title: 'B004', type: 'premix', start: 7, duration: 2 },
      { id: 114, title: 'W...', type: 'washout', start: 9, duration: 1 },
    ],
  },

  {
    resource: 'T06',
    items: [
      { id: 115, title: 'B009', type: 'shampoo', start: 9, duration: 3 },
      { id: 116, title: 'W...', type: 'washout', start: 12, duration: 1 },
    ],
  },
  {
    resource: 'T07',
    items: [
      { id: 117, title: 'B010', type: 'conditioner', start: 14, duration: 3 },
      { id: 118, title: 'W...', type: 'washout', start: 17, duration: 1 },
    ],
  },
  {
    resource: 'T08',
    items: [
      { id: 119, title: 'B011', type: 'shampoo', start: 8, duration: 4 },
      { id: 120, title: 'W...', type: 'washout', start: 12, duration: 1 },
    ],
  },
  {
    resource: 'T09',
    items: [
      { id: 121, title: 'B012', type: 'shampoo', start: 16, duration: 3 },
      { id: 122, title: 'W...', type: 'washout', start: 19, duration: 1 },
    ],
  },
  {
    resource: 'T10',
    items: [
      { id: 123, title: 'B013', type: 'conditioner', start: 10, duration: 3 },
      { id: 124, title: 'W...', type: 'washout', start: 13, duration: 1 },
    ],
  },

  {
    resource: 'T11',
    items: [
      { id: 125, title: 'B014', type: 'shampoo', start: 7, duration: 3 },
      { id: 126, title: 'W...', type: 'washout', start: 10, duration: 1 },
    ],
  },
  {
    resource: 'T12',
    items: [
      { id: 127, title: 'B015', type: 'premix', start: 12, duration: 2 },
      { id: 128, title: 'W...', type: 'washout', start: 14, duration: 1 },
    ],
  },
  {
    resource: 'T13',
    items: [
      { id: 129, title: 'B016', type: 'shampoo', start: 15, duration: 3 },
      { id: 130, title: 'W...', type: 'washout', start: 18, duration: 1 },
    ],
  },
  {
    resource: 'T14',
    items: [
      { id: 131, title: 'B017', type: 'conditioner', start: 9, duration: 3 },
      { id: 132, title: 'W...', type: 'washout', start: 12, duration: 1 },
    ],
  },
  {
    resource: 'T15',
    items: [
      { id: 133, title: 'B018', type: 'shampoo', start: 18, duration: 3 },
      { id: 134, title: 'W...', type: 'washout', start: 21, duration: 1 },
    ],
  },
  ...Array.from({ length: 13 }, (_, i) => ({
    resource: `T${String(i + 16).padStart(2, '0')}`,
    items: [
      {
        id: 135 + i * 2,
        title: `B${String(19 + i).padStart(3, '0')}`,
        type: 'shampoo',
        start: 8 + (i % 5) * 2,
        duration: 3,
      },
      {
        id: 136 + i * 2,
        title: 'W...',
        type: 'washout',
        start: 11 + (i % 5) * 2,
        duration: 1,
      },
    ],
  })),

  {
    resource: 'R1',
    items: [
      { id: 200, title: 'R-B01', type: 'ronkie', start: 9, duration: 2 },
    ],
  },
  {
    resource: 'R2',
    items: [
      { id: 201, title: 'R-B02', type: 'ronkie', start: 13, duration: 2 },
    ],
  },
  {
    resource: 'R3',
    items: [
      { id: 202, title: 'R-B03', type: 'ronkie', start: 17, duration: 2 },
    ],
  },
];

