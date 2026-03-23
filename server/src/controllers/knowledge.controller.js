import {
  answerQuestionWithRag,
  deleteKnowledgeDocument,
  indexKnowledgeDocument,
  listKnowledgeDocuments
} from '../services/rag/knowledge.service.js';
import { ApiError } from '../utils/apiError.js';

export async function listKnowledge(req, res) {
  const documents = await listKnowledgeDocuments(req.workspace._id);
  res.json({ success: true, data: documents });
}

export async function addKnowledgeText(req, res) {
  const document = await indexKnowledgeDocument({
    workspaceId: req.workspace._id,
    title: req.body.title,
    text: req.body.text,
    sourceType: 'manual'
  });
  res.status(201).json({ success: true, data: document });
}

export async function queryKnowledge(req, res) {
  const result = await answerQuestionWithRag({
    workspaceId: req.workspace._id,
    question: req.body.question
  });
  res.json({ success: true, data: result });
}

export async function removeKnowledgeDocument(req, res) {
  const removed = await deleteKnowledgeDocument({
    workspaceId: req.workspace._id,
    documentId: req.params.documentId
  });

  if (!removed) throw new ApiError(404, 'NOT_FOUND', 'Knowledge document not found');

  res.json({ success: true, message: 'Knowledge document deleted' });
}
