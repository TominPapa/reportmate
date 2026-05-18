import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceSecure } from '@/lib/get-workspace'

// 티어별 워크스페이스 한도
const TIER_LIMITS: Record<number, { maxClients: number; aiCreditsLimit: number; maxMembers: number }> = {
  1: { maxClients: 5,   aiCreditsLimit: 100,  maxMembers: 1  },
  2: { maxClients: 15,  aiCreditsLimit: 350,  maxMembers: 3  },
  3: { maxClients: 40,  aiCreditsLimit: 1000, maxMembers: 10 },
  4: { maxClients: 100, aiCreditsLimit: 2500, maxMembers: 20 },
}

// 스태킹: 보유 코드 수 → 티어 결정 (1코드=Tier1, 2코드=Tier2, ...)
function codesCountToTier(count: number): number {
  return Math.min(count, 4)
}

export async function POST(req: NextRequest) {
  const ctx = await getWorkspaceSecure()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: '코드를 입력해주세요.' }, { status: 400 })
  }

  const normalizedCode = code.trim().toUpperCase()

  // 코드 유효성 확인
  const appsumoCode = await prisma.appsumoCode.findUnique({
    where: { code: normalizedCode },
  })

  if (!appsumoCode) {
    return NextResponse.json({ error: '유효하지 않은 코드입니다.' }, { status: 400 })
  }

  if (appsumoCode.workspaceId) {
    // 이미 다른 워크스페이스에서 사용된 코드 (또는 본인이 이미 등록한 코드)
    if (appsumoCode.workspaceId === ctx.workspace.id) {
      return NextResponse.json({ error: '이미 등록된 코드입니다.' }, { status: 400 })
    }
    return NextResponse.json({ error: '이미 사용된 코드입니다.' }, { status: 400 })
  }

  if (appsumoCode.expiresAt && appsumoCode.expiresAt < new Date()) {
    return NextResponse.json({ error: '만료된 코드입니다.' }, { status: 400 })
  }

  // 현재 워크스페이스의 등록된 코드 수 조회
  const existingCodesCount = await prisma.appsumoCode.count({
    where: { workspaceId: ctx.workspace.id },
  })

  if (existingCodesCount >= 4) {
    return NextResponse.json(
      { error: '최대 4개 코드까지만 등록 가능합니다. (Tier 4 최대)' },
      { status: 400 }
    )
  }

  // 새 코드 등록 후의 총 코드 수 → 티어 결정
  const newTotalCodes = existingCodesCount + 1
  const newTier       = codesCountToTier(newTotalCodes)
  const limits        = TIER_LIMITS[newTier]

  // 트랜잭션: 코드 할당 + 워크스페이스 한도 업데이트
  await prisma.$transaction(async (tx) => {
    // 코드 워크스페이스에 연결
    await tx.appsumoCode.update({
      where: { code: normalizedCode },
      data: {
        workspaceId: ctx.workspace.id,
        redeemedAt:  new Date(),
      },
    })

    // 워크스페이스 한도 업데이트
    await tx.workspace.update({
      where: { id: ctx.workspace.id },
      data: {
        maxClients:     limits.maxClients,
        aiCreditsLimit: limits.aiCreditsLimit,
        maxMembers:     limits.maxMembers,
      },
    })
  })

  return NextResponse.json({
    ok:        true,
    tier:      newTier,
    totalCodes: newTotalCodes,
    limits,
    message:   `Tier ${newTier} 플랜이 적용되었습니다.`,
  })
}
