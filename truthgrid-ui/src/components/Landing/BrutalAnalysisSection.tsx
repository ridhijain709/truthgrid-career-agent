const scores = [
  { value: '2.1/10', label: 'Average Trust Score', color: 'text-red-400' },
  { value: '38%', label: 'Content with verifiable claims', color: 'text-yellow-400' },
  { value: '6%', label: 'Meets AYUSH / CDSCO guidelines', color: 'text-red-400' },
  { value: '4x', label: 'ROI for compliant content', color: 'text-green-400' },
];

export default function BrutalAnalysisSection() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-sky-400 text-xs font-bold tracking-widest uppercase mb-1">Brutal Analysis</div>
        <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Where India&apos;s healthcare content stands right now</h2>
        <p className="text-slate-400 mb-8 max-w-xl">
          TruthGrid ran 10,000+ content audits across health, wellness, and pharma brands in India. Here&apos;s what the data says.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scores.map((s) => (
            <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
              <div className={`text-4xl font-black leading-none mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
