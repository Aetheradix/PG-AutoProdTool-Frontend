import { createSlice } from '@reduxjs/toolkit';

/**
 * Stores the downtime blocks entered on the Create Plan form.
 * These are persisted in sessionStorage so they survive a navigate() to /plan-view.
 */

const loadFromSession = () => {
  try {
    const raw = sessionStorage.getItem('lastDowntimes');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const initialState = {
  // Each entry: { id, line, reason, startTime (ISO string), duration (mins) }
  downtimes: loadFromSession(),
};

const downtimeSlice = createSlice({
  name: 'downtime',
  initialState,
  reducers: {
    setDowntimes: (state, action) => {
      state.downtimes = action.payload;
      try {
        sessionStorage.setItem('lastDowntimes', JSON.stringify(action.payload));
      } catch {
        // ignore quota errors
      }
    },
    clearDowntimes: (state) => {
      state.downtimes = [];
      sessionStorage.removeItem('lastDowntimes');
    },
  },
});

export const { setDowntimes, clearDowntimes } = downtimeSlice.actions;
export default downtimeSlice.reducer;
