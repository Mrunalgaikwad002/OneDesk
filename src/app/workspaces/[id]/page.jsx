"use client";
import { useEffect, useState, use } from "react";
import { apiGet } from "../../../lib/api";
import { getToken } from "../../../lib/auth";
import ChatPanel from "./ChatPanel";
import ChatRooms from "./ChatRooms";
import TasksPanel from "./TasksPanel";
import DocsPanel from "./DocsPanel";
import WhiteboardPanel from "./WhiteboardPanel";
import WhiteboardKonva from "./WhiteboardKonva";
import VideoPanel from "./VideoPanel";

const tabs = [
  { key: 'chat', label: 'Chat' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'docs', label: 'Documents' },
  { key: 'whiteboard', label: 'Whiteboard' },
  { key: 'video', label: 'Video' }
];

export default function WorkspacePage({ params }) {
  const { id } = use(params);
  const [ws, setWs] = useState(null);
  const [active, setActive] = useState('chat');
  const [error, setError] = useState('');
  const token = getToken();

  useEffect(() => {
    if (!token) {
      window.location.replace('/login');
      return;
    }
    if (id === 'demo-workspace') {
      setWs({ id: 'demo-workspace', name: 'Demo Workspace', description: 'Mock workspace for testing', userRole: 'owner' });
    } else {
      (async () => {
        try {
          const res = await apiGet(`/api/workspaces/${id}`, token);
          setWs(res.workspace);
        } catch (e) {
          setError(e.message);
        }
      })();
    }
  }, [id, token]);

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {ws ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{ws.name}</h1>
                {ws.description && <p className="text-sm text-gray-600 mt-1">{ws.description}</p>}
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">Role: {ws.userRole}</span>
            </div>

            <div className="mt-6 border-b flex gap-2">
              {tabs.map(t => (
                <button key={t.key} onClick={()=>setActive(t.key)} className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${active===t.key? 'border-indigo-600 text-indigo-700':'border-transparent text-gray-600 hover:text-gray-900'}`}>{t.label}</button>
              ))}
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {active==='chat' && (
                <>
                  <div className="md:col-span-1">
                    <ChatRooms workspaceId={ws.id} onJoin={(room)=>setWs(prev=>({...prev, activeRoom: room}))} />
                  </div>
                  <div className="md:col-span-2">
                    <ChatPanel roomId={ws?.activeRoom?.id || ws?.generalRoomId || ws?.id} />
                  </div>
                </>
              )}
              {active==='tasks' && (
                <TasksPanel workspaceId={ws.id} />
              )}
              {active==='docs' && (
                <DocsPanel workspaceId={ws.id} />
              )}
              {active==='whiteboard' && (
                <WhiteboardPanel />
              )}
              {active==='video' && (
                <VideoPanel workspaceId={ws.id} />
              )}
            </div>
          </>
        ) : error ? (
          <div className="text-rose-600">{error}</div>
        ) : (
          <div className="text-gray-600">Loading...</div>
        )}
      </div>
    </div>
  );
}


