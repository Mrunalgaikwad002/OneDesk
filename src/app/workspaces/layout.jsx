"use client";
import Sidebar from "../../features/dashboard/components/Sidebar";

export default function WorkspaceLayout({ children }) {
  const onLogout = () => {
    try { localStorage.removeItem('token'); } catch {}
    if (typeof window !== 'undefined') window.location.replace('/login');
  };
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1">
        <div className="h-16 border-b flex items-center px-4 justify-between">
          <div className="font-medium text-gray-800">Workspaces</div>
        </div>
        <div className="px-6 py-6">{children}</div>
      </main>
    </div>
  );
}


