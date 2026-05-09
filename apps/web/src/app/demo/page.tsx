'use client';

import { useState, useRef } from 'react';

interface GSCQuery { query: string; clicks: number; impressions: number; ctr: number; position: number; }
interface GA4Page { page: string; sessions: number; users: number; bounceRate: number; engagementRate: number; conversions: number; avgDuration: string; }

interface KPIWithMoM {
  label: string;
  value: string;
  color: 'blue' | 'green' | 'dark';
  mom?: { previousValue: string; changePct: number; changeLabel: string; isGoodChange: boolean; };
}

interface SnapshotRow {
  metric: string; current: string; previous: string;
  changePct: number; changeLabel: string; isGoodChange: boolean;
  status: 'positive' | 'warning' | 'negative' | 'stable'; source: string;
}

interface GSCMetrics {
  type: 'gsc';
  totalClicks: number; totalImpressions: number; avgCTR: number; avgPosition: number; totalQueries: number;
  topQueries: GSCQuery[]; opportunityQueries: GSCQuery[]; topRankingQueries: GSCQuery[]; allQueries: GSCQuery[];
}

interface GA4Metrics {
  type: 'ga4';
  totalSessions: number; totalUsers: number; totalConversions: number;
  avgBounceRate: number; avgEngagementRate: number; totalPages: number;
  topPages: GA4Page[]; highBouncePages: GA4Page[]; allPages: GA4Page[];
}

type Metrics = GSCMetrics | GA4Metrics;

interface Report {
  executive_summary: string; kpi_narrative: string;
  wins: string[]; concerns: string[]; opportunities: string[];
  next_actions: string[]; top_query_insight: string; opportunity_insight: string;
}

interface ReportData {
  metrics: Metrics; report: Report;
  clientName: string; reportMonth: string; previousMonth: string | null;
  dataSource: string; dataType: 'gsc' | 'ga4';
  kpisWithMoM: KPIWithMoM[];
  snapshotRows: SnapshotRow[] | null;
  alertType: 'growth' | 'decline' | 'mixed' | null;
  alertMessage: string | null;
  totalItems: number; itemLabel: string;
  gscQueries?: GSCQuery[]; ga4Pages?: GA4Page[];
}

