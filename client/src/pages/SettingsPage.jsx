import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAppSelector } from '../app/hooks';
import { useLogoutMutation } from '../features/auth/authApi';
import WorkspaceShell from '../components/layout/WorkspaceShell';

function SettingsPage() {
  const activeWorkspaceId = useAppSelector((state) => state.workspace.activeWorkspaceId);
  const user = useAppSelector((state) => state.auth.user);
  const [logout, { isLoading }] = useLogoutMutation();

  if (!activeWorkspaceId) {
    return (
      <div className="app-shell-bg flex min-h-screen items-center justify-center p-6">
        <div className="glass-panel max-w-lg rounded-2xl p-6 text-center">
          <h1 className="font-display text-2xl text-white">Select a Workspace</h1>
          <p className="mt-2 text-sm text-slate-300">
            Open a workspace first so Settings can stay in the workspace sidebar layout.
          </p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceShell workspaceId={activeWorkspaceId} title="Profile Settings">
      <div className="space-y-4">
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-sm text-slate-300">Name</p>
          <p className="text-lg text-white">{user?.name || '-'}</p>
          <p className="mt-3 text-sm text-slate-300">Email</p>
          <p className="text-lg text-white">{user?.email || '-'}</p>
          <p className="mt-3 text-sm text-slate-300">Role</p>
          <p className="text-lg text-white">{user?.role || '-'}</p>
        </div>
        <Button
          variant="ghost"
          disabled={isLoading}
          onClick={async () => {
            await logout().unwrap();
            toast.success('Logged out');
            window.location.href = '/auth/login';
          }}
        >
          Logout
        </Button>
      </div>
    </WorkspaceShell>
  );
}

export default SettingsPage;

