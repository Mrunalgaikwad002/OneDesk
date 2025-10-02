export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-indigo-50/50 to-fuchsia-50/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-2xl border bg-white p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Ready to unify your workflow?</h3>
            <p className="mt-2 text-gray-600">Start collaborating with your team in minutes.</p>
          </div>
          <a href="#" className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-white font-medium hover:opacity-90 shadow">
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}


