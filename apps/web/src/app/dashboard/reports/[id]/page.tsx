import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ReportDetailClient from '@/components/ReportDetailClient'

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const workspace = await prisma.workspace.findFirst({ where: { ownerId: user.id } })
  if (!workspace) redirect('/login')

  const report = await prisma.report.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      client: true,
      dataset: true,
      blocks: { orderBy: { order: 'asc' } },
    },
  })

  if (!report) notFound()

  return <ReportDetailClient report={report} />
}
