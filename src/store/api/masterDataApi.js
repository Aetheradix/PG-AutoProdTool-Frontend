import { apiSlice } from './apiSlice';

export const masterDataApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSkuMaster: builder.query({
            query: (params = { page: 1, limit: 10 }) => ({
                url: '/v1/sku-master',
                params: {
                    page: params.page,
                    limit: params.limit,
                },
            }),
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
        deleteSkuMaster: builder.mutation({
            query: (gcas) => ({
                url: `/v1/sku-master/${encodeURIComponent(gcas)}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['MasterData'],
        }),
        getBulkDetails: builder.query({
            query: (params = { page: 1, limit: 10 }) => ({
                url: '/v1/bulk-details',
                params: {
                    page: params.page,
                    limit: params.limit,
                },
            }),
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
        deleteBulkDetail: builder.mutation({
            query: (id) => ({
                url: `/v1/bulk-details/${encodeURIComponent(id)}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['MasterData'],
        }),
    }),
});

export const {
    useGetSkuMasterQuery,
    useUpdateSkuMasterMutation,
    useCreateSkuMasterMutation,
    useDeleteSkuMasterMutation,
    useGetBulkDetailsQuery,
    useUpdateBulkDetailMutation,
    useCreateBulkDetailMutation,
    useDeleteBulkDetailMutation
} = masterDataApi;
