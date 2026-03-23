function Input({ label, error, className = '', ...props }) {
  return (
    <label className="flex w-full flex-col gap-1 text-sm">
      {label ? <span className="text-slate-300">{label}</span> : null}
      <input
        className={`rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-400">{error}</span> : null}
    </label>
  );
}

export default Input;

