import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => '/v1/auth/users',
            providesTags: ['Users'],
        }),
        getAuditLogs: builder.query({
            query: () => '/v1/auth/audit-logs',
            providesTags: ['AuditLogs'],
        }),
        updateUser: builder.mutation({
            query: ({ userId, ...userData }) => ({
                url: `/v1/auth/users/${userId}`,
                method: 'PATCH',
                body: userData,
            }),
            invalidatesTags: ['Users', 'AuditLogs'],
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `/v1/auth/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users', 'AuditLogs'],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetAuditLogsQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = userApi;

