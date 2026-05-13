import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorkspaceSecure } from '@/lib/get-workspace'
import Anthropic from '@anthropic-ai/sdk'

const REGEN_CREDITS = 5

const BLOCK_PROMPTS: Record<string, (metrics: Record<string, unknown>) => string> = {
  executive_summary: (m) =>
    `Based on this marketing data: ${JSON.stringify(m)}\n\nReturn ONLY JSON:\n{"executive_summary":"2-3 sentence overview","kpi_narrative":"1-2 sentences about key metrics"}`,
  kpi_snapshot: (m) =>
    `Based on this marketing data: ${JSON.stringify(m)}\n\nReturn ONLY JSON:\n{"wins":["win 1","win 2","win 3"],"concerns":["concern 1","concern 2"]}`,
  opportunities: (m) =>
    `Based on this marketing data: ${JSON.stringify(m)}\n\nReturn ONLY JSON:\n{"opportunities":["opportunity 1","opportunity 2","opportunity 3"],"opportunity_insight":"1-2 sentences"}`,
  action_plan: (m) =>
    `Based on this marketing data: ${JSON.stringify(m)}\n\nReturn ONLY JSON:\n{"next_actions":["action 1","action 2","action 3"]}`,
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getWorkspaceSecure()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: reportId } = await params
  const { blockType } = await req.json()

  if (!BLOCK_PROMPTS[blockType]) {
    return NextResponse.json({ error: 'Invalid block type' }, { status: 400 })
  }

  // 크레딧 확인
  const remaining = ctx.workspace.aiCreditsLimit - ctx.workspace.aiCreditsUsed
  if (remaining < REGEN_CREDITS) {
    return NextResponse.json(
      { error: `크레딧 부족 (필요: ${REGEN_CREDITS}, 잔여: ${remaining})` },
      { status: 400 }
    )
  }

  // 리포트 + 데이터셋 조회 (workspace 소속 검증 포함)
  const report = await prisma.report.findFirst({
    where: { id: reportId, workspaceId: ctx.workspace.id },
    include: { dataset: true },
  })
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  // summaryMetricsJson에서 _pdf 제외한 순수 지표만 추출
  const fullMetrics = report.dataset.summaryMetricsJson as Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _pdf, ...metricsOnly } = fullMetrics

  // AI 호출
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1000,
    system: 'You are an expert digital marketing analyst. Return ONLY valid JSON with no markdown.',
    messages: [{ role: 'user', content: BLOCK_PROMPTS[blockType](metricsOnly) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const aiResult = JSON.parse(cleaned)

  // 블록 업데이트 + 크레딧 차감 (트랜잭션)
  await prisma.$transaction(async (tx) => {
    await tx.reportBlock.updateMany({
      where: { reportId, blockType },
      data: { content: aiResult },
    })

    await tx.workspace.update({
      where: { id: ctx.workspace.id },
      data: { aiCreditsUsed: { increment: REGEN_CREDITS } },
    })

    await tx.usageLedger.create({
      data: {
        workspaceId: ctx.workspace.id,
        userId: ctx.user.id,
        reportId,
        action: 'regenerate_block',
        creditsUsed: REGEN_CREDITS,
      },
    })
  })

  return NextResponse.json({ ok: true, content: aiResult })
}
