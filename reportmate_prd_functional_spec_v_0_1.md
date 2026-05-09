# ReportMate 최종 기획안 및 기능 명세서 v1.2

작성일: 2026-04-26  
최종 수정: 2026-04-26 (v1.2 — 오류 검증 전체 반영)  
목적: AI 바이브코딩 개발 착수 직전 기준 문서  
상태: ✅ 오류 검증 완료 — 개발 착수 가능

### v1.2 변경 이력
| 구분 | 항목 | 내용 |
|------|------|------|
| 🔴 Critical | AI Credit vs 월간 리포트 수 충돌 | "월간 리포트 수" 제한 제거, AI Credit으로 단일화 |
| 🔴 Critical | Supabase Auth + Prisma 연결 | 연결 방식 확정 (Section 11.2, 13.2) |
| 🔴 Critical | normalized_data_json 대용량 | Storage 파일 + summary_metrics_json 분리 구조로 변경 |
| 🟡 Warning | AI 생성 실패 처리 | 재시도 정책, Credit 차감 기준 신규 추가 (Section 8.5) |
| 🟡 Warning | 블록 재생성 편집 덮어쓰기 | 블록/전체 재생성 시 동작 정의 (Section 7.8) |
| 🟡 Warning | user_notes 입력 UI | Report Builder 화면에 AI Notes 입력창 추가 (Section 12.9) |
| 🟡 Warning | 공유 링크 만료 정책 | 기본 무제한, Phase 4에서 만료일 설정 추가 (Section 7.13) |
| 🟡 Warning | AppSumo 스태킹 정책 | 최대 4코드 스태킹 규칙 추가 (Section 9.2.1) |
| 🟡 Warning | AI Credit 리셋 기준 | 코드 등록일 기준 매월 리셋 확정 (Section 8.6) |
| 🟡 Warning | 폴더/API 경로 불일치 | `/api/shared/[token]` → `/share/[token]/page.tsx` 통일 |
| 🟢 Minor | Section 26 체크리스트 | v1.2 기준으로 전면 갱신 |
| 🟢 Minor | metric_mappings workspace_id | 중복 컬럼 제거 |
| 🟢 Minor | 업로드 히스토리 화면 | Section 12.6.1 신규 추가 |

---

## 0. 최종 결론

ReportMate는 **소형 마케팅 에이전시와 프리랜서 마케터가 클라이언트에게 보낼 월간 성과 보고서를 AI로 빠르게 생성하는 SaaS**다.

핵심 방향은 다음과 같다.

> ReportMate는 데이터를 보여주는 대시보드가 아니라, 클라이언트에게 설명해주는 보고서 생성 도구다.

개발 방향은 다음과 같이 확정한다.

| 항목 | 최종 결정 |
|---|---|
| 제품명 | ReportMate |
| 제품 유형 | AI Client Report Generator |
| 1차 타깃 | SEO / 콘텐츠 마케팅 에이전시 |
| MVP 전략 | CSV-first |
| 초기 언어 | 영어 UI + 영어 리포트 |
| 차별화 핵심 | AI 문장과 근거 지표 연결 |
| AppSumo 전략 | 무제한 LTD 금지, AI credit 제한 |
| 구독 전환 | 추가 클라이언트, 추가 AI credit, 자동화, 고급 커넥터 |
| 개발 방식 | AI 바이브코딩 기반 단계별 개발 |
| 권장 기술스택 | Next.js + TypeScript + Supabase + Prisma + Tailwind + shadcn/ui + Anthropic API |

---

# 1. 제품 개요

## 1.1 제품명

**ReportMate**

이름 유지 이유:
- 기억하기 쉽다.
- 에이전시, 프리랜서, 컨설턴트까지 확장 가능하다.
- AI가 전문가를 대체하는 느낌보다 보조 도구의 느낌이 강하다.
- AppSumo 글로벌 SaaS 제품명으로 무난하다.

---

## 1.2 한 줄 정의

영문:

> ReportMate turns marketing data into client-ready AI reports for small agencies.

한국어:

> ReportMate는 소형 마케팅 에이전시와 프리랜서 마케터가 GA4, GSC, Google Ads, Meta Ads 등의 성과 CSV를 업로드하면 AI가 클라이언트에게 바로 보낼 수 있는 월간 성과 보고서를 만들어주는 SaaS다.

---

## 1.3 핵심 포지셔닝

핵심 메시지:

> Looker Studio shows the data. ReportMate explains it to your client.

ReportMate는 Looker Studio, AgencyAnalytics, DashThis 같은 대시보드 도구와 정면 경쟁하지 않는다. 이 도구들이 만든 데이터나 CSV export를 기반으로, **클라이언트가 이해할 수 있는 보고서 문장과 PDF 제출물**을 만드는 데 집중한다.

| 구분 | 기존 대시보드/리포팅 SaaS | ReportMate |
|---|---|---|
| 핵심 가치 | 데이터 연결, 차트, 대시보드 | 클라이언트 제출용 보고서 완성 |
| 경쟁 대상 | AgencyAnalytics, DashThis, Looker Studio | 수동 보고서 작성 시간 |
| 주요 산출물 | 대시보드, PDF | 설명이 포함된 월간 보고서 |
| 차별점 | 커넥터 수, 시각화 | AI 해석, 근거 연결, 클라이언트용 문장 |
| 사용 순간 | 데이터 확인 | 클라이언트 보고서 작성/전달 |

---

# 2. 사업 전제와 현실 판단

## 2.1 창업자 조건

- 개발은 AI 바이브코딩 중심으로 진행한다.
- 초기 자본은 제한적이다.
- 마케팅 네트워크, 팔로워, 이메일 리스트는 없다.
- 직접 영업이나 콜드 아웃리치는 최소화한다.
- 1차 출시 채널은 AppSumo를 목표로 한다.
- Product Hunt, Reddit, LinkedIn은 보조 채널로 사용한다.

---

## 2.2 시장 판단

에이전시 리포팅 / 대시보드 시장 전체는 이미 경쟁이 높다.

다만 ReportMate가 노리는 포지션은 다음과 같이 좁힌다.

> CSV 기반 데이터를 AI가 근거 지표와 연결해 클라이언트 제출용 보고서로 바꿔주는 도구

이 포지션은 일반 대시보드 SaaS와 다르고, ChatGPT 단독 사용과도 다르다.

경쟁 포화도 판단:

| 범위 | 포화도 | 판단 |
|---|---|---|
| 마케팅 대시보드 전체 | 높음 | 정면승부 금지 |
| 에이전시 리포팅 SaaS | 중간~높음 | 기존 제품 다수 |
| AI 클라이언트 보고서 작성 도구 | 중간 | 후발 진입 여지 있음 |
| Evidence-backed CSV-first report generator | 중간 이하 추정 | 가장 현실적인 진입 포지션 |

---

## 2.3 AppSumo 수익 기대치

AppSumo는 초기 매출과 고객 검증에는 유용하지만, 구독 전환 채널로 과대평가하면 안 된다.

현실적 관점:

| 항목 | 판단 |
|---|---|
| AppSumo 1차 목적 | 고객 검증 + 리뷰 확보 + 초기 현금 확보 |
| 2주 판매 목표 | 50~70건 |
| 잘 된 경우 | 100건 이상 |
| 보수적 실수령 추정 | $1,500~$2,000 |
| 기준 실수령 추정 | $2,500~$3,500 |
| 낙관 실수령 추정 | $4,000~$5,500 |
| Select급 노출 | 미확인, 별도 산정 필요 |

주의:
- 위 수치는 확정값이 아니라 보수 추정이다.
- AppSumo 계약 조건, 수익 배분율, 환불률, 노출 여부에 따라 크게 달라진다.
- AppSumo만으로 $3,000 MRR 달성은 어렵다.
- AppSumo 이후 별도 SEO, 커뮤니티, 콘텐츠 마케팅 전략이 필요하다.

---

# 3. 타깃 고객

## 3.1 1차 타깃: SEO / 콘텐츠 마케팅 에이전시

특징:
- 직원 1~20명
- 월간 클라이언트 리포트를 반복 작성한다.
- GA4, Google Search Console, Google Sheets 데이터를 주로 사용한다.
- 클라이언트가 SEO 지표를 잘 이해하지 못해 쉬운 설명이 필요하다.
- CSV upload만으로도 초기 가치를 느낄 수 있다.

핵심 메시지:

> Upload GA4 and Search Console exports. Generate client-ready SEO reports in minutes.

선정 이유:
- Meta API 리스크가 낮다.
- SEO 리포트는 전월 대비 비교와 설명 문장이 중요하다.
- GA4/GSC export 기반 MVP와 잘 맞는다.
- 클라이언트가 지표를 이해하기 어려워 AI 설명 가치가 크다.

---

## 3.2 2차 타깃: PPC 프리랜서 / 소형 광고 대행사

특징:
- Google Ads, Meta Ads, TikTok Ads 성과 보고가 필요하다.
- ROAS, CPA, CPC, CTR, Conversion Rate 등의 설명이 중요하다.
- 광고 성과 하락 시 클라이언트 설득 문장이 필요하다.

핵심 메시지:

> Turn ad performance exports into client-ready PPC reports.

주의:
- 광고 지표는 해석 오류 리스크가 크다.
- AI가 원인을 단정하면 위험하다.
- MVP에서는 Google Ads CSV와 Meta Ads CSV를 지원하되, API 자동 연동은 제외한다.

