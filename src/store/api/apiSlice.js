import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { message } from 'antd';

let isHandling401 = false;

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
        // Prevent browser from serving stale cached responses (e.g. HTML from disk cache)
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('Pragma', 'no-cache');
        headers.set('Accept', 'application/json');
        try {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user && user.access_token) {
                    headers.set('authorization', `Bearer ${user.access_token}`);
                }
            }
        } catch (e) {
            console.error('Failed to parse user from sessionStorage', e);
        }
        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const isLoginRequest = typeof args === 'string'
            ? args.includes('/login')
            : args?.url?.includes('/login');

        // Do not retry 401 requests
        retry.fail(result.error);

        if (!isLoginRequest && !isHandling401) {
            isHandling401 = true;
            sessionStorage.removeItem('user');
            window.dispatchEvent(new CustomEvent('auth:session-expired'));

            message.warning({
                content: 'Your session has expired. Please log in again.',
                key: 'session-expired',
                duration: 3,
            });

            setTimeout(() => {
                isHandling401 = false;
                window.location.href = '/login';
            }, 600);
        }
    }

    return result;
};

const baseQueryWithRetry = retry(baseQueryWithReauth, { maxRetries: 2 });


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
        'ArchivedPlan',
        'PackingPlan',
        'Tanks',
        'EquipmentsMaster',
        'WashoutMatrix'
    ],
    endpoints: () => ({}),
});
