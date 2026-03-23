import { z } from 'zod';

export const knowledgeTextSchema = z.object({
  title: z.string().min(2).max(160),
  text: z.string().min(10).max(120000)
});

export const knowledgeQuerySchema = z.object({
  question: z.string().min(2).max(1200)
});

export const knowledgeDocumentParamSchema = z.object({
  workspaceId: z.string().min(1),
  documentId: z.string().min(1)
});
