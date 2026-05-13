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

const BLOCKS = [
  { type: 'executive_summary', label: 'Executive Summary', desc: '전체 요약 + KPI 내러티브' },
  { type: 'kpi_snapshot',      label: 'Wins & Concerns',   desc: '이번 달 성과 + 주의 사항' },
  { type: 'opportunities',     label: 'Opportunities',     desc: '기회 요인 + 인사이트' },
  { type: 'action_plan',       label: 'Action Plan',       desc: '다음 달 액션 플랜' },
]

export default function ReportDetailClient({ report }: { report: Report }) {
  const [pdfUrl, setPdfUrl]           = useState<string | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [shareUrl, setShareUrl]       = useState<string | null>(null)
  const [sharing, setSharing]         = useState(false)
  const [copied, setCopied]           = useState(false)
  const [regenLoading, setRegenLoading] = useState<string | null>(null)  // blockType
  const [regenDone, setRegenDone]     = useState<string | null>(null)
  const [showRegen, setShowRegen]     = useState(false)
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

  async function handleShare() {
    setSharing(true)
    try {
      const res = await fetch(`/api/reports/${report.id}/share`, { method: 'POST' })
      const { token } = await res.json()
      const url = `${window.location.origin}/share/${token}`
      setShareUrl(url)
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      alert('공유 링크 생성에 실패했습니다.')
    } finally {
      setSharing(false)
    }
  }

  async function handleRegen(blockType: string) {
    setRegenLoading(blockType)
    setRegenDone(null)
    try {
      const res = await fetch(`/api/reports/${report.id}/regenerate-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockType }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error ?? '재생성 실패')
        return
      }
      setRegenDone(blockType)
      setTimeout(() => setRegenDone(null), 3000)
      // Update the block content in report object so re-generated PDF reflects new content
      const block = report.blocks.find(b => b.blockType === blockType)
      if (block) block.content = data.content
      // Re-generate PDF with updated content
      await generatePDF()
    } catch {
      alert('재생성 중 오류가 발생했습니다.')
    } finally {
      setRegenLoading(null)
    }
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
        <div className="flex items-center gap-2">
          {/* 공유 링크 복사 */}
          <button
            onClick={handleShare}
            disabled={sharing}
            className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 disabled:opacity-50 transition-colors"
          >
            {sharing ? '생성 중...' : copied ? '✓ 링크 복사됨!' : '🔗 공유 링크'}
          </button>
          {/* PDF 다운로드 */}
          <button
            onClick={handleDownload}
            disabled={!pdfUrl || loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'PDF 생성 중...' : '⬇ PDF 다운로드'}
          </button>
        </div>
        {/* 공유 URL 표시 */}
        {shareUrl && (
          <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <span className="text-xs text-blue-700 truncate flex-1">{shareUrl}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 3000) }}
              className="text-xs text-blue-600 hover:text-blue-800 shrink-0 font-medium"
            >
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
        )}
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

      {/* 블록 재생성 패널 */}
      <div className="shrink-0 border border-gray-200 rounded-xl bg-white overflow-hidden">
        <button
          onClick={() => setShowRegen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>✏️ 블록 단위 재생성</span>
          <span className="text-gray-400 text-xs">{showRegen ? '▲ 접기' : '▼ 펼치기'}</span>
        </button>

        {showRegen && (
          <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BLOCKS.map(block => {
              const isLoading = regenLoading === block.type
              const isDone    = regenDone    === block.type
              return (
                <button
                  key={block.type}
                  onClick={() => handleRegen(block.type)}
                  disabled={!!regenLoading}
                  className={`flex flex-col gap-1 p-3 rounded-lg border text-left transition-all disabled:opacity-60
                    ${isDone
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                >
                  <span className="text-xs font-semibold text-gray-800">
                    {isLoading ? '⏳ 생성 중...' : isDone ? '✅ 완료!' : block.label}
                  </span>
                  <span className="text-xs text-gray-400">{block.desc}</span>
                  <span className="text-xs text-blue-500 font-medium mt-1">5 크레딧</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
