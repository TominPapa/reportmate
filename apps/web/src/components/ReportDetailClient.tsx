'use client'

import { useState } from 'react'
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
  const [downloading, setDownloading] = useState(false)

  const summary = report.blocks.find(b => b.blockType === 'executive_summary')
  const kpi = report.blocks.find(b => b.blockType === 'kpi_snapshot')
  const opportunities = report.blocks.find(b => b.blockType === 'opportunities')
  const actions = report.blocks.find(b => b.blockType === 'action_plan')
  const metrics = report.dataset.summaryMetricsJson as Record<string, unknown>

  async function handleDownloadPDF() {
    setDownloading(true)
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: report.client.name,
          reportMonth: report.dataset.reportMonth,
          dataType: report.dataset.dataType,
          metrics,
          report: {
            executive_summary: summary?.content?.text,
            kpi_narrative: summary?.content?.kpi_narrative,
            wins: kpi?.content?.wins,
            concerns: kpi?.content?.concerns,
            opportunities: (opportunities?.content?.opportunities as string[]) ?? [],
            next_actions: (actions?.content?.next_actions as string[]) ?? [],
            top_query_insight: kpi?.content?.top_query_insight,
            opportunity_insight: opportunities?.content?.opportunity_insight,
          },
        }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.client.name}_${report.dataset.reportMonth}_report.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/reports" className="text-sm text-gray-500 hover:text-gray-700">← 리포트 목록</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {report.client.name} · {report.dataset.dataType.toUpperCase()} · {new Date(report.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {downloading ? 'PDF 생성 중...' : 'PDF 다운로드'}
        </button>
      </div>

      {/* Executive Summary */}
      {summary && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h2>
          <p className="text-gray-700 leading-relaxed">{summary.content.text as string}</p>
          {summary.content.kpi_narrative && (
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{summary.content.kpi_narrative as string}</p>
          )}
        </div>
      )}

      {/* Wins & Concerns */}
      {kpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <h2 className="text-base font-semibold text-green-800 mb-3">✅ 이번 달 성과</h2>
            <ul className="space-y-2">
              {(kpi.content.wins as string[])?.map((win, i) => (
                <li key={i} className="text-sm text-green-700">• {win}</li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <h2 className="text-base font-semibold text-red-800 mb-3">⚠️ 주의 사항</h2>
            <ul className="space-y-2">
              {(kpi.content.concerns as string[])?.map((concern, i) => (
                <li key={i} className="text-sm text-red-700">• {concern}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Opportunities */}
      {opportunities && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h2 className="text-base font-semibold text-blue-800 mb-3">🎯 기회 요인</h2>
          <ul className="space-y-2">
            {(opportunities.content.opportunities as string[])?.map((opp, i) => (
              <li key={i} className="text-sm text-blue-700">• {opp}</li>
            ))}
          </ul>
          {opportunities.content.opportunity_insight && (
            <p className="text-sm text-blue-600 mt-3 pt-3 border-t border-blue-200 italic">
              {opportunities.content.opportunity_insight as string}
            </p>
          )}
        </div>
      )}

      {/* Action Plan */}
      {actions && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">📋 다음 달 액션 플랜</h2>
          <ol className="space-y-2">
            {(actions.content.next_actions as string[])?.map((action, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-3">
                <span className="text-blue-600 font-bold shrink-0">{i + 1}.</span>
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
