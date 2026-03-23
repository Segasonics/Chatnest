import Badge from '../common/Badge';

function LeadsTable({ leads = [], onStatusChange }) {
  const statuses = ['new', 'qualified', 'booked', 'lost'];

  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/60">
          <tr>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Interest</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id} className="border-t border-slate-800/80">
              <td className="px-4 py-3 text-slate-100">{lead.customerNumber}</td>
              <td className="px-4 py-3 text-slate-200">{lead.name || '-'}</td>
              <td className="px-4 py-3 text-slate-300">{lead.interest || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge tone={lead.status === 'booked' ? 'success' : 'info'}>{lead.status}</Badge>
                  <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead, e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadsTable;
