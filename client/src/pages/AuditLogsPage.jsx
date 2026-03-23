import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import WorkspaceShell from '../components/layout/WorkspaceShell';
import Button from '../components/common/Button';
import { useGetAuditLogsQuery } from '../features/audit/auditApi';
import { formatDate } from '../utils/format';

function formatActor(actor) {
  if (!actor) return 'System';
  if (actor.name) return actor.name;
  if (actor.email) return actor.email;
  return 'User';
}

function formatMetadata(metadata) {
  if (!metadata) return '-';
  const text = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
  if (text.length <= 140) return text;
  return `${text.slice(0, 140)}...`;
}

function AuditLogsPage() {
  const { workspaceId } = useParams();
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isFetching } = useGetAuditLogsQuery({ workspaceId, page, limit });
  const payload = data?.data;
  const items = payload?.items || [];
  const totalPages = payload?.totalPages || 1;

  const rows = useMemo(
    () =>
      items.map((item) => ({
        id: item._id,
        time: formatDate(item.createdAt),
        actor: formatActor(item.actorUserId),
        action: item.action,
        target: `${item.targetType}${item.targetId ? ` · ${item.targetId}` : ''}`,
        metadata: formatMetadata(item.metadata)
      })),
    [items]
  );

  return (
    <WorkspaceShell workspaceId={workspaceId} title="Audit Logs">
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-slate-300">Recent workspace activity</p>
            <p className="text-xs text-slate-500">Tracks rules, flows, team, and provider changes.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Page {page}</span>
            <span>/</span>
            <span>{totalPages}</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="text-xs uppercase text-slate-400">
              <tr className="border-b border-slate-700/80">
                <th className="py-3 pr-4">Time</th>
                <th className="py-3 pr-4">Actor</th>
                <th className="py-3 pr-4">Action</th>
                <th className="py-3 pr-4">Target</th>
                <th className="py-3 pr-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    {isFetching ? 'Loading logs...' : 'No audit logs yet.'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800/70">
                    <td className="py-3 pr-4 text-xs text-slate-400">{row.time}</td>
                    <td className="py-3 pr-4">{row.actor}</td>
                    <td className="py-3 pr-4 text-emerald-200">{row.action}</td>
                    <td className="py-3 pr-4 text-slate-300">{row.target}</td>
                    <td className="py-3 pr-4 text-xs text-slate-400">{row.metadata}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            Showing {items.length} of {payload?.total || 0} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-xs"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              className="text-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

export default AuditLogsPage;
