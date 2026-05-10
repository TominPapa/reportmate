# ReportMate — 세션 인수인계 파일

> 이 파일은 Claude Code / AI 개발 도구가 새 세션에서 컨텍스트 없이 작업을 이어갈 수 있도록  
> 프로젝트 전체 상태와 핵심 원칙을 한 곳에 정리한 인수인계 문서다.  
> **새 세션 시작 시 반드시 이 파일을 먼저 읽는다.**

최종 업데이트: 2026-05-10 (MVP 앱 완성 + Vercel 배포 반영)

---

## 1. 프로젝트 정체성

**ReportMate** — 소형 마케팅 에이전시와 프리랜서 마케터가 GA4 / GSC / Google Ads / Meta Ads 등의 성과 CSV를 업로드하면, AI가 클라이언트에게 바로 보낼 수 있는 월간 성과 보고서를 생성해주는 SaaS.

**핵심 포지셔닝:**
> Looker Studio shows the data. ReportMate explains it to your client.

**이 제품은 대시보드가 아니다.** 데이터를 보여주는 것이 아니라, 클라이언트가 이해할 수 있는 보고서 문장과 PDF 산출물을 만드는 도구다.

**1차 타깃:** SEO / 콘텐츠 마케팅 에이전시 (직원 1~20명)  
**유통 채널:** AppSumo (글로벌 SaaS 평생 이용권 마켓) — 영어 기반 글로벌 서비스

---

## 2. 기준 문서 체계

| 문서 | 경로 | 역할 |
|------|------|------|
| **PRD + 기능 명세 (최신)** | `reportmate_prd_functional_spec_v_0_1.md` | 제품 전체 기준 (v1.2) |
| 세션 인수인계 | `docs/session-handover.md` | 이 파일 |
| 개발 로드맵 | `docs/development-roadmap.md` | Phase별 작업 목록 (이전 프로젝트용, 참고만) |
| 수익 모델 | `docs/revenue-model.md` | AppSumo 기반 수익 구조 |

**해석 충돌 시 우선순위:**
1. 이 인수인계 파일의 "절대 원칙"
2. PRD v1.2 (`reportmate_prd_functional_spec_v_0_1.md`)
3. 기타 문서

---

## 3. 기술 스택 (확정)

| 영역 | 선택 | 비고 |
|------|------|------|
| Frontend/Backend | Next.js App Router + TypeScript | Server Components 우선 |
| UI | Tailwind CSS + shadcn/ui | |
| DB | PostgreSQL (Supabase) | |
| ORM | Prisma | |
| 인증 | Supabase Auth | |
| 파일 저장 | Supabase Storage | CSV, 로고, PDF |
| AI | Anthropic Claude API (우선) | OpenAI는 fallback |
| PDF | Playwright | HTML → PDF 렌더링 |
| 이메일 | Resend | |
| 결제 | Stripe | Phase 4 이후 |
| 배포 | Vercel | |
| 에러 추적 | Sentry | |
| 패키지 매니저 | pnpm | |

---

## 4. 핵심 불변 원칙

### 4.1 제품 정체성 (절대 변경 금지)
- 실시간 대시보드 경쟁 금지
- AgencyAnalytics 저가 대체제 포지셔닝 금지
- 집중: 클라이언트 제출용 보고서 초안 생성 + Evidence Tags + PDF 완성도

### 4.2 CSV-first 전략
- API 자동 연동은 Phase 4 이후
- MVP는 CSV 업로드로만 동작
- GA4 + GSC 조합을 가장 먼저 안정화

### 4.3 AI 생성 규칙 (변경 금지)
- 제공된 지표만 사용. 없는 수치 생성 금지
- 원인 단정 금지. 추정은 추정으로 표시
- 성과 보장 표현 금지
- AI에는 summary_metrics_json만 전달. 원본 CSV 전달 금지
- AI 출력은 자유 텍스트가 아닌 JSON 구조로만 받음