---

## 3.3 3차 타깃: 소셜미디어 운영 대행사

특징:
- Instagram, Facebook, LinkedIn, TikTok 운영 리포트가 필요하다.
- Engagement, reach, follower growth, top posts 등이 중요하다.
- 플랫폼별 지표 정의가 달라 복잡도가 높다.

MVP에서는 후순위로 둔다.

---

# 4. 제품 원칙

## 4.1 대시보드가 아니라 보고서 작성 도구

ReportMate는 실시간 대시보드나 고급 BI 도구가 아니다.

하지 않을 것:
- 실시간 대시보드 경쟁
- 무제한 커넥터 경쟁
- 고급 차트 편집기 경쟁
- AgencyAnalytics 저가 대체제 포지셔닝

집중할 것:
- 클라이언트에게 보낼 보고서 초안 생성
- 데이터 기반 설명 문장
- 전월 대비 변화 해석
- 성과 하락 시 설명과 다음 액션 제안
- PDF/공유 링크 산출물 완성도

---

## 4.2 CSV-first

초기 MVP는 API 자동 연동보다 CSV 업로드를 우선한다.

이유:
- OAuth 승인 리스크 감소
- API quota 리스크 감소
- 플랫폼 정책 리스크 감소
- 다양한 데이터 소스를 빠르게 수용 가능
- AppSumo 초기 사용자 온보딩 실패율 감소

단점:
- 사용자가 CSV를 직접 export해야 한다.
- CSV 형식이 다양해 파싱 실패 가능성이 있다.
- “자동화” 기대치를 낮춰 설명해야 한다.

대응:
- 공식 샘플 CSV 제공
- GA4/GSC export 가이드 제공
- 컬럼 매핑 UX 강화
- 처음에는 SEO용 GA4 + GSC를 가장 안정적으로 만든다.

---

## 4.3 AI는 초안을 만들고, 사람은 승인한다

AI가 최종 보고서를 자동 발송하지 않는다.

기본 흐름:
1. 데이터 업로드
2. 컬럼 매핑
3. KPI 계산
4. AI 초안 생성
5. 근거 지표 확인
6. 위험 문장 확인
7. 사용자가 수정
8. PDF 또는 공유 링크 발행

---

## 4.4 근거 없는 문장은 위험 처리한다

AI 문장은 다음 기준을 따라야 한다.

- 숫자 문장은 반드시 계산된 지표에서만 생성한다.
- 원인 추정은 확정 표현을 사용하지 않는다.
- “guaranteed”, “proves”, “definitely” 같은 과도한 표현을 피한다.
- 데이터에 없는 플랫폼, 채널, 캠페인을 언급하지 않는다.
- 사용자가 업로드하지 않은 지표를 만들어내지 않는다.

---

# 5. MVP 범위

## 5.1 MVP 포함 기능

| 구분 | 기능 | 우선순위 |
|---|---|---:|
| 인증 | 회원가입 / 로그인 / 로그아웃 | P0 |
| 온보딩 | 워크스페이스 생성 | P0 |
| 온보딩 | 샘플 데이터로 리포트 체험 | P0 |
| 클라이언트 | 클라이언트 생성 / 수정 / 목록 | P0 |
| 데이터 | CSV 업로드 | P0 |
| 데이터 | CSV 미리보기 | P0 |
| 데이터 | 컬럼 자동 매핑 추천 | P0 |
| 데이터 | 수동 컬럼 매핑 | P0 |
| 데이터 | 매핑 템플릿 저장 | P0 |
| 계산 | KPI 계산 엔진 | P0 |
| 계산 | 전월 대비 비교 | P0 |
| 리포트 | 템플릿 선택 | P0 |
| 리포트 | AI 보고서 초안 생성 | P0 |
| 리포트 | Evidence Tags | P0 |
| 리포트 | Risk Flags | P0 |
| 리포트 | 블록 편집기 | P0 |
| 리포트 | 내부 메모 / 클라이언트용 문장 분리 | P1 |
| 출력 | PDF export | P0 |
| 출력 | 공유 링크 생성 / 비활성화 | P0 |
| 브랜딩 | 로고 / 브랜드 컬러 | P0 |
| AppSumo | 코드 등록 | P0 |
| 제한 | 티어별 사용량 제한 | P0 |
| 설정 | 데이터 삭제 요청 | P1 |
| 마케팅 | 랜딩 페이지 | P0 |
| 지원 | FAQ / Help 문서 | P0 |

---

## 5.2 MVP 제외 기능

| 제외 기능 | 제외 이유 | 향후 단계 |
|---|---|---|
| GA4 API 자동 연동 | OAuth/검증/쿼터 리스크 | Phase 4 |
| GSC API 자동 연동 | OAuth/검증 필요 | Phase 4 |
| Google Ads API | 복잡도 높음 | Phase 4+ |
| Meta Ads API | 정책 리스크 | Phase 4+ |
| 이메일 자동 발송 | 오발송/스팸 리스크 | 구독 기능 |
| 클라이언트 포털 | 범위 증가 | 구독 기능 |
| 커스텀 도메인 | 유지보수/설정 부담 | 구독 기능 |
| 실시간 대시보드 | 제품 포지션과 다름 | 제외 또는 장기 검토 |
| 다국어 리포트 | 초기 AppSumo는 영어 우선 | 추후 검토 |
| 팀 승인 워크플로우 | MVP 범위 초과 | Phase 4 |
| 무제한 AI 생성 | LTD 비용 리스크 | 금지 |

---

# 6. 핵심 사용자 플로우

## 6.1 첫 사용자 온보딩

목표:
- 사용자가 가입 후 3분 안에 샘플 리포트를 확인한다.
- 실제 CSV 업로드 시 10분 안에 첫 리포트를 만든다.

흐름:
1. 회원가입
2. 워크스페이스 이름 입력
3. 업무 유형 선택
   - SEO Agency
   - PPC Agency
   - Freelancer
   - Social Media Agency
4. 샘플 데이터로 체험 또는 CSV 업로드 선택
5. 리포트 템플릿 선택
6. AI 초안 생성
7. PDF 미리보기
8. 공유 링크 생성

---

## 6.2 월간 SEO 리포트 생성

흐름:
1. 클라이언트 선택
2. 보고 기간 선택
3. GA4 CSV 업로드
4. GSC CSV 업로드
5. 컬럼 매핑 확인
6. 전월 데이터 선택 또는 업로드
7. SEO Monthly Report 템플릿 선택
8. AI 초안 생성
9. Evidence Tags 확인
10. Risk Flags 수정
11. PDF export
12. 공유 링크 생성

---

## 6.3 성과 하락 보고서 생성

흐름:
1. 데이터 업로드
2. KPI 계산 엔진이 하락 지표 감지
3. AI가 Concerns 블록 생성
4. AI가 가능한 원인을 “추정”으로 표시
5. Next Actions 블록 생성
6. 사용자가 문체 선택
   - Professional
   - Friendly
   - Executive
   - Cautious
7. 최종 수정 후 발행

핵심 가치:
- 좋은 성과를 자랑하는 것보다, 나쁜 성과를 클라이언트에게 납득 가능하게 설명하는 것이 더 큰 가치다.

---

# 7. 기능 명세

## 7.1 인증 / 계정

### 기능
- 이메일 회원가입
- 이메일 로그인
- 로그아웃
- 비밀번호 재설정
- 사용자 프로필

### 수용 기준
- 중복 이메일 가입 방지
- 비밀번호 평문 저장 금지
- 로그인 실패 시 보안상 과도한 상세 정보 노출 금지
- 로그인 사용자는 자신의 워크스페이스 데이터만 접근 가능

---

## 7.2 워크스페이스

### 기능
- 워크스페이스 생성
- 워크스페이스 이름 수정
- 로고 업로드
- 브랜드 컬러 설정
- 타임존 설정
- 기본 통화 설정

### 필드
- id
- owner_user_id
- name
- logo_url
- primary_color
- timezone
- currency
- plan_type
- appsumo_tier
- created_at
- updated_at

---

## 7.3 클라이언트 관리

### 기능
- 클라이언트 생성
- 클라이언트 수정
- 클라이언트 목록
- 클라이언트 상세
- 클라이언트별 로고/컬러 override
- 클라이언트별 리포트 목록

### 필드
- id
- workspace_id
- name
- website_url
- industry
- logo_url
- primary_color
- status
- notes
- created_at
- updated_at

### 상태
- active
- paused
- archived

---

## 7.4 CSV 업로드

### MVP 지원 데이터 소스
- GA4 CSV
- Google Search Console CSV
- Google Ads CSV
- Meta Ads CSV
- Generic Marketing CSV

### 파일 제한
- 형식: .csv
- 최대 용량: 10MB
- 최대 행 수: 50,000행
- 인코딩: UTF-8 우선, 오류 시 안내

### 기능
- 파일 업로드
- CSV 파싱
- 헤더 자동 감지
- 데이터 미리보기
- 필수 컬럼 누락 경고
- 업로드 실패 사유 표시
- 샘플 CSV 다운로드

### 수용 기준
- 최소 20개 행 미리보기 제공
- 파일 오류 시 사람이 이해할 수 있는 메시지 제공
- 잘못된 CSV라도 서버가 중단되면 안 됨

---

## 7.5 컬럼 매핑

