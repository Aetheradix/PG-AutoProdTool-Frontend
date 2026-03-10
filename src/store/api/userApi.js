import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => '/v1/auth/users',
            providesTags: ['Users'],
        }),
        updateUser: builder.mutation({
            query: ({ userId, ...userData }) => ({
                url: `/v1/auth/users/${userId}`,
                method: 'PATCH',
                body: userData,
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
    useUpdateUserMutation,
    useDeleteUserMutation,
} = userApi;
