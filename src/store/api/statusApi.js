import { apiSlice } from './apiSlice';

export const statusApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTankStatus: builder.query({
            query: () => '/status/tanks',
            providesTags: ['Status'],
        }),
        getBatchStatus: builder.query({
            query: () => '/status/batches',
            providesTags: ['Status'],
        }),
        getStatus: builder.query({
            query: () => '/v1/status',
            providesTags: ['Status'],
        }),
        getRecentData: builder.query({
            query: (limit = 10) => `/v1/recent-data?limit=${limit}`,
            providesTags: ['Status'],
        }),
        getRmStatus: builder.query({
            query: () => '/v1/rm-data',
            providesTags: ['Status'],
        }),
    }),
});

export const { useGetTankStatusQuery, useGetBatchStatusQuery, useGetRecentDataQuery, useGetStatusQuery, useGetRmStatusQuery } = statusApi;