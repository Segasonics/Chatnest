import { baseApi } from '../../api/baseApi';

export const assetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query({
      query: (workspaceId) => `/workspaces/${workspaceId}/assets`,
      providesTags: ['Asset']
    }),
    deleteAsset: builder.mutation({
      query: ({ workspaceId, assetId }) => ({
        url: `/workspaces/${workspaceId}/assets/${assetId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Asset', 'Workspace']
    })
  })
});

export const { useGetAssetsQuery, useDeleteAssetMutation } = assetsApi;
