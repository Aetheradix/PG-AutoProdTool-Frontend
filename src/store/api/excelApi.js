import { apiSlice } from './apiSlice';

export const excelApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadExcelData: builder.mutation({
            query: (data) => ({
                url: '/excel/upload',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PackingPlan', 'Plan', 'ProductionSchedule', 'Timeline', 'Status'],
        }),
    }),
});

export const { useUploadExcelDataMutation } = excelApi;
