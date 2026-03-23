import { baseApi } from '../../api/baseApi';

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingMe: builder.query({
      query: () => '/billing/me',
      providesTags: ['Billing']
    }),
    createCheckoutSession: builder.mutation({
      query: (body) => ({
        url: '/billing/create-checkout-session',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Billing']
    })
  })
});

export const { useGetBillingMeQuery, useCreateCheckoutSessionMutation } = billingApi;
