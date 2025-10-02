"use client";
import Sidebar from "../../features/dashboard/components/Sidebar";
import TasksMockBoard from "../workspaces/[id]/TasksMockBoard";

export default function TasksHome() {
  const onLogout = () => { try { localStorage.removeItem('token'); } catch {}; window.location.replace('/login'); };
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1">
        <div className="h-16 border-b flex items-center px-4 justify-between">
          <div className="font-medium text-gray-900">Tasks</div>
        </div>
        <div className="px-6 py-6">
          <div className="text-gray-900 mb-3">Demo board (mock data). Open a workspace to use real boards.</div>
          <TasksMockBoard />
        </div>
      </main>
    </div>
  );
}


