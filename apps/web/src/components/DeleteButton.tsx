'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  apiPath: string        // e.g. /api/clients/[id]
  redirectTo?: string   // after delete, redirect here
  label?: string
}

export default function DeleteButton({ apiPath, redirectTo, label = '삭제' }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading]       = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(apiPath, { method: 'DELETE' })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        alert(e.error ?? '삭제 실패')
        return
      }
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1" onClick={e => e.preventDefault()}>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? '삭제 중...' : '확인'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          취소
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={e => { e.preventDefault(); setConfirming(true) }}
      className="text-xs px-2 py-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
    >
      {label}
    </button>
  )
}
