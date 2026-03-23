import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import WorkspaceShell from '../components/layout/WorkspaceShell';
import { useGetAnalyticsQuery } from '../features/analytics/analyticsApi';
import { formatNumber, percentage } from '../utils/format';

function AnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-950/90 px-3 py-2 text-xs text-slate-100 shadow-lg">
      <p className="text-xs text-slate-300">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="text-slate-300">{entry.name}</span>
            <span className="font-semibold text-white">{formatNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const { workspaceId } = useParams();
  const { data } = useGetAnalyticsQuery(workspaceId);
  const analytics = data?.data || {};

  const daily = useMemo(() => {
    const rows = analytics.daily || [];
    return rows.map((row) => ({
      ...row,
      day: new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));
  }, [analytics.daily]);

  const activityData = [
    { name: 'Inbound', value: analytics.inboundCount || 0 },
    { name: 'Outbound', value: analytics.outboundCount || 0 },
    { name: 'Leads', value: analytics.leadCount || 0 },
    { name: 'Booked', value: analytics.bookedCount || 0 }
  ];

  const topTriggers = analytics.topTriggers || [];

  return (
    <WorkspaceShell workspaceId={workspaceId} title="Analytics">
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-sm text-slate-300">Message Volume</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{formatNumber(analytics.messageVolume)}</h3>
          <div className="mt-4 grid gap-2 text-sm text-slate-400">
            <div className="flex items-center justify-between">
              <span>Reply rate</span>
              <span className="text-white">{percentage(analytics.replyRate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Conversion</span>
              <span className="text-white">{percentage(analytics.conversionRate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active rules</span>
              <span className="text-white">{formatNumber(analytics.ruleCount)}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <p className="text-sm text-slate-300">Inbound vs outbound</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="inboundGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25d366" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#25d366" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="outboundGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00a884" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#00a884" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a33" />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip content={<AnalyticsTooltip />} />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  name="Inbound"
                  stroke="#25d366"
                  fill="url(#inboundGlow)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="outbound"
                  name="Outbound"
                  stroke="#00a884"
                  fill="url(#outboundGlow)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <p className="text-sm text-slate-300">Leads & bookings</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a33" />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip content={<AnalyticsTooltip />} />
                <Line type="monotone" dataKey="leads" name="Leads" stroke="#7dd3fc" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="booked" name="Booked" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Activity breakdown</p>
            <p className="text-xs text-slate-500">Last 14 days</p>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a33" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip content={<AnalyticsTooltip />} />
                <Bar dataKey="value" name="Count" fill="#25d366" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Top triggers</p>
            <p className="text-xs text-slate-500">Auto replies</p>
          </div>
          <div className="mt-4 space-y-3">
            {topTriggers.length === 0 ? (
              <p className="text-sm text-slate-400">No triggers matched yet.</p>
            ) : (
              topTriggers.map((trigger) => (
                <div
                  key={trigger._id}
                  className="flex items-center justify-between rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{trigger._id}</p>
                    <p className="text-xs text-slate-400">Auto replies</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-300">{formatNumber(trigger.count)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

export default AnalyticsPage;