### 기능
- 자동 매핑 추천
- 사용자 수동 매핑
- 매핑 신뢰도 표시
- 이전 매핑 재사용
- 클라이언트별 매핑 템플릿 저장

### 표준 지표

SEO / GA4:
- sessions
- users
- new_users
- conversions
- conversion_rate
- engagement_rate
- avg_session_duration
- revenue

GSC:
- clicks
- impressions
- ctr
- average_position
- query
- page

Ads:
- spend
- impressions
- clicks
- ctr
- cpc
- conversions
- conversion_rate
- cost_per_conversion
- revenue
- roas

### 수용 기준
- 필수 지표 누락 시 경고
- 매핑 신뢰도 낮은 컬럼은 사용자 확인 필요
- 잘못된 매핑은 사용자가 수정 가능

---

## 7.6 KPI 계산 엔진

### 기능
- 총합 계산
- 평균 계산
- 전월 대비 변화량
- 전월 대비 변화율
- 상위 항목 추출
- 하위 항목 추출
- 급상승 / 급하락 지표 감지

### 변화율 계산
- change = current_value - previous_value
- change_rate = change / previous_value * 100

### 예외 처리
- previous_value = 0이면 change_rate는 n/a 또는 new로 표시
- 결측값은 계산 제외
- 통화/퍼센트/정수/소수 포맷 구분

### 원칙
AI는 원본 CSV를 직접 해석하지 않고, KPI 계산 엔진이 만든 구조화된 요약 데이터를 사용한다.

---

## 7.7 리포트 템플릿

### MVP 템플릿
1. SEO Monthly Report
2. PPC Monthly Report
3. Executive Summary Report
4. Local Business Marketing Report
5. E-commerce Performance Report
6. Social Media Monthly Report

### 우선 구현 순서
1. SEO Monthly Report
2. Executive Summary Report
3. PPC Monthly Report
4. Local Business Marketing Report
5. E-commerce Performance Report
6. Social Media Monthly Report

### 공통 블록
- Cover
- Executive Summary
- KPI Snapshot
- Wins
- Concerns
- What Changed
- Why It Matters
- Channel Performance
- Top Campaigns / Pages / Queries
- Next Month Action Plan
- Appendix / Data Notes

---

## 7.8 AI 보고서 생성

### 기능
- 템플릿 기반 보고서 초안 생성
- 블록 단위 생성
- 블록 단위 재생성
- 문체 선택
- Evidence Tags 연결
- Risk Flags 표시

### 문체 옵션
MVP:
- Professional
- Friendly
- Executive
- Cautious

후순위:
- Optimistic
- Defensive

### AI 생성 규칙
- 제공된 지표만 사용
- 수치 조작 금지
- 원인 단정 금지
- 추정은 추정으로 표시
- 성과 보장 표현 금지
- 클라이언트 비난 문장 금지
- 내부 메모와 외부 문장 분리

### 블록 재생성 시 편집 내용 처리 정책

> **[v1.2 신규]** Warning #5 해결

| 상황 | 처리 |
|------|------|
| 블록 단위 재생성 | 해당 블록의 AI 내용만 덮어씀. 다른 블록 편집 내용 보존 |
| 전체 리포트 재생성 | 실행 전 "모든 편집 내용이 초기화됩니다" 확인 모달 표시 |
| 사용자 직접 편집 후 재생성 | 재생성 버튼 클릭 시 "편집 내용이 AI 초안으로 교체됩니다. 계속하시겠습니까?" 확인 |

- 편집 내용은 자동 저장되며, 재생성 전 최종 편집본이 DB에 보존된다.
- MVP에서는 "편집 내용 복원" 기능(undo)은 제공하지 않는다. Phase 4 이후 검토.

### AI 출력 구조
AI 출력은 자유 텍스트가 아니라 JSON 구조로 받는다.

예시:

```json
{
  "blocks": [
    {
      "type": "executive_summary",
      "title": "Executive Summary",
      "content": "Organic traffic increased by 18.4% month-over-month...",
      "sentences": [
        {
          "text": "Organic traffic increased by 18.4% month-over-month.",
          "evidence_keys": ["ga4.sessions.mom_change"],
          "risk_level": "low"
        }
      ]
    }
  ]
}
```

---

## 7.9 Evidence Tags

### 목적
AI 문장의 신뢰성을 확보한다.

### 기능
- AI 문장과 관련 지표 연결
- 문장 클릭 시 근거 지표 표시
- PDF에는 근거 표시를 축약하거나 appendix에 표시
- 근거 없는 문장은 “unsupported” 또는 “inference”로 표시

### Evidence 필드
- sentence_id
- metric_key
- current_value
- previous_value
- change_value
- change_rate
- source_dataset_id
- confidence_level

---

## 7.10 Risk Flags

### 목적
위험한 AI 문장을 사용자가 발행 전 확인하게 한다.

### 위험 문장 예시
- 근거 없는 원인 단정
- 과도한 성과 보장
- 예산 증액을 강하게 요구
- 데이터에 없는 수치 언급
- 클라이언트 탓으로 돌리는 표현
- 법률/재무 자문처럼 보이는 표현

### 위험도
- low
- medium
- high

### 발행 조건
high risk 문장이 있으면 발행 전 확인 모달을 띄운다.

---

## 7.11 리포트 편집기

### 기능
- 블록 순서 변경
- 블록 숨김/표시
- 텍스트 직접 수정
- 블록별 AI 재생성
- 문체 변경 후 재생성
- Evidence panel 확인
- Risk flag 확인
- 자동 저장

### 편집 가능 여부
| 항목 | 편집 가능 |
|---|---|
| 제목 | 가능 |
| 본문 텍스트 | 가능 |
| AI 요약 | 가능 |
| 지표 값 | 기본 불가 |
| 차트 제목 | 가능 |
| 차트 데이터 | 불가 |
| 블록 순서 | 가능 |
| 블록 표시 여부 | 가능 |

지표 값을 임의 수정하게 하면 신뢰성이 무너지므로 MVP에서는 허용하지 않는다.

---

## 7.12 PDF Export

### 기능
- A4 PDF 생성
- Cover page
- Header/footer
- 페이지 번호
- 로고 / 브랜드 컬러 반영
- KPI 카드
- 차트 이미지 또는 HTML 렌더링
- 텍스트 줄바꿈
- 긴 리포트 페이지 분리

### 기술 방향
- HTML 리포트 페이지를 서버에서 Playwright로 PDF 변환
- print CSS 별도 작성
- PDF 생성 작업은 비동기 job으로 분리 가능

### 수용 기준
- PDF 생성 성공률 95% 이상
- 페이지 깨짐 최소화
- 긴 텍스트가 잘리지 않아야 함
- PDF 재생성 가능

---

## 7.13 공유 링크

### 기능
- 공유 링크 생성
- 공유 링크 복사
- 공유 링크 비활성화
- public viewer 페이지
- 내부 메모 숨김
- 브랜드 표시

### 보안
- 예측 불가능한 token 사용 (crypto.randomUUID 또는 동급 난수)
- 링크 비활성화 가능

### 만료 정책

> **[v1.2 신규]** Warning #7 해결

- **기본값: 만료 없음** (사용자가 직접 비활성화할 때까지 유효)
- MVP에서는 만료일 설정 UI 제공하지 않는다
- 향후 Phase 4에서 만료일 설정, 비밀번호 보호, 조회 로그 추가

### MVP 제외
- 비밀번호 보호
- 만료일 설정
- 조회 로그
- 클라이언트 댓글

---

## 7.14 AppSumo 코드 등록

### 기능
- 코드 입력
- 코드 유효성 검증
- 코드 중복 사용 방지
- 티어 매핑
- 워크스페이스에 lifetime 권한 부여
- 코드 등록 이력 저장

### 주의
초기에는 AppSumo 코드 목록을 CSV로 import해 관리하는 방식이 가장 단순하다.
AppSumo API 연동이 가능하더라도 MVP에서는 수동 코드 리스트 관리가 더 안전하다.

---

## 7.15 사용량 제한

### 제한 항목

> **[v1.2 수정]** "월간 리포트 생성 수"와 "공유 링크 수" 제한을 제거했다. AI Credit이 생성 횟수를 이미 제어하며, 공유 링크 수 제한은 사용자 경험을 저하시킨다.

- 클라이언트 수 (티어별 상한)
- AI credit (월간, 티어별 상한)
- 팀원 수 (티어별 상한)
- 파일 업로드 용량 (파일당 10MB, 총량 제한은 Phase 4 이후 검토)

### 초과 처리
- 제한 초과 시 새 생성 차단
- 업그레이드/추가 credit 구매 CTA 표시
- 사용량 대시보드 제공

---

# 8. AI Credit 정책

## 8.1 기본 원칙

AI credit은 LTD 비용 폭주를 막기 위한 핵심 장치다.

v1.1에서는 v1.0보다 보수적으로 계산한다. 이유는 실제 사용에서는 전체 생성 1회로 끝나지 않고, 블록 재생성, 문체 변경, 실패 재시도, 출력 토큰 비용이 발생하기 때문이다.

---

## 8.2 권장 credit 차감안

| 작업 | Credit |
|---|---:|
| 전체 리포트 초안 생성 | 15 |
| 블록 단위 재생성 | 5 |
| 문체 변경 후 재생성 | 5 |
| 위험 문장 교정 | 2 |
| 제목/요약 짧은 재작성 | 1 |
| PDF export | 0 |
| 공유 링크 생성 | 0 |
| CSV 업로드/매핑 | 0 |

