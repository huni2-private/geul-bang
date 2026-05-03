# Geul-bang — 구현 노트 (Implementation Notes)

> PDCA Phase: **DO**
> 문서 버전: v1.0 | 작성일: 2026-04-28 | 상태: MVP 구현 완료 (Firebase 연결 대기)

---

## 1. 구현 완료 현황

| 기능 ID | 기능명 | 상태 |
|---------|--------|------|
| SET-01 | 자동 익명 로그인 | ✅ 완료 |
| SET-02 | 계정 보존 경고 배너 | ✅ 완료 |
| SET-03 | Google 계정 연동 | ✅ 완료 |
| LIB-01 | 소설 목록 (최근 읽은 순) | ✅ 완료 |
| LIB-02 | 파일 업로드 (파일 선택) | ✅ 완료 |
| LIB-03 | 인코딩 자동 변환 | ✅ 완료 |
| LIB-04 | 클라우드 업로드 + 메타 저장 | ✅ 완료 |
| LIB-05 | 소설 삭제 | ✅ 완료 |
| RD-01 | 이어보기 (저장 위치 복원) | ✅ 완료 |
| RD-02 | 자동 저장 (Debounce 1초) | ✅ 완료 |
| RD-03 | 스마트 헤더 | ✅ 완료 |
| RD-04 | 뷰어 환경 설정 (글자 크기, 테마) | ✅ 완료 |
| RD-05 | 읽기 방식 설정 (Phase 1: 스크롤 고정) | ✅ 완료 |

---

## 2. 프로젝트 구조

```
geul-bang/
├── src/
│   ├── contexts/
│   │   └── AuthContext.jsx         # Firebase Auth 전역 상태, 익명 자동 로그인
│   ├── hooks/
│   │   ├── useNovels.js            # 서재 CRUD + 업로드 파이프라인
│   │   ├── useReader.js            # 이어보기 + debounce 자동 저장
│   │   └── useScrollDirection.js  # 스마트 헤더용 스크롤 방향 감지
│   ├── services/
│   │   ├── firebase.js             # Firebase 앱 초기화
│   │   ├── auth.service.js         # 익명 로그인, Google 연동
│   │   ├── novel.service.js        # Firestore CRUD (소설 메타데이터)
│   │   └── storage.service.js      # Firebase Storage 업로드/삭제
│   ├── utils/
│   │   └── encoding.js             # jschardet + TextDecoder (EUC-KR → UTF-8)
│   ├── components/
│   │   ├── auth/AccountBanner.jsx  # 익명 계정 연동 유도 배너
│   │   ├── layout/Header.jsx       # 스마트 헤더 (스크롤 방향 반응)
│   │   ├── library/
│   │   │   ├── NovelCard.jsx       # 소설 카드 (진행률 Bar)
│   │   │   └── FileUploader.jsx    # .txt 업로드 버튼
│   │   └── reader/
│   │       └── ReaderSettings.jsx  # 글자 크기 / 테마 설정 패널
│   ├── pages/
│   │   ├── LibraryPage.jsx         # 서재 화면
│   │   └── ReaderPage.jsx          # 리더 화면
│   ├── App.jsx                     # BrowserRouter + AuthProvider
│   └── index.css                   # Panda CSS @layer reset 선언
├── panda.config.mjs                # Panda CSS 테마 토큰 (Light/Dark/Sepia)
├── vite.config.js                  # styled-system alias 설정
├── .env.example                    # Firebase 환경 변수 템플릿
└── package.json
```

---

## 3. 주요 구현 결정 사항

### 3.1 Panda CSS `styled-system` 경로 처리
- `styled-system/` 폴더는 프로젝트 루트에 생성됨 (`src/` 외부)
- 모든 파일에서 `import { css } from 'styled-system/css'` 로 통일
- `vite.config.js`에 alias 추가로 해결:
  ```js
  resolve: {
    alias: { 'styled-system': path.resolve(__dirname, 'styled-system') }
  }
  ```

### 3.2 테마 적용 방식
- Panda CSS `semanticTokens`에 `_dark`, `_sepia` 조건 정의
- 리더 화면에서는 `[data-theme]` 대신 **인라인 스타일**로 직접 적용
  - 이유: 리더 배경/글자색이 뷰어 전체를 감싸는 단순 구조이므로 토큰보다 직접 제어가 명확함

### 3.3 인코딩 변환 (`utils/encoding.js`)
```js
const buffer = await file.arrayBuffer()
const detected = jschardet.detect(new Uint8Array(buffer))
const charset = detected?.encoding || 'utf-8'
const text = new TextDecoder(charset).decode(buffer)
return new Blob([text], { type: 'text/plain;charset=utf-8' })
```
- `jschardet`에 `Uint8Array` 전달 (Buffer 미지원 환경 대응)
- 감지 실패 시 `'utf-8'` 폴백

### 3.4 자동 저장 debounce (`hooks/useReader.js`)
- `lodash` 없이 직접 구현한 debounce 사용 (의존성 최소화)
- 스크롤 멈춤 1초 후 `progressRatio`, `scrollPosition`, `lastReadAt` 업데이트

### 3.5 소설 삭제 순서
- Storage 파일 삭제 → Firestore 문서 삭제 순으로 실행
- Storage 삭제 실패 시 Firestore 문서가 남아 orphan URL 참조를 방지

---

## 4. 환경 변수 설정 (Firebase 연결)

`.env.example`을 `.env`로 복사 후 Firebase 콘솔에서 값 입력:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firebase 콘솔 설정 체크리스트:
- [ ] Authentication → 익명 로그인 활성화
- [ ] Authentication → Google 로그인 활성화
- [ ] Firestore Database 생성 (테스트 모드 → Security Rules 적용)
- [ ] Storage 생성 (Security Rules 적용)

**Firestore Security Rules:**
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/novels/{novelId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

**Storage Security Rules:**
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /novels/{uid}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow write: if request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

---

## 5. 개발 서버 실행

```bash
cd geul-bang
npm run dev   # panda --watch + vite 동시 실행 (concurrently)
```

---

## 6. 빌드 결과

```
dist/assets/index.css    20.50 kB (gzip: 6.37 kB)
dist/assets/index.js    964.68 kB (gzip: 317.89 kB)
✓ built in 1.08s
```

> 번들 크기 경고 (500kB 초과): Firebase SDK 포함으로 인한 것. Phase 2에서 동적 import로 개선 예정.

---

## 7. 다음 단계 (Phase 2 후보)

| 항목 | 설명 |
|------|------|
| Firebase 연결 및 실제 동작 검증 | `.env` 입력 후 QA |
| Gap 분석 | `/pdca analyze Geul-bang` 으로 설계 대비 구현 정합성 확인 |
| 번들 최적화 | Firebase 동적 import 분리 |
| 페이지 모드 (RD-05) | 스와이프 방식 리더 추가 |
| 이메일 계정 연동 | SET-03 확장 |
