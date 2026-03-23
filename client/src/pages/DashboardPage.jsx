import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetWorkspacesQuery, useCreateWorkspaceMutation } from '../features/workspaces/workspaceApi';
import { useAppDispatch } from '../app/hooks';
import { setActiveWorkspace } from '../features/workspaces/workspaceSlice';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetWorkspacesQuery();
  const [createWorkspace, { isLoading: creating }] = useCreateWorkspaceMutation();
  const [name, setName] = useState('');

  const workspaces = data?.data?.items || [];

  const onCreate = async () => {
    console.info('Create workspace clicked', { name });
    if (!name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    try {
      toast.loading('Creating workspace...', { id: 'create-workspace' });
      await createWorkspace({ name, whatsappProvider: 'mock' }).unwrap();
      setName('');
      toast.success('Workspace created', { id: 'create-workspace' });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create workspace', { id: 'create-workspace' });
    }
  };

  return (
    <div className="app-shell-bg min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold text-white">Workspaces</h1>
        <p className="mt-1 text-slate-300">Each workspace represents a business.</p>

        <div className="glass-panel mt-6 rounded-2xl p-4">
          <p className="mb-3 text-sm text-slate-300">Create workspace</p>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCreate();
              }}
              placeholder="Workspace name"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
            />
            <Button onClick={onCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {isLoading ? <p className="text-slate-300">Loading...</p> : null}
          {!isLoading && !workspaces.length ? (
            <EmptyState title="No workspace yet" description="Create your first business workspace." />
          ) : null}
          {workspaces.map((workspace) => (
            <Link
              key={workspace._id}
              to={`/w/${workspace._id}`}
              onClick={() => dispatch(setActiveWorkspace(workspace._id))}
              className="glass-panel rounded-2xl p-4 transition hover:-translate-y-1"
            >
              <h3 className="font-display text-xl text-white">{workspace.name}</h3>
              <p className="mt-2 text-sm text-slate-300">Provider: {workspace.whatsappProvider}</p>
              <p className="text-sm text-slate-400">Number: {workspace.phoneNumber || 'Not connected'}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
