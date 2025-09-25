import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { userLoggedIn, userLoggedOut } from '../authslice';


const USER_API = 'http://localhost:8000/api/v1/course';


export const courseApi = createApi({
    reducerPath: 'courseApi',
    tagTypes: ['Refetch_Creator_Course', '', 'Refetch_Creator_Lecture'],
    baseQuery: fetchBaseQuery({
        baseUrl: USER_API,
        credentials: 'include',
        prepareHeaders: (headers) => {
            return headers;

        }
    }),
    endpoints: (builder) => ({

        createCourse: builder.mutation({
            query: ({ courseTitle, category }) => ({
                url: "",
                method: 'POST',
                body: { courseTitle, category }
            }),
            invalidatesTags: ['Refetch_Creator_Course']
        }),
        getAllCourses: builder.query({
            query: () => ({
                url: "all",
                method: 'GET'
            }),
            providesTags: ['Refetch_Creator_Course']

        }),
        editCourse: builder.mutation({
            query: ({ formData, courseId }) => ({
                url: `edit/${courseId}`,
                method: 'PUT',
                body: formData
            }),
            invalidatesTags: ['Refetch_Creator_Course']
        }),
        getCourseById: builder.query({
            query: (courseId) => ({
                url: `/${courseId}`,
                method: 'GET'
            }),
            providesTags: ['Refetch_Creator_Course']
        }),
        removeCourse: builder.mutation({
            query: (courseId) => ({
                url: `/${courseId}`,
                method: 'DELETE'
            }),
            providesTags: ['Refetch_Creator_Course']
        }),
        createLectures: builder.mutation({
            query: ({ lectureTitle, courseId }) => ({
                url: `/${courseId}/lectures`,
                method: 'POST',
                body: { lectureTitle }
            }),
            invalidatesTags: ['Refetch_Creator_Lecture']
        }),
        getAllLectures: builder.query({
            query: (courseId) => ({
                url: `${courseId}/lectures`,
                method: 'get',
            }),
            providesTags: ['Refetch_Creator_Lecture']
        }),
        editLecture: builder.mutation({
            query: ({ lectureId, courseId, lectureTitle, isPreviewFree, secure_url, public_id }) => ({
                url: `/${courseId}/lectures/${lectureId}`,
                method: 'PUT',
                body: {
                    lectureTitle,
                    isPreviewFree,
                    secure_url,
                    public_id
                }
            }),
            invalidatesTags: ['Refetch_Creator_Lecture']
        }),

        getLectureById: builder.query({
            query: ({ lectureId, courseId }) => ({
                url: `/${courseId}/lectures/${lectureId}`,
                method: 'GET'
            }),
            providesTags: ['Refetch_Creator_Lecture']

        }),
        removeLecture: builder.mutation({
            query: ({ lectureId, courseId }) => ({
                url: `/${courseId}/lectures/${lectureId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['refetch_creator_lecture']
        }),
        publishCourse: builder.mutation({
            query: ({ courseId, query }) => ({
                url: `/${courseId}?publish=${query}`,
                method: 'PATCH',
            }),
            providesTags: ['Refetch_Creator_Course']
        }),
        getPublishCourse: builder.query({
            query: () => ({
                url: "/publishCourse",
                method: 'GET'
            }),
            providesTags: ['Refetch_Creator_Course']
        }),
        getMonthlyRevenue: builder.query({
            query: (instructorId) => ({
                url: `/monthly-revenue/${instructorId}`,
                method: 'GET'
            }),
            providesTags: ['Refetch_Creator_Course']
        }),

    })
})
//build in hooks created by rtk query
export const { useCreateCourseMutation, useGetAllCoursesQuery, useEditCourseMutation, useGetCourseByIdQuery, useCreateLecturesMutation, useGetAllLecturesQuery, useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation, usePublishCourseMutation, useGetPublishCourseQuery, useRemoveCourseMutation, useGetMonthlyRevenueQuery } = courseApi;