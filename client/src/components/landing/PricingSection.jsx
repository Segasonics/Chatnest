function PricingSection() {
  const tiers = [
    { name: 'Free', price: '$0', messages: '100 msgs/mo', cta: 'Start Free' },
    { name: 'Pro', price: '$49', messages: '10,000 msgs/mo', cta: 'Go Pro', featured: true },
    { name: 'Team', price: '$149', messages: '50,000 msgs/mo', cta: 'Contact Sales' }
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="font-display text-3xl font-bold text-white">Pricing</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className={`rounded-2xl p-5 ${
              tier.featured
                ? 'electric-border bg-gradient-to-b from-emerald-600/20 to-green-500/12 shadow-glow'
                : 'glass-panel'
            }`}
          >
            <h3 className="font-display text-xl text-white">{tier.name}</h3>
            <p className="mt-3 text-3xl font-bold text-white">{tier.price}</p>
            <p className="mt-2 text-sm text-slate-300">{tier.messages}</p>
            <button className="mt-5 w-full rounded-xl bg-slate-100/10 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-100/20">
              {tier.cta}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PricingSection;

