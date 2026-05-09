import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
    include: { _count: { select: { clients: true } } },
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  if (workspace._count.clients >= workspace.maxClients) {
    return NextResponse.json(
      { error: `최대 ${workspace.maxClients}개 클라이언트까지 등록 가능합니다` },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { name, website } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: '클라이언트명을 입력하세요' }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: {
      workspaceId: workspace.id,
      name: name.trim(),
      website: website?.trim() || null,
    },
  })

  return NextResponse.json(client, { status: 201 })
}
