import { useState } from 'react';

const demoScript = {
  start: {
    text: 'Welcome to Chat Nest bot. Reply 1 for Pricing, 2 for Location, 3 for Booking.',
    options: [
      { key: '1', reply: 'Our Pro plan starts at $49/month.' },
      { key: '2', reply: 'We are at 90 Market Street, open 9am-7pm.' },
      { key: '3', reply: 'Great, share your preferred time in ISO format.' }
    ]
  }
};

function ChatSimulator() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', body: demoScript.start.text },
    { id: 2, from: 'user', body: '1' },
    { id: 3, from: 'bot', body: demoScript.start.options[0].reply }
  ]);
  const [input, setInput] = useState('');

  const onSend = () => {
    if (!input.trim()) return;
    const userMessage = { id: Date.now(), from: 'user', body: input };
    const option = demoScript.start.options.find((opt) => opt.key === input.trim());
    const botMessage = {
      id: Date.now() + 1,
      from: 'bot',
      body: option ? option.reply : 'Try 1, 2, or 3 in this demo.'
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput('');
  };

  return (
    <div className="glass-panel electric-border rounded-2xl p-4">
      <div className="mb-3 text-sm font-semibold text-emerald-200">Interactive Chat Simulator</div>
      <div className="chat-surface h-64 space-y-2 overflow-y-auto rounded-xl p-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.from === 'bot' ? 'bubble-in' : 'bubble-out ml-auto'}`}>
            {msg.body}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          className="w-full rounded-xl border border-[#2a3942] bg-[#121d24] px-3 py-2 text-sm"
          placeholder="Type 1 / 2 / 3"
        />
        <button onClick={onSend} className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-2 text-sm font-semibold text-white">
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatSimulator;

