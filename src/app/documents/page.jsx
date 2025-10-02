"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../features/dashboard/components/Sidebar";
import { apiGet } from "../../lib/api";
import { getToken } from "../../lib/auth";
import DocsPanel from "../workspaces/[id]/DocsPanel";

export default function DocumentsPage() {
  const onLogout = () => { try { localStorage.removeItem('token'); } catch {}; window.location.replace('/login'); };
  const token = getToken();
  const [workspaces, setWorkspaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { window.location.replace('/login'); return; }
    (async () => {
      try {
        const res = await apiGet('/api/workspaces', token).catch(()=>({ workspaces: [] }));
        const list = res.workspaces || [];
        setWorkspaces(list);
        if (list.length) {
          setSelected(list[0].id);
        } else {
          // fallback demo workspace so DocsPanel renders demo docs
          setSelected('demo-workspace');
        }
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1">
        <div className="h-16 border-b flex items-center px-4 justify-between">
          <div className="font-medium text-gray-800">Documents</div>
        </div>
        <div className="px-6 py-6">
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm text-gray-900">Workspace</label>
            <select value={selected || ''} onChange={(e)=>setSelected(e.target.value)} className="rounded-md border px-2 py-1 text-sm">
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          {selected ? (
            <DocsPanel workspaceId={selected} />
          ) : (
            <div className="text-gray-900">No workspaces. Create one first in the Workspaces page.</div>
          )}
        </div>
      </main>
    </div>
  );
}


