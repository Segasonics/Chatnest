import { formatDate } from '../../utils/format';

function InboxConversationList({ conversations = [], activeId, onSelect }) {
  return (
    <div className="glass-panel rounded-2xl p-3">
      <h3 className="mb-3 text-sm font-semibold text-[#d1d7db]">Conversations</h3>
      <div className="space-y-2">
        {conversations.map((item) => (
          <button
            key={item._id}
            onClick={() => onSelect(item._id)}
            className={`w-full rounded-xl p-3 text-left transition ${
              item._id === activeId
                ? 'bg-emerald-500/20 ring-1 ring-emerald-300/35'
                : 'bg-[#152028] hover:bg-[#1b2a33]'
            }`}
          >
            <p className="text-sm font-semibold text-white">{item.customerNumber}</p>
            <p className="text-xs text-[#8fa3ad]">{formatDate(item.lastMessageAt)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default InboxConversationList;