### 4.4 AI Credit 정책 (변경 금지)
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
- 월 리셋: AppSumo 코드 등록일 기준 매월 같은 날

### 4.5 AppSumo 티어 (확정)
| 티어 | 가격 | 클라이언트 | AI Credit/월 | 팀원 |
|------|------|-----------|------------|------|
| Tier 1 | $69 | 5 | 100 | 1 |
| Tier 2 | $129 | 15 | 350 | 3 |
| Tier 3 | $249 | 40 | 1,000 | 10 |
| Tier 4 | $399 | 100 | 2,500 | 20 |

- 제한 항목: 클라이언트 수 + AI Credit + 팀원 수 (월간 리포트 수 제한 없음)
- 코드 스태킹: 최대 4개, 1개=Tier1 → 4개=Tier4

### 4.6 데이터 저장 구조 (절대 원칙)
- 원본 CSV 행 데이터 → Supabase Storage 파일로 저장
- DB의 `datasets.summary_metrics_json` → KPI 집계 결과만 저장 (JSONB, 소량)
- `normalized_data_json` 컬럼 사용 금지 (삭제됨)
- AI에는 `summary_metrics_json`만 전달

### 4.7 Supabase Auth + Prisma 연결 방식 (확정)
- `public.users.id` = `auth.users.id` (동일 UUID)
- 가입 시 DB Trigger로 `public.users` row 자동 생성
- RLS 미사용 → 서버단 권한 검증 + workspace_id 필터링 강제
- 클라이언트에서 전달된 workspace_id 신뢰 금지

### 4.8 AI 생성 실패 처리
- API 타임아웃/오류: 자동 1회 재시도 → 실패 시 사용자 알림
- Credit은 최종 성공 시에만 차감
- 부분 성공은 성공으로 처리, Credit 차감

### 4.9 블록 재생성 편집 보존
- 블록 단위 재생성: 해당 블록만 덮어씀, 나머지 편집 보존
- 전체 재생성: 확인 모달 표시 후 진행
- 편집 undo 기능: MVP 미포함 (Phase 4 이후)

### 4.10 공유 링크
- 기본 만료: 없음 (사용자가 직접 비활성화)
- token: crypto.randomUUID 또는 동급 난수
- 내부 메모: 공유 링크에서 기본 숨김

---

## 5. DB 테이블 목록

```
users, workspaces, workspace_members,
clients,
uploaded_files, datasets, dataset_columns, metric_mappings,
reports, report_blocks, report_evidences, report_exports,
shared_links,
appsumo_codes, usage_ledger, ai_generation_logs,
audit_logs
```

**metric_mappings**: workspace_id 컬럼 없음 (client_id로 대체)  
**datasets**: normalized_data_json 없음, storage_path + summary_metrics_json 구조

---

## 6. 폴더 구조 핵심

```
app/
  (marketing)/          ← 랜딩 페이지
  (auth)/               ← 로그인/회원가입
  (dashboard)/          ← 대시보드, 클라이언트, 리포트, 설정
    uploads/history/    ← 업로드 히스토리
  share/[token]/        ← 공유 링크 공개 페이지 (API 아님)
  api/                  ← Route Handlers
lib/
  ai/, csv/, metrics/, pdf/, usage/, appsumo/, permissions/
```

**공유 링크 경로:** `/share/[token]` (페이지 라우트) — `/api/shared/[token]` 아님

---

## 7. 현재 개발 진행 상태

| Phase | 내용 | 상태 |
|-------|------|------|
| **Phase 0** | 시장 검증 — MVP 데모 앱 완성 + 피드백 수집 중 | ✅ **앱 완성, 배포 완료** |
| Phase 1 | MVP Core (인증, CSV, 매핑, KPI, AI 리포트, 편집기) | 미시작 |
| Phase 2 | Export & Sharing (PDF, 공유 링크, 화이트라벨) | 미시작 |
| Phase 3 | AppSumo Readiness (코드 등록, 티어 제한, 온보딩, 랜딩) | 미시작 |
| Phase 4 | Post-launch (API 연동, 자동화, 클라이언트 포털) | 미시작 |

