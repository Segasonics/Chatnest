function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-slate-700/70 text-slate-100',
    success: 'bg-emerald-500/20 text-emerald-300',
    warning: 'bg-amber-500/20 text-amber-300',
    danger: 'bg-rose-500/20 text-rose-300',
    info: 'bg-emerald-500/20 text-emerald-300'
  };

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export default Badge;

