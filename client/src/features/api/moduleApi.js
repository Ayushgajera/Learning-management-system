import { courseApi } from "./courseApi";

export const moduleApi = courseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCourseModules: builder.query({
            query: (courseId) => ({
                url: `../module/${courseId}`,
                method: 'GET'
            }),
            providesTags: ['Refetch_Creator_Course']
        }),
        createModule: builder.mutation({
            query: ({ courseId, moduleTitle, description }) => ({
                url: `../module/${courseId}`,
                method: 'POST',
                body: { moduleTitle, description }
            }),
            invalidatesTags: ['Refetch_Creator_Course']
        }),
        updateModule: builder.mutation({
            query: ({ moduleId, moduleTitle, description, isPublished }) => ({
                url: `../module/${moduleId}`,
                method: 'PUT',
                body: { moduleTitle, description, isPublished }
            }),
            invalidatesTags: ['Refetch_Creator_Course']
        }),
        deleteModule: builder.mutation({
            query: (moduleId) => ({
                url: `../module/${moduleId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Refetch_Creator_Course']
        }),
    })
});

export const {
    useGetCourseModulesQuery,
    useCreateModuleMutation,
    useUpdateModuleMutation,
    useDeleteModuleMutation
} = moduleApi;
