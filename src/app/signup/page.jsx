"use client";
import { useState } from "react";
import { apiPost } from "../../lib/api";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiPost("/api/auth/register", { email, password, fullName });
      localStorage.setItem("token", res.token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border p-6 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-700 mt-1">Join <span className="font-semibold">OneDesk</span> and start collaborating.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-gray-700">Full name</label>
            <input type="text" value={fullName} onChange={(e)=>setFullName(e.target.value)} required className="mt-1 w-full rounded-md border px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full rounded-md border px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="mt-1 w-full rounded-md border px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button disabled={loading} className="w-full rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white py-2 font-medium hover:opacity-90 disabled:opacity-60">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-4">Already have an account? <a className="text-indigo-600 hover:underline" href="/login">Log in</a></p>
      </form>
    </div>
  );
}


