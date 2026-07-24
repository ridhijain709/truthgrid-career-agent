const phases = [
  {
    num: '01',
    title: 'Content Audit & Baseline',
    time: 'Days 1–14',
    steps: [
      'TruthGrid audit of top 50 pages',
      'Compliance gap identification',
      'Competitor benchmark report',
      'Priority fix list (quick wins)',
    ],
  },
  {
    num: '02',
    title: 'Compliance & Trust Layer',
    time: 'Days 15–35',
    steps: [
      'Add regulatory disclaimers',
      'Source all medical claims',
      'Author bio credentialing',
      'AYUSH / CDSCO alignment review',
    ],
  },
  {
    num: '03',
    title: 'India Context & Depth',
    time: 'Days 36–60',
    steps: [
      'India-specific condition data',
      'Comorbidity coverage (diabetes, etc.)',
      'Regional diet & lifestyle integration',
      'Vernacular content pilot (Hindi)',
    ],
  },
  {
    num: '04',
    title: 'Scale & Measure',
    time: 'Days 61–90',
    steps: [
      'Publish re-scored content',
      'Track organic ranking lift',
      'Engagement & conversion metrics',
      '90-day TruthGrid re-audit',
    ],
  },
];

export default function RoadmapSection() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-sky-400 text-xs font-bold tracking-widest uppercase mb-1">Top 1% Roadmap</div>
        <h2 className="text-3xl font-extrabold mb-2 tracking-tight">90-day sprint to top-1% healthcare content</h2>
        <p className="text-slate-400 mb-8 max-w-xl">
          Specific, sequenced milestones for India healthcare / wellness / pharma content teams.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {phases.map((phase) => (
            <div key={phase.num} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="text-4xl font-black text-sky-400/20 leading-none mb-1">{phase.num}</div>
              <h3 className="font-bold text-base mb-1">{phase.title}</h3>
              <div className="text-sky-400 text-xs font-semibold mb-4">{phase.time}</div>
              <ul className="space-y-1">
                {phase.steps.map((step) => (
                  <li key={step} className="text-slate-400 text-sm pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-sky-400">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