### Phase 0 실제 구현 내용 (2026-05-10 기준)

**배포된 앱:**
- Live URL: https://reportmate-web.vercel.app
- GitHub: https://github.com/TominPapa/reportmate
- 인프라: Vercel (Root Directory = `apps/web`)

**구현된 기능 (데모 앱 — 인증/DB 없는 프론트 전용):**
1. GA4 또는 GSC CSV 업로드 (이번달 + 지난달 — 둘 다 드래그앤드롭 지원)
2. CSV 헤더 자동 감지 (GA4 vs GSC 구분)
3. MoM(전월 대비) 계산: `computeMoMGSC` / `computeMoMGA4`
4. Claude claude-opus-4-5 API로 AI 분석 텍스트 생성 (Executive Summary, Wins, Concerns, Opportunities, Action Items)
5. 웹 미리보기 결과 페이지 (즉시 확인 가능)
6. `@react-pdf/renderer`로 PDF 다운로드

**PDF 구성 (5페이지):**
- Page 1 (Cover): 제목, 서비스명, Reporting Period, ReportMate 메타정보, "Inside This Report" TOC
- Page 2: 바 차트 (Top Queries by Clicks), Quick Stats 스트립 (TOP PERFORMER / TOTAL TRACKED / REPORT PERIOD)
- Page 3: KPI Snapshot 표 + MoM Highlight Cards 2×2
- Page 4: Executive Summary + Wins & Concerns + Opportunities + Query Position Distribution 가로 바 차트
- Page 5: Action Plan + Data Appendix (전체 데이터 표)

**웹 미리보기 구성 (PDF와 동일):**
- Cover 영역: pill 태그, Reporting Period
- KPI Snapshot 표 + MoM Highlight Cards 2×2 그리드
- Executive Summary (파란 왼쪽 테두리 내러티브 박스)
- Wins / Concerns / Opportunities / Action Items (우선순위 배지: High/Medium/Low)
- Query Position Distribution 가로 바 차트
- Data Appendix 표

**핵심 파일 목록:**

| 파일 | 역할 |
|------|------|
| `apps/web/src/app/demo/page.tsx` | 데모 페이지 — CSV 업로드, AI 호출, 웹 미리보기 |
| `apps/web/src/components/ReportPDF.tsx` | PDF 렌더러 (`@react-pdf/renderer`) |
| `apps/web/src/app/api/generate/route.ts` | AI 생성 API route (Claude API 호출) |
| `apps/web/vercel.json` | Vercel 설정 (`{"framework": "nextjs"}`) |

**알려진 이슈:**
- PDF Page 3 하단 약 25% 여백 남아있음 (MoM 카드 아래)
- `→` 문자 react-pdf에서 `'`로 렌더링됨 → `{'  >  '}`(ASCII)로 우회 처리됨
- 기술 스택 표의 PDF 항목이 "Playwright"로 명시돼 있으나 실제 구현은 `@react-pdf/renderer` 사용

---

## 8. Phase 0 — 시장 검증 현황

**앱 완성. 이제 실제 피드백 수집이 남은 핵심 과제.**

### Step 1: 샘플 리포트 ✅ 완료
Canva 수동 제작 불필요 — 실제 앱이 CSV에서 자동 생성함.  
test CSV로 다음 3종 시나리오 PDF 생성 가능:
| # | 유형 | 생성 방법 |
|---|------|---------|
| 1 | SEO 성과 상승 | 트래픽 +18%, 전환 +12% 수치의 GSC/GA4 CSV 사용 |
| 2 | SEO 성과 하락 | 트래픽 -22% CSV → AI가 원인 분석 포함 |
| 3 | PPC 성과 애매 | ROAS 유지, CPC 상승 시나리오 |

### Step 2: 피드백 수집 채널 ⏳ 미완
**Reddit 계정 차단됨** — r/SEO, r/PPC, r/agency 포스팅 불가.

