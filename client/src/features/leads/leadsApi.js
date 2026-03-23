import { baseApi } from '../../api/baseApi';

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: (workspaceId) => `/workspaces/${workspaceId}/leads`,
      providesTags: ['Lead']
    }),
    updateLead: builder.mutation({
      query: ({ workspaceId, leadId, ...body }) => ({
        url: `/workspaces/${workspaceId}/leads/${leadId}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Lead', 'Analytics']
    })
  })
});

export const { useGetLeadsQuery, useUpdateLeadMutation } = leadsApi;
