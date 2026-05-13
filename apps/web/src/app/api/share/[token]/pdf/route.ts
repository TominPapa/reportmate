import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportPDF, PDFReportData } from '@/components/ReportPDF'
import React from 'react'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReactElement = any

// GET /api/share/[token]/pdf — 인증 없이 공유 링크로 PDF 생성
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // 토큰 유효성 확인
  const link = await prisma.sharedLink.findUnique({
    where: { token },
    include: {
      report: {
        include: {
          client:  true,
          dataset: true,
          blocks:  { orderBy: { order: 'asc' } },
        },
      },
    },
  })

  if (!link || !link.isActive) {
    return NextResponse.json({ error: 'Link not found or expired' }, { status: 404 })
  }

  const { report } = link
  const summary = report.blocks.find(b => b.blockType === 'executive_summary')
  const kpi     = report.blocks.find(b => b.blockType === 'kpi_snapshot')
  const opps    = report.blocks.find(b => b.blockType === 'opportunities')
  const actions = report.blocks.find(b => b.blockType === 'action_plan')
  const metrics = report.dataset.summaryMetricsJson as Record<string, unknown>
  const pdf     = metrics._pdf as Record<string, unknown> | undefined

  const data: PDFReportData = {
    clientName:   report.client.name,
    reportMonth:  report.dataset.reportMonth,
    dataType:     report.dataset.dataType as 'gsc' | 'ga4',
    dataSource:   (pdf?.dataSource as string) ?? (report.dataset.dataType === 'ga4' ? 'Google Analytics 4' : 'Google Search Console'),
    kpis:         (pdf?.kpis as PDFReportData['kpis']) ?? [],
    totalItems:   (pdf?.totalItems as number) ?? 0,
    itemLabel:    (pdf?.itemLabel as string) ?? 'items',
    gscQueries:   pdf?.gscQueries as PDFReportData['gscQueries'],
    ga4Pages:     pdf?.ga4Pages  as PDFReportData['ga4Pages'],
    snapshotRows: null,
    alertType:    null,
    alertMessage: null,
    report: {
      executive_summary:   (summary?.content as Record<string, unknown>)?.text as string ?? '',
      kpi_narrative:       (summary?.content as Record<string, unknown>)?.kpi_narrative as string ?? '',
      wins:                ((kpi?.content as Record<string, unknown>)?.wins as string[]) ?? [],
      concerns:            ((kpi?.content as Record<string, unknown>)?.concerns as string[]) ?? [],
      opportunities:       ((opps?.content as Record<string, unknown>)?.opportunities as string[]) ?? [],
      next_actions:        ((actions?.content as Record<string, unknown>)?.next_actions as string[]) ?? [],
      opportunity_insight: (opps?.content as Record<string, unknown>)?.opportunity_insight as string ?? '',
    },
  }

  try {
    const element: AnyReactElement = React.createElement(ReportPDF, { data })
    const buffer = await renderToBuffer(element)

    const rawFilename = `${data.clientName.replace(/\s+/g, '_')}_Report_${data.reportMonth}.pdf`
    const asciiFilename = rawFilename.replace(/[^\x20-\x7E]/g, '_')
    const encodedFilename = encodeURIComponent(rawFilename)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
