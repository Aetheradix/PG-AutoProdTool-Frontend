import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api', 
        prepareHeaders: (headers) => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.token) {
                headers.set('authorization', `Bearer ${user.token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Auth', 'Status', 'MasterData'],
    endpoints: () => ({}), 
});
 