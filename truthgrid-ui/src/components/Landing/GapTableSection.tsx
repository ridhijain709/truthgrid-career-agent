type Priority = 'Critical' | 'High' | 'Medium';

interface GapRow {
  area: string;
  yourScore: string;
  top1Score: string;
  gap: string;
  priority: Priority;
}

const rows: GapRow[] = [
  { area: 'Regulatory Compliance', yourScore: '2.4 / 10', top1Score: '9.1 / 10', gap: '−6.7', priority: 'Critical' },
  { area: 'Evidence Quality', yourScore: '3.1 / 10', top1Score: '9.4 / 10', gap: '−6.3', priority: 'Critical' },
  { area: 'India-Context Relevance', yourScore: '4.0 / 10', top1Score: '8.8 / 10', gap: '−4.8', priority: 'High' },
  { area: 'Vernacular Coverage', yourScore: '1.8 / 10', top1Score: '7.2 / 10', gap: '−5.4', priority: 'High' },
  { area: 'SEO / Discovery', yourScore: '5.2 / 10', top1Score: '9.0 / 10', gap: '−3.8', priority: 'Medium' },
  { area: 'Author Credentialing', yourScore: '2.9 / 10', top1Score: '8.5 / 10', gap: '−5.6', priority: 'Critical' },
  { area: 'Conversion Clarity', yourScore: '3.7 / 10', top1Score: '8.7 / 10', gap: '−5.0', priority: 'High' },
];

const badgeClass: Record<Priority, string> = {
  Critical: 'bg-red-900/40 text-red-400',
  High: 'bg-yellow-900/40 text-yellow-400',
  Medium: 'bg-sky-900/40 text-sky-400',
};

export default function GapTableSection() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-sky-400 text-xs font-bold tracking-widest uppercase mb-1">Gap Table</div>
        <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Critical gaps vs. Top 1% benchmark</h2>
        <p className="text-slate-400 mb-8 max-w-xl">
          Most India healthcare content teams are operating at 30–40% of what&apos;s achievable. Here&apos;s where the gaps are.
        </p>
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-900/20 text-sky-400 text-xs font-bold tracking-widest uppercase">
                <th className="text-left px-4 py-3">Content Area</th>
                <th className="text-left px-4 py-3">Your Avg Score</th>
                <th className="text-left px-4 py-3">Top 1% Score</th>
                <th className="text-left px-4 py-3">Gap</th>
                <th className="text-left px-4 py-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.area} className={i < rows.length - 1 ? 'border-b border-slate-700' : ''}>
                  <td className="px-4 py-3 font-medium">{row.area}</td>
                  <td className="px-4 py-3 text-slate-400">{row.yourScore}</td>
                  <td className="px-4 py-3 text-green-400">{row.top1Score}</td>
                  <td className="px-4 py-3 text-red-400 font-semibold">{row.gap}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass[row.priority]}`}>
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