export default function DemoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previousFile, setPreviousFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [reportMonth, setReportMonth] = useState('');
  const [previousMonth, setPreviousMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previousFileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (f: File) => {
    setLogoFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith('.csv')) setFile(dropped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setError(''); setResult(null);

    const formData = new FormData();
    formData.append('csv', file);
    formData.append('clientName', clientName || 'Client');
    formData.append('reportMonth', reportMonth || 'Last 30 Days');
    if (previousFile) {
      formData.append('csvPrevious', previousFile);
      formData.append('previousMonth', previousMonth || 'Previous Month');
    }

    try {
      const res = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="font-semibold text-lg tracking-tight">ReportMate</a>
          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">Beta</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!result ? (
          <div>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-3">Generate a Client Report</h1>
              <p className="text-zinc-500 max-w-md mx-auto">Upload your GSC or GA4 CSV and get a professional report in seconds.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm max-w-xl mx-auto">

              {/* Logo */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">Agency Logo <span className="text-zinc-400 font-normal text-xs">(optional)</span></label>
                <div onClick={() => logoRef.current?.click()} className="flex items-center gap-4 cursor-pointer border border-zinc-200 rounded-lg px-4 py-3 hover:bg-zinc-50 transition">
                  <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoChange(f); }} />
                  {logoPreview
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={logoPreview} alt="logo" className="h-8 object-contain" />
                    : <div className="text-sm text-zinc-400">Click to upload logo</div>}
                  {logoFile && <span className="text-xs text-zinc-400 ml-auto">{logoFile.name}</span>}
                </div>
              </div>

              {/* Client Name */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">Client Name</label>
                <input type="text" placeholder="e.g. Acme Corp" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Current Month CSV */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">
                  Current Month CSV
                  <span className="text-zinc-400 font-normal ml-2 text-xs">GSC (Performance → Queries) or GA4 (Reports → Export)</span>
                </label>
                <input type="text" placeholder="e.g. April 2026" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${dragging ? 'border-blue-400 bg-blue-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
                >
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  {file
                    ? <div><div className="text-2xl mb-1">📄</div><div className="text-sm font-medium text-zinc-700">{file.name}</div><div className="text-xs text-zinc-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</div></div>
                    : <div><div className="text-2xl mb-1">📁</div><div className="text-sm font-medium text-zinc-600">Drop CSV here or click to upload</div><div className="text-xs text-zinc-400 mt-0.5">Only .csv files</div></div>}
                </div>
              </div>

              {/* Previous Month CSV */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Previous Month CSV
                  <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Enables MoM comparison ↑↓</span>
                </label>
                <p className="text-xs text-zinc-400 mb-2">Optional — upload last month's export to show month-over-month changes</p>
                <input type="text" placeholder="e.g. March 2026" value={previousMonth} onChange={(e) => setPreviousMonth(e.target.value)} className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
                <div
                  onClick={() => previousFileRef.current?.click()}
                  className="border border-dashed border-zinc-200 rounded-xl p-4 text-center cursor-pointer hover:bg-zinc-50 transition"
                >
                  <input ref={previousFileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setPreviousFile(e.target.files?.[0] || null)} />
                  {previousFile
                    ? <div className="text-sm text-zinc-600 flex items-center justify-center gap-2"><span>📄</span>{previousFile.name}</div>
                    : <div className="text-sm text-zinc-400">Click to upload previous month CSV</div>}
                </div>
              </div>

              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

              <button type="submit" disabled={!file || loading} className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Generating report...</span>
                  : 'Generate Report →'}
              </button>
              <p className="text-center text-xs text-zinc-400 mt-4">Takes about 10–15 seconds · No data stored</p>
            </form>
          </div>
        ) : (
          <ReportView data={result} logoBase64={logoPreview} onReset={() => setResult(null)} />
        )}
      </div>
    </main>
  );
}

