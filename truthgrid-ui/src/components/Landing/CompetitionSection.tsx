const competitors = [
  {
    title: '🌐 WebMD / Healthline India Editions',
    desc: 'Fully localized content teams. India-specific condition guides. Trust scores 8.5+. Your brand is invisible next to them on search.',
    borderColor: 'border-red-500/40',
    titleColor: 'text-red-400',
  },
  {
    title: '💊 Pharma Brand Portals',
    desc: 'Apollo, Cipla, Dr. Reddy\'s content teams invest ₹2–5 Cr/year in content. Most SMB healthcare brands spend ₹5–15L. The gap shows.',
    borderColor: 'border-yellow-500/40',
    titleColor: 'text-yellow-400',
  },
  {
    title: '🤖 AI-Generated Content Farms',
    desc: "Low-quality but high-volume AI content is flooding search. Google's EEAT update will destroy these — but only if your content is genuinely better.",
    borderColor: 'border-purple-500/40',
    titleColor: 'text-purple-300',
  },
  {
    title: '✅ TruthGrid-Scored Brands (Opportunity)',
    desc: "Brands that pass TruthGrid's compliance + trust scoring see 40% higher organic reach and 3x better patient engagement in 90 days.",
    borderColor: 'border-green-500/40',
    titleColor: 'text-green-400',
  },
];

export default function CompetitionSection() {
  return (
    <section className="py-16 bg-slate-800/40">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-sky-400 text-xs font-bold tracking-widest uppercase mb-1">Competition</div>
        <h2 className="text-3xl font-extrabold mb-2 tracking-tight">What you&apos;re really competing against</h2>
        <p className="text-slate-400 mb-8 max-w-xl">
          The threat isn&apos;t other local brands. It&apos;s global healthcare content platforms entering India.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {competitors.map((c) => (
            <div key={c.title} className={`bg-slate-800 border ${c.borderColor} rounded-xl p-6`}>
              <h3 className={`font-bold text-base mb-2 ${c.titleColor}`}>{c.title}</h3>
              <p className="text-slate-400 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
