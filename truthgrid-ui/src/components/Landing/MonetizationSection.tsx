const metrics = [
  {
    value: '₹18L+',
    color: 'text-green-400',
    title: 'Avg. Annual Organic Revenue Uplift',
    desc: 'For a mid-size wellness brand moving from 3.0 to 7.5 TruthScore on their top 20 pages.',
  },
  {
    value: '40%',
    color: 'text-sky-400',
    title: 'Reduction in Content Compliance Risk',
    desc: 'Brands using TruthGrid scoring reduce the chance of ASCI / CDSCO notices by 40% within 6 months.',
  },
  {
    value: '3x',
    color: 'text-yellow-400',
    title: 'Patient Trust Signal Improvement',
    desc: 'Credentialed, evidence-backed content earns 3x more patient inquiries compared to generic wellness copy.',
  },
];

export default function MonetizationSection() {
  return (
    <section className="py-16 bg-slate-800/40">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-sky-400 text-xs font-bold tracking-widest uppercase mb-1">Monetization</div>
        <h2 className="text-3xl font-extrabold mb-2 tracking-tight">How TruthGrid creates measurable ROI</h2>
        <p className="text-slate-400 mb-8 max-w-xl">
          For India healthcare brands, better content directly equals more patients, prescriptions, and product sales.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {metrics.map((m) => (
            <div key={m.title} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className={`text-3xl font-black mb-2 ${m.color}`}>{m.value}</div>
              <h3 className="font-bold text-base mb-2">{m.title}</h3>
              <p className="text-slate-400 text-sm">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