---

## 8.3 AppSumo 티어별 credit

| 티어 | 월 Credit | 현실적 리포트 생성 수 | 비고 |
|---|---:|---:|---|
| Tier 1 | 100 | 약 5~8건 | 재생성 사용 고려 |
| Tier 2 | 350 | 약 20~28건 | 소형 에이전시 |
| Tier 3 | 1,000 | 약 60~80건 | 성장형 에이전시 |
| Tier 4 | 2,500 | 약 150~200건 | 반응 보고 결정 |

표현 주의:
- “최대 10건”처럼 고정 표현하지 않는다.
- “사용 방식에 따라 약 5~8건”처럼 보수적으로 설명한다.

---

## 8.4 AI 비용 관리 원칙

- 모델은 기본적으로 비용 효율 모델을 사용한다.
- 고품질 생성이 필요한 경우에만 상위 모델을 선택한다.
- 원본 CSV 전체를 LLM에 넣지 않는다.
- KPI 계산 결과와 요약 데이터만 LLM에 전달한다.
- 프롬프트 캐싱 또는 템플릿 캐싱 가능성을 고려한다.
- AI 호출 로그와 token 사용량을 반드시 저장한다.

---

## 8.5 AI 생성 실패 처리 정책

> **[v1.2 신규]** Warning #4 해결

### 실패 유형별 처리

| 유형 | 처리 방식 |
|------|----------|
| API 타임아웃 (60초 초과) | 자동 1회 재시도 → 실패 시 사용자 알림 |
| API 오류 (5xx) | 자동 1회 재시도 → 실패 시 사용자 알림 |
| JSON 스키마 검증 실패 | 자동 1회 재시도 → 실패 시 부분 결과 표시 |
| Credit 부족 | 재시도 없음, 즉시 업그레이드 CTA 표시 |

### Credit 차감 정책
- **Credit은 생성 성공 시에만 차감한다.**
- 재시도가 포함된 최종 실패 시 Credit 차감하지 않는다.
- 부분 성공(일부 블록만 생성됨)은 성공으로 처리하고 Credit을 차감한다.

### 사용자 메시지
- 실패 시: "Report generation failed. No credits were deducted. Please try again."
- 부분 성공 시: "Some blocks could not be generated. Credits have been deducted. You can regenerate individual blocks."

---

## 8.6 AI Credit 월 리셋 정책

> **[v1.2 신규]** Warning #9 해결

- Credit은 **AppSumo 코드 등록일 기준 매월 같은 날** 리셋된다.
- 예: 3월 15일 코드 등록 → 매월 15일 리셋
- 남은 Credit은 이월되지 않는다.
- 리셋 3일 전 이메일 알림 발송 (Phase 4 이후, MVP에서는 대시보드 표시만)
- Credit 리셋일은 설정 > 플랜 화면에서 확인 가능해야 한다.

---

# 9. AppSumo 티어 정책

## 9.1 권장 가격

> **[v1.2 수정]** "월 리포트 수" 제한을 제거했다.  
> AI Credit이 이미 AI 생성 횟수를 제한하며, 리포트 저장/PDF export/공유 링크는 Credit과 무관하다.  
> "월 리포트 수"를 별도로 두면 Credit 제한과 충돌하여 사용자 혼란이 발생한다.

| 티어 | 가격 | 클라이언트 | AI Credit/월 | 팀원 | 주요 기능 |
|---|---:|---:|---:|---:|---|
| Tier 1 | $69 | 5 | 100 | 1 | 기본 리포트, PDF, 공유 링크 |
| Tier 2 | $129 | 15 | 350 | 3 | 화이트라벨, 고급 템플릿 |
| Tier 3 | $249 | 40 | 1,000 | 10 | 팀 기능, 우선 지원 |
| Tier 4 | $399 | 100 | 2,500 | 20 | 반응 보고 선택 도입 |

**제한 구조 원칙:**
- 클라이언트 수 → 관리 규모 제한
- AI Credit → AI 생성 비용 제한
- 리포트 저장/PDF/공유 링크 → 제한 없음
- 팀원 수 → 협업 규모 제한

---

## 9.2 예상 판매 분포

| 티어 | 예상 비중 | 판단 |
|---|---:|---|
| Tier 1 | 70~80% | 신규 브랜드 기준 주력 |
| Tier 2 | 15~20% | 화이트라벨 필요 고객 |
| Tier 3 | 3~5% | 일부 에이전시 |
| Tier 4 | 1% 미만 | 초기에는 기대 낮음 |

---

## 9.2.1 AppSumo 코드 스태킹 정책

> **[v1.2 신규]** Warning #8 해결

AppSumo에서는 관례적으로 여러 코드를 등록해 상위 티어로 업그레이드하는 "스태킹"을 허용한다.

### 스태킹 규칙
- 동일 워크스페이스에 최대 **4개 코드**까지 스태킹 허용
- 코드 1개 = Tier 1, 코드 2개 = Tier 2, 코드 3개 = Tier 3, 코드 4개 = Tier 4
- 이미 Tier 4 상태에서 추가 코드 등록 불가 (오류 메시지 표시)
- 스태킹은 코드 등록 후 즉시 적용된다
- AppSumo Q&A 페이지에 스태킹 안내 필수 기재

---

## 9.3 LTD에 포함하지 말아야 할 기능

- 무제한 AI generation
- 모든 미래 커넥터 무상 포함
- 무제한 클라이언트
- 무제한 팀원
- 커스텀 도메인
- 자동 이메일 발송
- 클라이언트 포털
- 고급 승인 워크플로우

---

# 10. 구독 전환 전략

AppSumo 구매자를 직접 구독자로 전환하는 비율은 낮게 본다.

현실적 전략:
- LTD는 검증과 리뷰 확보용
- 구독 고객은 SEO/콘텐츠/커뮤니티를 통해 별도 획득
- LTD 구매자에게는 add-on과 usage expansion을 판매

## 10.1 구독 전환 기능

| 기능 | 구독 전용 이유 |
|---|---|
| 추가 클라이언트 슬롯 | 고객 규모 증가 시 과금 가능 |
| 추가 AI credit | 사용량 기반 비용 회수 |
| 자동 월간 리포트 생성 | 반복 자동화 가치 큼 |
| 이메일 예약 발송 | 운영 자동화 기능 |
| GA4/GSC API 자동 연동 | 유지보수 비용 발생 |
| Google Sheets 연동 | 자동화 가치 |
| 커스텀 도메인 | 고급 화이트라벨 |
| 클라이언트 포털 | 장기 SaaS 가치 |

---

# 11. 데이터베이스 설계 초안

## 11.1 주요 테이블

- users
- workspaces
- workspace_members
- clients
- uploaded_files
- datasets
- dataset_columns
- metric_mappings
- reports
- report_blocks
- report_evidences
- report_exports
- shared_links
- appsumo_codes
- usage_ledger
- ai_generation_logs
- audit_logs

---

## 11.2 users

> **[v1.2 수정]** Supabase Auth + Prisma 연결 방식을 확정했다.

### 연결 방식 확정
- Supabase Auth가 `auth.users` 테이블을 자체 관리한다.
- Prisma의 `public.users` 테이블은 `auth.users.id`를 그대로 PK로 사용한다.
- 사용자가 Supabase Auth로 가입하면, Supabase Database Trigger(또는 앱 서버 훅)가 `public.users`에 row를 자동 생성한다.
- 서버 코드에서는 Supabase Auth 세션의 `user.id`를 Prisma 쿼리의 `where.id`에 직접 사용한다.
- Row Level Security(RLS)는 MVP에서 사용하지 않는다. 대신 서버 액션/라우트 핸들러에서 `workspace_id` 기반 권한 검증을 강제한다.

### 컬럼
- id uuid PK (= Supabase auth.users.id, 자동 동기화)
- email varchar(255) NOT NULL
- name varchar(100) NULL
- avatar_url text NULL
- created_at timestamptz NOT NULL DEFAULT now()
- updated_at timestamptz NOT NULL DEFAULT now()

### 구현 주의
- 클라이언트에서 전달된 workspace_id를 신뢰하지 않는다.
- 서버에서 항상 세션 user.id → workspace_members 조회 → 권한 확인 순서로 처리한다.
- 비밀번호는 Supabase Auth가 관리하며 Prisma 테이블에 저장하지 않는다.

---

## 11.3 workspaces

- id
- owner_user_id
- name
- logo_url
- primary_color
- timezone
- currency
- plan_type
- appsumo_tier
- created_at
- updated_at

---

## 11.4 workspace_members

- id
- workspace_id
- user_id
- role
- status
- invited_at
- joined_at
- created_at
- updated_at

role:
- owner
- admin
- member

MVP에서는 owner만 구현해도 된다. 단, 스키마는 확장 가능하게 만든다.

---

## 11.5 clients

- id
- workspace_id
- name
- website_url
- industry
- logo_url
- primary_color
- status
- notes
- created_at
- updated_at

---

## 11.6 uploaded_files

- id
- workspace_id
- client_id
- source_type
- original_filename
- storage_path
- file_size
- row_count
- status
- error_message
- uploaded_by_user_id
- created_at
- updated_at

source_type:
- ga4
- gsc
- google_ads
- meta_ads
- generic

status:
- uploaded
- parsed
- failed
- archived

