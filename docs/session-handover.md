# ReportMate — 세션 인수인계 파일

> 이 파일은 Claude Code / AI 개발 도구가 새 세션에서 컨텍스트 없이 작업을 이어갈 수 있도록  
> 프로젝트 전체 상태와 핵심 원칙을 한 곳에 정리한 인수인계 문서다.  
> **새 세션 시작 시 반드시 이 파일을 먼저 읽는다.**

최종 업데이트: 2026-05-18 (Phase 1 MVP 대부분 완료, AppSumo 코드 시스템 착수 전)

---

## 1. 프로젝트 정체성

**ReportMate** — 소형 마케팅 에이전시와 프리랜서 마케터가 GA4 / GSC CSV를 업로드하면, AI가 클라이언트에게 바로 보낼 수 있는 월간 성과 보고서를 생성해주는 SaaS.

**핵심 포지셔닝:**
> Looker Studio shows the data. ReportMate explains it to your client.

**1차 타깃:** SEO / 콘텐츠 마케팅 에이전시 (직원 1~20명)  
**유통 채널:** AppSumo (글로벌 SaaS 평생 이용권 마켓) — 영어 기반 글로벌 서비스

---

## 2. 기준 문서 체계

| 문서 | 경로 | 역할 |
|------|------|------|
| **PRD + 기능 명세** | `reportmate_prd_functional_spec_v_0_1.md` | 제품 전체 기준 (v1.2) |
| 세션 인수인계 | `docs/session-handover.md` | 이 파일 |
| 수익 모델 | `docs/revenue-model.md` | AppSumo 기반 수익 구조 |

---

## 3. 기술 스택 (확정)

| 영역 | 선택 | 비고 |
|------|------|------|
| Frontend/Backend | Next.js App Router + TypeScript | Server Components 우선 |
| UI | Tailwind CSS | shadcn/ui 미사용 (직접 구현) |
| DB | PostgreSQL (Supabase) | |
| ORM | Prisma | |
| 인증 | Supabase Auth | |
| 파일 저장 | Supabase Storage | |
| AI | Anthropic Claude API (claude-opus-4-5) | |
| PDF | @react-pdf/renderer v4.5.1 | NanumGothic 폰트 (한글 지원) |
| 배포 | Vercel | Root Directory = `apps/web` |
| 패키지 매니저 | pnpm | |

---

## 4. 핵심 불변 원칙

### 4.1 AI Credit 정책
| 작업 | Credit |
|------|--------|
| 전체 리포트 초안 생성 | 15 |
| 블록 단위 재생성 | 5 |
| 문체 변경 후 재생성 | 5 |
| 위험 문장 교정 | 2 |
| 제목/요약 짧은 재작성 | 1 |
| PDF export / 공유 링크 / CSV 업로드 | 0 |

- Credit은 **생성 성공 시에만 차감**
- 최종 실패 시 Credit 차감 없음

### 4.2 AppSumo 티어 (확정)
| 티어 | 가격 | 클라이언트 | AI Credit/월 | 팀원 |
|------|------|-----------|------------|------|
| Tier 1 | $69 | 5 | 100 | 1 |
| Tier 2 | $129 | 15 | 350 | 3 |
| Tier 3 | $249 | 40 | 1,000 | 10 |
| Tier 4 | $399 | 100 | 2,500 | 20 |

- 코드 스태킹: 최대 4개, 1개=Tier1 → 4개=Tier4
- 월 리셋: 코드 등록일 기준 매월 같은 날

### 4.3 데이터 저장 구조
- 원본 CSV → Supabase Storage
- `datasets.summary_metrics_json` → KPI 집계 결과만 (JSONB, `_pdf` 필드 포함)
- AI 호출 시 `_pdf` 필드 제거한 순수 지표만 전달

### 4.4 Auth 구조
- `public.users.id` = `auth.users.id` (동일 UUID)
- 가입 시 DB Trigger로 `public.users` row 자동 생성
- RLS 미사용 → 서버단 `workspace_id` 필터링 강제
- 클라이언트에서 전달된 workspace_id 신뢰 금지

### 4.5 공유 링크
- 경로: `/share/[token]` (페이지 라우트, API 아님)
- 기본 만료 없음, 사용자가 수동 비활성화
- 토큰: UUID v4

---

## 5. DB 스키마 (Prisma, 2026-05-18 기준)

**파일:** `apps/web/prisma/schema.prisma`

