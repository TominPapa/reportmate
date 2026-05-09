import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ClientsPage() {
  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user!.id },
    include: {
      clients: { orderBy: { createdAt: 'desc' } },
    },
  })

  const clients = workspace?.clients ?? []
  const canAddMore = clients.length < (workspace?.maxClients ?? 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">클라이언트</h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} / {workspace?.maxClients ?? 5}개 등록</p>
        </div>
        {canAddMore && (
          <Link
            href="/dashboard/clients/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 클라이언트 추가
          </Link>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">등록된 클라이언트가 없습니다</p>
          <Link
            href="/dashboard/clients/new"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            첫 클라이언트 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-sm">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{client.name}</p>
                  {client.website && (
                    <p className="text-xs text-gray-400 truncate">{client.website}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(client.createdAt).toLocaleDateString('ko-KR')} 등록
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
