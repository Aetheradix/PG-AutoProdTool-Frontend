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
        getDeadstock: builder.query({
            query: (params = { page: 1, limit: 1000 }) => ({
                url: '/v1/rm-data',
                params: {
                    page: params.page,
                    limit: params.limit,
                },
            }),
            providesTags: ['MasterData'],
        }),
        updateDeadstock: builder.mutation({
            query: (data) => ({
                url: `/v1/rm-data/${encodeURIComponent(data.id)}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['MasterData'],
        }),
        getBprPdr: builder.query({
            query: (params = { page: 1, limit: 1000 }) => ({
                url: '/v1/bpr-pdr',
                params: {
                    page: params.page,
                    limit: params.limit,
                },
            }),
            providesTags: ['MasterData'],
        }),
        updateBprPdr: builder.mutation({
            query: (data) => ({
                url: `/v1/bpr-pdr/${encodeURIComponent(data.id)}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['MasterData'],
        }),
        createBprPdr: builder.mutation({
            query: (data) => ({
                url: '/v1/bpr-pdr',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['MasterData'],
        }),
        deleteBprPdr: builder.mutation({
            query: (id) => ({
                url: `/v1/bpr-pdr/${encodeURIComponent(id)}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['MasterData'],
        }),
        getEaBnaa: builder.query({
            query: (params = { page: 1, limit: 1000 }) => ({
                url: '/v1/ea-bnaa',
                params: {
                    page: params.page,
                    limit: params.limit,
                },
            }),
            providesTags: ['MasterData'],
        }),
        updateEaBnaa: builder.mutation({
            query: (data) => ({
                url: `/v1/ea-bnaa/${encodeURIComponent(data.id)}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['MasterData'],
        }),
        createEaBnaa: builder.mutation({
            query: (data) => ({
                url: '/v1/ea-bnaa',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['MasterData'],
        }),
        deleteEaBnaa: builder.mutation({
            query: (id) => ({
                url: `/v1/ea-bnaa/${encodeURIComponent(id)}`,
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
    useDeleteBulkDetailMutation,
    useGetDeadstockQuery,
    useUpdateDeadstockMutation,
    useGetBprPdrQuery,
    useUpdateBprPdrMutation,
    useCreateBprPdrMutation,
    useDeleteBprPdrMutation,
    useGetEaBnaaQuery,
    useUpdateEaBnaaMutation,
    useCreateEaBnaaMutation,
    useDeleteEaBnaaMutation
} = masterDataApi;
