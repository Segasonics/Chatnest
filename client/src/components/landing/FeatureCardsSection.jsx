function FeatureCardsSection() {
  const features = [
    ['Instant Replies', 'Keyword and intent-based auto-responses in seconds.'],
    ['Flow Builder', 'Build menu bots with node-based logic and previews.'],
    ['Lead Capture', 'Collect names, interests, and preferred schedules.'],
    ['Reminders', 'Schedule and send follow-up reminders automatically.'],
    ['Analytics', 'Track volume, reply rate, and conversion trends.'],
    ['Team Access', 'Collaborate in shared workspaces with role control.']
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="font-display text-3xl font-bold text-white">Core Features</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map(([title, desc]) => (
          <article key={title} className="glass-panel electric-border rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-glow">
            <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-300">{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeatureCardsSection;