---

## 11.7 datasets

> **[v1.2 수정]** `normalized_data_json` 제거. CSV 원본 데이터를 단일 JSONB에 저장하면 50,000행 기준 수십 MB가 되어 조회/인덱싱/AI 전달 시 심각한 성능 문제가 발생한다.

### 저장 구조 원칙
- **원본 row 데이터** → Supabase Storage에 파일(JSON/Parquet)로 저장
- **집계 요약 지표** → `summary_metrics_json` (JSONB, 소량)
- AI에는 `summary_metrics_json`만 전달한다. 원본 데이터를 LLM에 절대 전달하지 않는다.

### 컬럼
- id uuid PK
- workspace_id uuid NOT NULL
- client_id uuid NOT NULL
- uploaded_file_id uuid NOT NULL
- source_type varchar(30) NOT NULL (ga4 / gsc / google_ads / meta_ads / generic)
- reporting_period_start date NOT NULL
- reporting_period_end date NOT NULL
- storage_path text NOT NULL (Supabase Storage 내 파싱된 데이터 파일 경로)
- summary_metrics_json jsonb NOT NULL DEFAULT '{}'::jsonb (KPI 계산 결과 요약)
- row_count integer NOT NULL DEFAULT 0
- status varchar(20) NOT NULL DEFAULT 'processing'
- error_message text NULL
- created_at timestamptz NOT NULL DEFAULT now()
- updated_at timestamptz NOT NULL DEFAULT now()

### status 값
- processing (파싱 중)
- ready (사용 가능)
- failed (파싱 실패)
- archived (보관)

### summary_metrics_json 예시
```json
{
  "totals": { "sessions": 12400, "conversions": 310 },
  "mom_changes": { "sessions": 0.184, "conversions": -0.05 },
  "top_pages": [{ "page": "/blog/seo", "clicks": 840 }],
  "bottom_pages": [...],
  "period": { "start": "2026-03-01", "end": "2026-03-31" }
}
```

---

## 11.8 metric_mappings

> **[v1.2 수정]** Minor #12 해결: `workspace_id` 제거. `client_id`로 `workspace_id`를 항상 조회할 수 있으므로 중복이며, 불일치 버그의 원인이 된다.

- id uuid PK
- client_id uuid NOT NULL FK → clients.id
- source_type varchar(30) NOT NULL
- csv_column_name varchar(100) NOT NULL
- standard_metric_key varchar(80) NOT NULL
- confidence_score float NULL
- is_user_confirmed boolean NOT NULL DEFAULT false
- created_at timestamptz NOT NULL DEFAULT now()
- updated_at timestamptz NOT NULL DEFAULT now()

### 인덱스
- unique(client_id, source_type, csv_column_name)

---

## 11.9 reports

- id
- workspace_id
- client_id
- title
- template_type
- reporting_period_start
- reporting_period_end
- tone
- status
- created_by_user_id
- published_at
- created_at
- updated_at

status:
- draft
- generated
- reviewed
- published
- archived

---

## 11.10 report_blocks

- id
- report_id
- block_type
- title
- content
- sort_order
- is_visible
- ai_generated
- risk_level
- created_at
- updated_at

block_type:
- cover
- executive_summary
- kpi_snapshot
- wins
- concerns
- what_changed
- why_it_matters
- channel_performance
- top_items
- next_actions
- internal_notes
- appendix

---

## 11.11 report_evidences

- id
- report_id
- report_block_id
- sentence_id
- metric_key
- current_value
- previous_value
- change_value
- change_rate
- source_dataset_id
- confidence_level
- created_at

---

## 11.12 shared_links

- id
- report_id
- token
- status
- expires_at
- created_at
- disabled_at

status:
- active
- disabled
- expired

---

## 11.13 appsumo_codes

- id
- code
- tier
- status
- redeemed_by_user_id
- workspace_id
- redeemed_at
- created_at
- updated_at

status:
- unused
- redeemed
- revoked

---

## 11.14 usage_ledger

- id
- workspace_id
- user_id
- usage_type
- amount
- reference_id
- created_at

usage_type:
- ai_credit
- report_generation
- pdf_export
- file_upload

---

## 11.15 ai_generation_logs

- id
- workspace_id
- user_id
- report_id
- action_type
- model_name
- input_tokens
- output_tokens
- total_cost_estimate
- credits_charged
- status
- error_message
- created_at

---

# 12. 화면별 명세

## 12.1 Landing Page

목적:
- AppSumo 외부 유입과 Product Hunt 유입을 전환한다.

섹션:
1. Hero
2. Problem
3. Solution
4. How it works
5. Sample report preview
6. Feature comparison
7. Use cases
8. Pricing / AppSumo CTA
9. FAQ
10. Data privacy statement

핵심 CTA:
- Get Lifetime Deal
- Try Sample Report
- View Sample PDF

---

## 12.2 Sign Up / Login

기능:
- 이메일 가입
- 이메일 로그인
- 비밀번호 재설정
- 약관 동의

---

## 12.3 Onboarding

단계:
1. 워크스페이스명 입력
2. 업무 유형 선택
3. 샘플 데이터 사용 또는 CSV 업로드 선택
4. 첫 리포트 생성 유도

---

## 12.4 Dashboard

구성:
- 사용량 요약
- 남은 AI credits
- 클라이언트 수 / 제한
- 최근 리포트
- 최근 업로드 데이터
- Quick actions
- Setup checklist

CTA:
- Create Report
- Upload CSV
- Add Client

---

## 12.5 Clients

구성:
- 클라이언트 목록
- 상태 필터
- 검색
- 클라이언트 추가
- 최근 리포트 수

---

## 12.6 Client Detail

구성:
- 클라이언트 기본 정보
- 브랜드 override
- 업로드 데이터 목록
- 리포트 목록
- 메모

CTA:
- Upload Data
- Create Report

---

## 12.6.1 Upload History

> **[v1.2 신규]** Minor #13 해결: Dashboard에서 "최근 업로드 데이터"를 표시하지만 전체 목록 조회 화면이 없었음. 추가.

경로: `/uploads/history`

구성:
- 업로드 파일 전체 목록 (최신순)
- 필터: 클라이언트, 데이터 소스 유형, 상태 (ready / failed / archived)
- 검색: 파일명, 클라이언트명
- 각 항목: 파일명, 클라이언트, 소스 유형, 행 수, 업로드 일시, 상태 배지
- 실패 항목: 실패 사유 표시 + 재업로드 버튼
- 아카이브 처리 버튼

---

## 12.7 Upload Data

단계:
1. 클라이언트 선택
2. 데이터 소스 선택
3. 보고 기간 선택
4. CSV 업로드
5. 데이터 미리보기
6. 매핑으로 이동

오류:
- 파일 형식 오류
- 용량 초과
- 빈 파일
- 헤더 없음
- 인코딩 오류
- 필수 컬럼 없음

---

## 12.8 Data Mapping

구성:
- CSV 컬럼 목록
- 표준 지표 선택
- 자동 추천 배지
- 신뢰도 표시
- 필수 지표 경고
- 저장 버튼

---

## 12.9 Report Builder

구성:
- 리포트 제목
- 클라이언트 / 기간
- 템플릿 선택
- 문체 선택
- **AI Notes 입력창** (선택, AI에게 전달할 추가 컨텍스트 입력)
  - 예: "This client had a site migration in week 2", "Focus on mobile traffic"
  - 최대 500자, AI 입력 데이터의 `user_notes` 필드로 전달
- AI 초안 생성 버튼
- 블록 편집기
- Evidence panel
- Risk flags
- Preview / Export 버튼

> **[v1.2 수정]** Warning #6 해결: AI 입력 명세(17.2)의 `user_notes` 필드에 대응하는 UI 요소 추가

---

## 12.10 Report Preview

구성:
- 웹 리포트 미리보기
- PDF 미리보기
- 발행 전 체크리스트
- PDF 다운로드
- 공유 링크 생성

체크리스트:
- 위험 문장 확인
- 내부 메모 숨김 확인
- 클라이언트명 확인
- 보고 기간 확인
- 브랜드 로고 확인
- 주요 수치 확인

---

## 12.11 Shared Report

구성:
- 클라이언트용 웹 리포트
- 내부 메모 비노출
- 브랜드 반영
- 모바일 반응형

---

## 12.12 Settings

구성:
- 워크스페이스 설정
- 브랜드 설정
- AppSumo 코드 / 플랜
- 사용량
- 데이터 삭제 요청

---

# 13. 개발 기술스택

## 13.1 최종 권장 스택

