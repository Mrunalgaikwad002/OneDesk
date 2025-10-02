"use client";
import { useEffect, useState } from "react";
import { apiPost } from "../../../lib/api";

export default function AuthCallback() {
  const [msg, setMsg] = useState("Finishing sign-in...");

  useEffect(() => {
    try {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const accessToken = params.get('access_token');
      if (!accessToken) {
        setMsg('Missing access token.');
        return;
      }
      (async () => {
        try {
          const res = await apiPost('/api/auth/oauth', { accessToken });
          localStorage.setItem('token', res.token);
          window.location.replace('/dashboard');
        } catch (e) {
          setMsg(e.message || 'OAuth failed');
        }
      })();
    } catch (e) {
      setMsg('OAuth error');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-gray-800">{msg}</div>
    </div>
  );
}


