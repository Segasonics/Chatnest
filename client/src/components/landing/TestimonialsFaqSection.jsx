function TestimonialsFaqSection() {
  const faqs = [
    ['Can I switch from mock to real WhatsApp provider?', 'Yes. Provider adapters are swappable, starting with mock and extendable to Meta or Twilio.'],
    ['How secure is auth?', 'Access tokens are short lived and refresh tokens are kept in HttpOnly secure cookies.'],
    ['Can teams collaborate?', 'Team plan supports workspace member access and role-based controls.']
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-display text-2xl text-white">What customers say</h3>
          <p className="mt-4 text-slate-200">
            "Chat Nest replaced manual back-and-forth instantly. Our reply time dropped from 2 hours to 20 seconds."
          </p>
          <p className="mt-2 text-sm text-slate-400">- Sara K., Operations Lead</p>
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-2xl text-white">FAQ</h3>
          {faqs.map(([q, a]) => (
            <article key={q} className="glass-panel rounded-xl p-4">
              <h4 className="font-semibold text-white">{q}</h4>
              <p className="mt-1 text-sm text-slate-300">{a}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsFaqSection;
