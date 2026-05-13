import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ShareViewer from './ShareViewer'

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const link = await prisma.sharedLink.findUnique({
    where: { token },
    include: {
      report: {
        include: {
          client:  { select: { name: true } },
          dataset: { select: { reportMonth: true, dataType: true } },
        },
      },
    },
  })

  if (!link || !link.isActive) notFound()

  return (
    <ShareViewer
      token={token}
      clientName={link.report.client.name}
      reportMonth={link.report.dataset.reportMonth}
      dataType={link.report.dataset.dataType}
      reportTitle={link.report.title}
    />
  )
}
