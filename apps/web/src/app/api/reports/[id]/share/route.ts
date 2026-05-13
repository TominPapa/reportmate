import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceSecure } from '@/lib/get-workspace'

// POST /api/reports/[id]/share — 공유 링크 생성 (이미 있으면 기존 토큰 반환)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getWorkspaceSecure()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: reportId } = await params

  // 해당 워크스페이스 소속 리포트인지 확인
  const report = await prisma.report.findFirst({
    where: { id: reportId, workspaceId: ctx.workspace.id },
  })
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  // 기존 활성 공유 링크가 있으면 재사용
  const existing = await prisma.sharedLink.findFirst({
    where: { reportId, isActive: true },
  })
  if (existing) {
    return NextResponse.json({ token: existing.token })
  }

  // 새로 생성
  const link = await prisma.sharedLink.create({
    data: { reportId, workspaceId: ctx.workspace.id },
  })

  return NextResponse.json({ token: link.token })
}

// DELETE /api/reports/[id]/share — 공유 링크 비활성화
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getWorkspaceSecure()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: reportId } = await params

  await prisma.sharedLink.updateMany({
    where: { reportId, workspaceId: ctx.workspace.id },
    data: { isActive: false },
  })

  return NextResponse.json({ ok: true })
}
