import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/v1/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        signup: builder.mutation({
            query: (userData) => ({
                url: '/v1/auth/signup',
                method: 'POST',
                body: userData,
            }),
        }),
    }),
});

export const { useLoginMutation, useSignupMutation } = authApi;
