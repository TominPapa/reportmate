import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';

// NotoSansKR: covers both Korean (Hangul) and Latin characters in one TTF file
// Source: official Google Fonts GitHub repository (raw content)
Font.register({
  family: 'NotoSansKR',
  src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskr/static/NotoSansKR-Regular.ttf',
});
Font.register({
  family: 'NotoSansKR-Bold',
  src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskr/static/NotoSansKR-Bold.ttf',
});

const DARK = '#0f172a';
const DARK2 = '#1e293b';
const BLUE = '#2563eb';
const GREEN = '#059669';
const RED = '#dc2626';
const AMBER = '#d97706';
const GRAY = '#71717a';
const LIGHT = '#f8fafc';
const BORDER = '#e2e8f0';

const s = StyleSheet.create({
  // ── Pages ──────────────────────────────────────────────
  coverPage:   { fontFamily: 'NotoSansKR', backgroundColor: DARK, paddingBottom: 50 },
  contentPage: { fontFamily: 'NotoSansKR', backgroundColor: '#ffffff', paddingBottom: 50 },

  // ── Cover ──────────────────────────────────────────────
  coverTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 40, paddingTop: 36, marginBottom: 60 },
  coverLogo: { width: 80, height: 80, objectFit: 'contain' },
  coverBrand: { color: '#94a3b8', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase' },
  coverPeriod: { color: '#64748b', fontSize: 8, textAlign: 'right' },
  coverContent: { paddingHorizontal: 40, paddingBottom: 32 },
  coverPill: { borderWidth: 1, borderColor: '#334155', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 20 },
  coverPillText: { color: '#94a3b8', fontSize: 7.5, letterSpacing: 1.5, textTransform: 'uppercase' },
  coverReportType: { color: '#cbd5e1', fontSize: 13, marginBottom: 8 },
  coverClientName: { color: '#ffffff', fontSize: 34, fontFamily: 'NotoSansKR-Bold', marginBottom: 6, lineHeight: 1.2 },
  coverMeta: { color: '#64748b', fontSize: 9.5, marginBottom: 28 },

  // Alert boxes
  alertGrowth:  { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#052e16', borderLeftWidth: 3, borderLeftColor: GREEN, borderRadius: 6, padding: 12, marginBottom: 28 },
  alertDecline: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#450a0a', borderLeftWidth: 3, borderLeftColor: RED, borderRadius: 6, padding: 12, marginBottom: 28 },
  alertMixed:   { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#431407', borderLeftWidth: 3, borderLeftColor: AMBER, borderRadius: 6, padding: 12, marginBottom: 28 },
  alertIcon: { fontSize: 10, marginRight: 8, marginTop: 1 },
  alertGrowthText:  { color: '#86efac', fontSize: 9, lineHeight: 1.5, flex: 1 },
  alertDeclineText: { color: '#fca5a5', fontSize: 9, lineHeight: 1.5, flex: 1 },
  alertMixedText:   { color: '#fed7aa', fontSize: 9, lineHeight: 1.5, flex: 1 },

  // Cover KPI preview row
  coverKpiRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  coverKpiBox: { flex: 1, backgroundColor: DARK2, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#1e293b' },
  coverKpiLabel: { color: '#64748b', fontSize: 7, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  coverKpiValue: { color: '#ffffff', fontSize: 18, fontFamily: 'NotoSansKR-Bold', marginBottom: 3 },
  coverKpiMom: { fontSize: 7.5, marginTop: 1 },

  // ── Section header (content pages) ─────────────────────
  pageHeader: { paddingHorizontal: 40, paddingTop: 32, paddingBottom: 0 },
  sectionTag: { color: BLUE, fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'NotoSansKR-Bold', marginBottom: 6 },
  pageTitle: { color: '#0f172a', fontSize: 22, fontFamily: 'NotoSansKR-Bold', marginBottom: 4 },
  pageSubtitle: { color: GRAY, fontSize: 9, marginBottom: 20 },
  divider: { borderTopWidth: 1, borderTopColor: BORDER, marginVertical: 16 },

  // ── KPI Cards (summary page) ────────────────────────────
  kpiRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 40, marginTop: 20 },
  kpiCard: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 20 },
  kpiCardLabel: { color: GRAY, fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  kpiCardValueBlue:  { color: BLUE,  fontSize: 24, fontFamily: 'NotoSansKR-Bold' },
  kpiCardValueGreen: { color: GREEN, fontSize: 24, fontFamily: 'NotoSansKR-Bold' },
  kpiCardValueDark:  { color: DARK,  fontSize: 24, fontFamily: 'NotoSansKR-Bold' },
  kpiMomPositive: { color: GREEN, fontSize: 7.5, marginTop: 3 },
  kpiMomNegative: { color: RED,   fontSize: 7.5, marginTop: 3 },
  kpiMomStable:   { color: GRAY,  fontSize: 7.5, marginTop: 3 },

  // ── Narrative box ───────────────────────────────────────
  narrativeBox: { borderLeftWidth: 3, borderLeftColor: BLUE, backgroundColor: '#eff6ff', borderRadius: 4, padding: 22, marginHorizontal: 40, marginTop: 4 },
  narrativeText: { fontSize: 12, color: '#1e3a5f', lineHeight: 1.7, marginBottom: 8 },
  narrativeSubText: { fontSize: 11, color: '#3b5998', lineHeight: 1.6 },

  // ── Snapshot table ──────────────────────────────────────
  tableWrapper: { paddingHorizontal: 40, marginTop: 4 },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: DARK, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 4, marginBottom: 1 },
  tableRow:    { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableRowAlt: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10, backgroundColor: LIGHT, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableHeaderText: { fontSize: 7, fontFamily: 'NotoSansKR-Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableCellText: { fontSize: 8.5, color: '#334155' },
  tableCellMuted: { fontSize: 8.5, color: GRAY },
  tableCellPositive: { fontSize: 8.5, color: GREEN, fontFamily: 'NotoSansKR-Bold' },
  tableCellNegative: { fontSize: 8.5, color: RED,   fontFamily: 'NotoSansKR-Bold' },
  badgePositive: { backgroundColor: '#dcfce7', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeWarning:  { backgroundColor: '#fef9c3', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeNegative: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeStable:   { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeTextPositive: { fontSize: 7, color: '#15803d', fontFamily: 'NotoSansKR-Bold' },
  badgeTextWarning:  { fontSize: 7, color: '#92400e', fontFamily: 'NotoSansKR-Bold' },
  badgeTextNegative: { fontSize: 7, color: '#b91c1c', fontFamily: 'NotoSansKR-Bold' },
  badgeTextStable:   { fontSize: 7, color: '#475569', fontFamily: 'NotoSansKR-Bold' },

  // ── Wins & Concerns ─────────────────────────────────────
  twoCol: { flexDirection: 'row', gap: 12, paddingHorizontal: 40, marginTop: 4 },
  winsBox: { flex: 1, backgroundColor: '#f0fdf4', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#bbf7d0' },
  concernsBox: { flex: 1, backgroundColor: '#fff1f2', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#fecdd3' },
  winsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  concernsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  winsTitle: { fontSize: 8, color: '#15803d', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'NotoSansKR-Bold' },
  concernsTitle: { fontSize: 8, color: '#b91c1c', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'NotoSansKR-Bold' },
  listItem: { flexDirection: 'row', marginBottom: 8, gap: 6 },
  listBulletGreen: { fontSize: 9, color: GREEN, marginTop: 1, width: 10 },
  listBulletRed:   { fontSize: 9, color: RED,   marginTop: 1, width: 10 },
  listBulletBlue:  { fontSize: 9, color: BLUE,  marginTop: 1, width: 10 },
  listText: { fontSize: 9, color: '#374151', lineHeight: 1.55, flex: 1 },

  // ── Opportunities ───────────────────────────────────────
  body: { paddingHorizontal: 40 },
  oppInsight: { fontSize: 9.5, color: BLUE, lineHeight: 1.6, marginBottom: 10 },

  // ── Action items ────────────────────────────────────────
  actionItem: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  actionNum: { width: 22, height: 22, backgroundColor: BLUE, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  actionNumText: { color: '#fff', fontSize: 9, fontFamily: 'NotoSansKR-Bold' },
  actionContent: { flex: 1 },
  actionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  actionTitle: { fontSize: 10, color: '#0f172a', fontFamily: 'NotoSansKR-Bold', flex: 1 },
  priorityHigh:   { backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  priorityMed:    { backgroundColor: '#fef9c3', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  priorityLow:    { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  priorityHighText: { fontSize: 6.5, color: '#b91c1c', fontFamily: 'NotoSansKR-Bold' },
  priorityMedText:  { fontSize: 6.5, color: '#92400e', fontFamily: 'NotoSansKR-Bold' },
  priorityLowText:  { fontSize: 6.5, color: '#475569', fontFamily: 'NotoSansKR-Bold' },
  actionDesc: { fontSize: 8.5, color: GRAY, lineHeight: 1.5 },

  // ── Bar chart ───────────────────────────────────────────
  chartArea: { paddingHorizontal: 40, marginTop: 4 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 220, gap: 6 },
  chartBarWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 220 },
  chartBarValue: { fontSize: 8, fontFamily: 'NotoSansKR-Bold', marginBottom: 4 },
  chartBarLabel: { fontSize: 7, color: GRAY, marginTop: 6, textAlign: 'center' },

  // ── Data table ──────────────────────────────────────────
  dataTableWrapper: { paddingHorizontal: 40, marginTop: 4 },
  dataTableRow:    { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dataTableRowAlt: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, backgroundColor: LIGHT, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },

  // ── Position styles ─────────────────────────────────────
  posGreen:  { fontSize: 8.5, color: GREEN, fontFamily: 'NotoSansKR-Bold' },
  posYellow: { fontSize: 8.5, color: AMBER, fontFamily: 'NotoSansKR-Bold' },
  posRed:    { fontSize: 8.5, color: RED,   fontFamily: 'NotoSansKR-Bold' },

  // ── Cover contents (bottom of cover page) ───────────────
  coverSpacer: { flex: 1 },
  coverContents: { paddingHorizontal: 40, paddingBottom: 70 },
  coverContentsLabel: { fontSize: 7, color: '#334155', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, fontFamily: 'NotoSansKR-Bold' },
  coverContentsRow: { flexDirection: 'row', gap: 10 },
  coverContentsCard: { flex: 1, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10 },
  coverContentsCardNum: { fontSize: 7, color: '#475569', marginBottom: 4 },
  coverContentsCardTitle: { fontSize: 9, color: '#94a3b8', fontFamily: 'NotoSansKR-Bold' },

  // ── Footer ──────────────────────────────────────────────
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 8 },
  footerCover: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 8 },
  footerText: { fontSize: 7.5, color: '#475569' },
  footerTextCover: { fontSize: 7.5, color: '#334155' },
  sectionLabel: { fontSize: 8, color: GRAY, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'NotoSansKR-Bold' },
  footnote: { fontSize: 7.5, color: '#94a3b8', marginTop: 10, paddingHorizontal: 40 },
});

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface KPIWithMoM {
  label: string;
  value: string;
  color: 'blue' | 'green' | 'dark';
  mom?: { previousValue: string; changePct: number; changeLabel: string; isGoodChange: boolean; };
}

export interface SnapshotRow {
  metric: string; current: string; previous: string;
  changePct: number; changeLabel: string; isGoodChange: boolean;
  status: 'positive' | 'warning' | 'negative' | 'stable'; source: string;
}

export interface GSCQueryRow { query: string; clicks: number; impressions: number; ctr: number; position: number; }
export interface GA4PageRow  { page: string; sessions: number; users: number; bounceRate: number; conversions: number; }

export interface PDFReportData {
  clientName: string;
  reportMonth: string;
  previousMonth?: string | null;
  dataSource: string;
  logoBase64?: string;
  dataType: 'gsc' | 'ga4';
  alertType?: 'growth' | 'decline' | 'mixed' | null;
  alertMessage?: string | null;
  kpis: KPIWithMoM[];
  totalItems: number;
  itemLabel: string;
  snapshotRows?: SnapshotRow[] | null;
  gscQueries?: GSCQueryRow[];
  ga4Pages?: GA4PageRow[];
  report: {
    executive_summary: string; kpi_narrative: string;
    wins: string[]; concerns: string[];
    opportunities: string[]; next_actions: string[];
    opportunity_insight: string;
  };
}

// ── Helper components ──────────────────────────────────────────────────────

function Footer({ clientName, reportMonth, cover = false }: { clientName: string; reportMonth: string; cover?: boolean }) {
  return (
    <View style={cover ? s.footerCover : s.footer} fixed>
      <Text style={cover ? s.footerTextCover : s.footerText}>{clientName} · {reportMonth}</Text>
      <Text style={cover ? s.footerTextCover : s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Badge({ status }: { status: 'positive' | 'warning' | 'negative' | 'stable' }) {
  const bg   = status === 'positive' ? s.badgePositive : status === 'warning' ? s.badgeWarning : status === 'negative' ? s.badgeNegative : s.badgeStable;
  const tx   = status === 'positive' ? s.badgeTextPositive : status === 'warning' ? s.badgeTextWarning : status === 'negative' ? s.badgeTextNegative : s.badgeTextStable;
  const lbl  = status === 'positive' ? 'Positive' : status === 'warning' ? 'Watch' : status === 'negative' ? 'Critical' : 'Stable';
  return <View style={bg}><Text style={tx}>{lbl}</Text></View>;
}

// ── Main component ─────────────────────────────────────────────────────────

export function ReportPDF({ data }: { data: PDFReportData }) {
  const { clientName, reportMonth, previousMonth, dataSource, alertType, alertMessage, kpis, snapshotRows, gscQueries, ga4Pages, report, dataType } = data;

  const kpiValueStyle = (color: 'blue' | 'green' | 'dark') =>
    color === 'blue' ? s.kpiCardValueBlue : color === 'green' ? s.kpiCardValueGreen : s.kpiCardValueDark;

  const posStyle = (pos: number) => pos <= 3 ? s.posGreen : pos <= 10 ? s.posYellow : s.posRed;

  const prevLabel = previousMonth || 'Prev';

  // Bar chart
  const chartItems = dataType === 'gsc'
    ? (gscQueries ?? []).slice(0, 5).map(q => ({ label: q.query, value: q.clicks }))
    : (ga4Pages ?? []).slice(0, 5).map(p => ({ label: p.page.split('/').filter(Boolean).pop() || p.page, value: p.sessions }));
  const chartMax = Math.max(...chartItems.map(i => i.value), 1);
  const chartColor = dataType === 'gsc' ? BLUE : '#7c3aed';
  const MAX_BAR_H = 180;

  // Priority tags for actions
  const priorities = ['High', 'Medium', 'Medium', 'Low', 'Low'];

  return (
    <Document>

      {/* ═══════════════════════════════════════════════════════
          PAGE 1 — COVER
      ═══════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.coverPage}>
        {/* Top bar */}
        <View style={s.coverTopBar}>
          <View>
            {data.logoBase64
              ? <Image src={data.logoBase64} style={s.coverLogo} />
              : <Text style={s.coverBrand}>ReportMate</Text>}
          </View>
          <Text style={s.coverPeriod}>{reportMonth}</Text>
        </View>

        {/* Main content */}
        <View style={s.coverContent}>
          <View style={s.coverPill}>
            <Text style={s.coverPillText}>Monthly Performance Report</Text>
          </View>

          <Text style={s.coverReportType}>{dataSource}</Text>
          <Text style={s.coverClientName}>{clientName}</Text>
          <Text style={s.coverMeta}>Reporting Period: {reportMonth}{previousMonth ? `  ·  vs ${previousMonth}` : ''}</Text>

          {/* Alert */}
          {alertType && alertMessage && (
            <View style={alertType === 'growth' ? s.alertGrowth : alertType === 'decline' ? s.alertDecline : s.alertMixed}>
              <Text style={s.alertIcon}>{alertType === 'growth' ? '↑' : alertType === 'decline' ? '↓' : '~'}</Text>
              <Text style={alertType === 'growth' ? s.alertGrowthText : alertType === 'decline' ? s.alertDeclineText : s.alertMixedText}>
                {alertMessage}
              </Text>
            </View>
          )}

          {/* KPI Preview */}
          <View style={s.coverKpiRow}>
            {kpis.map((kpi, i) => (
              <View key={i} style={s.coverKpiBox}>
                <Text style={s.coverKpiLabel}>{kpi.label}</Text>
                <Text style={s.coverKpiValue}>{kpi.value}</Text>
                {kpi.mom && (
                  <Text style={[s.coverKpiMom, { color: kpi.mom.isGoodChange ? GREEN : RED }]}>
                    {kpi.mom.isGoodChange ? '▲' : '▼'} {kpi.mom.changeLabel} vs {prevLabel}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Meta info — sits right below KPI cards */}
        <View style={{ paddingHorizontal: 40, marginTop: 36 }}>
          <View style={{ borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 20 }}>
            <Text style={{ color: '#334155', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase' }}>ReportMate  ·  AI-Powered Marketing Analysis</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 32, marginTop: 20 }}>
            <View>
              <Text style={{ color: '#64748b', fontSize: 7, letterSpacing: 0.5, marginBottom: 4 }}>Data Source</Text>
              <Text style={{ color: '#94a3b8', fontSize: 9, fontFamily: 'NotoSansKR-Bold' }}>{dataSource}</Text>
            </View>
            <View>
              <Text style={{ color: '#64748b', fontSize: 7, letterSpacing: 0.5, marginBottom: 4 }}>Reporting Period</Text>
              <Text style={{ color: '#94a3b8', fontSize: 9, fontFamily: 'NotoSansKR-Bold' }}>{reportMonth}</Text>
            </View>
            {previousMonth && (
              <View>
                <Text style={{ color: '#64748b', fontSize: 7, letterSpacing: 0.5, marginBottom: 4 }}>Compared To</Text>
                <Text style={{ color: '#94a3b8', fontSize: 9, fontFamily: 'NotoSansKR-Bold' }}>{previousMonth}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Spacer pushes "Inside This Report" to bottom */}
        <View style={{ flex: 1 }} />

        {/* Inside This Report — bottom of cover */}
        <View style={s.coverContents}>
          <Text style={s.coverContentsLabel}>Inside This Report</Text>
          <View style={s.coverContentsRow}>
            {[
              { num: '01', title: 'Executive Summary' },
              { num: '02', title: 'KPI Snapshot' },
              { num: '03', title: 'Wins & Concerns' },
              { num: '04', title: 'Action Plan' },
            ].map((item, i) => (
              <View key={i} style={s.coverContentsCard}>
                <Text style={s.coverContentsCardNum}>{item.num}</Text>
                <Text style={s.coverContentsCardTitle}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <Footer clientName={clientName} reportMonth={reportMonth} cover />
      </Page>

      {/* ═══════════════════════════════════════════════════════
          PAGE 2 — EXECUTIVE SUMMARY
      ═══════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.contentPage}>
        <View style={s.pageHeader}>
          <Text style={s.sectionTag}>Overview</Text>
          <Text style={s.pageTitle}>Executive Summary</Text>
        </View>

        {/* Narrative box */}
        <View style={s.narrativeBox}>
          <Text style={s.narrativeText}>{report.executive_summary}</Text>
          <Text style={s.narrativeSubText}>{report.kpi_narrative}</Text>
        </View>

        {/* KPI Cards */}
        <View style={s.kpiRow}>
          {kpis.map((kpi, i) => (
            <View key={i} style={s.kpiCard}>
              <Text style={s.kpiCardLabel}>{kpi.label}</Text>
              <Text style={kpiValueStyle(kpi.color)}>{kpi.value}</Text>
              {kpi.mom
                ? <Text style={kpi.mom.isGoodChange ? s.kpiMomPositive : s.kpiMomNegative}>
                    {kpi.mom.isGoodChange ? '▲' : '▼'} {kpi.mom.changeLabel} vs {prevLabel}
                  </Text>
                : null}
            </View>
          ))}
        </View>

        {/* Bar chart */}
        {chartItems.length > 0 && (
          <View style={[s.chartArea, { marginTop: 20 }]}>
            <Text style={s.sectionLabel}>{dataType === 'gsc' ? 'Top 5 Queries by Clicks' : 'Top 5 Pages by Sessions'}</Text>
            <View style={s.chartBars}>
              {chartItems.map((item, i) => {
                const barH = Math.max((item.value / chartMax) * MAX_BAR_H, 3);
                return (
                  <View key={i} style={s.chartBarWrapper}>
                    <Text style={[s.chartBarValue, { color: chartColor }]}>{item.value.toLocaleString()}</Text>
                    <View style={{ width: '72%', height: barH, backgroundColor: chartColor, borderRadius: 3, opacity: 1 - i * 0.12 }} />
                    <Text style={s.chartBarLabel}>{item.label.length > 13 ? item.label.slice(0, 13) + '…' : item.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick stats strip — fills remaining space on Page 2 */}
        {chartItems.length > 0 && (
          <View style={{ paddingHorizontal: 40, marginTop: 40 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { label: 'Top Performer', value: chartItems[0]?.label.length > 22 ? chartItems[0].label.slice(0, 22) + '…' : chartItems[0]?.label, sub: `${chartItems[0]?.value.toLocaleString()} ${dataType === 'gsc' ? 'clicks' : 'sessions'}` },
                { label: 'Total Tracked', value: `${dataType === 'gsc' ? (gscQueries ?? []).length : (ga4Pages ?? []).length} ${dataType === 'gsc' ? 'queries' : 'pages'}`, sub: `from ${dataSource}` },
                { label: 'Report Period', value: reportMonth, sub: previousMonth ? `vs ${previousMonth}` : 'current period' },
              ].map((stat, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: LIGHT, borderRadius: 8, padding: 26, borderWidth: 1, borderColor: BORDER }}>
                  <Text style={{ fontSize: 7.5, color: GRAY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>{stat.label}</Text>
                  <Text style={{ fontSize: 12, color: DARK, fontFamily: 'NotoSansKR-Bold', marginBottom: 6 }}>{stat.value}</Text>
                  <Text style={{ fontSize: 8.5, color: GRAY }}>{stat.sub}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Footer clientName={clientName} reportMonth={reportMonth} />
      </Page>

      {/* ═══════════════════════════════════════════════════════
          PAGE 3 — KPI SNAPSHOT (only if MoM data exists)
      ═══════════════════════════════════════════════════════ */}
      {snapshotRows && snapshotRows.length > 0 && (
        <Page size="A4" style={s.contentPage}>
          <View style={s.pageHeader}>
            <Text style={s.sectionTag}>Performance Data</Text>
            <Text style={s.pageTitle}>KPI Snapshot</Text>
            <Text style={s.pageSubtitle}>Data source: {dataSource}  ·  {reportMonth} vs {prevLabel}</Text>
          </View>

          <View style={s.tableWrapper}>
            {/* Header */}
            <View style={s.tableHeaderRow}>
              <Text style={[s.tableHeaderText, { flex: 2 }]}>Metric</Text>
              <Text style={[s.tableHeaderText, { width: 80, textAlign: 'right' }]}>{reportMonth}</Text>
              <Text style={[s.tableHeaderText, { width: 80, textAlign: 'right' }]}>{prevLabel}</Text>
              <Text style={[s.tableHeaderText, { width: 70, textAlign: 'right' }]}>Change</Text>
              <Text style={[s.tableHeaderText, { width: 70, textAlign: 'center' }]}>Status</Text>
              <Text style={[s.tableHeaderText, { width: 40, textAlign: 'right' }]}>Source</Text>
            </View>

            {snapshotRows.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={[s.tableCellText, { flex: 2 }]}>{row.metric}</Text>
                <Text style={[s.tableCellText, { width: 80, textAlign: 'right' }]}>{row.current}</Text>
                <Text style={[s.tableCellMuted, { width: 80, textAlign: 'right' }]}>{row.previous}</Text>
                <Text style={[row.isGoodChange ? s.tableCellPositive : s.tableCellNegative, { width: 70, textAlign: 'right' }]}>{row.changeLabel}</Text>
                <View style={{ width: 70, alignItems: 'center' }}><Badge status={row.status} /></View>
                <Text style={[s.tableCellMuted, { width: 40, textAlign: 'right' }]}>{row.source}</Text>
              </View>
            ))}
          </View>

          <Text style={s.footnote}>* All data sourced from {dataSource} exports. Position metric: lower value = better ranking.</Text>

          {/* MoM Highlight Cards — 2×2 grid fills empty space */}
          <View style={{ paddingHorizontal: 40, marginTop: 44 }}>
            <Text style={s.sectionLabel}>Month-over-Month Highlights</Text>
            {[0, 2].map(rowStart => (
              <View key={rowStart} style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                {snapshotRows.slice(rowStart, rowStart + 2).map((row, i) => {
                  const isPos = row.status === 'positive';
                  const isNeg = row.status === 'negative';
                  return (
                    <View key={i} style={{
                      flex: 1, borderRadius: 12, padding: 36,
                      backgroundColor: isPos ? '#f0fdf4' : isNeg ? '#fff1f2' : LIGHT,
                      borderWidth: 1,
                      borderColor: isPos ? '#bbf7d0' : isNeg ? '#fecdd3' : BORDER,
                    }}>
                      <Text style={{ fontSize: 8, color: GRAY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>{row.metric}</Text>
                      <Text style={{ fontSize: 48, fontFamily: 'NotoSansKR-Bold', color: row.isGoodChange ? GREEN : RED, marginBottom: 12 }}>{row.changeLabel}</Text>
                      <Text style={{ fontSize: 10, color: '#475569' }}>{row.previous}{'  >  '}{row.current}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          <Footer clientName={clientName} reportMonth={reportMonth} />
        </Page>
      )}

      {/* ═══════════════════════════════════════════════════════
          PAGE 4 — WINS & CONCERNS + OPPORTUNITIES
      ═══════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.contentPage}>
        <View style={s.pageHeader}>
          <Text style={s.sectionTag}>Analysis</Text>
          <Text style={s.pageTitle}>Wins & Concerns</Text>
        </View>

        <View style={s.twoCol}>
          <View style={s.winsBox}>
            <View style={s.winsHeader}><Text style={s.winsTitle}>✓  What Went Well</Text></View>
            {report.wins.map((w, i) => (
              <View key={i} style={s.listItem}>
                <Text style={s.listBulletGreen}>✓</Text>
                <Text style={s.listText}>{w}</Text>
              </View>
            ))}
          </View>
          <View style={s.concernsBox}>
            <View style={s.concernsHeader}><Text style={s.concernsTitle}>⚠  Areas to Watch</Text></View>
            {report.concerns.map((c, i) => (
              <View key={i} style={s.listItem}>
                <Text style={s.listBulletRed}>!</Text>
                <Text style={s.listText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[s.divider, { marginHorizontal: 40 }]} />

        {/* Opportunities */}
        <View style={s.body}>
          <Text style={s.sectionLabel}>Opportunities</Text>
          <Text style={s.oppInsight}>{report.opportunity_insight}</Text>
          {report.opportunities.map((o, i) => (
            <View key={i} style={s.listItem}>
              <Text style={s.listBulletBlue}>{i + 1}.</Text>
              <Text style={s.listText}>{o}</Text>
            </View>
          ))}
        </View>

        {/* Query Position Distribution — fills empty space on Page 4 */}
        {dataType === 'gsc' && (gscQueries ?? []).length > 0 && (() => {
          const allQ = gscQueries ?? [];
          const top3   = allQ.filter(q => q.position <= 3);
          const page1  = allQ.filter(q => q.position > 3 && q.position <= 10);
          const beyond = allQ.filter(q => q.position > 10);
          const total  = allQ.length;
          const buckets = [
            { label: 'Top 3',             count: top3.length,   clicks: top3.reduce((s, q)   => s + q.clicks, 0), color: GREEN  },
            { label: 'Page 1  (4 – 10)',  count: page1.length,  clicks: page1.reduce((s, q)  => s + q.clicks, 0), color: AMBER  },
            { label: 'Beyond Page 1',     count: beyond.length, clicks: beyond.reduce((s, q) => s + q.clicks, 0), color: '#94a3b8' },
          ];
          return (
            <View style={[s.body, { marginTop: 16 }]}>
              <View style={[s.divider, { marginHorizontal: 0, marginBottom: 16 }]} />
              <Text style={s.sectionLabel}>Query Position Distribution</Text>
              <View style={{ gap: 10 }}>
                {buckets.map((b, i) => {
                  const pct = total > 0 ? (b.count / total) * 100 : 0;
                  return (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ width: 110, fontSize: 8.5, color: '#374151' }}>{b.label}</Text>
                      <View style={{ flex: 1, height: 16, backgroundColor: '#f1f5f9', borderRadius: 3 }}>
                        <View style={{ width: `${pct}%`, height: 16, backgroundColor: b.color, borderRadius: 3 }} />
                      </View>
                      <Text style={{ width: 22, fontSize: 8.5, fontFamily: 'NotoSansKR-Bold', color: b.color, textAlign: 'right' }}>{b.count}</Text>
                      <Text style={{ width: 72, fontSize: 7.5, color: GRAY, textAlign: 'right' }}>{b.clicks.toLocaleString()} clicks</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={{ fontSize: 7.5, color: '#94a3b8', marginTop: 10 }}>Based on {total} tracked queries · {reportMonth}</Text>
            </View>
          );
        })()}

        <Footer clientName={clientName} reportMonth={reportMonth} />
      </Page>

      {/* ═══════════════════════════════════════════════════════
          PAGE 5 — ACTION PLAN + DATA APPENDIX
      ═══════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.contentPage}>
        <View style={s.pageHeader}>
          <Text style={s.sectionTag}>Recommendations</Text>
          <Text style={s.pageTitle}>Action Plan</Text>
        </View>

        <View style={[s.body, { marginTop: 4 }]}>
          {report.next_actions.map((a, i) => {
            const priority = priorities[i] || 'Low';
            const numStyle = priority === 'High' ? { backgroundColor: RED } : priority === 'Medium' ? { backgroundColor: AMBER } : { backgroundColor: '#64748b' };
            const badgeStyle = priority === 'High' ? s.priorityHigh : priority === 'Medium' ? s.priorityMed : s.priorityLow;
            const badgeTextStyle = priority === 'High' ? s.priorityHighText : priority === 'Medium' ? s.priorityMedText : s.priorityLowText;
            return (
              <View key={i} style={s.actionItem}>
                <View style={[s.actionNum, numStyle]}>
                  <Text style={s.actionNumText}>{i + 1}</Text>
                </View>
                <View style={s.actionContent}>
                  <View style={s.actionTitleRow}>
                    <Text style={s.actionTitle}>{a}</Text>
                    <View style={badgeStyle}><Text style={badgeTextStyle}>{priority} Priority</Text></View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Data Appendix */}
        {((dataType === 'gsc' && (gscQueries ?? []).length > 0) || (dataType === 'ga4' && (ga4Pages ?? []).length > 0)) && (
          <>
            <View style={[s.divider, { marginHorizontal: 40 }]} />
            <View style={s.dataTableWrapper}>
              <Text style={s.sectionLabel}>{dataType === 'gsc' ? 'Query Data Appendix' : 'Page Data Appendix'}</Text>
              <View style={s.tableHeaderRow}>
                {dataType === 'gsc'
                  ? <>
                      <Text style={[s.tableHeaderText, { flex: 3 }]}>Query</Text>
                      <Text style={[s.tableHeaderText, { width: 55, textAlign: 'right' }]}>Clicks</Text>
                      <Text style={[s.tableHeaderText, { width: 75, textAlign: 'right' }]}>Impressions</Text>
                      <Text style={[s.tableHeaderText, { width: 55, textAlign: 'right' }]}>CTR</Text>
                      <Text style={[s.tableHeaderText, { width: 60, textAlign: 'right' }]}>Position</Text>
                    </>
                  : <>
                      <Text style={[s.tableHeaderText, { flex: 3 }]}>Page</Text>
                      <Text style={[s.tableHeaderText, { width: 60, textAlign: 'right' }]}>Sessions</Text>
                      <Text style={[s.tableHeaderText, { width: 55, textAlign: 'right' }]}>Users</Text>
                      <Text style={[s.tableHeaderText, { width: 75, textAlign: 'right' }]}>Bounce Rate</Text>
                      <Text style={[s.tableHeaderText, { width: 55, textAlign: 'right' }]}>Conv.</Text>
                    </>}
              </View>

              {dataType === 'gsc'
                ? (gscQueries ?? []).map((q, i) => (
                    <View key={i} style={i % 2 === 0 ? s.dataTableRow : s.dataTableRowAlt}>
                      <Text style={[s.tableCellText, { flex: 3 }]}>{q.query.length > 38 ? q.query.slice(0, 38) + '…' : q.query}</Text>
                      <Text style={[s.tableCellText, { width: 55, textAlign: 'right' }]}>{q.clicks.toLocaleString()}</Text>
                      <Text style={[s.tableCellMuted, { width: 75, textAlign: 'right' }]}>{q.impressions.toLocaleString()}</Text>
                      <Text style={[s.tableCellMuted, { width: 55, textAlign: 'right' }]}>{q.ctr}%</Text>
                      <Text style={[posStyle(q.position), { width: 60, textAlign: 'right' }]}>{q.position}</Text>
                    </View>
                  ))
                : (ga4Pages ?? []).map((p, i) => (
                    <View key={i} style={i % 2 === 0 ? s.dataTableRow : s.dataTableRowAlt}>
                      <Text style={[s.tableCellMuted, { flex: 3 }]}>{p.page.length > 38 ? p.page.slice(0, 38) + '…' : p.page}</Text>
                      <Text style={[s.tableCellText, { width: 60, textAlign: 'right' }]}>{p.sessions.toLocaleString()}</Text>
                      <Text style={[s.tableCellText, { width: 55, textAlign: 'right' }]}>{p.users.toLocaleString()}</Text>
                      <Text style={[s.tableCellText, { width: 75, textAlign: 'right' }]}>{p.bounceRate}%</Text>
                      <Text style={[s.tableCellText, { width: 55, textAlign: 'right' }]}>{p.conversions.toLocaleString()}</Text>
                    </View>
                  ))}
            </View>
          </>
        )}

        <Footer clientName={clientName} reportMonth={reportMonth} />
      </Page>

    </Document>
  );
}
