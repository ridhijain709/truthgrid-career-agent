const items = [
  {
    icon: '🔬',
    title: 'Evidence-Backed Claims',
    desc: 'Every factual claim links to a peer-reviewed study, clinical trial, or official guideline. No hedging with "may help."',
  },
  {
    icon: '⚖️',
    title: 'Regulatory Framing',
    desc: 'Content acknowledges CDSCO, FSSAI, and AYUSH boundaries. Compliance isn\'t a blocker — it\'s a trust signal.',
  },
  {
    icon: '🎯',
    title: 'Condition-Specific Depth',
    desc: 'Winning content goes 3 levels deep: condition → mechanism → India-specific context (diet, comorbidities, access).',
  },
  {
    icon: '📱',
    title: 'Vernacular Accessibility',
    desc: 'Hindi, Tamil, Telugu, Marathi adaptations outperform English-only by 3.7x in Tier 2 / Tier 3 city engagement.',
  },
  {
    icon: '👩‍⚕️',
    title: 'Credentialed Authorship',
    desc: 'Content attributed to named doctors or specialists earns 2.4x more trust signals and reduces bounce rate by 31%.',
  },
  {
    icon: '📊',
    title: 'Outcome Transparency',
    desc: 'Realistic, data-backed outcome framing ("60% reduction in 8 weeks in clinical trial") beats vague promises every time.',
  },
];

export default function WhatWorksSection() {
  return (
    <section className="py-16 bg-slate-800/40">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-sky-400 text-xs font-bold tracking-widest uppercase mb-1">What Works</div>
        <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Signals that separate top 1% healthcare content</h2>
        <p className="text-slate-400 mb-8 max-w-xl">
          High-performing brands share these traits. Most India healthcare teams have none of them.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item.title} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-base mb-1">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
