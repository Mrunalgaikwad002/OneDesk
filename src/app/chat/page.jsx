"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../features/dashboard/components/Sidebar";
import { apiGet } from "../../lib/api";
import { getToken } from "../../lib/auth";
import ChatRooms from "../workspaces/[id]/ChatRooms";
import ChatPanel from "../workspaces/[id]/ChatPanel";

export default function ChatHome() {
  const onLogout = () => { try { localStorage.removeItem('token'); } catch {}; window.location.replace('/login'); };
  const token = getToken();
  const [workspaces, setWorkspaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    if (!token) { window.location.replace('/login'); return; }
    (async () => {
      try {
        const res = await apiGet('/api/workspaces', token);
        const list = res.workspaces || [];
        setWorkspaces(list);
        if (list.length) setSelected(list[0].id); else setSelected('demo-workspace');
      } catch {
        setSelected('demo-workspace');
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1">
        <div className="h-16 border-b flex items-center px-4 justify-between">
          <div className="font-medium text-gray-900">Chat</div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-900">Workspace</label>
            <select value={selected || ''} onChange={(e)=>{ setSelected(e.target.value); setActiveRoom(null); }} className="rounded-md border px-2 py-1 text-sm text-gray-900">
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
              {!workspaces.length && <option value="demo-workspace">Demo Workspace</option>}
            </select>
          </div>
        </div>
        <div className="px-6 py-6 grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <ChatRooms workspaceId={selected} onJoin={setActiveRoom} />
          </div>
          <div className="md:col-span-2">
            <ChatPanel roomId={activeRoom?.id || 'demo-room-1'} />
          </div>
        </div>
      </main>
    </div>
  );
}


