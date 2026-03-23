function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-slate-400">
        <p>© {new Date().getFullYear()} Chat Nest</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-emerald-300">
            Privacy
          </a>
          <a href="#" className="hover:text-emerald-300">
            Terms
          </a>
          <a href="#" className="hover:text-emerald-300">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

