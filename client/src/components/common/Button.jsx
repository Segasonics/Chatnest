function Button({ className = '', variant = 'primary', type = 'button', ...props }) {
  const styles = {
    primary:
      'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400 text-white shadow-glow hover:-translate-y-0.5',
    secondary: 'bg-[#1f2c34] text-slate-100 border border-[#2a3942] hover:border-emerald-300',
    ghost: 'bg-transparent text-[#d1d7db] border border-[#2a3942] hover:border-[#435a65]'
  };

  return (
    <button
      type={type}
      className={`button-sheen inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export default Button;

