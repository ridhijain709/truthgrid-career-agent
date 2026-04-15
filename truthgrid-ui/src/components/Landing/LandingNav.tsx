import Link from 'next/link';

export default function LandingNav() {
  return (
    <nav className="border-b border-slate-700 py-4 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-50">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        <div className="text-xl font-black tracking-tight text-sky-400">
          Truth<span className="text-green-400">Grid</span>
        </div>
        <Link
          href="#audit"
          className="bg-sky-400 text-slate-900 font-bold px-5 py-2 rounded-md text-sm hover:opacity-85 transition-opacity"
        >
          Request a Content Audit
        </Link>
      </div>
    </nav>
  );
}
