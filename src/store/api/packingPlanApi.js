import { apiSlice } from './apiSlice';

export const packingPlanApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPackingPlan: builder.query({
            query: (params = { page: 1, limit: 1000 }) => ({
                url: '/v1/packing-plan',
                params: {
                    limit: params.limit,
                },
            }),
            providesTags: ['PackingPlan'],
        }),
        createPackingPlan: builder.mutation({
            query: (data) => ({
                url: '/v1/packing-plan',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PackingPlan'],
        }),
        updatePackingPlan: builder.mutation({
            query: (data) => ({
                url: `/v1/packing-plan/${encodeURIComponent(data.id)}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['PackingPlan'],
        }),
        deletePackingPlan: builder.mutation({
            query: (id) => ({
                url: `/v1/packing-plan/${encodeURIComponent(id)}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PackingPlan'],
        }),
    }),
});

export const {
    useGetPackingPlanQuery,
    useCreatePackingPlanMutation,
    useUpdatePackingPlanMutation,
    useDeletePackingPlanMutation,
} = packingPlanApi;
