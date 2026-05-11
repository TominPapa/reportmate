'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Block {
  id: string
  blockType: string
  content: Record<string, unknown>
  order: number
}

interface Report {
  id: string
  title: string
  status: string
  createdAt: Date
  client: { name: string; website: string | null }
  dataset: { dataType: string; reportMonth: string; summaryMetricsJson: unknown }
  blocks: Block[]
}

export default function ReportDetailClient({ report }: { report: Report }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    generatePDF()
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generatePDF() {
    setLoading(true)
    setError(null)
    try {
      const summary = report.blocks.find(b => b.blockType === 'executive_summary')
      const kpi     = report.blocks.find(b => b.blockType === 'kpi_snapshot')
      const opps    = report.blocks.find(b => b.blockType === 'opportunities')
      const actions = report.blocks.find(b => b.blockType === 'action_plan')
      const metrics = report.dataset.summaryMetricsJson as Record<string, unknown>
      const pdf     = metrics._pdf as Record<string, unknown> | undefined

      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName:   report.client.name,
          reportMonth:  report.dataset.reportMonth,
          dataType:     report.dataset.dataType,
          dataSource:   pdf?.dataSource ?? (report.dataset.dataType === 'ga4' ? 'Google Analytics 4' : 'Google Search Console'),
          kpis:         pdf?.kpis ?? [],
          totalItems:   pdf?.totalItems ?? 0,
          itemLabel:    pdf?.itemLabel ?? 'items',
          gscQueries:   pdf?.gscQueries,
          ga4Pages:     pdf?.ga4Pages,
          snapshotRows: null,
          alertType:    null,
          alertMessage: null,
          report: {
            executive_summary:   summary?.content?.text as string ?? '',
            kpi_narrative:       summary?.content?.kpi_narrative as string ?? '',
            wins:                (kpi?.content?.wins as string[]) ?? [],
            concerns:            (kpi?.content?.concerns as string[]) ?? [],
            opportunities:       (opps?.content?.opportunities as string[]) ?? [],
            next_actions:        (actions?.content?.next_actions as string[]) ?? [],
            opportunity_insight: opps?.content?.opportunity_insight as string ?? '',
          },
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setError(errData.error ?? res.statusText)
        return
      }

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      blobUrlRef.current = url
      setPdfUrl(url)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = `${report.client.name}_${report.dataset.reportMonth}_report.pdf`
    a.click()
  }

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 160px)', minHeight: '600px' }}>

      {/* 헤더 */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <Link href="/dashboard/reports" className="text-sm text-gray-500 hover:text-gray-700">
            ← 리포트 목록
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{report.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {report.client.name} · {report.dataset.dataType.toUpperCase()} · {new Date(report.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={!pdfUrl || loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'PDF 생성 중...' : '⬇ PDF 다운로드'}
        </button>
      </div>

      {/* PDF 프리뷰 */}
      <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden min-h-0">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">PDF 생성 중... (약 5~10초 소요)</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-sm text-red-500 font-medium">PDF 생성 실패</p>
            <p className="text-xs text-gray-500 max-w-md text-center">{error}</p>
            <button
              onClick={generatePDF}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {pdfUrl && (
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title={report.title}
          />
        )}
      </div>
    </div>
  )
}
