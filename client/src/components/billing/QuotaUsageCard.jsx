import { formatNumber } from '../../utils/format';
import { PLAN_LIMITS } from '../../utils/constants';

function QuotaUsageCard({ plan = 'free', remaining = 0 }) {
  const total = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const used = Math.max(0, total - remaining);
  const percent = Math.min(100, Math.round((used / total) * 100));

  return (
    <div className="glass-panel rounded-2xl p-4">
      <p className="text-sm text-slate-300">Quota usage ({plan.toUpperCase()})</p>
      <p className="mt-2 text-2xl font-bold text-white">
        {formatNumber(used)} / {formatNumber(total)}
      </p>
      <div className="mt-3 h-2 rounded-full bg-slate-800">
        <div className="h-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-400">{formatNumber(remaining)} remaining this cycle</p>
    </div>
  );
}

export default QuotaUsageCard;