```
users, workspaces, workspace_members,
clients,
uploaded_files, datasets,
reports, report_blocks,
shared_links,
appsumo_codes, usage_ledger
```

**핵심 컬럼:**
- `workspaces.ai_credits_limit` / `ai_credits_used` — 크레딧 추적
- `workspaces.max_clients` — 클라이언트 한도
- `datasets.summary_metrics_json` — JSONB, `_pdf` 필드 포함 (PDF 생성용)
- `report_blocks.content` — JSONB, AI 생성 결과
- `shared_links.token` — UUID, isActive 플래그
- `appsumo_codes.code` / `tier` / `redeemedAt` / `workspaceId` — AppSumo 코드

---

## 6. 현재 개발 진행 상태 (2026-05-18)

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 0 | 데모 앱 완성 | ✅ 완료 |
| **Phase 1** | MVP Core | ✅ **대부분 완료** |
| Phase 2 | Export & Sharing | ✅ **완료 (Phase 1에 통합 구현)** |
| Phase 3 | AppSumo Readiness | 🔄 **진행 중** (다음 작업: AppSumo 코드 시스템) |
| Phase 4 | Post-launch | 미시작 |

---

## 7. 구현 완료 기능 목록 (2026-05-18 기준)

### 7.1 인증 (Supabase Auth)
- ✅ 로그인 / 회원가입 (`/login`, `/signup`)
- ✅ 미들웨어 auth guard (`/dashboard/**` 보호)
  - Edge Runtime 안전: `getSession()` 사용 (네트워크 요청 없음)
  - `apps/web/src/middleware.ts`

### 7.2 클라이언트 관리
- ✅ 클라이언트 목록 (`/dashboard/clients`)
  - hover 시 삭제 버튼 노출
- ✅ 클라이언트 추가 (`/dashboard/clients/new`)
- ✅ 클라이언트 삭제 API (`DELETE /api/clients/[id]`)
  - workspace 소속 검증 + cascade 삭제 (리포트, 데이터셋 포함)
- ✅ 최대 클라이언트 수 제한 (`workspace.maxClients`)

### 7.3 CSV 업로드 & 분석
- ✅ GA4 CSV 업로드 + 컬럼 자동 감지
- ✅ GSC CSV 업로드 + 컬럼 자동 감지
- ✅ MoM(전월 대비) 계산
- ✅ `summary_metrics_json` + `_pdf` 필드 저장

### 7.4 AI 리포트 생성
- ✅ Claude claude-opus-4-5 API로 4개 블록 동시 생성
  - executive_summary, kpi_snapshot, opportunities, action_plan
- ✅ 15 크레딧 차감 (트랜잭션)
- ✅ `usage_ledger` 기록
- ✅ 크레딧 부족 시 에러 반환

### 7.5 리포트 목록 & 상세
- ✅ 리포트 목록 (`/dashboard/reports`)
  - hover 시 삭제 버튼 노출
- ✅ 리포트 삭제 API (`DELETE /api/reports/[id]`)
- ✅ 리포트 상세 (`/dashboard/reports/[id]`)
  - PDF 자동 생성 → iframe inline 미리보기
  - 로딩 스피너 / 에러 재시도 UI

### 7.6 PDF 생성
- ✅ `POST /api/pdf` — `@react-pdf/renderer` 서버사이드 PDF 생성
- ✅ 한글 폰트: NanumGothic (fonts.gstatic.com CDN — 서버사이드 접근 가능)
  - Regular: `https://fonts.gstatic.com/s/nanumgothic/v26/PN_3Rfi-oW3hYwmKDpxS7F_z_g.ttf`
  - Bold: `https://fonts.gstatic.com/s/nanumgothic/v26/PN_oRfi-oW3hYwmKDpxS7F_LQv37zg.ttf`
- ✅ RFC 5987 filename 인코딩 (한글 클라이언트명 ByteString 오류 해결)
  ```
  Content-Disposition: attachment; filename="ASCII_fallback.pdf"; filename*=UTF-8''%EC%A0%95...
  ```
- ✅ PDF 구성: Cover / KPI Snapshot / Executive Summary / Wins & Concerns / Opportunities / Action Plan

### 7.7 공유 링크
- ✅ 공유 링크 생성 API (`POST /api/reports/[id]/share`)
  - 기존 활성 링크 있으면 재사용
