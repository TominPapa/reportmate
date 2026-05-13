import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceSecure } from '@/lib/get-workspace'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getWorkspaceSecure()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const client = await prisma.client.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.client.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
