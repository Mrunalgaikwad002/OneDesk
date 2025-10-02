const features = [
  {
    title: 'Real-time Docs',
    desc: 'CRDT-powered editing with presence cursors and snapshots.',
  },
  {
    title: 'Video Conferencing',
    desc: 'Low-latency calls, screen-share, and group rooms.',
  },
  {
    title: 'Task Boards',
    desc: 'Kanban boards with drag-and-drop and real-time sync.',
  },
  {
    title: 'Team Chat',
    desc: 'Channels, mentions, typing indicators, and message history.',
  },
  {
    title: 'Whiteboard',
    desc: 'Sketch, plan, and export diagrams collaboratively.',
  },
  {
    title: 'Secure Auth',
    desc: 'Role-based access with Supabase Auth and JWT.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-14">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Everything remote teams need</h2>
        <p className="mt-2 text-center text-gray-600 max-w-2xl mx-auto">Built on real-time tech to keep everyone on the same page.</p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => (
            <div key={f.title} className="rounded-2xl border p-5 hover:shadow-lg transition bg-white/90">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-gray-600">{f.desc}</p>
              <div className="mt-3 h-1 w-14 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


