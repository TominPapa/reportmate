import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import Anthropic from '@anthropic-ai/sdk';

interface CSVRow { [key: string]: string; }

function getCol(row: CSVRow, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined) return row[key];
    const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
    if (found) return row[found];
  }
  return '';
}

function detectCSVType(headers: string[]): 'gsc' | 'ga4' {
  const lower = headers.map(h => h.toLowerCase());
  if (lower.some(h => h.includes('session') || h.includes('active user') || h.includes('engagement'))) return 'ga4';
  return 'gsc';
}

function parseGSCCSV(rows: CSVRow[]) {
  const parsed = rows
    .map(row => ({
      query: getCol(row, 'Query', 'query', 'Top queries'),
      clicks: parseInt(getCol(row, 'Clicks', 'clicks') || '0', 10),
      impressions: parseInt(getCol(row, 'Impressions', 'impressions') || '0', 10),
      ctr: parseFloat((getCol(row, 'CTR', 'ctr') || '0').replace('%', '')),
      position: parseFloat(getCol(row, 'Position', 'position') || '0'),
    }))
    .filter(r => r.query && !isNaN(r.clicks) && r.impressions > 0);

  const totalClicks = parsed.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = parsed.reduce((s, r) => s + r.impressions, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const weightedPos = parsed.reduce((s, r) => s + r.position * r.impressions, 0);
  const avgPosition = totalImpressions > 0 ? weightedPos / totalImpressions : 0;

  return {
    type: 'gsc' as const,
    totalClicks,
    totalImpressions,
    avgCTR: Math.round(avgCTR * 100) / 100,
    avgPosition: Math.round(avgPosition * 10) / 10,
    totalQueries: parsed.length,
    topQueries: [...parsed].sort((a, b) => b.clicks - a.clicks).slice(0, 10),
    opportunityQueries: parsed.filter(r => r.position >= 4 && r.position <= 20 && r.impressions >= 50).sort((a, b) => a.position - b.position).slice(0, 8),
    topRankingQueries: parsed.filter(r => r.position <= 3).sort((a, b) => b.clicks - a.clicks).slice(0, 5),
    allQueries: [...parsed].sort((a, b) => b.clicks - a.clicks),
  };
}

function parseGA4CSV(rows: CSVRow[]) {
  const parsed = rows
    .map(row => ({
      page: getCol(row, 'Page path', 'Page path and screen class', 'Landing page', 'page_path', 'Page'),
      sessions: parseInt(getCol(row, 'Sessions', 'sessions') || '0', 10),
      users: parseInt(getCol(row, 'Active users', 'Users', 'Total users', 'users') || '0', 10),
      bounceRate: parseFloat((getCol(row, 'Bounce rate', 'bounce_rate') || '0').replace('%', '')),
      engagementRate: parseFloat((getCol(row, 'Engagement rate', 'engagement_rate') || '0').replace('%', '')),
      avgDuration: getCol(row, 'Average session duration', 'Avg. session duration', 'avg_session_duration'),
      conversions: parseInt(getCol(row, 'Conversions', 'Key events', 'conversions') || '0', 10),
    }))
    .filter(r => r.page && r.sessions > 0);

  const totalSessions = parsed.reduce((s, r) => s + r.sessions, 0);
  const totalUsers = parsed.reduce((s, r) => s + r.users, 0);
  const totalConversions = parsed.reduce((s, r) => s + r.conversions, 0);
  const avgBounceRate = parsed.length > 0 ? parsed.reduce((s, r) => s + r.bounceRate, 0) / parsed.length : 0;
  const avgEngagementRate = parsed.length > 0 ? parsed.reduce((s, r) => s + r.engagementRate, 0) / parsed.length : 0;

  return {
    type: 'ga4' as const,
    totalSessions,
    totalUsers,
    totalConversions,
    avgBounceRate: Math.round(avgBounceRate * 10) / 10,
    avgEngagementRate: Math.round(avgEngagementRate * 10) / 10,
    totalPages: parsed.length,
    topPages: [...parsed].sort((a, b) => b.sessions - a.sessions).slice(0, 10),
    highBouncePages: parsed.filter(r => r.bounceRate > 60 && r.sessions > 50).sort((a, b) => b.bounceRate - a.bounceRate).slice(0, 5),
    allPages: [...parsed].sort((a, b) => b.sessions - a.sessions),
  };
}

function parseCSV(csvText: string) {
  const result = Papa.parse<CSVRow>(csvText, { header: true, skipEmptyLines: true, transformHeader: h => h.trim() });
  const headers = result.meta.fields || [];
  if (detectCSVType(headers) === 'ga4') return parseGA4CSV(result.data);
  return parseGSCCSV(result.data);
}

// ── MoM helpers ──────────────────────────────────────────────────────────────

function pct(current: number, previous: number) {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

function fmtPct(n: number) { return (n >= 0 ? '+' : '') + n + '%'; }

function momStatus(changePct: number, isPositiveGood: boolean): 'positive' | 'warning' | 'negative' | 'stable' {
  const effective = isPositiveGood ? changePct : -changePct;
  if (effective > 5) return 'positive';
  if (effective < -10) return 'negative';
  if (effective < -2) return 'warning';
  return 'stable';
}

function computeMoMGSC(cur: ReturnType<typeof parseGSCCSV>, prev: ReturnType<typeof parseGSCCSV>) {
  const clicksPct = pct(cur.totalClicks, prev.totalClicks);
  const impPct = pct(cur.totalImpressions, prev.totalImpressions);
  const ctrPct = pct(cur.avgCTR, prev.avgCTR);
  const posPct = pct(cur.avgPosition, prev.avgPosition);

  return {
    clicks: { current: cur.totalClicks, previous: prev.totalClicks, changePct: clicksPct, changeLabel: fmtPct(clicksPct), isGoodChange: clicksPct >= 0 },
    impressions: { current: cur.totalImpressions, previous: prev.totalImpressions, changePct: impPct, changeLabel: fmtPct(impPct), isGoodChange: impPct >= 0 },
    ctr: { current: cur.avgCTR, previous: prev.avgCTR, changePct: ctrPct, changeLabel: fmtPct(ctrPct), isGoodChange: ctrPct >= 0 },
    position: { current: cur.avgPosition, previous: prev.avgPosition, changePct: posPct, changeLabel: fmtPct(posPct), isGoodChange: posPct <= 0 },
  };
}

function computeMoMGA4(cur: ReturnType<typeof parseGA4CSV>, prev: ReturnType<typeof parseGA4CSV>) {
  const sessPct = pct(cur.totalSessions, prev.totalSessions);
  const usersPct = pct(cur.totalUsers, prev.totalUsers);
  const convPct = pct(cur.totalConversions, prev.totalConversions);
  const bouncePct = pct(cur.avgBounceRate, prev.avgBounceRate);

  return {
    sessions: { current: cur.totalSessions, previous: prev.totalSessions, changePct: sessPct, changeLabel: fmtPct(sessPct), isGoodChange: sessPct >= 0 },
    users: { current: cur.totalUsers, previous: prev.totalUsers, changePct: usersPct, changeLabel: fmtPct(usersPct), isGoodChange: usersPct >= 0 },
    conversions: { current: cur.totalConversions, previous: prev.totalConversions, changePct: convPct, changeLabel: fmtPct(convPct), isGoodChange: convPct >= 0 },
    bounceRate: { current: cur.avgBounceRate, previous: prev.avgBounceRate, changePct: bouncePct, changeLabel: fmtPct(bouncePct), isGoodChange: bouncePct <= 0 },
  };
}

function determineAlert(goodCount: number, badCount: number): { type: 'growth' | 'decline' | 'mixed'; message: string } {
  if (goodCount >= 2 && badCount === 0) return { type: 'growth', message: 'Strong performance across all key metrics. Organic traffic and visibility are trending up.' };
  if (badCount >= 2 && goodCount === 0) return { type: 'decline', message: 'Significant decline detected across multiple metrics. Immediate action recommended.' };
  return { type: 'mixed', message: 'Mixed signals this month — some metrics improved while others declined.' };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const anthropic = new Anthropic({ apiKey });

    const formData = await req.formData();
    const file = formData.get('csv') as File;
    const clientName = (formData.get('clientName') as string) || 'Your Client';
    const reportMonth = (formData.get('reportMonth') as string) || 'Last 30 Days';
    const previousFile = formData.get('csvPrevious') as File | null;
    const previousMonth = (formData.get('previousMonth') as string) || '';

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const csvText = await file.text();
    const metrics = parseCSV(csvText);

    const isEmpty = metrics.type === 'gsc' ? metrics.totalQueries === 0 : metrics.totalPages === 0;
    if (isEmpty) return NextResponse.json({ error: 'Could not parse CSV. Please check your export format.' }, { status: 400 });

    // ── Previous month (optional) ──
    let prevMetrics: ReturnType<typeof parseGSCCSV> | ReturnType<typeof parseGA4CSV> | null = null;
    if (previousFile) {
      const prevText = await previousFile.text();
      prevMetrics = parseCSV(prevText);
    }

    // ── Compute MoM ──
    type MoMGSC = ReturnType<typeof computeMoMGSC>;
    type MoMGA4 = ReturnType<typeof computeMoMGA4>;
    let mom: MoMGSC | MoMGA4 | null = null;
    let alertData: { type: 'growth' | 'decline' | 'mixed'; message: string } | null = null;

    if (prevMetrics) {
      if (metrics.type === 'gsc' && prevMetrics.type === 'gsc') {
        mom = computeMoMGSC(metrics, prevMetrics);
        const m = mom as MoMGSC;
        const goodCount = [m.clicks.isGoodChange && Math.abs(m.clicks.changePct) > 5, m.impressions.isGoodChange && Math.abs(m.impressions.changePct) > 5, m.position.isGoodChange && Math.abs(m.position.changePct) > 1].filter(Boolean).length;
        const badCount = [!m.clicks.isGoodChange && Math.abs(m.clicks.changePct) > 5, !m.impressions.isGoodChange && Math.abs(m.impressions.changePct) > 5, !m.position.isGoodChange && Math.abs(m.position.changePct) > 1].filter(Boolean).length;
        alertData = determineAlert(goodCount, badCount);
      } else if (metrics.type === 'ga4' && prevMetrics.type === 'ga4') {
        mom = computeMoMGA4(metrics, prevMetrics);
        const m = mom as MoMGA4;
        const goodCount = [m.sessions.isGoodChange && Math.abs(m.sessions.changePct) > 5, m.users.isGoodChange && Math.abs(m.users.changePct) > 5, m.conversions.isGoodChange && Math.abs(m.conversions.changePct) > 5].filter(Boolean).length;
        const badCount = [!m.sessions.isGoodChange && Math.abs(m.sessions.changePct) > 5, !m.users.isGoodChange && Math.abs(m.users.changePct) > 5, !m.conversions.isGoodChange && Math.abs(m.conversions.changePct) > 5].filter(Boolean).length;
        alertData = determineAlert(goodCount, badCount);
      }
    }

    // ── Build snapshot rows for PDF table ──
    const snapshotRows = mom
      ? metrics.type === 'gsc'
        ? (() => {
            const m = mom as MoMGSC;
            return [
              { metric: 'Total Clicks', current: m.clicks.current.toLocaleString(), previous: m.clicks.previous.toLocaleString(), changePct: m.clicks.changePct, changeLabel: m.clicks.changeLabel, isGoodChange: m.clicks.isGoodChange, status: momStatus(m.clicks.changePct, true), source: 'GSC' },
              { metric: 'Impressions', current: m.impressions.current.toLocaleString(), previous: m.impressions.previous.toLocaleString(), changePct: m.impressions.changePct, changeLabel: m.impressions.changeLabel, isGoodChange: m.impressions.isGoodChange, status: momStatus(m.impressions.changePct, true), source: 'GSC' },
              { metric: 'Avg. CTR', current: m.ctr.current + '%', previous: m.ctr.previous + '%', changePct: m.ctr.changePct, changeLabel: m.ctr.changeLabel, isGoodChange: m.ctr.isGoodChange, status: momStatus(m.ctr.changePct, true), source: 'GSC' },
              { metric: 'Avg. Position', current: m.position.current.toString(), previous: m.position.previous.toString(), changePct: m.position.changePct, changeLabel: m.position.changeLabel, isGoodChange: m.position.isGoodChange, status: momStatus(m.position.changePct, false), source: 'GSC' },
            ];
          })()
        : (() => {
            const m = mom as MoMGA4;
            return [
              { metric: 'Sessions', current: m.sessions.current.toLocaleString(), previous: m.sessions.previous.toLocaleString(), changePct: m.sessions.changePct, changeLabel: m.sessions.changeLabel, isGoodChange: m.sessions.isGoodChange, status: momStatus(m.sessions.changePct, true), source: 'GA4' },
              { metric: 'Users', current: m.users.current.toLocaleString(), previous: m.users.previous.toLocaleString(), changePct: m.users.changePct, changeLabel: m.users.changeLabel, isGoodChange: m.users.isGoodChange, status: momStatus(m.users.changePct, true), source: 'GA4' },
              { metric: 'Conversions', current: m.conversions.current.toLocaleString(), previous: m.conversions.previous.toLocaleString(), changePct: m.conversions.changePct, changeLabel: m.conversions.changeLabel, isGoodChange: m.conversions.isGoodChange, status: momStatus(m.conversions.changePct, true), source: 'GA4' },
              { metric: 'Avg. Bounce Rate', current: m.bounceRate.current + '%', previous: m.bounceRate.previous + '%', changePct: m.bounceRate.changePct, changeLabel: m.bounceRate.changeLabel, isGoodChange: m.bounceRate.isGoodChange, status: momStatus(m.bounceRate.changePct, false), source: 'GA4' },
            ];
          })()
      : null;

    // ── Build KPIs with MoM ──
    const kpisWithMoM = metrics.type === 'ga4'
      ? (() => {
          const m = mom as MoMGA4 | null;
          return [
            { label: 'Sessions', value: metrics.totalSessions.toLocaleString(), color: 'blue' as const, mom: m ? { previousValue: m.sessions.previous.toLocaleString(), changePct: m.sessions.changePct, changeLabel: m.sessions.changeLabel, isGoodChange: m.sessions.isGoodChange } : undefined },
            { label: 'Users', value: metrics.totalUsers.toLocaleString(), color: 'dark' as const, mom: m ? { previousValue: m.users.previous.toLocaleString(), changePct: m.users.changePct, changeLabel: m.users.changeLabel, isGoodChange: m.users.isGoodChange } : undefined },
            { label: 'Conversions', value: metrics.totalConversions.toLocaleString(), color: 'green' as const, mom: m ? { previousValue: m.conversions.previous.toLocaleString(), changePct: m.conversions.changePct, changeLabel: m.conversions.changeLabel, isGoodChange: m.conversions.isGoodChange } : undefined },
            { label: 'Avg Bounce Rate', value: `${metrics.avgBounceRate}%`, color: 'dark' as const, mom: m ? { previousValue: m.bounceRate.previous + '%', changePct: m.bounceRate.changePct, changeLabel: m.bounceRate.changeLabel, isGoodChange: m.bounceRate.isGoodChange } : undefined },
          ];
        })()
      : (() => {
          const m = mom as MoMGSC | null;
          return [
            { label: 'Total Clicks', value: metrics.totalClicks.toLocaleString(), color: 'blue' as const, mom: m ? { previousValue: m.clicks.previous.toLocaleString(), changePct: m.clicks.changePct, changeLabel: m.clicks.changeLabel, isGoodChange: m.clicks.isGoodChange } : undefined },
            { label: 'Impressions', value: metrics.totalImpressions.toLocaleString(), color: 'dark' as const, mom: m ? { previousValue: m.impressions.previous.toLocaleString(), changePct: m.impressions.changePct, changeLabel: m.impressions.changeLabel, isGoodChange: m.impressions.isGoodChange } : undefined },
            { label: 'Avg CTR', value: `${metrics.avgCTR}%`, color: 'green' as const, mom: m ? { previousValue: m.ctr.previous + '%', changePct: m.ctr.changePct, changeLabel: m.ctr.changeLabel, isGoodChange: m.ctr.isGoodChange } : undefined },
            { label: 'Avg Position', value: metrics.avgPosition.toString(), color: 'dark' as const, mom: m ? { previousValue: m.position.previous.toString(), changePct: m.position.changePct, changeLabel: m.position.changeLabel, isGoodChange: m.position.isGoodChange } : undefined },
          ];
        })();

    // ── Prompt ──
    const dataSource = metrics.type === 'ga4' ? 'Google Analytics 4' : 'Google Search Console';
    const momSummary = mom
      ? metrics.type === 'gsc'
        ? (() => { const m = mom as MoMGSC; return `\n\nMONTH-OVER-MONTH vs ${previousMonth}:\n- Clicks: ${m.clicks.changeLabel} (${m.clicks.previous.toLocaleString()} → ${m.clicks.current.toLocaleString()})\n- Impressions: ${m.impressions.changeLabel}\n- CTR: ${m.ctr.changeLabel}\n- Avg Position: ${m.position.changeLabel} (${m.position.previous} → ${m.position.current}, lower is better)`; })()
        : (() => { const m = mom as MoMGA4; return `\n\nMONTH-OVER-MONTH vs ${previousMonth}:\n- Sessions: ${m.sessions.changeLabel}\n- Users: ${m.users.changeLabel}\n- Conversions: ${m.conversions.changeLabel}\n- Bounce Rate: ${m.bounceRate.changeLabel}`; })()
      : '';

    let summaryMetrics: Record<string, unknown>;
    let promptContent: string;

    if (metrics.type === 'ga4') {
      summaryMetrics = { period: reportMonth, client: clientName, data_source: dataSource, total_sessions: metrics.totalSessions, total_users: metrics.totalUsers, total_conversions: metrics.totalConversions, avg_bounce_rate_percent: metrics.avgBounceRate, avg_engagement_rate_percent: metrics.avgEngagementRate, total_pages_analyzed: metrics.totalPages, top_pages_by_sessions: metrics.topPages.map(p => ({ page: p.page, sessions: p.sessions, users: p.users, bounce_rate: p.bounceRate, conversions: p.conversions })), high_bounce_pages: metrics.highBouncePages.map(p => ({ page: p.page, bounce_rate: p.bounceRate, sessions: p.sessions })) };
      promptContent = `Generate a monthly website performance report based on this Google Analytics 4 data:\n\n${JSON.stringify(summaryMetrics, null, 2)}${momSummary}\n\nReturn a JSON object:\n{\n  "executive_summary": "2-3 sentences. If MoM data exists, lead with the % change.",\n  "kpi_narrative": "1-2 sentences interpreting sessions, users, and conversions.",\n  "wins": ["specific win 1 with data", "specific win 2", "specific win 3"],\n  "concerns": ["specific concern 1 with data", "specific concern 2"],\n  "opportunities": ["actionable opportunity 1", "opportunity 2", "opportunity 3"],\n  "next_actions": ["concrete action 1", "concrete action 2", "concrete action 3"],\n  "top_query_insight": "1-2 sentences about top performing pages.",\n  "opportunity_insight": "1-2 sentences about pages with high bounce rates or low engagement."\n}`;
    } else {
      summaryMetrics = { period: reportMonth, client: clientName, data_source: dataSource, total_clicks: metrics.totalClicks, total_impressions: metrics.totalImpressions, avg_ctr_percent: metrics.avgCTR, avg_position: metrics.avgPosition, total_queries: metrics.totalQueries, top_queries_by_clicks: metrics.topQueries.map(q => ({ query: q.query, clicks: q.clicks, impressions: q.impressions, ctr_percent: q.ctr, position: q.position })), opportunity_queries: metrics.opportunityQueries.map(q => ({ query: q.query, impressions: q.impressions, position: q.position, clicks: q.clicks })), top_ranking_queries: metrics.topRankingQueries.map(q => ({ query: q.query, position: q.position, clicks: q.clicks })) };
      promptContent = `Generate a monthly SEO performance report based on this Google Search Console data:\n\n${JSON.stringify(summaryMetrics, null, 2)}${momSummary}\n\nReturn a JSON object:\n{\n  "executive_summary": "2-3 sentences. If MoM data exists, lead with the % change and trend direction.",\n  "kpi_narrative": "1-2 sentences interpreting the key numbers.",\n  "wins": ["specific win 1 with data", "specific win 2", "specific win 3"],\n  "concerns": ["specific concern 1 with data", "specific concern 2"],\n  "opportunities": ["actionable opportunity 1", "opportunity 2", "opportunity 3"],\n  "next_actions": ["concrete action 1", "concrete action 2", "concrete action 3"],\n  "top_query_insight": "1-2 sentences about top performing queries.",\n  "opportunity_insight": "1-2 sentences about queries positioned 4-20 with growth potential."\n}`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      system: `You are an expert digital marketing analyst writing monthly performance reports for agency clients. Write in clear, professional language. Only reference metrics explicitly provided. Never invent numbers. Return ONLY valid JSON with no markdown.`,
      messages: [{ role: 'user', content: promptContent }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const report = JSON.parse(cleaned);

    const totalItems = metrics.type === 'ga4' ? metrics.totalPages : metrics.totalQueries;
    const itemLabel = metrics.type === 'ga4' ? 'pages' : 'queries';
    const gscQueries = metrics.type === 'gsc' ? metrics.allQueries : undefined;
    const ga4Pages = metrics.type === 'ga4' ? metrics.allPages : undefined;

    return NextResponse.json({
      metrics,
      report,
      clientName,
      reportMonth,
      previousMonth: previousMonth || null,
      dataSource,
      dataType: metrics.type,
      kpisWithMoM,
      snapshotRows,
      alertType: alertData?.type || null,
      alertMessage: alertData?.message || null,
      totalItems,
      itemLabel,
      gscQueries,
      ga4Pages,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
