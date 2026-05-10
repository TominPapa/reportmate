import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// getSession(): JWT를 쿠키에서 직접 읽음 (HTTP 왕복 없음) → 빠름
// getUser(): Supabase 서버에 검증 요청 (HTTP 왕복 있음) → 느림
// 대시보드 내부 페이지는 layout에서 이미 인증 완료 → getSession으로 충분

export const getWorkspace = cache(async () => {
  const supabase = await createClient()

  // session에서 user 정보 직접 추출 (네트워크 없이 JWT 디코딩)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const user = session.user

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true, name: true, ownerId: true,
      aiCreditsUsed: true, aiCreditsLimit: true,
      maxClients: true, maxMembers: true,
    },
  })

  return workspace ? { user, workspace } : null
})

// API route용: 보안이 중요한 쓰기 작업에는 getUser() 사용
export async function getWorkspaceSecure() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
  })

  return workspace ? { user, workspace } : null
}
