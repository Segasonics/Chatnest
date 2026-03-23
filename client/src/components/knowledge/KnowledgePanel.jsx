import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import {
  useCreateKnowledgeTextMutation,
  useDeleteKnowledgeDocumentMutation,
  useGetKnowledgeDocumentsQuery,
  useQueryKnowledgeAnswerMutation
} from '../../features/knowledge/knowledgeApi';

function KnowledgePanel({ workspaceId }) {
  const { data, isLoading } = useGetKnowledgeDocumentsQuery(workspaceId, {
    skip: !workspaceId
  });
  const [createKnowledgeText, { isLoading: addingText }] = useCreateKnowledgeTextMutation();
  const [deleteKnowledgeDocument, { isLoading: deleting }] = useDeleteKnowledgeDocumentMutation();
  const [queryKnowledgeAnswer, { isLoading: asking }] = useQueryKnowledgeAnswerMutation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const documents = data?.data || [];

  const onAddText = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await createKnowledgeText({
        workspaceId,
        title: title.trim(),
        text: content.trim()
      }).unwrap();
      setTitle('');
      setContent('');
      toast.success('Knowledge added and indexed');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add knowledge');
    }
  };

  const onAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      const result = await queryKnowledgeAnswer({ workspaceId, question: question.trim() }).unwrap();
      setAnswer(result?.data || null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to query AI');
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="glass-panel rounded-2xl p-4">
        <h3 className="font-display text-lg text-white">Knowledge Base</h3>
        <p className="mt-1 text-sm text-slate-300">
          Add business information and let the AI answer customer questions.
        </p>

        <form onSubmit={onAddText} className="mt-4 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Document title (e.g. Pricing FAQ)"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-28 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Paste knowledge text..."
          />
          <Button type="submit" disabled={addingText}>
            {addingText ? 'Indexing...' : 'Add Knowledge'}
          </Button>
        </form>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-200">Indexed documents</p>
          {isLoading ? <p className="text-sm text-slate-400">Loading...</p> : null}
          {!isLoading && !documents.length ? (
            <EmptyState
              title="No indexed docs"
              description="Upload a PDF or add manual text above."
            />
          ) : null}
          <div className="space-y-2">
            {documents.map((doc) => (
              <article key={doc._id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                <p className="text-sm font-semibold text-white">{doc.title}</p>
                <p className="text-xs text-slate-400">
                  {doc.sourceType} | {doc.status} | {doc.chunkCount || 0} chunks
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    className="text-xs text-rose-300 disabled:opacity-50"
                    disabled={deleting}
                    onClick={async () => {
                      setDeleteTarget(doc);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-4">
        <h3 className="font-display text-lg text-white">Ask AI (RAG Test)</h3>
        <p className="mt-1 text-sm text-slate-300">
          Test how auto-reply will answer using workspace knowledge.
        </p>
        <form onSubmit={onAsk} className="mt-4 space-y-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Ask something like: What are your prices?"
          />
          <Button type="submit" disabled={asking}>
            {asking ? 'Asking...' : 'Ask AI'}
          </Button>
        </form>

        {answer ? (
          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/50 p-3">
            <p className="text-sm text-white">{answer.answer || 'No answer generated.'}</p>
            {answer.sources?.length ? (
              <div className="mt-3 space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-400">Sources</p>
                {answer.sources.map((source, index) => (
                  <p key={`${source.documentId || index}_${index}`} className="text-xs text-emerald-300">
                    {source.title || 'Untitled source'}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Knowledge Document"
        onClose={() => setDeleteTarget(null)}
      >
        <p className="text-sm text-slate-300">
          This will remove the indexed document and its chunks. This action cannot be undone.
        </p>
        <p className="mt-2 text-sm text-white">
          {deleteTarget?.title || 'Untitled document'}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!deleteTarget?._id) return;
              try {
                await deleteKnowledgeDocument({
                  workspaceId,
                  documentId: deleteTarget._id
                }).unwrap();
                toast.success('Knowledge document deleted');
              } catch (error) {
                toast.error(error?.data?.message || 'Delete failed');
              } finally {
                setDeleteTarget(null);
              }
            }}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default KnowledgePanel;

