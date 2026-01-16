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
  { resource: 'T06', items: [] },
  { resource: 'T07', items: [] },
];
