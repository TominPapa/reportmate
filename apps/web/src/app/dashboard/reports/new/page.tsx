'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Client { id: string; name: string }

export default function NewReportPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [reportMonth, setReportMonth] = useState('')
  const [previousMonth, setPreviousMonth] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPrevFile, setCsvPrevFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'generating'>('form')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId || !reportMonth || !csvFile) {
      setError('클라이언트, 리포트 월, CSV 파일은 필수입니다')
      return
    }

    setLoading(true)
    setStep('generating')
    setError(null)

    const formData = new FormData()
    formData.append('clientId', clientId)
    formData.append('reportMonth', reportMonth)
    if (previousMonth) formData.append('previousMonth', previousMonth)
    formData.append('csv', csvFile)
    if (csvPrevFile) formData.append('csvPrevious', csvPrevFile)

    const res = await fetch('/api/reports/generate', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? '리포트 생성에 실패했습니다')
      setLoading(false)
      setStep('form')
      return
    }

    router.push(`/dashboard/reports/${data.reportId}`)
  }

  if (step === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium text-gray-700">AI가 리포트를 생성하고 있습니다...</p>
        <p className="text-sm text-gray-500">보통 20-40초 정도 소요됩니다</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">리포트 생성</h1>
        <p className="text-sm text-gray-500 mt-1">CSV를 업로드하면 AI가 월간 리포트를 작성합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* 클라이언트 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            클라이언트 <span className="text-red-500">*</span>
          </label>
          <select
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">클라이언트 선택...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {clients.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">먼저 클라이언트를 추가해주세요</p>
          )}
        </div>

        {/* 리포트 월 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              리포트 월 <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              value={reportMonth}
              onChange={e => setReportMonth(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전월 (선택 — MoM 비교)
            </label>
            <input
              type="month"
              value={previousMonth}
              onChange={e => setPreviousMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* CSV 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이번 달 CSV (GSC 또는 GA4) <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={e => setCsvFile(e.target.files?.[0] ?? null)}
            required
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {previousMonth && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전월 CSV (선택)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={e => setCsvPrevFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || clients.length === 0}
            className="flex-1 py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            AI 리포트 생성 (크레딧 15개)
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}
