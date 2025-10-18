"use client";
import { useState } from "react";
import { apiPost } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiPost("/api/auth/login", { email, password });
      localStorage.setItem("token", res.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border p-6 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
        <p className="text-sm text-gray-700 mt-1">Welcome back to <span className="font-semibold">OneDesk</span>.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input type="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Password</label>
            <input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="mt-1 w-full rounded-md border px-3 py-2 bg-white text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button disabled={loading} className="w-full rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white py-2 font-medium hover:opacity-90 disabled:opacity-60">
            {loading ? "Logging in..." : "Log in"}
          </button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>
          <button type="button" onClick={async()=>{
            if (!supabase) {
              alert('Supabase not configured on frontend');
              return;
            }
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/auth/callback` }
            });
          }} className="w-full inline-flex items-center justify-center rounded-md border py-2 font-medium hover:bg-gray-50">
            <span>Continue with Google</span>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-4">No account? <a className="text-indigo-600 hover:underline" href="/signup">Sign up</a></p>
      </form>
    </div>
  );
}