- ✅ 공유 링크 비활성화 (`DELETE /api/reports/[id]/share`)
- ✅ 공유 페이지 (`/share/[token]`)
  - 토큰 유효성 검증 (isActive 확인)
  - PDF 자동 생성 + iframe 표시
  - 공개 PDF 생성 API (`GET /api/share/[token]/pdf`)
- ✅ 클립보드 복사 + 복사 완료 UI 피드백

### 7.8 블록 단위 재생성
- ✅ 재생성 API (`POST /api/reports/[id]/regenerate-block`)
  - `blockType` 파라미터: executive_summary / kpi_snapshot / opportunities / action_plan
  - `summary_metrics_json`에서 `_pdf` 제거 후 AI 전달
  - 5 크레딧 차감 (트랜잭션)
  - `usage_ledger` 기록
- ✅ 재생성 UI 패널 (리포트 상세 하단)
  - `✏️ 블록 단위 재생성` 토글 버튼
  - 4개 블록 카드 (5 크레딧 표시)
  - 재생성 중 로딩 상태
  - 완료 후 PDF 자동 갱신

### 7.9 공통 컴포넌트
- ✅ `DeleteButton.tsx` — hover-reveal 2단계 확인 삭제 버튼

### 7.10 랜딩 페이지
- ✅ `/` 랜딩 페이지 (`apps/web/src/app/page.tsx`)
  - Sticky 네비게이션 (Sign in / Get Started Free)
  - Hero 섹션 + 가치 제안
  - 3단계 사용 흐름
  - Before/After 비교 그리드
  - 6개 기능 카드
  - AppSumo Tier 1~4 가격표
  - Dark CTA 섹션
  - 푸터

---

## 8. 핵심 파일 목록

```
apps/web/
├── prisma/
│   └── schema.prisma                      # DB 스키마 (SharedLink, AppSumoCode 포함)
├── src/
│   ├── middleware.ts                       # Auth guard (getSession 기반)
│   ├── lib/
│   │   ├── prisma.ts                      # Prisma client singleton
│   │   ├── get-workspace.ts               # getWorkspace / getWorkspaceSecure
│   │   └── supabase/
│   │       ├── client.ts                  # Browser Supabase client
│   │       └── server.ts                  # Server Supabase client (cookies)
│   ├── app/
│   │   ├── page.tsx                       # 랜딩 페이지
│   │   ├── (auth)/login/page.tsx          # 로그인
│   │   ├── (auth)/signup/page.tsx         # 회원가입
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                 # 대시보드 레이아웃 + 사이드바
│   │   │   ├── page.tsx                   # 대시보드 홈
│   │   │   ├── clients/page.tsx           # 클라이언트 목록 (삭제 버튼 포함)
│   │   │   ├── clients/[id]/page.tsx      # 클라이언트 상세
│   │   │   ├── clients/new/page.tsx       # 클라이언트 추가
│   │   │   ├── reports/page.tsx           # 리포트 목록 (삭제 버튼 포함)
│   │   │   ├── reports/[id]/page.tsx      # 리포트 상세 (서버 컴포넌트)
│   │   │   └── reports/new/page.tsx       # 리포트 생성 (CSV 업로드)
│   │   ├── share/[token]/
│   │   │   ├── page.tsx                   # 공유 페이지 (서버 컴포넌트)
│   │   │   └── ShareViewer.tsx            # 공유 PDF iframe (클라이언트 컴포넌트)
│   │   └── api/
│   │       ├── pdf/route.ts               # PDF 생성 (POST)
│   │       ├── clients/[id]/route.ts      # 클라이언트 삭제 (DELETE)
│   │       ├── reports/[id]/route.ts      # 리포트 삭제 (DELETE)
│   │       ├── reports/[id]/share/route.ts         # 공유 링크 생성/비활성화
│   │       ├── reports/[id]/regenerate-block/route.ts  # 블록 재생성 (POST)
│   │       └── share/[token]/pdf/route.ts # 공개 PDF 생성 (GET)
│   └── components/
│       ├── ReportDetailClient.tsx         # 리포트 상세 (PDF iframe + 재생성 패널)
│       ├── ShareViewer.tsx                # 공유 페이지 뷰어
│       ├── ReportPDF.tsx                  # @react-pdf/renderer PDF 레이아웃
│       └── DeleteButton.tsx              # 삭제 확인 버튼
```

---

## 9. 인프라 정보

- **Live URL:** https://reportmate-web.vercel.app
- **GitHub:** https://github.com/TominPapa/reportmate
- **Vercel Root Directory:** `apps/web`
- **DB:** Supabase (PostgreSQL)
- **브랜치:** `main` (직접 배포)

