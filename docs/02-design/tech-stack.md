# Geul-bang — 기술 스택 정의서 (Tech Stack)

> PDCA Phase: **PLAN → DESIGN**
> 문서 버전: v1.0 | 작성일: 2026-04-22

---

## 1. 전체 스택 개요

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                  │
│  React 18 + Vite │ Panda CSS │ Lucide-React          │
│  jschardet (인코딩 감지) │ TextDecoder (UTF-8 변환)   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│              Firebase (BaaS)                        │
│  Authentication │ Firestore │ Cloud Storage          │
└─────────────────────────────────────────────────────┘
```

---

## 2. 레이어별 기술 스택

### 2.1 Frontend

| 분류 | 기술 | 버전 | 선택 이유 |
|------|------|------|-----------|
| UI 프레임워크 | React | 18.x | 컴포넌트 재사용, 생태계 |
| 빌드 도구 | Vite | 5.x | 빠른 HMR, 경량 번들 |
| 스타일 | Panda CSS | 0.x | 타입세이프 CSS-in-JS, 빌드타임 정적 CSS, 디자인 토큰 기반 테마 관리 |
| 아이콘 | Lucide-React | latest | 경량, React 친화적 |
| 라우팅 | React Router | 6.x | SPA 페이지 전환 |
| 상태 관리 | React Context + useState | built-in | 규모 적합, 외부 의존성 최소화 |

### 2.2 인코딩 처리

| 분류 | 기술 | 역할 |
|------|------|------|
| 인코딩 감지 | jschardet | 바이너리 분석 → 인코딩 추정 |
| 인코딩 변환 | TextDecoder (Web API) | EUC-KR → UTF-8 변환 |
| 파일 읽기 | FileReader API | ArrayBuffer로 파일 바이너리 읽기 |

**처리 파이프라인:**
```
File 선택 → FileReader.readAsArrayBuffer()
  → jschardet.detect(buffer) → encoding 추정
  → new TextDecoder(encoding).decode(buffer)
  → UTF-8 문자열 획득
  → Blob('text/plain;charset=utf-8') 생성
  → Firebase Storage 업로드
```

### 2.3 Backend (Firebase BaaS)

| 서비스 | 용도 | 상세 |
|--------|------|------|
| Firebase Authentication | 사용자 인증 | 익명 로그인, Google OAuth, 이메일 연동 |
| Firestore | 메타데이터 DB | 소설 목록, 진행률, 타임스탬프 |
| Firebase Cloud Storage | 파일 원본 저장 | .txt 파일 본문 (대용량 허용) |

### 2.4 배포

| 항목 | 기술 | 비고 |
|------|------|------|
| 호스팅 | Firebase Hosting | CDN, HTTPS 자동 제공 |
| CI/CD | GitHub Actions (Phase 2) | main 브랜치 push → 자동 배포 |

---

## 3. 기술 선택 근거 (ADR 요약)

### ADR-00: 스타일 프레임워크 — Panda CSS

- **결정**: Tailwind CSS 대신 Panda CSS 채택
- **이유**: 디자인 토큰으로 Light/Dark/Sepia 테마를 선언적으로 관리, 빌드 타임 정적 CSS 생성(런타임 오버헤드 없음), 완전한 타입 안전
- **대안 기각**: Tailwind CSS (과도한 범용 사용으로 차별화 부족), vanilla-extract (보일러플레이트 과다)

**Panda CSS 테마 토큰 예시 (panda.config.ts):**
```typescript
export default defineConfig({
  theme: {
    tokens: {
      fonts: {
        reader: { value: '"KoPub Batang", "Noto Serif KR", serif' },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          value: { base: '#FFFFFF', _dark: '#1a1a1a', _sepia: '#f4ecd8' }
        },
        text: {
          value: { base: '#1a1a1a', _dark: '#e0e0e0', _sepia: '#3b2f2f' }
        },
      },
    },
  },
})
```

---

### ADR-01: 파일 저장 방식 — 하이브리드 (Firestore + Storage)

- **결정**: 파일 본문 → Storage, 메타데이터 → Firestore
- **이유**: Firestore 단일 문서 1MB 제한 (장편 소설 평균 2~5MB)
- **대안 기각**: Firestore 단독 저장 (용량 초과), IndexedDB 로컬 저장 (기기 동기화 불가)

### ADR-02: 인코딩 변환 위치 — 클라이언트 사이드

- **결정**: 브라우저에서 인코딩 감지 및 변환 후 UTF-8로 업로드
- **이유**: 서버 불필요, 파일이 클라이언트에서 처리되므로 네트워크 왕복 없음
- **대안 기각**: Firebase Functions에서 변환 (Cold Start, 비용, 복잡도)

### ADR-03: 인증 방식 — 익명 우선 + 선택적 연동

- **결정**: 앱 첫 로드 시 자동 익명 로그인, 사용자 선택으로 Google 계정 연동
- **이유**: 진입 장벽 최소화 (회원가입 없이 즉시 사용)
- **대안 기각**: 소셜 로그인 필수 (이탈률 증가)

---

## 4. 개발 환경

```bash
# 권장 Node 버전
node >= 20.x

# 주요 패키지
npm create vite@latest geul-bang -- --template react
npm install firebase jschardet
npm install -D @pandacss/dev

# Panda CSS 초기화
npx panda init --postcss
```

---

## 5. 비용 추정 (Firebase Spark Plan 기준)

| 서비스 | 무료 한도 | 예상 사용량 | 비고 |
|--------|-----------|------------|------|
| Authentication | 무제한 | - | 무료 |
| Firestore | 50,000 읽기/일 | 낮음 | MVP 단계 무료 |
| Cloud Storage | 5GB 저장 / 1GB 전송/일 | txt 평균 3MB × 100권 = 300MB | 무료 범위 내 |
| Hosting | 10GB 저장 / 360MB 전송/일 | 낮음 | 무료 |
