import Badge from '../common/Badge';

function RulesTable({ rules = [], onEdit, onDelete }) {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/60 text-slate-300">
          <tr>
            <th className="px-4 py-3">Trigger</th>
            <th className="px-4 py-3">Response</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule._id} className="border-t border-slate-800/80">
              <td className="px-4 py-3 text-slate-100">
                {rule.triggerType}: <span className="text-emerald-300">{rule.triggerValue}</span>
              </td>
              <td className="px-4 py-3 text-slate-300">
                {rule.responseType === 'asset'
                  ? rule.responseAssetId?.fileName || 'Asset selected'
                  : rule.responseText}
              </td>
              <td className="px-4 py-3 text-slate-300 capitalize">{rule.responseType}</td>
              <td className="px-4 py-3">
                <Badge tone={rule.isActive ? 'success' : 'warning'}>{rule.isActive ? 'Active' : 'Paused'}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button className="text-emerald-300" onClick={() => onEdit(rule)}>
                    Edit
                  </button>
                  <button className="text-rose-300" onClick={() => onDelete(rule)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RulesTable;

