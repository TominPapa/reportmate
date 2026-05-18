import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceSecure } from '@/lib/get-workspace'

export async function GET() {
  const ctx = await getWorkspaceSecure()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const codes = await prisma.appsumoCode.findMany({
    where:   { workspaceId: ctx.workspace.id },
    orderBy: { redeemedAt: 'asc' },
    select:  { code: true, tier: true, redeemedAt: true },
  })

  const codesCount = codes.length
  const tier = Math.min(codesCount, 4)  // 0 = free / 1~4 = paid

  return NextResponse.json({
    tier,
    codesCount,
    codes,
    workspace: {
      aiCreditsUsed:  ctx.workspace.aiCreditsUsed,
      aiCreditsLimit: ctx.workspace.aiCreditsLimit,
      maxClients:     ctx.workspace.maxClients,
      maxMembers:     ctx.workspace.maxMembers,
      creditsResetAt: ctx.workspace.creditsResetAt,
    },
  })
}
