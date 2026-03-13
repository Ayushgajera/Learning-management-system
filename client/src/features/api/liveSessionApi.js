import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config/index';

const LIVE_SESSION_API = `${config.API_BASE_URL}/api/v1/live-sessions`;

export const liveSessionApi = createApi({
    reducerPath: 'liveSessionApi',
    tagTypes: ['LiveSessions', 'LiveSession'],
    baseQuery: fetchBaseQuery({
        baseUrl: LIVE_SESSION_API,
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        createLiveSession: builder.mutation({
            query: (body) => ({
                url: '',
                method: 'POST',
                body
            }),
            invalidatesTags: ['LiveSessions']
        }),

        getSessionsByCourse: builder.query({
            query: (courseId) => `/course/${courseId}`,
            providesTags: ['LiveSessions']
        }),

        getUpcomingStudentSessions: builder.query({
            query: () => '/student/upcoming',
            providesTags: ['LiveSessions']
        }),

        getUpcomingInstructorSessions: builder.query({
            query: () => '/instructor/upcoming',
            providesTags: ['LiveSessions']
        }),

        getSessionById: builder.query({
            query: (sessionId) => `/${sessionId}`,
            providesTags: (result, error, sessionId) => [
                { type: 'LiveSession', id: sessionId }
            ]
        }),

        updateLiveSession: builder.mutation({
            query: ({ sessionId, ...body }) => ({
                url: `/${sessionId}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['LiveSessions']
        }),

        cancelLiveSession: builder.mutation({
            query: (sessionId) => ({
                url: `/${sessionId}/cancel`,
                method: 'PATCH'
            }),
            invalidatesTags: ['LiveSessions']
        }),

        startLiveSession: builder.mutation({
            query: (sessionId) => ({
                url: `/${sessionId}/start`,
                method: 'PATCH'
            }),
            invalidatesTags: ['LiveSessions']
        }),

        endLiveSession: builder.mutation({
            query: (sessionId) => ({
                url: `/${sessionId}/end`,
                method: 'PATCH'
            }),
            invalidatesTags: ['LiveSessions']
        }),

        uploadRecording: builder.mutation({
            query: ({ sessionId, recordingUrl, recordingPublicId }) => ({
                url: `/${sessionId}/recording`,
                method: 'POST',
                body: { recordingUrl, recordingPublicId }
            }),
            invalidatesTags: ['LiveSessions']
        }),

        getInstructorSessionHistory: builder.query({
            query: ({ page = 1, limit = 20 } = {}) => `/instructor/history?page=${page}&limit=${limit}`,
            providesTags: ['LiveSessions']
        }),

        getSessionChat: builder.query({
            query: (sessionId) => `/${sessionId}/chat`
        }),
    })
});

export const {
    useCreateLiveSessionMutation,
    useGetSessionsByCourseQuery,
    useGetUpcomingStudentSessionsQuery,
    useGetUpcomingInstructorSessionsQuery,
    useGetInstructorSessionHistoryQuery,
    useGetSessionByIdQuery,
    useUpdateLiveSessionMutation,
    useCancelLiveSessionMutation,
    useStartLiveSessionMutation,
    useEndLiveSessionMutation,
    useUploadRecordingMutation,
    useGetSessionChatQuery,
} = liveSessionApi;
