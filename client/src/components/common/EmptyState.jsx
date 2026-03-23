function EmptyState({ title, description, action }) {
  return (
    <div className="glass-panel rounded-2xl border border-dashed border-slate-600 p-8 text-center">
      <h3 className="font-display text-xl text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
