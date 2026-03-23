import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import QuotaUsageCard from '../components/billing/QuotaUsageCard';
import { useCreateCheckoutSessionMutation, useGetBillingMeQuery } from '../features/billing/billingApi';
import { useAppSelector } from '../app/hooks';
import WorkspaceShell from '../components/layout/WorkspaceShell';

function BillingPage() {
  const activeWorkspaceId = useAppSelector((state) => state.workspace.activeWorkspaceId);
  const { data } = useGetBillingMeQuery();
  const [createCheckoutSession, { isLoading }] = useCreateCheckoutSessionMutation();

  const billing = data?.data;

  if (!activeWorkspaceId) {
    return (
      <div className="app-shell-bg flex min-h-screen items-center justify-center p-6">
        <div className="glass-panel max-w-lg rounded-2xl p-6 text-center">
          <h1 className="font-display text-2xl text-white">Select a Workspace</h1>
          <p className="mt-2 text-sm text-slate-300">
            Open a workspace first so Billing can stay in the workspace sidebar layout.
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

  const checkout = async (plan) => {
    try {
      const result = await createCheckoutSession({ plan }).unwrap();
      if (result?.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to open checkout');
    }
  };

  return (
    <WorkspaceShell workspaceId={activeWorkspaceId} title="Billing & Plans">
      <div className="space-y-4">
        <QuotaUsageCard plan={billing?.plan} remaining={billing?.messageCreditsRemaining} />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { id: 'free', label: 'Free', price: '$0', limit: '100 msgs/mo' },
            { id: 'pro', label: 'Pro', price: '$49', limit: '10,000 msgs/mo' },
            { id: 'team', label: 'Team', price: '$149', limit: '50,000 msgs/mo' }
          ].map((plan) => (
            <article key={plan.id} className="glass-panel rounded-2xl p-4">
              <h3 className="font-display text-xl text-white">{plan.label}</h3>
              <p className="mt-2 text-2xl font-bold text-white">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-400">{plan.limit}</p>
              <Button className="mt-3 w-full" onClick={() => checkout(plan.id)} disabled={isLoading}>
                Choose {plan.label}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}

export default BillingPage;

