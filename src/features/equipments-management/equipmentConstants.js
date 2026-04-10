export const DESIGNATION_STYLES = {
  Portable: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  Ronchi:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Unused:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  Sachet:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  Tube:     { bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' },
  _default: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
};

export const getDesignationStyle = (val) =>
  DESIGNATION_STYLES[val] ?? DESIGNATION_STYLES._default;