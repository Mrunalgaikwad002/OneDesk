"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../features/dashboard/components/Sidebar";
import { apiGet, apiPost } from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState({ doc: null, message: null, workspace: null });
  const [creatingWs, setCreatingWs] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (!token) {
      window.location.replace('/login');
      return;
    }
    (async () => {
      try {
        const res = await apiGet('/api/auth/me', token);
        setUser(res.user);
        // load recent workspace activity
        const wsRes = await apiGet('/api/workspaces', token);
        const ws = wsRes.workspaces?.[0];
        if (ws) {
          // recent document
          try {
            const docs = await apiGet(`/api/documents/workspace/${ws.id}`, token);
            const recentDoc = docs.documents?.[0] || null;
            // recent chat message from first room
            let recentMsg = null;
            const rooms = await apiGet(`/api/chat/workspace/${ws.id}/rooms`, token);
            const room = rooms.rooms?.[0];
            if (room) {
              const msgs = await apiGet(`/api/chat/rooms/${room.id}/messages?limit=1`, token);
              recentMsg = (msgs.messages || [])[0] || null;
            }
            setRecent({ doc: recentDoc, message: recentMsg, workspace: ws });
          } catch {}
        }
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.replace('/login');
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1">
        <div className="h-16 border-b flex items-center px-4 justify-between">
          <div className="font-medium text-gray-800">Dashboard</div>
        </div>
        <div className="px-6 py-6">
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          <h1 className="text-2xl font-bold text-gray-900">Welcome{user ? `, ${user.fullName || user.email}` : ''} 👋</h1>
          <p className="text-gray-900 mt-2">Quick links</p>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="/workspaces" className="rounded-lg border p-4 hover:shadow-sm">
              <div className="font-semibold text-gray-900">Workspaces</div>
              <p className="text-sm text-gray-900">Create or open your team spaces.</p>
            </a>
            <a href="/documents" className="rounded-lg border p-4 hover:shadow-sm">
              <div className="font-semibold text-gray-900">Documents</div>
              <p className="text-sm text-gray-900">Collaborate in real-time.</p>
            </a>
            <a href="/tasks" className="rounded-lg border p-4 hover:shadow-sm">
              <div className="font-semibold text-gray-900">Tasks</div>
              <p className="text-sm text-gray-900">Manage sprints and todos.</p>
            </a>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">Recent activity</div>
                {recent.workspace && (
                  <a className="text-xs text-indigo-600 hover:underline" href={`/workspaces/${recent.workspace.id}`}>Open {recent.workspace.name}</a>
                )}
              </div>
              <div className="mt-3 text-sm text-gray-900 space-y-2">
                <div>
                  <span className="font-medium">Last document:</span> {recent.doc ? recent.doc.title : '—'}
                </div>
                <div>
                  <span className="font-medium">Recent message:</span> {recent.message ? recent.message.content : '—'}
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="font-semibold text-gray-900">Shortcuts</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/workspaces" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 text-gray-900">+ Create Workspace</a>
                <a href="/tasks" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 text-gray-900">+ New Task</a>
                <a href="/documents" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 text-gray-900">+ New Document</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


