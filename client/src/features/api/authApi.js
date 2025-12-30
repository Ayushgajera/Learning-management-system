import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { userLoggedIn, userLoggedOut } from '../authslice';

import config from '../../config/index';

const USER_API = `${config.API_BASE_URL}/api/v1/user/`;


export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: USER_API,
        credentials: 'include',
        prepareHeaders: (headers) => {
            return headers;

        }
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputata) => ({
                url: "register",
                method: 'POST',
                body: inputata
            })
        }),
        loginUser: builder.mutation({
            query: (inputata) => ({
                url: "login",
                method: 'POST',
                body: inputata
            }),
            // it's called when the loginUser activated means triggered loginUser
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    //queryFUlfilled used to store data from the server(recieved response from backend)
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({ user: result.data.user }));

                } catch (error) {
                    // console.log(error)

                }
            }
        }),
        loaduser: builder.query({
            query: () => ({
                url: "profile",
                method: 'GET'
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                // console.log("loaduser API call started");
                try {
                    //queryFUlfilled used to store data from the server(recieved response from backend)
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({ user: result.data.user }));

                } catch (error) {
                    // console.log(error)

                }
            }
        }),
        updatedUser: builder.mutation({
            query: (inputData) => ({
                url: "profile/update",
                method: 'PUT',
                body: inputData,
                credentials: 'include',
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({ user: result.data.user }));
                } catch (error) {
                    // console.log(error);
                }
            }
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url: "logout",
                method: 'GET'
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {

                    dispatch(userLoggedOut());

                } catch (error) {
                    // console.log(error)

                }
            }

        }),

    })
})
//build in hooks created by rtk query   
export const { useRegisterUserMutation, useLoginUserMutation, useLoaduserQuery, useLogoutUserMutation, useUpdatedUserMutation } = authApi;