function ReportView({ data, logoBase64, onReset }: { data: ReportData; logoBase64?: string; onReset: () => void }) {
  const { report, clientName, reportMonth, previousMonth, dataSource, dataType, kpisWithMoM, snapshotRows, alertType, alertMessage, totalItems, itemLabel, gscQueries, ga4Pages } = data;
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const payload = {
        clientName, reportMonth, previousMonth, dataSource, dataType,
        logoBase64: logoBase64 || undefined,
        kpis: kpisWithMoM,
        totalItems, itemLabel,
        alertType, alertMessage,
        snapshotRows,
        gscQueries, ga4Pages,
        report,
      };

      const res = await fetch('/api/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName.replace(/\s+/g, '_')}_Report_${reportMonth.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const alertColors = { growth: 'bg-emerald-50 border-emerald-400 text-emerald-800', decline: 'bg-red-50 border-red-400 text-red-800', mixed: 'bg-amber-50 border-amber-400 text-amber-800' };
  const alertIcons = { growth: '↑', decline: '↓', mixed: '~' };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={onReset} className="text-sm text-zinc-500 hover:text-zinc-800">← New Report</button>
        <button onClick={handleDownloadPDF} disabled={pdfLoading} className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition disabled:opacity-60">
          {pdfLoading ? 'Generating PDF…' : 'Download PDF'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {/* Cover Header */}
        <div className="bg-zinc-900 px-8 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              {logoBase64
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={logoBase64} alt="logo" className="h-16 object-contain" />
                : <div className="text-zinc-400 text-xs font-medium tracking-widest uppercase">ReportMate</div>}
            </div>
            <div className="text-zinc-400 text-xs">{reportMonth}</div>
          </div>
          <h1 className="text-white text-3xl font-bold mb-1">{clientName}</h1>
          <div className="text-zinc-400 text-sm">{dataSource} · {totalItems} {itemLabel} analyzed</div>

          {alertType && alertMessage && (
            <div className={`mt-4 px-4 py-3 rounded-lg border text-sm font-medium ${alertColors[alertType]}`}>
              <span className="font-bold mr-2">{alertIcons[alertType]}</span>{alertMessage}
            </div>
          )}
        </div>

        {/* KPI Bar */}
        <div className="grid grid-cols-4 border-b border-zinc-100">
          {kpisWithMoM.map((kpi, i) => (
            <div key={i} className={`px-5 py-4 ${i < 3 ? 'border-r border-zinc-100' : ''}`}>
              <div className="text-xs text-zinc-400 mb-1">{kpi.label}</div>
              <div className={`text-xl font-bold ${kpi.color === 'blue' ? 'text-blue-600' : kpi.color === 'green' ? 'text-emerald-600' : 'text-zinc-900'}`}>{kpi.value}</div>
              {kpi.mom && (
                <div className={`text-xs mt-0.5 font-medium ${kpi.mom.isGoodChange ? 'text-emerald-600' : 'text-red-500'}`}>
                  {kpi.mom.isGoodChange ? '▲' : '▼'} {kpi.mom.changeLabel} vs {previousMonth || 'prev'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Snapshot Table (if MoM) */}
        {snapshotRows && snapshotRows.length > 0 && (
          <div className="px-8 py-6 border-b border-zinc-100">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">KPI Snapshot</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-zinc-500">Metric</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-zinc-500">{reportMonth}</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-zinc-500">{previousMonth || 'Previous'}</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-zinc-500">Change</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {snapshotRows.map((row, i) => {
                  const badgeClass = { positive: 'bg-emerald-100 text-emerald-700', warning: 'bg-amber-100 text-amber-700', negative: 'bg-red-100 text-red-700', stable: 'bg-zinc-100 text-zinc-600' }[row.status];
                  const badgeLabel = { positive: 'Positive', warning: 'Watch', negative: 'Critical', stable: 'Stable' }[row.status];
                  return (
                    <tr key={i} className={i % 2 === 0 ? '' : 'bg-zinc-50/50'}>
                      <td className="px-3 py-2 font-medium text-zinc-700">{row.metric}</td>
                      <td className="px-3 py-2 text-right text-zinc-700">{row.current}</td>
                      <td className="px-3 py-2 text-right text-zinc-400">{row.previous}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${row.isGoodChange ? 'text-emerald-600' : 'text-red-500'}`}>{row.changeLabel}</td>
                      <td className="px-3 py-2 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>{badgeLabel}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-8 space-y-6">
          {/* Bar Chart - Top 5 */}
          {(gscQueries || ga4Pages) && (() => {
            const items = dataType === 'gsc' ? (gscQueries || []).slice(0, 5) : (ga4Pages || []).slice(0, 5);
            const maxVal = dataType === 'gsc'
              ? Math.max(...items.map(q => (q as GSCQuery).clicks))
              : Math.max(...items.map(p => (p as GA4Page).sessions));
            return (
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                  {dataType === 'gsc' ? 'Top Queries by Clicks' : 'Top Pages by Sessions'}
                </div>
                <div className="space-y-2.5">
                  {items.map((item, i) => {
                    const val = dataType === 'gsc' ? (item as GSCQuery).clicks : (item as GA4Page).sessions;
                    const label = dataType === 'gsc' ? (item as GSCQuery).query : (item as GA4Page).page;
                    const barPct = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;
                    const colors = ['bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-sky-400', 'bg-sky-300'];
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-36 text-xs text-zinc-600 truncate shrink-0 text-right">{label}</div>
                        <div className="flex-1 h-5 bg-zinc-100 rounded overflow-hidden">
                          <div className={`h-full ${colors[i]} rounded transition-all`} style={{ width: `${barPct}%` }} />
                        </div>
                        <div className="text-xs font-semibold text-zinc-700 w-14 shrink-0">{val.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="border-t border-zinc-100" />

          {/* Executive Summary */}
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Executive Summary</div>
            <p className="text-zinc-700 leading-relaxed">{report.executive_summary}</p>
            <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{report.kpi_narrative}</p>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Wins & Concerns */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-emerald-50 rounded-xl p-5">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-3">✓ Wins</div>
              <ul className="space-y-2.5">
                {report.wins.map((w, i) => <li key={i} className="text-sm text-emerald-900 flex gap-2 leading-snug"><span className="text-emerald-500 shrink-0 mt-0.5">✓</span><span>{w}</span></li>)}
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl p-5">
              <div className="text-xs font-semibold text-red-700 uppercase tracking-widest mb-3">! Concerns</div>
              <ul className="space-y-2.5">
                {report.concerns.map((c, i) => <li key={i} className="text-sm text-red-900 flex gap-2 leading-snug"><span className="text-red-400 shrink-0 mt-0.5">!</span><span>{c}</span></li>)}
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Opportunities */}
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Opportunities</div>
            <p className="text-sm text-blue-600 mb-4 leading-relaxed">{report.opportunity_insight}</p>
            <ul className="space-y-2.5">
              {report.opportunities.map((o, i) => (
                <li key={i} className="text-sm text-zinc-700 flex gap-3 leading-snug">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span><span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Next Actions */}
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Recommended Next Actions</div>
            <ol className="space-y-3">
              {report.next_actions.map((a, i) => (
                <li key={i} className="flex gap-3 leading-snug">
                  <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-sm text-zinc-700">{a}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Data Table */}
          {(gscQueries || ga4Pages) && (
            <>
              <div className="border-t border-zinc-100" />
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">{dataType === 'gsc' ? 'Top Queries' : 'Top Pages'}</div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-zinc-900 text-zinc-300">
                      {dataType === 'gsc'
                        ? ['Query', 'Clicks', 'Impressions', 'CTR', 'Position'].map(h => <th key={h} className="px-3 py-2 text-left font-semibold tracking-wide">{h}</th>)
                        : ['Page', 'Sessions', 'Users', 'Bounce Rate', 'Conv.'].map(h => <th key={h} className="px-3 py-2 text-left font-semibold tracking-wide">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {dataType === 'gsc'
                      ? (gscQueries || []).map((q, i) => (
                        <tr key={i} className={i % 2 === 0 ? '' : 'bg-zinc-50'}>
                          <td className="px-3 py-2 text-zinc-700">{q.query}</td>
                          <td className="px-3 py-2 text-zinc-700">{q.clicks.toLocaleString()}</td>
                          <td className="px-3 py-2 text-zinc-500">{q.impressions.toLocaleString()}</td>
                          <td className="px-3 py-2 text-zinc-500">{q.ctr}%</td>
                          <td className={`px-3 py-2 font-bold ${q.position <= 3 ? 'text-emerald-600' : q.position <= 10 ? 'text-amber-600' : 'text-red-500'}`}>{q.position}</td>
                        </tr>
                      ))
                      : (ga4Pages || []).map((p, i) => (
                        <tr key={i} className={i % 2 === 0 ? '' : 'bg-zinc-50'}>
                          <td className="px-3 py-2 text-zinc-500">{p.page}</td>
                          <td className="px-3 py-2 text-zinc-700">{p.sessions.toLocaleString()}</td>
                          <td className="px-3 py-2 text-zinc-700">{p.users.toLocaleString()}</td>
                          <td className="px-3 py-2 text-zinc-500">{p.bounceRate}%</td>
                          <td className="px-3 py-2 text-zinc-700">{p.conversions.toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
            <div className="text-xs text-zinc-400">Generated by ReportMate</div>
            <div className="text-xs text-zinc-400">AI-powered reporting</div>
          </div>
        </div>
      </div>
    </div>
  );
}
