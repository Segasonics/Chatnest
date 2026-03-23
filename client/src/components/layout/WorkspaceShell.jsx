import Sidebar from './Sidebar';

function WorkspaceShell({ workspaceId, title, children, rightSlot }) {
  return (
    <div className="app-shell-bg min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-white md:text-3xl">{title}</h1>
          {rightSlot}
        </div>
        <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
          <Sidebar workspaceId={workspaceId} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceShell;
