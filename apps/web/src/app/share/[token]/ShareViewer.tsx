'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  token: string
  clientName: string
  reportMonth: string
  dataType: string
  reportTitle: string
}

export default function ShareViewer({ token, clientName, reportMonth, dataType, reportTitle }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const blobRef = useRef<string | null>(null)

  useEffect(() => {
    loadPDF()
    return () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPDF() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/share/${token}/pdf`)
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setError(e.error ?? 'Failed to load report')
        return
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      blobRef.current = url
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
    a.download = `${clientName}_${reportMonth}_report.pdf`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-900 text-lg">ReportMate</span>
          <span className="text-gray-300">|</span>
          <div>
            <p className="text-sm font-medium text-gray-900">{reportTitle}</p>
            <p className="text-xs text-gray-400">{clientName} · {dataType.toUpperCase()} · {reportMonth}</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={!pdfUrl || loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : '⬇ Download PDF'}
        </button>
      </header>

      {/* PDF 뷰어 */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm" style={{ minHeight: 'calc(100vh - 120px)' }}>
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Generating report...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ minHeight: 'calc(100vh - 120px)' }}>
              <p className="text-sm text-red-500 font-medium">Failed to load report</p>
              <p className="text-xs text-gray-400">{error}</p>
              <button onClick={loadPDF} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Retry
              </button>
            </div>
          )}
          {pdfUrl && (
            <iframe src={pdfUrl} className="w-full h-full" style={{ minHeight: 'calc(100vh - 120px)' }} title={reportTitle} />
          )}
        </div>
      </div>

      {/* 푸터 */}
      <footer className="text-center py-4 text-xs text-gray-400">
        Powered by <span className="font-semibold text-gray-600">ReportMate</span> · AI-powered marketing reports
      </footer>
    </div>
  )
}
