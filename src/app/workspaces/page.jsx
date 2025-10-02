"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = getToken();

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const res = await apiGet('/api/workspaces', token);
        const list = res.workspaces || [];
        // fetch member counts in parallel
        const withCounts = await Promise.all(list.map(async (w) => {
          try {
            const members = await apiGet(`/api/users/workspace/${w.id}/members`, token);
            return { ...w, memberCount: (members.members || []).length };
          } catch {
            return { ...w, memberCount: 0 };
          }
        }));
        setWorkspaces(withCounts);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (!token) {
      window.location.replace('/login');
    } else {
      load();
    }
  }, [token]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await apiPost('/api/workspaces', { name }, token);
      setWorkspaces([res.workspace, ...workspaces]);
      setName("");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Your Workspaces</h1>
          <form onSubmit={onCreate} className="flex items-center gap-2">
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="New workspace name" className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button className="rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90">Create</button>
          </form>
        </div>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : workspaces.length === 0 ? (
            <div className="text-gray-600">No workspaces yet. Create your first one.</div>
          ) : (
            workspaces.map(ws => (
              <a key={ws.id} href={`/workspaces/${ws.id}`} className="rounded-lg border p-4 hover:shadow-sm block">
                <h3 className="font-semibold text-gray-900">{ws.name}</h3>
                {ws.description && <p className="text-sm text-gray-900 mt-1">{ws.description}</p>}
                <div className="mt-2 text-xs text-gray-700">Created: {new Date(ws.createdAt || ws.created_at).toLocaleDateString()}</div>
                <div className="text-xs text-gray-700">Members: {ws.memberCount ?? '—'}</div>
                <div className="mt-1 text-xs text-gray-700">Role: {ws.role}</div>
              </a>
            ))
          )}
        </div>

        {(!loading && workspaces.length===0) && (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="/workspaces/demo-workspace" className="rounded-lg border p-4 bg-white block hover:shadow-sm">
              <h3 className="font-semibold text-gray-900">Demo Workspace</h3>
              <p className="text-sm text-gray-900 mt-1">Example description to show layout.</p>
              <div className="mt-2 text-xs text-gray-700">Created: {new Date().toLocaleDateString()}</div>
              <div className="text-xs text-gray-700">Members: 3</div>
              <div className="mt-3 text-xs text-gray-700">Click to open the demo workspace.</div>
            </a>
          </div>
        )}

        <div className="mt-8 rounded-lg border p-4">
          <h2 className="text-lg font-semibold text-gray-900">Join workspace</h2>
          <p className="text-sm text-gray-900 mt-1">Ask an admin for an invite link. Clicking it will add you automatically.</p>
        </div>
      </div>
    </div>
  );
}


