import { redirect } from 'next/navigation'
import { getWorkspace } from '@/lib/get-workspace'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await getWorkspace()
  if (!ctx) redirect('/login')

  const { user, workspace } = ctx

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav
        workspaceName={workspace.name}
        creditsUsed={workspace.aiCreditsUsed}
        creditsLimit={workspace.aiCreditsLimit}
        userEmail={user.email ?? ''}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