대안 채널 (우선순위 순):
| 채널 | 접근법 | 예상 반응 |
|------|--------|---------|
| **Indie Hackers** | Show IH 포스트: "Built an AI report generator for agencies" | 개발자+SaaS 구매자 mix |
| **Hacker News** | Show HN 포스트 | 높은 노출, 비판적 피드백 |
| **Facebook Groups** | Digital Marketing Agency owners 그룹 | 실제 에이전시 타깃 |
| **LinkedIn** | 마케터 대상 게시물 + 직접 DM | B2B 타깃 가장 적합 |
| **Product Hunt** | Coming Soon 페이지 등록 | 얼리어답터 수집 |

### Step 3: 통과 기준
| 항목 | 통과 기준 |
|------|---------|
| 샘플 리포트 반응 | 5명 중 3명 "보낼 수 있다" |
| 리포트 작성 고통 | 평균 1시간 이상 소요 응답 |
| 지불 의향 | 최소 2명 "$69 LTD 긍정" |
| CSV 허용도 | 5명 중 3명 CSV 수용 |
| ChatGPT 대비 | 차별점 1개 이상 인정 |

**모두 통과 → Phase 1 착수 / 2개 이상 미달 → 방향 재검토**

---

## 9. MVP 범위 외 (구현 금지)

- 실시간 대시보드
- GA4 / GSC / Ads API 자동 연동 (Phase 4)
- 이메일 예약 발송 (Phase 4)
- 클라이언트 포털 (Phase 4)
- 커스텀 도메인 (Phase 4)
- 무제한 AI 생성 (LTD에 영구 금지)
- 팀 승인 워크플로우 (Phase 4)

---

## 10. 미결 사항

| 항목 | 상태 | 우선순위 |
|------|------|---------|
| 피드백 수집 채널 결정 (Reddit 차단) | ⏳ 즉시 필요 | 🔴 HIGH |
| PDF Page 3 하단 여백 (~25%) 제거 | ⏳ 다음 세션 | 🟡 MEDIUM |
| Phase 0 통과 기준 달성 후 Phase 1 착수 결정 | ⏳ 피드백 후 | 🟡 MEDIUM |
| 기술 스택 문서 PDF 항목 수정 (Playwright → @react-pdf/renderer) | ⏳ 낮은 우선순위 | 🟢 LOW |
| Prisma 스키마 초안 | ⏳ Phase 1 착수 시 | 🟢 LOW |
| AI 프롬프트 실측 튜닝 | ⏳ Phase 1 착수 시 | 🟢 LOW |
| AppSumo 판매 페이지 초안 | ⏳ Phase 3 | 🟢 LOW |

---

## 11. 새 세션 시작 프롬프트 (그대로 복사)

```
너는 ReportMate SaaS의 실개발 담당자다.

ReportMate는 소형 마케팅 에이전시가 GA4/GSC/Google Ads/Meta Ads CSV를 업로드하면,
AI가 클라이언트에게 보낼 월간 성과 보고서를 생성해주는 SaaS다.

인수인계 문서: docs/session-handover.md (반드시 먼저 읽을 것)
PRD + 기능 명세: reportmate_prd_functional_spec_v_0_1.md (v1.2)

절대 원칙:
1. 대시보드 경쟁 금지. 클라이언트 제출용 보고서 완성이 핵심
2. AI에 원본 CSV 전달 금지. summary_metrics_json만 전달
3. normalized_data_json 컬럼 사용 금지 (삭제된 구조)
4. Credit은 생성 성공 시에만 차감
5. 공유 링크는 /share/[token] 페이지 라우트 (API 아님)
6. workspace_id는 클라이언트 전달값 신뢰 금지, 서버 세션에서 재확인
7. Supabase Auth user.id = Prisma users.id (동일 UUID)

현재 Phase: [Phase X 기입]
이번 세션 목표: [목표 기입]

각 작업 완료 시:
- 변경한 파일 목록
- 구현/수정한 기능 목록
- 검증 결과
- 남은 TODO
를 정리해라.
```
