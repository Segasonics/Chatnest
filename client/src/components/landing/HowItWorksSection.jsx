function HowItWorksSection() {
  const steps = [
    'Connect WhatsApp',
    'Add rules and menu flows',
    'Capture leads automatically',
    'Send reminders and followups',
    'Track performance in analytics'
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="font-display text-3xl font-bold text-white">How it works</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step} className="glass-panel rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-300">Step {index + 1}</p>
            <p className="mt-2 text-sm text-slate-100">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;

