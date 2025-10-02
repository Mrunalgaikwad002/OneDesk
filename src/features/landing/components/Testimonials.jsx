const testimonials = [
  {
    name: 'Aditi',
    role: 'Product Manager',
    quote: 'We ship faster because everyone is literally on the same page.'
  },
  {
    name: 'Rahul',
    role: 'Engineering Lead',
    quote: 'Docs, tasks, and calls in one place cut our tool-switching in half.'
  },
  {
    name: 'Sara',
    role: 'Designer',
    quote: 'The live whiteboard is perfect for remote design reviews.'
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-indigo-50/40">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Loved by modern teams</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-gray-700">“{t.quote}”</p>
              <div className="mt-4 text-sm text-gray-500">
                <span className="font-semibold text-gray-800">{t.name}</span> · {t.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


