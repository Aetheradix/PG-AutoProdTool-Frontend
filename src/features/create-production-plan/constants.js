export const DOWNTIME_DURATIONS = {
  'CIL + Deep Cleaning': 45,
  'TBM (6h)': 360,
  'TBM (8h)': 480,
  Startup: 120,
  'Culture Connect': 60,
  Shutdown: 120,
};

export const REASON_OPTIONS = [
  { value: 'CIL + Deep Cleaning', label: 'CIL + Deep Cleaning (45m)' },
  { value: 'TBM (6h)', label: 'TBM (6h)' },
  { value: 'TBM (8h)', label: 'TBM (8h)' },
  { value: 'Startup', label: 'Startup (2h)' },
  { value: 'Culture Connect', label: 'Culture Connect (1h)' },
  { value: 'Shutdown', label: 'Shutdown (2h)' },
  { value: 'Changeover', label: 'Changeover' },
  { value: 'Breakdown', label: 'Breakdown' },
  { value: 'Maintenance', label: 'Maintenance' },
];
