/**
 * AppSumo 코드 사전 생성 스크립트
 *
 * 사용법:
 *   npx tsx scripts/seed-appsumo-codes.ts
 *
 * 기본값: Tier 1 코드 50개 생성
 * 옵션:
 *   TIER=2 COUNT=100 npx tsx scripts/seed-appsumo-codes.ts
 */

import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

const TIER  = parseInt(process.env.TIER  ?? '1', 10)
const COUNT = parseInt(process.env.COUNT ?? '50', 10)
const PREFIX = `RM${TIER}-` // e.g. RM1-XXXX-XXXX

if (![1, 2, 3, 4].includes(TIER)) {
  console.error('TIER must be 1, 2, 3, or 4')
  process.exit(1)
}

function generateCode(): string {
  // Format: RM1-XXXX-XXXX  (8 random uppercase hex chars)
  const part1 = randomBytes(2).toString('hex').toUpperCase()
  const part2 = randomBytes(2).toString('hex').toUpperCase()
  return `${PREFIX}${part1}-${part2}`
}

async function main() {
  console.log(`Generating ${COUNT} Tier ${TIER} AppSumo codes...`)

  const codes: string[] = []
  const seen = new Set<string>()

  // Also load existing codes to avoid collisions
  const existing = await prisma.appsumoCode.findMany({ select: { code: true } })
  existing.forEach(r => seen.add(r.code))

  while (codes.length < COUNT) {
    const code = generateCode()
    if (!seen.has(code)) {
      seen.add(code)
      codes.push(code)
    }
  }

  const result = await prisma.appsumoCode.createMany({
    data: codes.map(code => ({ code, tier: TIER })),
    skipDuplicates: true,
  })

  console.log(`✅ Created ${result.count} codes (Tier ${TIER})`)
  console.log('\nSample codes:')
  codes.slice(0, 5).forEach(c => console.log(' ', c))
  if (COUNT > 5) console.log(`  ... and ${COUNT - 5} more`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
