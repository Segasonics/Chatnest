import { baseApi } from '../../api/baseApi';

export const knowledgeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getKnowledgeDocuments: builder.query({
      query: (workspaceId) => `/workspaces/${workspaceId}/knowledge`,
      providesTags: ['Workspace']
    }),
    createKnowledgeText: builder.mutation({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/knowledge/text`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['Workspace']
    }),
    deleteKnowledgeDocument: builder.mutation({
      query: ({ workspaceId, documentId }) => ({
        url: `/workspaces/${workspaceId}/knowledge/${documentId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Workspace']
    }),
    queryKnowledgeAnswer: builder.mutation({
      query: ({ workspaceId, question }) => ({
        url: `/workspaces/${workspaceId}/knowledge/query`,
        method: 'POST',
        body: { question }
      })
    })
  })
});

export const {
  useGetKnowledgeDocumentsQuery,
  useCreateKnowledgeTextMutation,
  useDeleteKnowledgeDocumentMutation,
  useQueryKnowledgeAnswerMutation
} = knowledgeApi;
