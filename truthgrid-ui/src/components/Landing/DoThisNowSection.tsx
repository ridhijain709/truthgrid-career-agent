const actions = [
  {
    num: '1',
    title: 'Run a TruthGrid Demo Audit on your homepage',
    desc: "Takes 5 minutes. You'll see your trust score, top 3 compliance gaps, and what the #1 competitor is doing differently.",
  },
  {
    num: '2',
    title: 'List every medical claim on your top 5 pages. Source each one.',
    desc: '"Boosts immunity" is not a claim. "Shown to increase NK cell activity by 34% in a 2022 AIIMS study" is. Rewrite accordingly.',
  },
  {
    num: '3',
    title: 'Add doctor/specialist attribution to your top-traffic pages',
    desc: 'Even one named, credentialed author lifts trust scores significantly. Use Dr. [Name], [Speciality], [Hospital/Reg No.].',
  },
  {
    num: '4',
    title: 'Pick one condition. Write the definitive India-specific guide.',
    desc: 'Choose the condition most relevant to your product. Go 3x deeper than any existing article. Target India-specific statistics, diets, access challenges.',
  },
  {
    num: '5',
    title: 'Request a full TruthGrid Content Audit',
    desc: 'Get a detailed 40-page report covering all pages, scores, competitor gaps, and a prioritised fix list ready for your content team.',
  },
];

export default function DoThisNowSection() {
  return (
    <section id="demo" className="py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-sky-400 text-xs font-bold tracking-widest uppercase mb-1">Do This Now</div>
        <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Your 7-day action plan</h2>
        <p className="text-slate-400 mb-8 max-w-xl">
          No budget needed. Start with what you have. These moves separate growing healthcare brands from stagnant ones.
        </p>
        <div className="space-y-3">
          {actions.map((action) => (
            <div key={action.num} className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex gap-4">
              <div className="text-xl font-black text-sky-400 min-w-[2rem]">{action.num}</div>
              <div>
                <h4 className="font-bold text-base mb-1">{action.title}</h4>
                <p className="text-slate-400 text-sm">{action.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
