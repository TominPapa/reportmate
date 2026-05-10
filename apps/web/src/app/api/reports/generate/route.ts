import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface CSVRow { [key: string]: string }

function getCol(row: CSVRow, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined) return row[key]
    const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase())
    if (found) return row[found]
  }
  return ''
}

function detectCSVType(headers: string[]): 'gsc' | 'ga4' {
  const lower = headers.map(h => h.toLowerCase())
  if (lower.some(h => h.includes('session') || h.includes('active user') || h.includes('engagement'))) return 'ga4'
  return 'gsc'
}

function parseGSCCSV(rows: CSVRow[]) {
  const parsed = rows.map(row => ({
    query: getCol(row, 'Query', 'query', 'Top queries'),
    clicks: parseInt(getCol(row, 'Clicks', 'clicks') || '0', 10),
    impressions: parseInt(getCol(row, 'Impressions', 'impressions') || '0', 10),
    ctr: parseFloat((getCol(row, 'CTR', 'ctr') || '0').replace('%', '')),
    position: parseFloat(getCol(row, 'Position', 'position') || '0'),
  })).filter(r => r.query && !isNaN(r.clicks) && r.impressions > 0)

  const totalClicks = parsed.reduce((s, r) => s + r.clicks, 0)
  const totalImpressions = parsed.reduce((s, r) => s + r.impressions, 0)
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const weightedPos = parsed.reduce((s, r) => s + r.position * r.impressions, 0)
  const avgPosition = totalImpressions > 0 ? weightedPos / totalImpressions : 0

  return {
    type: 'gsc' as const,
    totalClicks, totalImpressions,
    avgCTR: Math.round(avgCTR * 100) / 100,
    avgPosition: Math.round(avgPosition * 10) / 10,
    totalQueries: parsed.length,
    topQueries: [...parsed].sort((a, b) => b.clicks - a.clicks).slice(0, 10),
    opportunityQueries: parsed.filter(r => r.position >= 4 && r.position <= 20 && r.impressions >= 50).sort((a, b) => a.position - b.position).slice(0, 8),
    topRankingQueries: parsed.filter(r => r.position <= 3).sort((a, b) => b.clicks - a.clicks).slice(0, 5),
    allQueries: [...parsed].sort((a, b) => b.clicks - a.clicks),
  }
}

function parseGA4CSV(rows: CSVRow[]) {
  const parsed = rows.map(row => ({
    page: getCol(row, 'Page path', 'Page path and screen class', 'Landing page', 'page_path', 'Page'),
    sessions: parseInt(getCol(row, 'Sessions', 'sessions') || '0', 10),
    users: parseInt(getCol(row, 'Active users', 'Users', 'Total users', 'users') || '0', 10),
    bounceRate: parseFloat((getCol(row, 'Bounce rate', 'bounce_rate') || '0').replace('%', '')),
    engagementRate: parseFloat((getCol(row, 'Engagement rate', 'engagement_rate') || '0').replace('%', '')),
    avgDuration: getCol(row, 'Average session duration', 'Avg. session duration', 'avg_session_duration'),
    conversions: parseInt(getCol(row, 'Conversions', 'Key events', 'conversions') || '0', 10),
  })).filter(r => r.page && r.sessions > 0)

  const totalSessions = parsed.reduce((s, r) => s + r.sessions, 0)
  const totalUsers = parsed.reduce((s, r) => s + r.users, 0)
  const totalConversions = parsed.reduce((s, r) => s + r.conversions, 0)
  const avgBounceRate = parsed.length > 0 ? parsed.reduce((s, r) => s + r.bounceRate, 0) / parsed.length : 0
  const avgEngagementRate = parsed.length > 0 ? parsed.reduce((s, r) => s + r.engagementRate, 0) / parsed.length : 0

  return {
    type: 'ga4' as const,
    totalSessions, totalUsers, totalConversions,
    avgBounceRate: Math.round(avgBounceRate * 10) / 10,
    avgEngagementRate: Math.round(avgEngagementRate * 10) / 10,
    totalPages: parsed.length,
    topPages: [...parsed].sort((a, b) => b.sessions - a.sessions).slice(0, 10),
    highBouncePages: parsed.filter(r => r.bounceRate > 60 && r.sessions > 50).sort((a, b) => b.bounceRate - a.bounceRate).slice(0, 5),
    allPages: [...parsed].sort((a, b) => b.sessions - a.sessions),
  }
}

