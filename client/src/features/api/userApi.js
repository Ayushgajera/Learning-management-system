import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Replace with your actual backend URL
const baseApiUrl = 'http://localhost:8000/api/v1/userManagement/';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseApiUrl,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // You can add an authorization token here if your API requires it
      // const token = getState().auth.token;
      // if (token) {
      //   headers.set('authorization', `Bearer ${token}`);
      // }
      return headers;
    },
  }),
  tagTypes: ['User'], // Used for automatic re-fetching after updates
  endpoints: (builder) => ({
    // GET all users
    getAllUsers: builder.query({
      query: (instructorId) => `users/${instructorId}`,
      providesTags: ['User'],
    }),
    // Delete a user
    deleteUser: builder.mutation({
      // The API endpoint now needs to handle both user deletion and course removal
      query: ({ userId, instructorId }) => ({
        url: `users/${userId}/${instructorId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'], // Re-fetches user list after deletion
    }),
    // Remove a course from a user
    removeCourseFromUser: builder.mutation({
      query: ({ userId, courseId, instructorId }) => ({
        url: `users/${userId}/courses/${courseId}/remove/${instructorId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    // Get Instructor Reputation
    // Get Instructor Reputation
    getInstructorReputation: builder.query({
      query: () => ({
        url: `../user/instructor/reputation`, // Go up from userManagement to root, then to user
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useRemoveCourseFromUserMutation,
  useGetInstructorReputationQuery,
} = userApi;