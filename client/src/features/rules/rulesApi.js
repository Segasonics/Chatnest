import { baseApi } from '../../api/baseApi';

export const rulesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRules: builder.query({
      query: (workspaceId) => `/workspaces/${workspaceId}/rules`,
      providesTags: ['Rule']
    }),
    createRule: builder.mutation({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/rules`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Rule']
    }),
    updateRule: builder.mutation({
      query: ({ workspaceId, ruleId, ...body }) => ({
        url: `/workspaces/${workspaceId}/rules/${ruleId}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Rule']
    }),
    deleteRule: builder.mutation({
      query: ({ workspaceId, ruleId }) => ({
        url: `/workspaces/${workspaceId}/rules/${ruleId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Rule']
    })
  })
});

export const { useGetRulesQuery, useCreateRuleMutation, useUpdateRuleMutation, useDeleteRuleMutation } = rulesApi;
