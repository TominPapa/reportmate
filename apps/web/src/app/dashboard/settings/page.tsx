import { prisma } from '@/lib/prisma'
import { getWorkspace } from '@/lib/get-workspace'
import BillingClient from './BillingClient'

export default async function SettingsPage() {
  const ctx = await getWorkspace()
  const { workspace: ws } = ctx!

  // 상세 workspace 정보 로드
  const workspace = await prisma.workspace.findFirst({
    where: { id: ws.id },
  })

  // 등록된 AppSumo 코드 로드
  const codes = await prisma.appsumoCode.findMany({
    where:   { workspaceId: ws.id },
    orderBy: { redeemedAt: 'asc' },
    select:  { code: true, tier: true, redeemedAt: true },
  })

  const codesCount = codes.length
  const tier = Math.min(codesCount, 4)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-sm text-gray-500 mt-1">플랜 및 계정 관리</p>
      </div>

      {/* 현재 플랜 현황 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">현재 플랜</h2>

        {/* 티어 배지 */}
        <div className="flex items-center gap-3">
          {tier === 0 ? (
            <span className="px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-600 rounded-full">
              Free
            </span>
          ) : (
            <span className="px-3 py-1 text-sm font-semibold bg-blue-600 text-white rounded-full">
              AppSumo Tier {tier}
            </span>
          )}
          <span className="text-sm text-gray-500">
            코드 {codesCount}개 등록됨
          </span>
        </div>

        {/* 한도 현황 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">AI 크레딧</p>
            <p className="text-lg font-bold text-gray-900">
              {workspace!.aiCreditsLimit - workspace!.aiCreditsUsed}
              <span className="text-sm font-normal text-gray-400"> / {workspace!.aiCreditsLimit}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">잔여</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">클라이언트</p>
            <p className="text-lg font-bold text-gray-900">
              <span className="text-sm font-normal text-gray-400">최대 </span>
              {workspace!.maxClients}개
            </p>
            <p className="text-xs text-gray-400 mt-1">한도</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">팀원</p>
            <p className="text-lg font-bold text-gray-900">
              <span className="text-sm font-normal text-gray-400">최대 </span>
              {workspace!.maxMembers}명
            </p>
            <p className="text-xs text-gray-400 mt-1">한도</p>
          </div>
        </div>

        {/* 크레딧 리셋 날짜 */}
        <p className="text-xs text-gray-400">
          크레딧 리셋일: {new Date(workspace!.creditsResetAt).toLocaleDateString('ko-KR')}
        </p>

        {/* 등록된 코드 목록 */}
        {codes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">등록된 코드</p>
            <div className="space-y-1.5">
              {codes.map((c, i) => (
                <div key={c.code} className="flex items-center justify-between text-xs px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="font-mono text-gray-700">{c.code}</span>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span>Tier {c.tier}</span>
                    <span>{c.redeemedAt ? new Date(c.redeemedAt).toLocaleDateString('ko-KR') : '-'}</span>
                    {i === codes.length - 1 && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">최신</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 코드 등록 */}
      <BillingClient codesCount={codesCount} />

      {/* 티어 비교표 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">AppSumo 티어 안내</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-gray-500 font-medium">티어</th>
                <th className="text-left pb-2 text-gray-500 font-medium">코드 수</th>
                <th className="text-left pb-2 text-gray-500 font-medium">클라이언트</th>
                <th className="text-left pb-2 text-gray-500 font-medium">AI 크레딧/월</th>
                <th className="text-left pb-2 text-gray-500 font-medium">팀원</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { tier: 1, codes: 1, clients: 5,   credits: 100,  members: 1  },
                { tier: 2, codes: 2, clients: 15,  credits: 350,  members: 3  },
                { tier: 3, codes: 3, clients: 40,  credits: 1000, members: 10 },
                { tier: 4, codes: 4, clients: 100, credits: 2500, members: 20 },
              ].map(row => (
                <tr
                  key={row.tier}
                  className={`${tier === row.tier ? 'bg-blue-50' : ''}`}
                >
                  <td className="py-2.5 font-medium text-gray-900">
                    Tier {row.tier}
                    {tier === row.tier && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">← 현재</span>
                    )}
                  </td>
                  <td className="py-2.5 text-gray-600">{row.codes}개</td>
                  <td className="py-2.5 text-gray-600">{row.clients}개</td>
                  <td className="py-2.5 text-gray-600">{row.credits.toLocaleString()}</td>
                  <td className="py-2.5 text-gray-600">{row.members}명</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * 코드 스태킹: AppSumo에서 추가 코드 구매 후 등록하면 상위 티어로 자동 업그레이드됩니다.
        </p>
      </section>
    </div>
  )
}
