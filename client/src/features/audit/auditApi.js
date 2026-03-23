import { baseApi } from '../../api/baseApi';

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query({
      query: ({ workspaceId, page = 1, limit = 20 }) =>
        `/workspaces/${workspaceId}/audit?page=${page}&limit=${limit}`,
      providesTags: ['AuditLogs']
    })
  })
});

export const { useGetAuditLogsQuery } = auditApi;
