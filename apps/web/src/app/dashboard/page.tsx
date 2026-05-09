import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user!.id },
    include: {
      clients: { orderBy: { createdAt: 'desc' }, take: 5 },
      reports: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { client: { select: { name: true } } },
      },
    },
  })

  const clientCount = workspace?.clients.length ?? 0
  const reportCount = await prisma.report.count({
    where: { workspaceId: workspace?.id },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{workspace?.name}</h1>
        <p className="text-sm text-gray-500 mt-1">AI 크레딧 현황 및 최근 활동</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">클라이언트</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{clientCount}</p>
          <p className="text-xs text-gray-400 mt-1">최대 {workspace?.maxClients ?? 5}개</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">생성된 리포트</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{reportCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">AI 크레딧 잔여</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {(workspace?.aiCreditsLimit ?? 100) - (workspace?.aiCreditsUsed ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {workspace?.aiCreditsUsed ?? 0} / {workspace?.aiCreditsLimit ?? 100} 사용
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/clients/new"
          className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition-colors"
        >
          <p className="text-lg font-semibold">+ 클라이언트 추가</p>
          <p className="text-sm text-blue-100 mt-1">새 클라이언트를 등록하세요</p>
        </Link>
        <Link
          href="/dashboard/reports/new"
          className="bg-white border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors"
        >
          <p className="text-lg font-semibold text-gray-900">+ 리포트 생성</p>
          <p className="text-sm text-gray-500 mt-1">CSV를 업로드하여 AI 리포트를 만드세요</p>
        </Link>
      </div>

      {/* Recent reports */}
      {workspace?.reports && workspace.reports.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 리포트</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {workspace.reports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/reports/${report.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{report.client.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.status === 'final'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {report.status === 'final' ? '완료' : '초안'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
