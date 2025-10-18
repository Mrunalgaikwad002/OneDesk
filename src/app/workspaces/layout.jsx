"use client";
import Sidebar from "../../features/dashboard/components/Sidebar";

export default function WorkspaceLayout({ children }) {
  const onLogout = () => {
    try { localStorage.removeItem('token'); } catch {}
    if (typeof window !== 'undefined') window.location.replace('/login');
  };
  return (
    <div className="min-h-screen flex">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 flex flex-col">
        <div className="h-16 border-b flex items-center px-6 justify-between bg-white/80 backdrop-blur-sm">
          <div className="font-semibold text-gray-800 text-lg">Workspaces</div>
        </div>
        <div className="flex-1 p-0 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}


