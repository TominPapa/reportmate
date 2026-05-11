import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // getSession(): JWT를 쿠키에서 읽음 (네트워크 없음) → Edge Runtime에서 빠르고 안전
    // 라우트 보호 목적에는 충분. 쓰기 API는 별도로 getUser() 사용
    const { data: { session } } = await supabase.auth.getSession()

    const { pathname } = request.nextUrl

    // 미인증 상태에서 /dashboard 접근 → 로그인 페이지로
    if (!session && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 이미 로그인된 상태에서 로그인/회원가입 페이지 접근 → 대시보드로
    if (session && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

  } catch {
    // 미들웨어 오류 시 통과 처리 (서비스 중단 방지)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // 정적 파일, 이미지, API 라우트 제외
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
