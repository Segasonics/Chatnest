import { baseApi } from '../../api/baseApi';

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query({
      query: () => '/workspaces',
      providesTags: ['Workspace']
    }),
    getWorkspace: builder.query({
      query: (id) => `/workspaces/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Workspace', id }]
    }),
    createWorkspace: builder.mutation({
      query: (body) => ({
        url: '/workspaces',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Workspace']
    }),
    updateWorkspace: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/workspaces/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Workspace', id }]
    }),
    deleteWorkspace: builder.mutation({
      query: (id) => ({
        url: `/workspaces/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Workspace']
    }),
    addTeamMember: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/workspaces/${id}/team`,
        method: 'POST',
        body
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Workspace', id }]
    }),
    removeTeamMember: builder.mutation({
      query: ({ id, memberId }) => ({
        url: `/workspaces/${id}/team/${memberId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Workspace', id }]
    }),
    uploadAsset: builder.mutation({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/workspaces/${id}/upload-asset`,
          method: 'POST',
          body: formData
        };
      },
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Workspace', id }]
    }),
    getMetaSignupConfig: builder.query({
      query: (id) => `/workspaces/${id}/providers/meta/embedded-signup-config`,
      providesTags: (_res, _err, id) => [{ type: 'Workspace', id }]
    }),
    getMetaWebhookStatus: builder.query({
      query: (id) => `/workspaces/${id}/providers/meta/webhook-status`,
      providesTags: (_res, _err, id) => [{ type: 'Workspace', id }]
    }),
    connectMetaProvider: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/workspaces/${id}/providers/meta/complete`,
        method: 'POST',
        body
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Workspace', id }]
    }),
    disconnectMetaProvider: builder.mutation({
      query: (id) => ({
        url: `/workspaces/${id}/providers/meta/disconnect`,
        method: 'DELETE'
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'Workspace', id }]
    })
  })
});

export const {
  useGetWorkspacesQuery,
  useGetWorkspaceQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useUploadAssetMutation,
  useGetMetaSignupConfigQuery,
  useGetMetaWebhookStatusQuery,
  useConnectMetaProviderMutation,
  useDisconnectMetaProviderMutation
} = workspaceApi;
