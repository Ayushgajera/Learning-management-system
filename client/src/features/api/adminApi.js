import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config/index';

const ADMIN_API = `${config.API_BASE_URL}/api/v1/admin`;

export const adminApi = createApi({
    reducerPath: 'adminApi',
    tagTypes: ['AdminUsers', 'AdminCourses', 'AdminStats', 'AdminPurchases', 'InstructorApplications'],
    baseQuery: fetchBaseQuery({
        baseUrl: ADMIN_API,
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        // Dashboard stats
        getAdminStats: builder.query({
            query: () => '/stats',
            providesTags: ['AdminStats'],
        }),

        // Users
        getAllPlatformUsers: builder.query({
            query: ({ page = 1, limit = 20, search = '', role = '' } = {}) =>
                `/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role=${role}`,
            providesTags: ['AdminUsers'],
        }),

        updateUserRole: builder.mutation({
            query: ({ userId, newRole }) => ({
                url: `/users/${userId}/role`,
                method: 'PUT',
                body: { newRole },
            }),
            invalidatesTags: ['AdminUsers', 'AdminStats'],
        }),

        deleteUserAdmin: builder.mutation({
            query: (userId) => ({
                url: `/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminUsers', 'AdminStats'],
        }),

        // Courses
        getAllPlatformCourses: builder.query({
            query: ({ page = 1, limit = 20, search = '', status = '' } = {}) =>
                `/courses?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`,
            providesTags: ['AdminCourses'],
        }),

        toggleCoursePublish: builder.mutation({
            query: (courseId) => ({
                url: `/courses/${courseId}/toggle-publish`,
                method: 'PATCH',
            }),
            invalidatesTags: ['AdminCourses', 'AdminStats'],
        }),

        deleteCourseAdmin: builder.mutation({
            query: (courseId) => ({
                url: `/courses/${courseId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminCourses', 'AdminStats'],
        }),

        // Revenue
        getPlatformRevenue: builder.query({
            query: () => '/revenue',
            providesTags: ['AdminStats'],
        }),

        // Purchases
        getAllPurchases: builder.query({
            query: ({ page = 1, limit = 20, search = '' } = {}) =>
                `/purchases?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
            providesTags: ['AdminPurchases'],
        }),

        // Instructor Applications
        getPendingInstructors: builder.query({
            query: ({ status = 'pending' } = {}) =>
                `/instructor-applications?status=${status}`,
            providesTags: ['InstructorApplications'],
        }),

        approveInstructor: builder.mutation({
            query: (userId) => ({
                url: `/instructor-applications/${userId}/approve`,
                method: 'PUT',
            }),
            invalidatesTags: ['InstructorApplications', 'AdminUsers', 'AdminStats'],
        }),

        rejectInstructor: builder.mutation({
            query: ({ userId, reason }) => ({
                url: `/instructor-applications/${userId}/reject`,
                method: 'PUT',
                body: { reason },
            }),
            invalidatesTags: ['InstructorApplications'],
        }),
    }),
});

export const {
    useGetAdminStatsQuery,
    useGetAllPlatformUsersQuery,
    useUpdateUserRoleMutation,
    useDeleteUserAdminMutation,
    useGetAllPlatformCoursesQuery,
    useToggleCoursePublishMutation,
    useDeleteCourseAdminMutation,
    useGetPlatformRevenueQuery,
    useGetAllPurchasesQuery,
    useGetPendingInstructorsQuery,
    useApproveInstructorMutation,
    useRejectInstructorMutation,
} = adminApi;
