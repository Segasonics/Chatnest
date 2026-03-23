import { baseApi } from '../../api/baseApi';

export const flowsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFlows: builder.query({
      query: (workspaceId) => `/workspaces/${workspaceId}/flows`,
      providesTags: ['Flow']
    }),
    createFlow: builder.mutation({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/flows`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Flow']
    }),
    updateFlow: builder.mutation({
      query: ({ workspaceId, flowId, ...body }) => ({
        url: `/workspaces/${workspaceId}/flows/${flowId}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Flow']
    }),
    deleteFlow: builder.mutation({
      query: ({ workspaceId, flowId }) => ({
        url: `/workspaces/${workspaceId}/flows/${flowId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Flow']
    })
  })
});

export const { useGetFlowsQuery, useCreateFlowMutation, useUpdateFlowMutation, useDeleteFlowMutation } =
  flowsApi;