| 영역 | 권장 기술 | 선택 이유 |
|---|---|---|
| 프론트/백엔드 | Next.js App Router | 풀스택 구현, Vercel 배포, AI 코딩 친화적 |
| 언어 | TypeScript | 타입 안정성, AI 코드 검증 용이 |
| UI | Tailwind CSS + shadcn/ui | 빠른 SaaS UI 제작, 일관된 컴포넌트 |
| DB | PostgreSQL | 관계형 데이터, SaaS 권한/플랜/리포트 구조에 적합 |
| DB 호스팅 | Supabase Postgres | 초기 비용 낮음, Storage/Auth 통합 가능 |
| ORM | Prisma | 타입 안전 DB 접근, AI 코딩 시 이해 쉬움 |
| 인증 | Supabase Auth | 이메일 인증, OAuth 확장, 비용 효율 |
| 파일 저장 | Supabase Storage | CSV, 로고, PDF 저장 |
| AI API | Anthropic Claude API 우선 | 긴 문서/보고서 작성 품질 우수 |
| AI fallback | OpenAI API 선택 가능 | 비용/품질 비교용 백업 |
| PDF 생성 | Playwright | HTML 기반 PDF 생성 안정적 |
| 이메일 | Resend | Next.js 연동 간단, 트랜잭션 이메일 적합 |
| 결제 | Stripe | 구독/애드온 확장용 |
| AppSumo 코드 | 내부 코드 DB 관리 | MVP에서 API 의존 최소화 |
| 배포 | Vercel | Next.js 배포 최적화 |
| 에러 추적 | Sentry | 운영 오류 추적 |
| 분석 | PostHog 또는 Plausible | 제품 사용 분석 |
| 테스트 | Vitest + Playwright | 단위 테스트 + E2E |
| 코드 품질 | ESLint + Prettier | AI 코드 일관성 유지 |
| 패키지 매니저 | pnpm | 빠르고 일관적 |

---

## 13.2 기술 선택 근거

### Next.js App Router

ReportMate는 랜딩 페이지, 대시보드, 서버 액션, API route, PDF 생성, 인증 연동이 모두 필요한 SaaS다. Next.js App Router는 풀스택 SaaS MVP에 적합하다.

권장 구조:
- App Router 기반
- Server Components 우선
- Client Components는 필요한 UI 상호작용에만 사용
- Server Actions는 단순 mutation에 사용
- 복잡한 처리와 외부 API 호출은 route handlers 또는 service layer 사용

---

### Supabase + Prisma

Supabase는 초기 비용이 낮고 Postgres, Auth, Storage를 한 번에 사용할 수 있다.

Prisma는 타입 안전성과 스키마 관리에 유리하다.

**[v1.2 확정]** 연결 방식:
- `public.users.id` = `auth.users.id` (동일 UUID 사용)
- 가입 시 Database Trigger로 `public.users` row 자동 생성
- RLS 미사용, 서버단 권한 검증 + workspace_id 필터링으로 대체
- 클라이언트 전달 workspace_id 신뢰 금지, 반드시 서버에서 세션 기반 재확인

---

### Playwright PDF

ReportMate의 핵심 산출물은 PDF다.
HTML 리포트 페이지를 그대로 PDF로 렌더링하면 웹 미리보기와 PDF 디자인 일관성을 유지하기 쉽다.

주의:
- Vercel serverless에서 브라우저 런타임 문제가 생길 수 있으므로, 필요 시 PDF 생성 전용 서버/worker를 분리한다.
- MVP에서는 동기 PDF 생성으로 시작하되, 실패율이 높으면 background job으로 분리한다.

---

### Anthropic API

보고서 문장 품질이 중요하므로 Claude 계열을 우선 고려한다.

주의:
- 입력 토큰뿐 아니라 출력 토큰 비용이 중요하다.
- 원본 CSV 전체를 넣으면 비용과 오류가 증가한다.
- KPI 요약 데이터만 넣는다.
- AI generation log를 반드시 남긴다.

---

## 13.3 대체 스택

### 비용 절감형
- Next.js
- Supabase Auth/DB/Storage
- Prisma
- OpenAI 또는 저비용 모델
- Vercel

장점:
- 가장 단순
- 초기 비용 낮음

단점:
- PDF 생성/AI 품질 튜닝은 직접 해결 필요

### 안정성 우선형
- Next.js
- Neon Postgres
- Clerk Auth
- S3/R2 Storage
- Prisma
- Vercel

장점:
- 인증과 DB 분리가 명확
- 확장성 좋음

단점:
- 서비스 수 증가
- 초기 설정 복잡도 증가
- 비용 증가 가능

최종 권장:
- MVP는 Supabase 통합형으로 시작한다.
- 매출과 사용량이 검증된 후 분리 여부를 판단한다.

---

# 14. 프로젝트 폴더 구조 권장안

> **[v1.2 수정]** Warning #10 해결: 공유 링크는 API 라우트가 아닌 페이지 라우트로 분리. `/api/shared/[token]` → `/share/[token]/page.tsx`

```txt
reportmate/
  app/
    (marketing)/
      page.tsx
      pricing/page.tsx
      sample-report/page.tsx
    (auth)/
      login/page.tsx
      signup/page.tsx
    (dashboard)/
      dashboard/page.tsx
      clients/page.tsx
      clients/[clientId]/page.tsx
      uploads/page.tsx
      uploads/history/page.tsx          ← [v1.2 신규] Minor #13 해결
      reports/page.tsx
      reports/[reportId]/builder/page.tsx
      reports/[reportId]/preview/page.tsx
      settings/page.tsx
    share/
      [token]/page.tsx                  ← 공유 링크 공개 페이지 (API 아님)
    api/
      ai/generate-report/route.ts
      ai/regenerate-block/route.ts
      uploads/parse-csv/route.ts
      pdf/[reportId]/route.ts
      appsumo/redeem/route.ts
  components/
    ui/
    layout/
    dashboard/
    clients/
    uploads/
    reports/
    evidence/
    billing/
  lib/
    auth/
    db/
    ai/
    csv/
    metrics/
    pdf/
    usage/
    appsumo/
    permissions/
  prisma/
    schema.prisma
    migrations/
  public/
    sample-csv/
    sample-reports/
  tests/
    unit/
    e2e/
  docs/
    PRD.md
    API.md
    DATABASE.md
    AI_PROMPTS.md
    APPSUMO_QA.md
```

---

# 15. 서비스 레이어 설계

## 15.1 핵심 서비스

| 서비스 | 역할 |
|---|---|
| authService | 사용자/세션 처리 |
| workspaceService | 워크스페이스 권한/설정 |
| clientService | 클라이언트 CRUD |
| uploadService | CSV 업로드 처리 |
| csvParserService | CSV 파싱/미리보기 |
| mappingService | 컬럼 매핑 추천/저장 |
| metricService | KPI 계산 |
| reportService | 리포트 생성/조회/상태 관리 |
| aiReportService | AI 리포트 생성 |
| evidenceService | Evidence Tags 연결 |
| riskFlagService | 위험 문장 감지 |
| pdfService | PDF 생성 |
| usageService | credit/limit 차감 |
| appsumoService | 코드 등록/티어 적용 |
| permissionService | workspace 권한 검증 |

---

# 16. API / Route Handler 초안

## 인증/워크스페이스
- POST /api/workspaces
- GET /api/workspaces/current
- PATCH /api/workspaces/:id

## 클라이언트
- GET /api/clients
- POST /api/clients
- GET /api/clients/:id
- PATCH /api/clients/:id
- DELETE /api/clients/:id/archive

## 업로드
- POST /api/uploads
- POST /api/uploads/:id/parse
- GET /api/uploads/:id/preview

## 매핑
- POST /api/mappings/suggest
- POST /api/mappings/save
- GET /api/mappings/:clientId/:sourceType

## 리포트
- POST /api/reports
- GET /api/reports
- GET /api/reports/:id
- PATCH /api/reports/:id
- POST /api/reports/:id/generate
- POST /api/reports/:id/regenerate-block
- POST /api/reports/:id/publish

## PDF/공유
- POST /api/reports/:id/export-pdf
- POST /api/reports/:id/share
- PATCH /api/shared-links/:id/disable
- GET /share/[token] → 페이지 라우트 (app/share/[token]/page.tsx), API 아님

## AppSumo
- POST /api/appsumo/redeem
- GET /api/appsumo/current-plan

## 사용량
- GET /api/usage/current
- POST /api/usage/check

---

# 17. AI 프롬프트 설계 원칙

## 17.1 시스템 프롬프트 핵심

```txt
You are a marketing report assistant for small agencies.
Use only the provided metrics.
Do not invent numbers.
Do not infer causes as facts.
If a cause is uncertain, phrase it as a possible explanation.
Write in client-friendly English.
Every numeric claim must reference an evidence key.
Return structured JSON only.
```

---

## 17.2 AI 입력 데이터

AI에는 다음만 전달한다.

- report_type
- client_industry
- reporting_period
- tone
- calculated_kpis
- month_over_month_changes
- top_items
- bottom_items
- user_notes
- block_schema

전달하지 않을 것:
- 원본 CSV 전체
- 불필요한 개인정보
- 업로드 파일 원문 전체

---

## 17.3 생성 후 검증

AI 출력 후 다음 검증을 수행한다.

1. JSON schema 검증
2. evidence key 존재 여부 검증
3. 숫자 문장과 evidence 값 일치 여부 검증
4. 금지 표현 감지
5. 위험 문장 flag 처리
6. 실패 시 재생성 또는 사용자 경고

---

# 18. CSV 전략

## 18.1 가장 중요한 리스크

ReportMate의 MVP 실패 리스크 1순위는 AI가 아니라 CSV 파싱 실패다.

대응 원칙:
- 모든 CSV 자동 인식 약속 금지
- 공식 export 가이드 제공
- 샘플 CSV 제공
- 컬럼 매핑 UX 강화
- SEO용 GA4 + GSC 조합을 가장 먼저 안정화

---

## 18.2 공식 샘플 CSV

제공할 샘플:
1. GA4 monthly traffic sample
2. GSC query performance sample
3. GSC page performance sample
4. Google Ads campaign sample
5. Meta Ads campaign sample
6. Generic marketing KPI sample

