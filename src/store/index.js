import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './api/apiSlice';
import profileReducer from './slices/profileSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        profile: profileReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);
