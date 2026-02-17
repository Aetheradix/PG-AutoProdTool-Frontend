import { apiSlice } from './apiSlice';

export const planApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProductionSchedule: builder.query({
            query: (params = { page: 1, limit: 100 }) => ({
                url: '/v1/production-schedule',
                params: {
                    page: params.page,
                    limit: params.limit,
                },
            }),
            providesTags: ['Plan'],
        }),
    }),
});

export const {
    useGetProductionScheduleQuery,
} = planApi;