---

## 18.3 CSV 업로드 가이드

각 데이터 소스별로 준비:
- 어디에서 export하는지
- 어떤 기간으로 export하는지
- 어떤 컬럼이 필요한지
- 어떤 형식이 가장 잘 작동하는지
- 오류가 날 때 어떻게 수정하는지

---

# 19. 샘플 리포트 전략

## 19.1 개발 전 필수 샘플

개발 전 최소 3개 샘플 리포트를 만든다.

필수 샘플:
1. SEO 성과 상승 월간 리포트
2. SEO 성과 하락 월간 리포트
3. PPC 성과 애매한 월간 리포트

런치 전 최소 10개 샘플 리포트를 준비한다.

---

## 19.2 샘플 품질 기준

| 항목 | 기준 |
|---|---|
| 분량 | 3~6페이지 |
| 구성 | Summary / KPI / Wins / Concerns / Next Actions |
| 문체 | 클라이언트가 이해 가능한 영어 |
| 근거 | 모든 수치 문장에 evidence 표시 |
| 디자인 | 실제 에이전시가 보낼 수 있는 PDF 수준 |
| 사례 | 좋은 성과, 나쁜 성과, 애매한 성과 모두 포함 |

---

# 20. Phase 0 — 개발 전 시장 검증

> **Phase 0의 핵심 원칙:** 코드를 한 줄도 쓰지 않고, 실제 사람들에게 “이거 살 것 같아?”를 확인하는 단계다.  
> 개발에 수개월을 쏟기 전에, $0~$100 예산으로 팔릴지를 먼저 증명한다.

---

## 20.0 Phase 0가 필요한 이유

ReportMate는 **”만들면 팔릴 것 같다”는 가정** 위에 있다.  
이 가정이 틀리면 수개월의 개발이 낭비된다.

Phase 0는 이 가정을 코드 없이 검증한다.  
통과하면 확신을 갖고 개발한다. 미달이면 방향을 바꾼다.

---

## 20.1 목표

앱 없이, 수동으로 만든 샘플 리포트만으로 아래를 확인한다.

1. 실제 마케터/에이전시가 이 리포트를 클라이언트에게 보낼 수 있는가?
2. 지금 리포트 작성에 충분히 불편함을 느끼고 있는가?
3. $69 LTD에 돈을 낼 의향이 있는가?
4. CSV 업로드 방식을 수용할 수 있는가?

---

## 20.2 Step 1 — 샘플 리포트 3개 수동 제작

### 도구
- **Canva** (무료, 템플릿 풍부, PDF 내보내기 가능) — 권장
- Google Slides (무료, 공유 링크 생성 가능)
- Figma (디자인 퀄리티 높음, 다소 복잡)

### 만들어야 할 3개
| # | 유형 | 시나리오 |
|---|------|---------|
| 1 | SEO 성과 상승 리포트 | 전월 대비 트래픽 +18%, 전환 +12% |
| 2 | SEO 성과 하락 리포트 | 트래픽 -22%, 원인 설명 + 대응 방안 포함 |
| 3 | PPC 성과 애매한 리포트 | ROAS 유지, CPC 상승, 해석이 필요한 상황 |

### 리포트 필수 구성 요소 (각 3~6페이지)
```
1. Cover Page      — 클라이언트명, 기간, 에이전시 로고
2. Executive Summary — 핵심 3줄 요약
3. KPI Snapshot    — 주요 지표 카드 (숫자 + 전월 대비 화살표)
4. Wins            — 잘 된 것 2~3가지 (수치 근거 포함)
5. Concerns        — 우려사항 + 가능한 원인 (추정으로 표현)
6. Next Actions    — 다음 달 액션 플랜 3가지
```

### 데이터는 가상으로 만들어도 된다
- 실제 클라이언트 데이터 없어도 됨
- 현실적인 숫자를 직접 입력해서 만들면 됨
- “Sample Data — Not Real Client” 문구를 하단에 표시

### 품질 기준
- 실제 에이전시가 클라이언트에게 보낼 수 있는 수준의 디자인
- 모든 수치 문장에 근거 표시 (예: “based on GA4 data”)
- 문체는 Professional English

---

## 20.3 Step 2 — Reddit 피드백 수집

### 대상 커뮤니티 (우선순위순)
1. **r/SEO** — 가장 직접적인 타깃
2. **r/PPC** — 2차 타깃
3. **r/agency** — 에이전시 운영자
4. **r/freelance** — 프리랜서 마케터

### 포스팅 전략
Reddit은 광고성 글을 싫어한다. 아래 방식을 따른다.

**제목 예시:**
```
I made a sample AI-generated SEO report for agencies — would you actually send this to a client?
```

**본문 예시:**
```
I'm exploring whether to build a tool that turns GA4/GSC CSV exports into 
client-ready reports using AI.

Before writing any code, I wanted to see if the output is actually useful.

Here's a sample monthly SEO report I made manually:
[PDF 링크 또는 이미지]

Questions:
1. Would you send something like this to a client?
2. How long does it currently take you to make a similar report?
3. What's missing or wrong with this format?

Not selling anything. Just validating before I build.
```

**주의사항:**
- 링크를 직접 홍보하지 않는다
- “I'm building” 이 아니라 “I'm exploring” 으로 표현한다
- 댓글에는 솔직하게 대화한다
- 반응이 없으면 1주일 후 다른 커뮤니티에 재시도

### PDF 공유 방법
- Canva 공개 링크 (별도 가입 없이 열람 가능)
- Google Drive 공개 공유
- Notion 공개 페이지에 이미지 삽입

---

## 20.4 Step 3 — Upwork 인터뷰 (선택, 예산 $100)

Reddit 반응이 애매하거나 더 깊은 피드백이 필요할 때 진행한다.

### 대상
- “Marketing agency owner” 또는 “SEO freelancer” 프로필
- 영어권 (미국, 영국, 캐나다, 호주)
- 리뷰 10개 이상

### 방법
- Upwork에서 5명에게 메시지 발송
- “$20 for a 20-minute interview about your client reporting process”
- 질문 내용은 아래 인터뷰 질문지 사용

### 인터뷰 질문지
```
1. How do you currently create monthly reports for your clients?
2. How long does it take to create one report?
3. What tools do you use? (Looker Studio, Google Sheets, Word, etc.)
4. What's the most painful part of the reporting process?
5. [샘플 리포트 공유] Would you send something like this to your client?
6. What would you change or add?
7. Would you pay $69 one-time for a tool that generates this automatically?
8. Is uploading a CSV acceptable, or do you need direct API integration?
```

---

## 20.5 통과 기준

| 검증 항목 | 통과 기준 | 미달 시 |
|---|---|---|
| 샘플 리포트 반응 | 응답자 5명 중 3명 이상 “보낼 수 있다” | 디자인/내용 재검토 |
| 리포트 작성 고통 | 평균 1시간 이상 소요 응답 확보 | 타깃 재검토 |
| 지불 의향 | 최소 2명 이상 “$69 LTD 긍정” | 가격/기능 재검토 |
| CSV 허용도 | 5명 중 3명 이상 CSV 수용 | API 우선 전략 재검토 |
| ChatGPT 대비 | 근거 지표/반복 매핑/PDF 중 1개 이상 인정 | 차별화 포인트 재검토 |

**모든 항목 통과 → Phase 1 개발 시작**  
**2개 이상 미달 → 방향 재검토 후 Phase 0 재실행**

---

## 20.6 예상 소요 시간

| 작업 | 예상 시간 |
|------|---------|
| 샘플 리포트 3개 제작 (Canva) | 1~2일 |
| Reddit 포스팅 + 반응 대기 | 3~5일 |
| Upwork 인터뷰 (선택) | 3~5일 |
| 결과 정리 및 판단 | 반나절 |
| **총 Phase 0 기간** | **약 1~2주** |

---

## 20.7 Phase 0 완료 체크리스트

- [ ] SEO 성과 상승 샘플 리포트 PDF 완성
- [ ] SEO 성과 하락 샘플 리포트 PDF 완성
- [ ] PPC 성과 애매한 샘플 리포트 PDF 완성
- [ ] Reddit 최소 1개 커뮤니티 포스팅 완료
- [ ] 유효 피드백 5개 이상 수집
- [ ] 통과 기준 5개 항목 판정 완료
- [ ] Phase 1 착수 or 방향 재검토 결정

통과 기준 충족 시, 이 체크리스트를 완료 표시하고 Phase 1을 시작한다.

---

# 21. 마케팅 준비

## 21.1 런치 전 콘텐츠

최소 작성 콘텐츠:
1. How to automate client SEO reports
2. GA4 client report template
3. Google Search Console monthly report template
4. How agencies can explain SEO performance drops
5. Looker Studio vs AI client reports
6. ChatGPT vs ReportMate for agency reports

---

## 21.2 AppSumo Q&A 핵심 답변

### Q. ChatGPT에 CSV 넣으면 되는데 왜 사야 하나요?

A. ChatGPT can write a report. ReportMate gives you a repeatable reporting workflow: saved client mappings, evidence-backed claims, reusable templates, branded PDFs, and monthly comparison logic.

핵심 차이:
- 저장된 클라이언트별 매핑
- 근거 지표 연결
- 반복 가능한 템플릿
- 브랜드 PDF
- 전월 대비 계산
- 리포트 발행 플로우

---

