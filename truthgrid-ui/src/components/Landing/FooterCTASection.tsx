import Link from 'next/link';

export default function FooterCTASection() {
  return (
    <>
      <section
        id="audit"
        className="py-20 text-center"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.10) 0%, transparent 70%)' }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Ready to build India&apos;s most trusted healthcare content?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
            Join the content teams already using TruthGrid to score higher, comply faster, and convert better.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="#demo"
              className="bg-sky-400 text-slate-900 font-bold px-8 py-3 rounded-lg text-base hover:opacity-85 transition-opacity"
            >
              🚀 Try the Demo
            </Link>
            <a
              href="mailto:hello@truthgrid.in?subject=Content Audit Request"
              className="border border-slate-600 text-slate-100 font-semibold px-8 py-3 rounded-lg text-base hover:border-sky-400 transition-colors"
            >
              📋 Request a Content Audit
            </a>
            <a
              href="/TruthGrid_Brutal_Analysis_Top1Percent.html"
              className="border border-green-500 text-green-400 font-semibold px-8 py-3 rounded-lg text-base hover:bg-green-500/10 transition-colors"
              download
            >
              ⬇ Download the Report
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-700 py-6 text-center text-slate-500 text-sm">
        <div className="max-w-5xl mx-auto px-6">
          © 2024 TruthGrid — Healthcare Content Intelligence Platform. Built for India&apos;s healthcare, wellness &amp; pharma brands.
        </div>
      </footer>
    </>
  );
}
