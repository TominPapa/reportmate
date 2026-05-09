"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await fetch("https://formspree.io/f/xqewvvdd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 max-w-5xl mx-auto w-full">
        <span className="font-semibold text-lg tracking-tight">ReportMate</span>
        <span className="text-xs bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">Early Access</span>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full mb-6">
          Built for small marketing agencies
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-zinc-900 mb-5">
          Turn CSV exports into<br />
          <span className="text-blue-600">client-ready reports</span> in minutes
        </h1>
        <p className="text-lg text-zinc-500 mb-10 max-w-xl mx-auto">
          Upload your GA4, Google Ads, or Meta Ads CSV — ReportMate generates a formatted monthly report your client can actually read. No more copy-pasting numbers at midnight.
        </p>

        {/* Email form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Joining..." : "Get Early Access"}
            </button>
          </form>
        ) : (
          <div className="inline-block bg-green-50 text-green-700 px-6 py-3 rounded-lg text-sm font-medium">
            You&apos;re on the list! We&apos;ll be in touch soon.
          </div>
        )}
        <p className="text-xs text-zinc-400 mt-3">Free during beta. No credit card required.</p>
      </section>

      {/* How it works */}
      <section className="bg-zinc-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">📁</div>
              <h3 className="font-semibold mb-2">1. Upload your CSVs</h3>
              <p className="text-sm text-zinc-500">Export from GA4, Google Ads, or Meta Ads. Drop them in.</p>
            </div>
            <div>
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold mb-2">2. AI analyzes the data</h3>
              <p className="text-sm text-zinc-500">Identifies key trends, hidden problems, and bright spots automatically.</p>
            </div>
            <div>
              <div className="text-3xl mb-3">📄</div>
              <h3 className="font-semibold mb-2">3. Get a client-ready report</h3>
              <p className="text-sm text-zinc-500">A formatted PDF report your client can read — in minutes, not hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample report */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-3">What the output looks like</h2>
        <p className="text-center text-zinc-500 text-sm mb-10">Sample report for a fictional client — FitCore Studio, March 2026</p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="bg-zinc-900 px-5 py-4">
              <div className="text-xs text-zinc-400 mb-1">ReportMate · AI-Generated Report</div>
              <div className="text-xs text-zinc-500 mb-3">FITCORE STUDIO</div>
              <div className="text-white font-bold text-xl leading-tight">Monthly PPC<br />Performance Report</div>
              <div className="text-zinc-400 text-xs mt-2">March 2026 · Google Ads + Meta Ads</div>
            </div>
            <div className="bg-zinc-800 px-5 py-4 flex gap-4">
              <div className="text-center">
                <div className="text-yellow-400 font-bold text-lg">3.8×</div>
                <div className="text-zinc-400 text-xs">Blended ROAS</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold text-lg">+18.4%</div>
                <div className="text-zinc-400 text-xs">Avg CPC MoM</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg">$14,820</div>
                <div className="text-zinc-400 text-xs">Total Ad Spend</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 overflow-hidden shadow-sm bg-white p-5">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Executive Summary</div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <div className="text-xs font-semibold text-yellow-800 mb-1">⚠ What Mixed Signals Means</div>
              <div className="text-xs text-yellow-700">ROAS held at 3.8× but spend increased $2,320 while conversions grew only 4.2%. Google and Meta are telling very different stories.</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-red-50 rounded-lg p-2">
                <div className="text-xs font-semibold text-red-700 mb-1">Hidden Problem</div>
                <div className="text-xs text-red-600">Google CPC rose $1.84 → $2.18 (+18.5% MoM)</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-xs font-semibold text-green-700 mb-1">Bright Spot</div>
                <div className="text-xs text-green-600">Meta delivered 4.6× ROAS — best month in Q1</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="bg-zinc-50 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-10">Sound familiar?</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              "Spending 3+ hours every month copy-pasting numbers into slides",
              "Clients asking 'what does this mean?' after seeing raw dashboards",
              "Scrambling to explain mixed signals across platforms",
              "No time to add narrative — just numbers and hope for the best",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-zinc-200">
                <span className="text-red-400 mt-0.5">✕</span>
                <span className="text-sm text-zinc-600">{pain}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">Get early access</h2>
        <p className="text-zinc-500 text-sm mb-8">We&apos;re onboarding a small group of agencies first. Join the waitlist and we&apos;ll reach out directly.</p>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Joining..." : "Join Waitlist"}
            </button>
          </form>
        ) : (
          <div className="inline-block bg-green-50 text-green-700 px-6 py-3 rounded-lg text-sm font-medium">
            You&apos;re on the list! We&apos;ll be in touch soon.
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-6 px-6 text-center text-xs text-zinc-400">
        © 2026 ReportMate · Built for marketing agencies
      </footer>
    </main>
  );
}
