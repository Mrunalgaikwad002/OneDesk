export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-fuchsia-50 to-white" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-200 blur-3xl opacity-60" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pink-200 blur-3xl opacity-60" />

      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-3 py-1 text-xs font-medium">Built for remote teams</span>
          <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold tracking-tight">
            <span className="relative inline-block">
              <span className="absolute -inset-3 -z-10 rounded-full bg-gradient-to-r from-indigo-400/30 to-fuchsia-400/30 blur-xl" />
              <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
                OneDesk
              </span>
            </span>
            <span className="block text-gray-900">Collaborate in real time — all in one place.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
            Human-friendly tools that help your team create, meet, and deliver — together.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a href="#" className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-white font-medium hover:opacity-90 shadow-lg">
              Create your workspace
            </a>
            <a href="#features" className="inline-flex items-center justify-center rounded-lg border px-6 py-3 font-medium hover:bg-gray-50">
              Explore features
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="rounded-xl border p-4 bg-white/70">Low‑latency WebRTC</div>
            <div className="rounded-xl border p-4 bg-white/70">Conflict‑free Docs</div>
            <div className="rounded-xl border p-4 bg-white/70">Live Task Boards</div>
            <div className="rounded-xl border p-4 bg-white/70">Secure Roles</div>
          </div>
        </div>
      </div>
    </section>
  );
}


