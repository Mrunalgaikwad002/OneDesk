"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import { getToken } from "../../../lib/auth";
import { getSocket } from "../../../lib/socket";

export default function ChatRooms({ workspaceId, onJoin }) {
  const token = getToken();
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [presence, setPresence] = useState({}); // userId -> status
  const socket = getSocket(token);

  const loadRooms = async () => {
    if (workspaceId === 'demo-workspace') {
      setRooms([
        { id: 'demo-room-1', name: 'General', type: 'general' },
        { id: 'demo-room-2', name: 'Development', type: 'group' },
        { id: 'demo-room-3', name: 'Random', type: 'group' }
      ]);
      return;
    }
    try {
      const res = await apiGet(`/api/chat/workspace/${workspaceId}/rooms`, token);
      setRooms(res.rooms || []);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  useEffect(() => {
    if (workspaceId) loadRooms();
  }, [workspaceId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_workspaces', [workspaceId]);
    const onOnline = ({ userId, workspaceId: ws }) => { if (ws===workspaceId) setPresence(p=>({ ...p, [userId]: 'online' })); };
    const onOffline = ({ userId, workspaceId: ws }) => { if (ws===workspaceId) setPresence(p=>({ ...p, [userId]: 'offline' })); };
    const onPresence = ({ userId, status, workspaceId: ws }) => { if (ws===workspaceId) setPresence(p=>({ ...p, [userId]: status })); };
    socket.on('user_online', onOnline);
    socket.on('user_offline', onOffline);
    socket.on('presence_updated', onPresence);
    return () => {
      socket.off('user_online', onOnline);
      socket.off('user_offline', onOffline);
      socket.off('presence_updated', onPresence);
    };
  }, [socket, workspaceId]);

  const createRoom = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (workspaceId === 'demo-workspace') {
      const newRoom = { 
        id: `demo-room-${Date.now()}`, 
        name: name.trim(), 
        type: 'group',
        createdAt: new Date().toISOString()
      };
      setRooms([newRoom, ...rooms]);
      setName("");
      return;
    }
    
    try {
      const res = await apiPost(`/api/chat/workspace/${workspaceId}/rooms`, { 
        name: name.trim(), 
        type: 'group' 
      }, token);
      
      if (res.room) {
        setRooms([res.room, ...rooms]);
        setName("");
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create room. Please try again.');
    }
  };

  return (
    <div className="rounded-lg border p-3 bg-white">
      <form onSubmit={createRoom} className="flex items-center gap-2">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="New room name" className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button className="rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-3 py-2 text-sm">Create</button>
      </form>
      <div className="mt-3 divide-y">
        {(rooms.length ? rooms : [
          { id: 'demo-room-1', name: 'General', type: 'general' },
          { id: 'demo-room-2', name: 'Development', type: 'group' },
          { id: 'demo-room-3', name: 'Random', type: 'group' }
        ]).map(r => (
          <button key={r.id} onClick={()=>onJoin(r)} className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 px-2 rounded">
            <div>
              <div className="font-medium text-gray-900">{r.name}</div>
              <div className="text-xs text-gray-600">{r.type}</div>
            </div>
            <div className="flex items-center gap-1">
              {/* presence chips (mock dot if no socket presence yet) */}
              <span title="online" className={`h-2 w-2 rounded-full ${Object.keys(presence).length? 'bg-green-400':'bg-gray-300'}`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}


