import { baseApi } from '../../api/baseApi';

export const inboxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (workspaceId) => `/workspaces/${workspaceId}/conversations`,
      providesTags: ['Conversation']
    }),
    getConversationById: builder.query({
      query: ({ workspaceId, conversationId }) =>
        `/workspaces/${workspaceId}/conversations/${conversationId}`,
      providesTags: ['Conversation']
    }),
    sendMessage: builder.mutation({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/send`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Conversation', 'Analytics', 'Billing']
    })
  })
});

export const { useGetConversationsQuery, useGetConversationByIdQuery, useSendMessageMutation } = inboxApi;
