# ReportMate — Claude Code 개발 가이드

## 프로젝트 개요
소형 마케팅 에이전시가 GA4/GSC/Ads CSV를 업로드하면 AI가 클라이언트용 월간 보고서를 생성하는 SaaS.

## 필독 문서
- PRD + 기능 명세: `../../reportmate_prd_functional_spec_v_0_1.md` (v1.2)
- 세션 인수인계: `../../docs/session-handover.md`

## 절대 원칙
1. 대시보드 경쟁 금지 — 클라이언트 제출용 보고서 완성이 핵심
2. AI에 원본 CSV 전달 금지 — summary_metrics_json만 전달
3. Credit은 생성 성공 시에만 차감
4. 공유 링크는 /share/[token] 페이지 라우트 (API 아님)
5. workspace_id는 클라이언트 전달값 신뢰 금지, 서버 세션에서 재확인
6. Supabase Auth user.id = Prisma users.id (동일 UUID)

## 기술 스택
Next.js App Router + TypeScript + Tailwind + shadcn/ui + Prisma + Supabase + Anthropic API

## 현재 Phase
Phase 0 (시장 검증) — 코드 개발 미시작
