import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">ReportMate</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 transition">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          Built for small marketing agencies
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold leading-tight text-zinc-900 mb-6">
          CSV in.{' '}
          <span className="text-blue-600">Client-ready report</span>{' '}
          out.
        </h1>

        <p className="text-xl text-zinc-500 mb-4 max-w-2xl mx-auto leading-relaxed">
          Upload your GA4 or Search Console export — ReportMate generates a
          professional PDF report your client can actually understand.
          <strong className="text-zinc-700"> In minutes, not hours.</strong>
        </p>

        <p className="text-sm text-zinc-400 italic mb-10">
          "Looker Studio shows the data. ReportMate explains it to your client."
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition text-base shadow-lg shadow-blue-100"
          >
            Start for free →
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 border border-zinc-200 text-zinc-600 font-medium rounded-xl hover:border-zinc-400 transition text-base"
          >
            Sign in
          </Link>
        </div>
        <p className="text-xs text-zinc-400 mt-4">No credit card required · 100 AI credits free</p>
      </section>

      {/* ── PDF Preview mockup ──────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-zinc-200 shadow-2xl shadow-zinc-100 overflow-hidden">
          {/* Browser bar */}
          <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4 bg-white rounded px-3 py-1 text-xs text-zinc-400 border border-zinc-200">
              reportmate-web.vercel.app/dashboard/reports/...
            </div>
          </div>
          {/* Mock PDF Cover */}
          <div className="bg-slate-900 px-10 py-12">
            <div className="flex items-start justify-between mb-10">
              <span className="text-xs text-slate-400 font-medium tracking-widest uppercase">ReportMate</span>
              <span className="text-xs text-slate-500">2026-04</span>
            </div>
            <div className="inline-block border border-slate-700 rounded-full px-4 py-1 mb-6">
              <span className="text-xs text-slate-400 tracking-widest uppercase">Monthly Performance Report</span>
            </div>
            <p className="text-slate-400 text-sm mb-2">Google Search Console</p>
            <h2 className="text-white text-5xl font-bold mb-3">Acme Marketing</h2>
            <p className="text-slate-500 text-sm mb-10">Reporting Period: 2026-04</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'TOTAL CLICKS', value: '4,821' },
                { label: 'IMPRESSIONS', value: '89,340' },
                { label: 'AVG CTR', value: '5.4%' },
                { label: 'AVG POSITION', value: '7.2' },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">{kpi.label}</p>
                  <p className="text-white text-2xl font-bold">{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Mock Page 2 preview strip */}
          <div className="bg-white px-10 py-8 border-t border-zinc-100">
            <div className="flex gap-8">
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Overview</p>
                <p className="text-2xl font-bold text-zinc-900 mb-4">Executive Summary</p>
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                  <p className="text-sm text-blue-900 leading-relaxed">
                    In April 2026, Acme Marketing's website generated 4,821 clicks from 89,340 impressions,
                    achieving a 5.4% CTR with an average position of 7.2. The site demonstrates strong
                    authority in the digital marketing vertical...
                  </p>
                </div>
              </div>
              <div className="w-48 shrink-0">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">What Went Well</p>
                <div className="space-y-2">
                  {['Top query holds #1.4 position', 'CTR above industry avg', '3 new page-1 keywords'].map(w => (
                    <div key={w} className="flex gap-2 text-xs text-zinc-600">
                      <span className="text-green-500 shrink-0">✓</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section className="bg-zinc-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl font-bold text-center mb-14">From CSV to PDF in 3 steps</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '📁',
                title: 'Upload your CSV',
                desc: 'Export from GA4 or Google Search Console. Drop the file — no formatting needed.',
              },
              {
                step: '02',
                icon: '🤖',
                title: 'AI analyzes the data',
                desc: 'Claude AI reads your metrics, identifies trends, wins, concerns, and opportunities. No hallucinations — only your data.',
              },
              {
                step: '03',
                icon: '📄',
                title: 'Download the report',
                desc: 'Get a professional PDF with cover page, KPI summary, executive narrative, and action plan. Ready to send.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-xs font-bold text-zinc-300 mb-4 text-5xl font-mono">{item.step}</div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain points ─────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Sound familiar?</p>
          <h2 className="text-3xl font-bold text-center mb-14">Every agency owner knows this pain</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { bad: 'Spending 3+ hours building slides from raw numbers every month', good: 'AI-generated report narrative in under 60 seconds' },
              { bad: 'Clients asking "what does this mean?" after seeing a Looker Studio dashboard', good: 'Plain-English explanations included in every report' },
              { bad: 'Copy-pasting KPIs into Google Docs, formatting tables manually', good: 'Structured PDF with KPI cards, charts, and tables auto-generated' },
              { bad: 'No time to add insights — just send the data and hope for the best', good: 'AI-written wins, concerns, opportunities, and action plan every time' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-zinc-100 p-5 bg-white">
                <div className="flex gap-2 items-start mb-3">
                  <span className="text-red-400 text-sm mt-0.5 shrink-0">✕</span>
                  <span className="text-sm text-zinc-400 line-through">{item.bad}</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-green-500 text-sm mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-zinc-700 font-medium">{item.good}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="bg-zinc-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl font-bold text-center mb-14">Everything in one report</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '📊', title: 'KPI Snapshot', desc: 'Auto-calculated KPIs with month-over-month comparison' },
              { icon: '✍️', title: 'AI Narrative', desc: 'Executive summary and insight paragraphs written by Claude AI' },
              { icon: '✅', title: 'Wins & Concerns', desc: 'What went well and what needs attention, clearly listed' },
              { icon: '🎯', title: 'Opportunities', desc: 'Specific growth opportunities identified from your data' },
              { icon: '📋', title: 'Action Plan', desc: 'Prioritized next steps with High / Medium / Low urgency' },
              { icon: '📁', title: 'Data Appendix', desc: 'Full query or page table included for transparency' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-5 border border-zinc-100">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1 text-sm">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl font-bold text-center mb-3">Lifetime deal — pay once, use forever</h2>
          <p className="text-center text-zinc-500 text-sm mb-14">Available on AppSumo. Stack codes to unlock higher tiers.</p>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { tier: 'Tier 1', price: '$69', clients: '5', credits: '100', members: '1', highlight: false },
              { tier: 'Tier 2', price: '$129', clients: '15', credits: '350', members: '3', highlight: false },
              { tier: 'Tier 3', price: '$249', clients: '40', credits: '1,000', members: '10', highlight: true },
              { tier: 'Tier 4', price: '$399', clients: '100', credits: '2,500', members: '20', highlight: false },
            ].map((t) => (
              <div
                key={t.tier}
                className={`rounded-xl p-5 border ${t.highlight ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100' : 'border-zinc-200 bg-white'}`}
              >
                {t.highlight && (
                  <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-3">Most Popular</div>
                )}
                <p className="text-xs font-semibold text-zinc-400 mb-1">{t.tier}</p>
                <p className={`text-3xl font-bold mb-4 ${t.highlight ? 'text-blue-600' : 'text-zinc-900'}`}>{t.price}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Clients</span><span className="font-medium">{t.clients}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">AI Credits/mo</span><span className="font-medium">{t.credits}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Team members</span><span className="font-medium">{t.members}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Reports</span><span className="font-medium text-green-600">Unlimited</span></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-400 mt-6">1 AI Credit = 1 report block generation · 15 credits per full report · Credits reset monthly</p>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────── */}
      <section className="bg-slate-900 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stop spending Sunday nights on reports</h2>
          <p className="text-slate-400 mb-8">
            ReportMate handles the writing. You handle the strategy.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition text-base shadow-lg"
          >
            Start for free →
          </Link>
          <p className="text-slate-500 text-xs mt-4">100 AI credits free · No credit card required</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-zinc-900">ReportMate</span>
          <span className="text-xs text-zinc-400">© 2026 ReportMate · Built for marketing agencies</span>
          <div className="flex gap-4 text-xs text-zinc-400">
            <Link href="/login" className="hover:text-zinc-700">Sign in</Link>
            <Link href="/signup" className="hover:text-zinc-700">Sign up</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
