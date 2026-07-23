import Link from 'next/link';
import { ArrowRight, BarChart2, Zap, Brain, Globe, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background-dark text-text-dark">
      {/* ── Nav ── */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-white">TruthGrid</span>
        </div>
        <nav className="flex items-center space-x-6 text-sm">
          <Link href="/demo" className="text-gray-400 hover:text-white transition-colors">Live Demo</Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/submit" className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium">
            Get Your TruthID
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="px-6 py-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-4 py-1.5 text-sm text-primary-500 mb-8">
          <Zap className="w-3.5 h-3.5" />
          <span>AI-native assessment · not a resume filter</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Your skills,{' '}
          <span className="text-primary-500">verified by AI.</span>
          <br />Not your college name.
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          TruthGrid runs a multi-step AI assessment pipeline to produce your{' '}
          <strong className="text-white">TruthID</strong> — a 0–10,000 score that measures
          what actually predicts job performance: priority definition ability, execution speed,
          and real-world project evidence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/demo"
            className="flex items-center space-x-2 bg-primary-500 text-white px-8 py-3.5 rounded-lg hover:bg-primary-600 transition-colors font-semibold text-lg"
          >
            <span>Try the Demo</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/submit"
            className="flex items-center space-x-2 border border-gray-700 text-white px-8 py-3.5 rounded-lg hover:border-gray-500 transition-colors font-semibold text-lg"
          >
            <span>Submit Your Assessment</span>
          </Link>
        </div>
      </section>

      {/* ── Problem Statement ── */}
      <section className="px-6 py-16 bg-card-dark border-y border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">The 40M student signal problem</h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
            India graduates <strong className="text-white">40 million+ students annually</strong>. Employers interview 50+ candidates per role — not because good candidates are scarce, but because{' '}
            <strong className="text-white">credentials don&apos;t predict execution ability</strong>. A GPA doesn&apos;t tell you if someone can build. A degree from CCS University vs IIT doesn&apos;t tell you if they ship fast. A resume doesn&apos;t tell you if they know what <em>not</em> to build.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">How the agent works</h2>
        <p className="text-gray-400 text-center mb-12">
          This is not a chatbot. Claude orchestrates a 4-step autonomous pipeline — not a static rubric.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', icon: Brain, title: 'Assess Skills', desc: 'Claude analyzes project history, self-assessment, and behavior signals using India-specific domain knowledge.' },
            { step: '02', icon: Globe, title: 'Research Market', desc: "Live web search retrieves current job demand, salary ranges, and top companies for the student's field in India." },
            { step: '03', icon: BarChart2, title: 'Generate TruthID', desc: 'The 0\u201310,000 weighted score is computed. Priority ability carries 30% \u2014 the single highest weight.' },
            { step: '04', icon: CheckCircle, title: 'Generate Report', desc: 'An employer-ready markdown report with score breakdown, AI reasoning, and concrete next steps.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="bg-card-dark rounded-xl p-6 border border-gray-800 relative">
              <div className="text-xs font-mono text-primary-500 mb-3">{step}</div>
              <Icon className="w-6 h-6 text-primary-500 mb-3" />
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Score Formula ── */}
      <section className="px-6 py-16 bg-card-dark border-y border-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Score formula</h2>
          <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm space-y-2 border border-gray-700">
            <p className="text-gray-400">{/* TruthID score formula — weights reflect India job market research */}
              {'// TruthID score formula — weights reflect India job market research'}</p>
            <p className="text-white">{'TruthID = (priorityAbility / 10 × '}
              <span className="text-primary-500">3000</span>
              {')'}&nbsp;&nbsp;&nbsp;
              <span className="text-gray-500">{'// 30% — most predictive signal'}</span></p>
            <p className="text-white">{'        + (technicalSkills / 10  × '}
              <span className="text-primary-500">2000</span>
              {')'}&nbsp;&nbsp;&nbsp;
              <span className="text-gray-500">{'// 20%'}</span></p>
            <p className="text-white">{'        + (executionSpeed  / 10  × '}
              <span className="text-primary-500">2000</span>
              {')'}&nbsp;&nbsp;&nbsp;
              <span className="text-gray-500">{'// 20%'}</span></p>
            <p className="text-white">{'        + (learnability    / 10  × '}
              <span className="text-primary-500">2000</span>
              {')'}&nbsp;&nbsp;&nbsp;
              <span className="text-gray-500">{'// 20%'}</span></p>
            <p className="text-white">{'        + (softSkills      / 10  × '}
              <span className="text-primary-500">1000</span>
              {')'}&nbsp;&nbsp;&nbsp;
              <span className="text-gray-500">{'// 10%'}</span></p>
            <p className="text-white">
              {'        + marketAlignmentBonus'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-gray-500">{'// up to +500 (live data)'}</span></p>
            <p className="text-primary-500 pt-2">{'        = max 10,000'}</p>
          </div>
          <p className="text-gray-400 text-sm text-center mt-4">
            Why priority ability at 30%? It&apos;s the single most predictive signal of long-term value creation — and the quality explicitly named as the #1 hiring criterion in MUST&apos;s job description.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">See it in action</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Run a sample assessment on a real student profile and see the full pipeline — skill scoring, market research, and TruthID generation.
        </p>
        <Link
          href="/demo"
          className="inline-flex items-center space-x-2 bg-primary-500 text-white px-10 py-4 rounded-lg hover:bg-primary-600 transition-colors font-semibold text-lg"
        >
          <span>Launch Demo</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm">
        <p>TruthGrid — India&apos;s AI-native skill verification system</p>
        <p className="mt-1">Built with Anthropic Claude · Next.js · TypeScript</p>
      </footer>
    </div>
  );
}