---

## 10. 알려진 이슈 / 기술 부채

| 항목 | 상태 | 우선순위 |
|------|------|---------|
| jsDelivr CDN 403 — 서버사이드 폰트 로드 불가 | ✅ 해결 (fonts.gstatic.com으로 교체) | — |
| 한글 파일명 ByteString 오류 | ✅ 해결 (RFC 5987 인코딩) | — |
| Middleware getUser() Edge Runtime 오류 | ✅ 해결 (getSession()으로 교체) | — |
| 크레딧 월 리셋 로직 미구현 | ⏳ AppSumo 코드 시스템과 함께 구현 예정 | 🟡 MEDIUM |
| 팀원 초대 / workspace_members 관리 UI | ⏳ Phase 4 | 🟢 LOW |
| 리포트 편집기 (블록 직접 텍스트 수정) | ⏳ Phase 4 | 🟢 LOW |

---

## 11. 다음 작업: AppSumo 코드 등록 시스템

**목표:** 구매자가 AppSumo 코드를 입력하면 워크스페이스에 티어가 적용되는 시스템 구현

### 11.1 구현 범위
1. **코드 사전 생성 스크립트** (`scripts/seed-appsumo-codes.ts`)
   - `appsumo_codes` 테이블에 코드 배치 INSERT
   - tier 1~4 구분, 미사용 상태로 저장

2. **코드 등록 API** (`POST /api/appsumo/redeem`)
   - 코드 유효성 검증 (존재 + 미사용 + 만료 전)
   - 스태킹 로직: 현재 티어 + 새 코드 → 합산 티어 계산
   - 트랜잭션: 코드 사용 처리 + 워크스페이스 한도 업데이트
   - `usage_ledger` 기록

3. **코드 등록 UI** (`/dashboard/settings` 또는 `/dashboard/billing`)
   - 코드 입력 폼 + 제출 버튼
   - 현재 플랜 표시 (티어, 남은 크레딧, 클라이언트 수)
   - 등록 성공/실패 피드백

### 11.2 티어 한도 정의
```typescript
const TIER_LIMITS = {
  1: { maxClients: 5,   aiCreditsLimit: 100,  maxMembers: 1  },
  2: { maxClients: 15,  aiCreditsLimit: 350,  maxMembers: 3  },
  3: { maxClients: 40,  aiCreditsLimit: 1000, maxMembers: 10 },
  4: { maxClients: 100, aiCreditsLimit: 2500, maxMembers: 20 },
}
```

### 11.3 스태킹 규칙
- 코드 1개 = Tier 1, 2개 = Tier 2, 3개 = Tier 3, 4개 = Tier 4
- 이미 4개 등록한 워크스페이스는 추가 등록 불가
- 동일 코드 중복 등록 불가

### 11.4 관련 DB 모델
```prisma
model AppsumoCode {
  id          String    @id @default(uuid()) @db.Uuid
  code        String    @unique
  tier        Int
  workspaceId String?   @map("workspace_id") @db.Uuid
  redeemedAt  DateTime? @map("redeemed_at")
  expiresAt   DateTime? @map("expires_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  workspace   Workspace? @relation(...)
  @@map("appsumo_codes")
}
```

---

## 12. 새 세션 시작 프롬프트 (그대로 복사)

```
너는 ReportMate SaaS의 실개발 담당자다.
인수인계 문서: docs/session-handover.md (반드시 먼저 읽을 것)

현재 Phase: Phase 3 (AppSumo Readiness)
이번 세션 목표: [목표 기입]

절대 원칙:
1. 대시보드 경쟁 금지. 클라이언트 제출용 보고서 완성이 핵심
2. AI에 원본 CSV 전달 금지. summary_metrics_json만 전달 (_pdf 필드 제거 후)
3. Credit은 생성 성공 시에만 차감
4. 공유 링크는 /share/[token] 페이지 라우트 (API 아님)
5. workspace_id는 클라이언트 전달값 신뢰 금지, getWorkspaceSecure()로 재확인
6. Supabase Auth user.id = Prisma users.id (동일 UUID)
7. jsDelivr CDN 사용 금지 (서버사이드 403). 폰트는 fonts.gstatic.com 사용

각 작업 완료 시: 변경 파일 목록 / 구현 기능 / 검증 결과 / 남은 TODO 정리
```
