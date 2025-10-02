"use client";
import Sidebar from "../../features/dashboard/components/Sidebar";
import { useEffect, useState } from "react";
import { apiGet, apiPut } from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function SettingsPage() {
  const onLogout = () => { try { localStorage.removeItem('token'); } catch {}; window.location.replace('/login'); };
  const token = getToken();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!token) { window.location.replace('/login'); return; }
    (async () => {
      try {
        const res = await apiGet('/api/auth/me', token);
        setFullName(res.user?.fullName || "");
        setAvatarUrl(res.user?.avatarUrl || "");
      } catch {}
    })();
  }, [token]);

  const onSave = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPut('/api/auth/profile', { fullName, avatarUrl }, token);
      setMsg('Profile updated');
    } catch (err) {
      setMsg(err.message || 'Update failed');
    }
  };
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1">
        <div className="h-16 border-b flex items-center px-4 justify-between">
          <div className="font-medium text-gray-800">Settings</div>
        </div>
        <div className="px-6 py-6">
          <form onSubmit={onSave} className="max-w-md rounded-2xl border p-4 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm text-gray-700">Full name</label>
                <input value={fullName} onChange={(e)=>setFullName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Avatar URL</label>
                <input value={avatarUrl} onChange={(e)=>setAvatarUrl(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              {msg && <p className="text-sm text-gray-900">{msg}</p>}
              <button className="rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90">Save changes</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}


