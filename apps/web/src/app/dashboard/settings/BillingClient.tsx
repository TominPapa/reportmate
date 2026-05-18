'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  codesCount: number
}

export default function BillingClient({ codesCount }: Props) {
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const maxReached = codesCount >= 4

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res  = await fetch('/api/appsumo/redeem', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '코드 등록에 실패했습니다.')
        return
      }

      setSuccess(data.message ?? `Tier ${data.tier} 플랜이 적용되었습니다.`)
      setCode('')
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">AppSumo 코드 등록</h2>
      <p className="text-sm text-gray-500 mb-4">
        AppSumo에서 구매한 코드를 입력하면 플랜이 즉시 업그레이드됩니다.
      </p>

      {maxReached ? (
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-500">✅ 코드 4개 등록 완료 — Tier 4 최대 플랜입니다.</span>
        </div>
      ) : (
        <form onSubmit={handleRedeem} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="RM1-XXXX-XXXX"
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50
                       placeholder:text-gray-300 uppercase"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                       hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading ? '등록 중...' : '코드 등록'}
          </button>
        </form>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
      {success && (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-600 font-medium">
          <span>🎉</span>
          <span>{success}</span>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        * 코드는 대소문자 구분 없이 입력 가능합니다. 최대 4개 스태킹.
      </p>
    </section>
  )
}
