import { NavLink } from 'react-router-dom';

function Sidebar({ workspaceId }) {
  const links = [
    { to: `/w/${workspaceId}`, label: 'Overview', end: true },
    { to: `/w/${workspaceId}/inbox`, label: 'Inbox' },
    { to: `/w/${workspaceId}/rules`, label: 'Rules' },
    { to: `/w/${workspaceId}/flows`, label: 'Flows' },
    { to: `/w/${workspaceId}/leads`, label: 'Leads' },
    { to: `/w/${workspaceId}/knowledge`, label: 'AI Knowledge' },
    { to: `/w/${workspaceId}/analytics`, label: 'Analytics' },
    { to: `/w/${workspaceId}/audit`, label: 'Audit Logs' },
    { to: '/billing', label: 'Billing' },
    { to: '/settings', label: 'Settings' }
  ];

  return (
    <aside className="glass-panel w-full rounded-2xl p-3 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-64 lg:self-start lg:overflow-y-auto">
      <div className="mb-3 px-3 text-xs uppercase tracking-wide text-[#8fa3ad]">Workspace</div>
      <div className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={Boolean(link.end)}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/40 to-green-500/24 text-white ring-1 ring-emerald-300/25'
                  : 'text-[#d1d7db] hover:bg-[#1f2c34] hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;

