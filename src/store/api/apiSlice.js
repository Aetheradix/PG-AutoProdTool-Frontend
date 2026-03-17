import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user && user.access_token) {
                    headers.set('authorization', `Bearer ${user.access_token}`);
                }
            }
        } catch (e) {
            console.error('Failed to parse user from localStorage', e);
        }
        return headers;
    },
});

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 2 });

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithRetry,
    tagTypes: [
        'Auth',
        'Status',
        'MasterData',
        'Plan',
        'User',
        'ProductionSchedule',
        'Batch',
        'Timeline',
        'ArchivedPlan'
    ],
    endpoints: () => ({}),
});
