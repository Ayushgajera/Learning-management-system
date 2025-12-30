import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import config from '../../config/index';

const USER_API = `${config.API_BASE_URL}/api/v1/user`;

export const wishlistApi = createApi({
  reducerPath: 'wishlistApi',
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: 'include',
  }),
  tagTypes: ['Wishlist'],
  endpoints: (builder) => ({
    fetchWishlist: builder.query({
      query: () => 'wishlist',
      providesTags: ['Wishlist'],
    }),
    addCourseToWishlist: builder.mutation({
      query: (courseId) => ({
        url: `wishlist/${courseId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Wishlist'],
    }),
    removeCourseFromWishlist: builder.mutation({
      query: (courseId) => ({
        url: `wishlist/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useFetchWishlistQuery,
  useAddCourseToWishlistMutation,
  useRemoveCourseFromWishlistMutation,
} = wishlistApi;
