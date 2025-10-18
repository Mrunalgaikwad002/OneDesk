
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
      // If it's a network error (backend not running), show demo rooms
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        console.log('Backend unavailable, showing demo rooms');
        setRooms([
          { id: 'demo-room-1', name: 'General', type: 'general', createdAt: new Date().toISOString() },
          { id: 'demo-room-2', name: 'Development', type: 'group', createdAt: new Date().toISOString() },
          { id: 'demo-room-3', name: 'Design', type: 'group', createdAt: new Date().toISOString() }
        ]);
      }
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
    console.log('Create room clicked, name:', name);
    if (!name.trim()) {
      console.log('No name provided');
      return;
    }
    
    if (workspaceId === 'demo-workspace') {
      console.log('Creating demo room');
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
      console.log('Creating real room via API');
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
      // If backend is unavailable, create a local demo room
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        console.log('Backend unavailable, creating local demo room');
        const newRoom = { 
          id: `demo-room-${Date.now()}`, 
          name: name.trim(), 
          type: 'group',
          createdAt: new Date().toISOString()
        };
        setRooms([newRoom, ...rooms]);
        setName("");
      } else {
        alert(`Failed to create room: ${err.message}`);
      }
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
      <form onSubmit={createRoom} className="flex items-center gap-3">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="New room name" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 shadow-sm" />
        <button type="submit" className="rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2">Create</button>
      </form>
      <div className="mt-4 divide-y divide-gray-100">
        {(rooms.length ? rooms : [
          { id: 'demo-room-1', name: 'General', type: 'general' },
          { id: 'demo-room-2', name: 'Development', type: 'group' },
          { id: 'demo-room-3', name: 'Random', type: 'group' }
        ]).map(r => (
          <button key={r.id} onClick={()=>onJoin(r)} className="w-full flex items-center justify-between rounded-md px-2 py-3 text-left transition-colors hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none">
            <div>
              <div className="font-medium text-gray-900">{r.name}</div>
              <div className="text-xs text-gray-500 capitalize">{r.type}</div>
            </div>
            <div className="flex items-center gap-1">
              {/* presence chips (mock dot if no socket presence yet) */}
              <span title="online" className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${Object.keys(presence).length? 'bg-green-500':'bg-gray-300'}`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}