### Q. CSV만으로 사용할 수 있나요?

A. 네. MVP는 CSV-first입니다. GA4, GSC, Google Ads, Meta Ads CSV를 업로드해 사용할 수 있습니다.

---

### Q. API 연동은 언제 되나요?

A. GA4, GSC, Google Sheets 연동은 post-launch roadmap입니다. MVP는 안정적인 CSV workflow를 먼저 제공합니다.

---

### Q. 데이터가 AI 학습에 사용되나요?

A. No. Uploaded client data is used only to generate your reports and is not used to train AI models.

실제 정책은 사용하는 AI API와 개인정보처리방침에 맞춰 최종 확인해야 한다.

---

# 22. 보안 / 개인정보 / 데이터 정책

## 22.1 원칙

- 사용자 데이터는 워크스페이스 단위로 격리한다.
- 업로드된 클라이언트 데이터는 리포트 생성을 위해서만 사용한다.
- AI 학습 사용 여부는 명확히 고지한다.
- 사용자는 파일과 리포트 삭제를 요청할 수 있어야 한다.
- 공유 링크는 예측 불가능한 token 기반으로 생성한다.

---

## 22.2 MVP 보안 요구사항

- 인증된 사용자만 dashboard 접근
- workspace_id 기반 권한 검증
- 파일 접근 권한 검증
- 공유 링크 token 난수화
- 내부 메모는 shared report에서 기본 숨김
- AI API key 서버 환경변수 관리
- 에러 로그에 민감 데이터 저장 금지

---

# 23. 테스트 전략

## 23.1 단위 테스트

대상:
- KPI 계산
- 변화율 계산
- CSV 파싱
- 컬럼 매핑
- credit 차감
- AppSumo 코드 등록
- 권한 검증

---

## 23.2 E2E 테스트

핵심 시나리오:
1. 회원가입 → 워크스페이스 생성
2. 클라이언트 생성
3. CSV 업로드
4. 컬럼 매핑
5. AI 리포트 생성
6. PDF export
7. 공유 링크 생성
8. AppSumo 코드 등록
9. credit 초과 시 생성 차단

---

## 23.3 수동 QA 체크리스트

- 샘플 데이터로 3분 내 리포트 생성 가능한가?
- 실제 CSV로 10분 내 리포트 생성 가능한가?
- PDF 페이지가 깨지지 않는가?
- AI가 없는 수치를 만들지 않는가?
- Evidence Tags가 정상 연결되는가?
- Risk Flags가 작동하는가?
- 공유 링크에 내부 메모가 보이지 않는가?
- 티어 제한이 정확히 작동하는가?

---

# 24. 개발 로드맵

## Phase 0: 검증 + 설계

목표:
- 개발 전 시장 반응 확인
- 샘플 리포트와 CSV 정책 확정

작업:
1. 샘플 리포트 3개 제작
2. Reddit/Upwork 피드백 5명 수집
3. AI credit 정책 확정
4. AppSumo 티어 확정
5. CSV 샘플 형식 확정
6. DB 스키마 확정
7. UI 와이어프레임 확정
8. AI 프롬프트 초안 확정

---

## Phase 1: MVP Core

작업:
1. 프로젝트 세팅
2. 인증
3. 워크스페이스
4. 클라이언트 관리
5. CSV 업로드
6. CSV 파싱/미리보기
7. 컬럼 매핑
8. KPI 계산 엔진
9. 리포트 템플릿
10. AI 리포트 생성
11. Evidence Tags
12. Risk Flags
13. 리포트 편집기

---

## Phase 2: Export & Sharing

작업:
1. PDF export
2. 공유 링크
3. 화이트라벨
4. 발행 전 체크리스트
5. 내부 메모 숨김
6. 리포트 미리보기

---

## Phase 3: AppSumo Readiness

작업:
1. AppSumo 코드 등록
2. 티어별 제한
3. 사용량 대시보드
4. 온보딩 튜토리얼
5. 샘플 데이터
6. FAQ
7. 랜딩 페이지
8. AppSumo Q&A 문서
9. 지원 이메일 템플릿

---

## Phase 4: Post-launch

작업:
1. GA4 API 연동
2. GSC API 연동
3. Google Sheets 연동
4. 자동 월간 리포트 생성
5. 이메일 예약 발송
6. 팀 승인 워크플로우
7. 클라이언트 포털
8. 커스텀 도메인

---

# 25. AI 바이브코딩 개발 원칙

## 25.1 AI에게 한 번에 맡기면 안 되는 작업

- 전체 SaaS를 한 번에 구현
- DB 스키마와 UI와 AI 로직을 동시에 수정
- PDF export와 리포트 편집기를 한 번에 구현
- 권한/결제/사용량 제한을 나중에 붙이기

이렇게 하면 오류가 누적된다.

---

## 25.2 권장 개발 방식

각 단계는 다음 순서로 진행한다.

1. 요구사항 확인
2. 관련 파일만 읽기
3. 작은 단위 구현
4. 타입 오류 확인
5. 테스트 작성
6. 수동 QA
7. 문서 갱신
8. 다음 단계 이동

---

## 25.3 AI에게 줄 기본 규칙

```txt
Do not rewrite unrelated files.
Do not introduce new dependencies without approval.
Keep changes small and testable.
Use TypeScript strictly.
Validate user permissions on every server-side operation.
Do not trust client-side workspace_id.
Do not send raw CSV data directly to LLM.
All AI-generated numeric claims must be backed by computed metrics.
Update documentation after each completed phase.
```

---

# 26. 개발 착수 전 최종 체크리스트

> **[v1.2 수정]** Minor #11 해결: v1.1에서 "확정 필요"로 남겨진 항목들을 v1.2 기준으로 갱신

| 항목 | 상태 |
|---|---|
| 제품명 ReportMate 확정 | ✅ 확정 |
| 제품 방향 AI Client Report Generator | ✅ 확정 |
| CSV-first 전략 | ✅ 확정 |
| 1차 타깃 SEO/콘텐츠 에이전시 | ✅ 확정 |
| AI credit 정책 | ✅ 확정 (Section 8.2, 8.5, 8.6) |
| AppSumo 티어 및 스태킹 정책 | ✅ 확정 (Section 9.1, 9.2.1) |
| Supabase Auth + Prisma 연결 방식 | ✅ 확정 (Section 11.2, 13.2) |
| AI 생성 실패 처리 정책 | ✅ 확정 (Section 8.5) |
| 블록 재생성 편집 덮어쓰기 정책 | ✅ 확정 (Section 7.8) |
| 공유 링크 만료 정책 | ✅ 확정 (Section 7.13) |
| Credit 월 리셋 기준 | ✅ 확정 (Section 8.6) |
| 폴더 구조 / API 경로 정합성 | ✅ 확정 (Section 14, 16) |
| DB 스키마 | ✅ 초안 완료 (Prisma 스키마는 개발 Phase 1에서 생성) |
| UI 화면 목록 | ✅ 확정 (상세 와이어프레임은 개발 중 병행) |
| AI 프롬프트 | ✅ 원칙 확정 (실제 프롬프트는 Phase 1에서 실측 튜닝) |
| 기술스택 | ✅ 확정 |
| 샘플 리포트 | ⏳ Phase 0에서 제작 (개발 착수 전 필수) |
| CSV 샘플 | ⏳ Phase 0에서 제작 |
| Phase 0 인터뷰 질문지 | ⏳ Phase 0에서 제작 |
| AppSumo Q&A 판매 페이지용 정리 | ⏳ Phase 3에서 완성 |

---

# 27. 다음 산출물 순서

개발 직전까지 남은 산출물은 아래 순서로 만든다.

1. 데이터베이스 Prisma schema 초안
2. UI 화면별 상세 명세서
3. AI 프롬프트 / JSON schema 명세서
4. CSV 샘플 형식 / 매핑 규칙 문서
5. 샘플 리포트 3개
6. AppSumo 런치 페이지 초안
7. AppSumo Q&A 문서
8. Claude Code / Codex 개발 전달 프롬프트

---

# 28. 최종 요약

ReportMate는 기능이 많은 SaaS가 아니라, 한 가지 문제를 강하게 해결하는 SaaS여야 한다.

그 문제는 다음이다.

> 소형 마케팅 에이전시가 매월 반복적으로 작성하는 클라이언트 성과 보고서를 빠르고, 안전하고, 보기 좋게 완성하는 것.

성공 확률을 높이는 핵심은 다음이다.

1. 대시보드 경쟁을 피한다.
2. CSV-first로 초기 실패율을 낮춘다.
3. SEO/GSC/GA4 리포트를 가장 먼저 안정화한다.
4. AI 문장에 근거 지표를 연결한다.
5. 샘플 리포트 품질을 제품 판매의 핵심 자산으로 만든다.
6. AppSumo를 구독 전환 채널이 아니라 검증 채널로 본다.
7. LTD에는 반드시 credit과 사용량 제한을 둔다.
8. AI 바이브코딩은 작은 단위로 단계별 진행한다.

최종 판단:

> 이 프로젝트는 “잘 만들면 팔릴 수도 있는 SaaS”가 아니라, “검증 가능한 샘플 리포트가 좋으면 팔릴 가능성이 생기는 SaaS”다.

따라서 개발 착수 전 가장 먼저 해야 할 일은 코드 작성이 아니라 **샘플 리포트 3개와 CSV 매핑 정책을 확정하는 것**이다.

