# ReportMate — 세션 인수인계 파일

> 이 파일은 Claude Code / AI 개발 도구가 새 세션에서 컨텍스트 없이 작업을 이어갈 수 있도록  
> 프로젝트 전체 상태와 핵심 원칙을 한 곳에 정리한 인수인계 문서다.  
> **새 세션 시작 시 반드시 이 파일을 먼저 읽는다.**

최종 업데이트: 2026-04-26 (v1.2 반영)

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
| **Phase 0** | 시장 검증 (샘플 리포트 제작 + Reddit 피드백) | ⏳ **현재 단계** |
| Phase 1 | MVP Core (인증, CSV, 매핑, KPI, AI 리포트, 편집기) | 미시작 |
| Phase 2 | Export & Sharing (PDF, 공유 링크, 화이트라벨) | 미시작 |
| Phase 3 | AppSumo Readiness (코드 등록, 티어 제한, 온보딩, 랜딩) | 미시작 |
| Phase 4 | Post-launch (API 연동, 자동화, 클라이언트 포털) | 미시작 |

---

## 8. Phase 0 — 지금 해야 할 일 (개발 전 시장 검증)

**코드를 한 줄도 쓰기 전에 반드시 완료해야 한다.**

### Step 1: 샘플 리포트 3개 수동 제작 (Canva 권장)
| # | 유형 | 시나리오 |
|---|------|---------|
| 1 | SEO 성과 상승 리포트 | 트래픽 +18%, 전환 +12% |
| 2 | SEO 성과 하락 리포트 | 트래픽 -22%, 원인 설명 포함 |
| 3 | PPC 성과 애매한 리포트 | ROAS 유지, CPC 상승 |

필수 구성: Cover / Executive Summary / KPI Snapshot / Wins / Concerns / Next Actions

### Step 2: Reddit 포스팅
대상: r/SEO, r/PPC, r/agency, r/freelance  
제목: "I made a sample AI-generated SEO report for agencies — would you actually send this to a client?"  
핵심: 광고 아닌 피드백 요청 형태로 작성

### Step 3: 통과 기준 확인
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

| 항목 | 상태 |
|------|------|
| Phase 0 샘플 리포트 제작 | ⏳ 진행 필요 |
| Reddit 피드백 수집 | ⏳ Phase 0 완료 후 |
| Prisma 스키마 초안 | ⏳ Phase 1 착수 시 |
| AI 프롬프트 실측 튜닝 | ⏳ Phase 1 착수 시 |
| AppSumo 판매 페이지 초안 | ⏳ Phase 3 |

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
