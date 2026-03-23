import { baseApi } from '../../api/baseApi';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: (workspaceId) => `/workspaces/${workspaceId}/analytics`,
      providesTags: ['Analytics']
    })
  })
});

export const { useGetAnalyticsQuery } = analyticsApi;
