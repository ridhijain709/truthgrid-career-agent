import Link from 'next/link';

export default function HeroSection() {
  return (
    <header className="py-20 text-center" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.12) 0%, transparent 70%)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="inline-block bg-purple-900/40 border border-purple-500/40 text-purple-300 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
          🏥 India Healthcare Content Intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-5">
          Your healthcare content is{' '}
          <span className="bg-gradient-to-r from-sky-400 to-green-400 bg-clip-text text-transparent">
            losing patients
          </span>{' '}
          to competitors who score higher.
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-lg mb-10">
          TruthGrid scores, benchmarks, and rebuilds India&apos;s healthcare, wellness &amp; pharma content — so your brand ranks, converts, and complies.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="#demo"
            className="bg-sky-400 text-slate-900 font-bold px-8 py-3 rounded-lg text-base hover:opacity-85 transition-opacity"
          >
            🚀 Try the Demo
          </Link>
          <Link
            href="#audit"
            className="border border-slate-600 text-slate-100 font-semibold px-8 py-3 rounded-lg text-base hover:border-sky-400 transition-colors"
          >
            📋 Request a Content Audit
          </Link>
          <a
            href="/TruthGrid_Brutal_Analysis_Top1Percent.html"
            className="border border-green-500 text-green-400 font-semibold px-8 py-3 rounded-lg text-base hover:bg-green-500/10 transition-colors"
            download
          >
            ⬇ Download the Report
          </a>
        </div>
      </div>
    </header>
  );
}
