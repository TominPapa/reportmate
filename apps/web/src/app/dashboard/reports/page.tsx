import { prisma } from '@/lib/prisma'
import { getWorkspace } from '@/lib/get-workspace'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'

export default async function ReportsPage() {
  const ctx = await getWorkspace()
  const { workspace: ws } = ctx!

  const workspace = await prisma.workspace.findFirst({
    where: { id: ws.id },
  })

  const reports = await prisma.report.findMany({
    where: { workspaceId: workspace!.id },
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true } },
      dataset: { select: { dataType: true, reportMonth: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">리포트</h1>
          <p className="text-sm text-gray-500 mt-1">{reports.length}개 생성됨</p>
        </div>
        <Link
          href="/dashboard/reports/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 리포트 생성
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">아직 생성된 리포트가 없습니다</p>
          <Link
            href="/dashboard/reports/new"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            첫 리포트 만들기
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
              <Link href={`/dashboard/reports/${report.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${report.status === 'final' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {report.client.name} · {report.dataset.dataType.toUpperCase()} · {report.dataset.reportMonth}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  report.status === 'final' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {report.status === 'final' ? '완료' : '초안'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteButton
                    apiPath={`/api/reports/${report.id}`}
                    redirectTo="/dashboard/reports"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