function parseCSV(csvText: string) {
  const result = Papa.parse<CSVRow>(csvText, { header: true, skipEmptyLines: true, transformHeader: h => h.trim() })
  const headers = result.meta.fields || []
  if (detectCSVType(headers) === 'ga4') return parseGA4CSV(result.data)
  return parseGSCCSV(result.data)
}

const GENERATE_CREDITS = 15

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
  })
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  // 크레딧 확인
  const remaining = workspace.aiCreditsLimit - workspace.aiCreditsUsed
  if (remaining < GENERATE_CREDITS) {
    return NextResponse.json({ error: `크레딧이 부족합니다 (필요: ${GENERATE_CREDITS}, 잔여: ${remaining})` }, { status: 400 })
  }

  const formData = await request.formData()
  const clientId = formData.get('clientId') as string
  const reportMonth = formData.get('reportMonth') as string
  const previousMonth = (formData.get('previousMonth') as string) || ''
  const csvFile = formData.get('csv') as File
  const csvPrevFile = formData.get('csvPrevious') as File | null

  if (!clientId || !reportMonth || !csvFile) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다' }, { status: 400 })
  }

  // 클라이언트가 이 workspace 소속인지 확인
  const client = await prisma.client.findFirst({
    where: { id: clientId, workspaceId: workspace.id },
  })
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  // CSV 파싱
  const csvText = await csvFile.text()
  const metrics = parseCSV(csvText)
  const isEmpty = metrics.type === 'gsc' ? metrics.totalQueries === 0 : metrics.totalPages === 0
  if (isEmpty) return NextResponse.json({ error: 'CSV를 파싱할 수 없습니다. 내보내기 형식을 확인해주세요.' }, { status: 400 })

  let prevMetrics: ReturnType<typeof parseGSCCSV> | ReturnType<typeof parseGA4CSV> | null = null
  if (csvPrevFile) {
    const prevText = await csvPrevFile.text()
    prevMetrics = parseCSV(prevText)
  }

  // AI 프롬프트 구성
  const dataSource = metrics.type === 'ga4' ? 'Google Analytics 4' : 'Google Search Console'
  const clientName = client.name

  let summaryMetrics: Record<string, unknown>
  let promptContent: string

  if (metrics.type === 'ga4') {
    summaryMetrics = {
      period: reportMonth, client: clientName, data_source: dataSource,
      total_sessions: metrics.totalSessions, total_users: metrics.totalUsers,
      total_conversions: metrics.totalConversions, avg_bounce_rate_percent: metrics.avgBounceRate,
      avg_engagement_rate_percent: metrics.avgEngagementRate, total_pages_analyzed: metrics.totalPages,
      top_pages_by_sessions: metrics.topPages.map(p => ({ page: p.page, sessions: p.sessions, users: p.users, bounce_rate: p.bounceRate, conversions: p.conversions })),
      high_bounce_pages: metrics.highBouncePages.map(p => ({ page: p.page, bounce_rate: p.bounceRate, sessions: p.sessions })),
    }
    promptContent = `Generate a monthly website performance report based on this Google Analytics 4 data:\n\n${JSON.stringify(summaryMetrics, null, 2)}\n\nReturn a JSON object:\n{\n  "executive_summary": "2-3 sentences",\n  "kpi_narrative": "1-2 sentences",\n  "wins": ["win 1", "win 2", "win 3"],\n  "concerns": ["concern 1", "concern 2"],\n  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],\n  "next_actions": ["action 1", "action 2", "action 3"],\n  "top_query_insight": "1-2 sentences about top pages",\n  "opportunity_insight": "1-2 sentences about high bounce pages"\n}`
  } else {
    summaryMetrics = {
      period: reportMonth, client: clientName, data_source: dataSource,
      total_clicks: metrics.totalClicks, total_impressions: metrics.totalImpressions,
      avg_ctr_percent: metrics.avgCTR, avg_position: metrics.avgPosition, total_queries: metrics.totalQueries,
      top_queries_by_clicks: metrics.topQueries.map(q => ({ query: q.query, clicks: q.clicks, impressions: q.impressions, ctr_percent: q.ctr, position: q.position })),
      opportunity_queries: metrics.opportunityQueries.map(q => ({ query: q.query, impressions: q.impressions, position: q.position, clicks: q.clicks })),
    }
    promptContent = `Generate a monthly SEO performance report based on this Google Search Console data:\n\n${JSON.stringify(summaryMetrics, null, 2)}\n\nReturn a JSON object:\n{\n  "executive_summary": "2-3 sentences",\n  "kpi_narrative": "1-2 sentences",\n  "wins": ["win 1", "win 2", "win 3"],\n  "concerns": ["concern 1", "concern 2"],\n  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],\n  "next_actions": ["action 1", "action 2", "action 3"],\n  "top_query_insight": "1-2 sentences about top queries",\n  "opportunity_insight": "1-2 sentences about opportunity queries"\n}`
  }

  // PDF용 KPI 데이터 구성 (summaryMetricsJson에 함께 저장)
  const kpis = metrics.type === 'ga4'
    ? [
        { label: 'Sessions', value: metrics.totalSessions.toLocaleString(), color: 'blue' },
        { label: 'Users', value: metrics.totalUsers.toLocaleString(), color: 'dark' },
        { label: 'Conversions', value: metrics.totalConversions.toLocaleString(), color: 'green' },
        { label: 'Avg Bounce Rate', value: `${metrics.avgBounceRate}%`, color: 'dark' },
      ]
    : [
        { label: 'Total Clicks', value: metrics.totalClicks.toLocaleString(), color: 'blue' },
        { label: 'Impressions', value: metrics.totalImpressions.toLocaleString(), color: 'dark' },
        { label: 'Avg CTR', value: `${metrics.avgCTR}%`, color: 'green' },
        { label: 'Avg Position', value: metrics.avgPosition.toString(), color: 'dark' },
      ]

  const totalItems = metrics.type === 'ga4' ? metrics.totalPages : metrics.totalQueries
  const itemLabel = metrics.type === 'ga4' ? 'pages' : 'queries'
  const gscQueries = metrics.type === 'gsc' ? metrics.allQueries.slice(0, 50) : undefined
  const ga4Pages = metrics.type === 'ga4' ? metrics.allPages.slice(0, 50) : undefined

  // summaryMetrics에 PDF 필드 추가
  const fullMetrics = {
    ...summaryMetrics,
    _pdf: { kpis, totalItems, itemLabel, dataSource, gscQueries, ga4Pages },
  }

  // AI 호출
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    system: `You are an expert digital marketing analyst. Write professional reports. Return ONLY valid JSON with no markdown.`,
    messages: [{ role: 'user', content: promptContent }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  const cleaned = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const aiReport = JSON.parse(cleaned)

  // DB 저장 (트랜잭션)
  const result = await prisma.$transaction(async (tx) => {
    // 1. 업로드 파일 기록
    const uploadedFile = await tx.uploadedFile.create({
      data: {
        workspaceId: workspace.id,
        clientId,
        filename: csvFile.name,
        storagePath: `${workspace.id}/${clientId}/${Date.now()}_${csvFile.name}`,
        fileSize: csvFile.size,
        dataType: metrics.type,
      },
    })

    // 2. 데이터셋 생성
    const dataset = await tx.dataset.create({
      data: {
        workspaceId: workspace.id,
        clientId,
        uploadedFileId: uploadedFile.id,
        dataType: metrics.type,
        reportMonth,
        previousMonth: previousMonth || null,
        summaryMetricsJson: fullMetrics as object,
      },
    })

    // 3. 리포트 생성
    const report = await tx.report.create({
      data: {
        workspaceId: workspace.id,
        clientId,
        datasetId: dataset.id,
        title: `${clientName} - ${reportMonth} ${metrics.type.toUpperCase()} Report`,
        status: 'draft',
      },
    })

    // 4. 리포트 블록 생성
    const blocks = [
      { blockType: 'executive_summary', content: { text: aiReport.executive_summary, kpi_narrative: aiReport.kpi_narrative }, order: 0 },
      { blockType: 'kpi_snapshot', content: { wins: aiReport.wins, concerns: aiReport.concerns, top_query_insight: aiReport.top_query_insight }, order: 1 },
      { blockType: 'opportunities', content: { opportunities: aiReport.opportunities, opportunity_insight: aiReport.opportunity_insight }, order: 2 },
      { blockType: 'action_plan', content: { next_actions: aiReport.next_actions }, order: 3 },
    ]

    await tx.reportBlock.createMany({
      data: blocks.map(b => ({ ...b, reportId: report.id })),
    })

    // 5. 크레딧 차감
    await tx.workspace.update({
      where: { id: workspace.id },
      data: { aiCreditsUsed: { increment: GENERATE_CREDITS } },
    })

    // 6. 사용 기록
    await tx.usageLedger.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        reportId: report.id,
        action: 'generate_report',
        creditsUsed: GENERATE_CREDITS,
      },
    })

    return { reportId: report.id }
  })

  return NextResponse.json(result)
}
