import { apiSlice } from './apiSlice';

export const profileApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query({
            query: () => '/profile',
            providesTags: ['Auth'],
        }),
        updateProfile: builder.mutation({
            query: (profileData) => ({
                url: '/profile',
                method: 'PATCH',
                body: profileData,
            }),
            invalidatesTags: ['Auth'],
        }),
    }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
