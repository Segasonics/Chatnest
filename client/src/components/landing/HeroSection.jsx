import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-24">
      <div className="absolute inset-0 bg-mesh opacity-80" aria-hidden="true" />
      <div className="absolute -left-20 top-24 h-60 w-60 animate-pulseGlow rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute right-0 top-40 h-56 w-56 animate-float rounded-full bg-green-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <p className="mb-4 inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
          AI-native WhatsApp automation
        </p>
        <h1 className="font-display text-4xl font-extrabold leading-tight text-white md:text-6xl">
          Turn WhatsApp into your <span className="bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">24/7 revenue engine</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-200">
          Connect your business number, launch intelligent flows, capture leads, and automate replies with analytics you can trust.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/auth/register" className="button-sheen rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-3 text-sm font-semibold text-white shadow-glow">
            Start Free Trial
          </Link>
          <a href="#demo" className="rounded-xl border border-slate-500 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-emerald-300">
            See Demo
          </a>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

