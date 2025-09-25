import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { userLoggedIn, userLoggedOut } from '../authslice';

const USER_API = 'http://localhost:8000/api/v1/payment';


export const paymentApi = createApi({
    reducerPath: 'paymentApi',
    baseQuery: fetchBaseQuery({
        baseUrl:USER_API,
        credentials: 'include',
        prepareHeaders: (headers) => {
            return headers;

          } 
    }),
    endpoints:(builder)=>({
        createPayment: builder.mutation({
            query: (paymentData) => ({
                url: "create-order",
                method: 'POST',
                body: paymentData
            })
        }),
        verifyPayment: builder.mutation({
            query: (paymentData) => ({
                url: "verify",
                method: 'POST',
                body: paymentData
            })
        }),
        GetPurchaseCourse: builder.query({
            query: (courseId) => ({
                url: `/${courseId}/purchase`,
                method: 'GET'
            })
        }),
        withdrawFromWallet: builder.mutation({
            query: (withdrawData) => ({
                url: "withdraw",
                method: 'POST',
                body: withdrawData
            })
        }),
    })
})
//build in hooks created by rtk query
export const {useGetPurchaseCourseQuery,useCreatePaymentMutation,useVerifyPaymentMutation,useWithdrawFromWalletMutation} = paymentApi;