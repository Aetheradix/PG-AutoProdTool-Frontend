import { apiSlice } from './apiSlice';

export const planApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProductionSchedule: builder.query({
            query: (params = { page: 1, limit: 100 }) => ({
                // API endpoint updated to /ghantt
                url: '/v1/production-schedule',
                params: {
                    page: params.page,
                    limit: params.limit,
                },
            }),
            providesTags: ['Plan'],
        }),
        runSimulation: builder.mutation({
            query: (body) => ({
                url: '/v1/simulation/run',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Plan', 'ProductionSchedule', 'PackingPlan'],
        }),
    }),
});

export const {
    useGetProductionScheduleQuery,
    useRunSimulationMutation,
} = planApi;
