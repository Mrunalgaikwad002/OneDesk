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
          <div className="fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome{user ? `, ${user.fullName || user.email}` : ''} 👋
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Quick links to get started</p>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="/workspaces" className="card-modern p-6 group">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  🏢
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Workspaces</div>
                  <p className="text-sm text-gray-600">Create or open your team spaces</p>
                </div>
              </div>
            </a>
            <a href="/documents" className="card-modern p-6 group">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  📝
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Documents</div>
                  <p className="text-sm text-gray-600">Collaborate in real-time</p>
                </div>
              </div>
            </a>
            <a href="/tasks" className="card-modern p-6 group">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  ✅
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Tasks</div>
                  <p className="text-sm text-gray-600">Manage sprints and todos</p>
                </div>
              </div>
            </a>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="card-modern p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">Recent Activity</h3>
                {recent.workspace && (
                  <a className="text-sm btn-gradient-primary px-3 py-1 rounded-full" href={`/workspaces/${recent.workspace.id}`}>
                    Open {recent.workspace.name}
                  </a>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                    📄
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Last Document</div>
                    <div className="text-sm text-gray-600">{recent.doc ? recent.doc.title : 'No documents yet'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    💬
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Recent Message</div>
                    <div className="text-sm text-gray-600">{recent.message ? recent.message.content.slice(0, 50) + '...' : 'No messages yet'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-modern p-6">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a href="/workspaces" className="btn-gradient-primary w-full px-4 py-3 rounded-lg text-center block">
                  + Create Workspace
                </a>
                <a href="/tasks" className="btn-gradient-secondary w-full px-4 py-3 rounded-lg text-center block">
                  + New Task
                </a>
                <a href="/documents" className="w-full px-4 py-3 rounded-lg text-center block border-2 border-dashed border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                  + New Document
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


