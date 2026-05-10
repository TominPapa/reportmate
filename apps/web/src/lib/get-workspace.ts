import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// React cache: 같은 요청 내에서 반복 호출 시 DB를 재조회하지 않음
export const getWorkspace = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

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
