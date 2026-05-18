'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/auth/actions'

interface Props {
  workspaceName: string
  creditsUsed: number
  creditsLimit: number
  userEmail: string
}

export default function DashboardNav({ workspaceName, creditsUsed, creditsLimit, userEmail }: Props) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/dashboard/clients', label: '클라이언트' },
    { href: '/dashboard/reports', label: '리포트' },
    { href: '/dashboard/settings', label: '설정' },
  ]

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-lg font-bold text-gray-900">
              ReportMate
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">{creditsUsed}</span>
              <span> / {creditsLimit} 크레딧</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{userEmail}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
