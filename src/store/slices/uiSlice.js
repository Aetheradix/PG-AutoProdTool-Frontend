import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTabs: {
    planView: sessionStorage.getItem('planViewActiveTab') || 'gantt',
    packingPlan: sessionStorage.getItem('packingPlanActiveTab') || 'packing-plan',
    masterData: sessionStorage.getItem('masterDataActiveTab') || 'sku-master',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      const { view, tab } = action.payload;
      state.activeTabs[view] = tab;
      sessionStorage.setItem(`${view}ActiveTab`, tab);
    },
    resetTabs: (state) => {
      state.activeTabs = {
        planView: 'gantt',
        packingPlan: 'packing-plan',
        masterData: 'sku-master',
      };
      sessionStorage.removeItem('planViewActiveTab');
      sessionStorage.removeItem('packingPlanActiveTab');
      sessionStorage.removeItem('masterDataActiveTab');
    },
  },
});

export const { setActiveTab, resetTabs } = uiSlice.actions;
export default uiSlice.reducer;
