import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => '/v1/auth/users',
            providesTags: ['Users'],
        }),
        updateUserRole: builder.mutation({
            query: ({ userId, role }) => ({
                url: `/v1/auth/users/${userId}/role`,
                method: 'PATCH',
                body: { role },
            }),
            invalidatesTags: ['Users'],
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `/v1/auth/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
} = userApi;
