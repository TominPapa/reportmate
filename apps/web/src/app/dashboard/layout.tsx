import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
    select: { id: true, name: true, aiCreditsUsed: true, aiCreditsLimit: true },
  })

  if (!workspace) redirect('/login')

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
