import ChatSimulator from './ChatSimulator';

function InteractiveDemoSection() {
  return (
    <section id="demo" className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 className="font-display text-3xl font-bold text-white">Try a live automation preview</h2>
          <p className="mt-3 text-slate-300">
            This simulator mirrors the same rule and flow behavior used in your workspace inbox.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-200">
            <li>- Keyword replies</li>
            <li>- Menu path navigation</li>
            <li>- Structured handoff prompts</li>
          </ul>
        </div>
        <ChatSimulator />
      </div>
    </section>
  );
}

export default InteractiveDemoSection;
