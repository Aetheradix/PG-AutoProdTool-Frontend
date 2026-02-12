import { apiSlice } from './apiSlice';

export const masterDataApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSkuMaster: builder.query({
            query: () => '/v1/sku-master',
            providesTags: ['MasterData'],
        }),
        updateSkuMaster: builder.mutation({
            query: (data) => ({
                url: `/v1/sku-master/${encodeURIComponent(data.gcas)}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['MasterData'],
        }),
        createSkuMaster: builder.mutation({
            query: (data) => ({
                url: '/v1/sku-master',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['MasterData'],
        }),
        getBulkDetails: builder.query({
            query: () => '/v1/bulk-details',
            providesTags: ['MasterData'],
        }),
        updateBulkDetail: builder.mutation({
            query: (data) => ({
                url: `/v1/bulk-details/${encodeURIComponent(data.id || data.bulk_id)}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['MasterData'],
        }),
        createBulkDetail: builder.mutation({
            query: (data) => ({
                url: '/v1/bulk-details',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['MasterData'],
        }),
    }),
});

export const {
    useGetSkuMasterQuery,
    useUpdateSkuMasterMutation,
    useCreateSkuMasterMutation,
    useGetBulkDetailsQuery,
    useUpdateBulkDetailMutation,
    useCreateBulkDetailMutation
} = masterDataApi;
