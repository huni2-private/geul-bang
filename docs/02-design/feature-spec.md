# Geul-bang — 기능 명세서 (Feature Specification)

> PDCA Phase: **DESIGN**
> 문서 버전: v1.0 | 작성일: 2026-04-22

---

## 1. 기능 전체 목록 (Feature Map)

```
Geul-bang
├── [AUTH] 인증 시스템
│   ├── SET-01  자동 익명 로그인
│   ├── SET-02  계정 보존 경고 배너
│   └── SET-03  Google 계정 연동 (익명 → 정회원)
│
├── [LIB] 서재 화면
│   ├── LIB-01  소설 목록 (최근 읽은 순)
│   ├── LIB-02  파일 업로드 (파일 선택)
│   ├── LIB-03  인코딩 자동 변환
│   ├── LIB-04  클라우드 업로드 + 메타 저장
│   └── LIB-05  소설 삭제
│
└── [RD]  리더 화면
    ├── RD-01   이어보기 (저장된 위치 복원)
    ├── RD-02   자동 저장 (Debounce 스크롤 추적)
    ├── RD-03   스마트 헤더 (스크롤 방향 감지)
    ├── RD-04   뷰어 환경설정 (글자 크기, 테마)
    └── RD-05   읽기 방식 설정 [Phase 1: 스크롤 고정]
```

---

## 2. 인증 시스템 (AUTH)

### SET-01 — 자동 익명 로그인

| 항목 | 내용 |
|------|------|
| 기능 ID | SET-01 |
| 우선순위 | Critical |
| Phase | 1 |

**동작 시나리오:**
```
앱 최초 로드
  → Firebase onAuthStateChanged 리스너 등록
  → 기존 세션 없을 경우: signInAnonymously() 자동 호출
  → uid 획득 → AuthContext에 저장
  → 서재 화면으로 이동
```

**검증 조건:**
- [ ] 최초 접속 시 로그인 화면 없이 서재 진입
- [ ] 새 탭에서도 동일 uid 유지 (Firebase 세션 지속)
- [ ] signInAnonymously 실패 시 에러 토스트 표시

---

### SET-02 — 계정 보존 경고 배너

| 항목 | 내용 |
|------|------|
| 기능 ID | SET-02 |
| 우선순위 | High |
| Phase | 1 |

**UI 명세:**
```
[위치] 서재 화면 상단 (소설 목록 위)
[조건] isAnonymous === true 일 때만 표시
[내용] "⚠️ 브라우저 데이터 삭제 시 소설이 사라집니다. 계정을 연동하세요."
[CTA] "계정 연동하기" 버튼 → SET-03 트리거
[스타일] amber/yellow 배경, 닫기(X) 버튼 없음 (항상 노출)
```

**검증 조건:**
- [ ] 익명 상태에서 배너 표시
- [ ] Google 연동 완료 후 배너 자동 사라짐

---

### SET-03 — Google 계정 연동

| 항목 | 내용 |
|------|------|
| 기능 ID | SET-03 |
| 우선순위 | High |
| Phase | 1 |

**동작 시나리오:**
```
"계정 연동하기" 버튼 클릭
  → GoogleAuthProvider 생성
  → linkWithPopup(currentUser, provider) 호출
  → 팝업에서 Google 로그인 완료
  → 기존 익명 uid와 동일 uid 유지 (Firestore 데이터 보존)
  → isAnonymous = false 상태로 갱신
  → SET-02 배너 숨김
```

**에러 처리:**

| 에러 코드 | 원인 | 처리 |
|-----------|------|------|
| auth/credential-already-in-use | 이미 다른 계정에 연동된 Google | "이미 연동된 계정입니다" 토스트 |
| auth/popup-closed-by-user | 사용자가 팝업 닫음 | 무시 (연동 취소로 간주) |

**검증 조건:**
- [ ] 연동 후 기존 소설 목록 유지
- [ ] 연동 후 다른 브라우저에서 Google 로그인 시 동일 서재 접근

---

## 3. 서재 화면 (LIB)

### LIB-01 — 소설 목록

| 항목 | 내용 |
|------|------|
| 기능 ID | LIB-01 |
| 우선순위 | Critical |
| Phase | 1 |

**데이터 쿼리:**
```javascript
firestore
  .collection(`users/${uid}/novels`)
  .orderBy('lastReadAt', 'desc')
  .onSnapshot(/* 실시간 업데이트 */)
```

**카드 UI 구성:**
```
┌─────────────────────────────────────────┐
│  📖 소설 제목                      [삭제] │
│  마지막 읽은 시각: 2026-04-22 14:30       │
│  ████████████░░░░░░░ 65%                │
└─────────────────────────────────────────┘
```

**빈 상태 UI:**
```
서재가 비어 있어요.
.txt 파일을 업로드해서 첫 소설을 추가해보세요.
[파일 업로드]
```

**검증 조건:**
- [ ] 소설 카드 클릭 → 리더 화면으로 이동
- [ ] lastReadAt 내림차순 정렬
- [ ] progressRatio 기반 진행률 Bar 표시 (0~100%)

---

### LIB-02 ~ LIB-04 — 파일 업로드 파이프라인

| 기능 ID | 기능명 | Phase |
|---------|--------|-------|
| LIB-02 | 파일 선택 | 1 |
| LIB-03 | 인코딩 변환 | 1 |
| LIB-04 | 클라우드 업로드 | 1 |

**UI 흐름:**
```
[파일 업로드] 버튼 클릭
  → <input type="file" accept=".txt"> 트리거
  → 파일 선택
  → [로딩 스피너 표시]
  ┌─ LIB-03 인코딩 변환 ─────────────────┐
  │  FileReader.readAsArrayBuffer()       │
  │  → jschardet.detect(buffer)          │
  │  → TextDecoder(charset).decode()     │
  │  → UTF-8 Blob 생성                   │
  └───────────────────────────────────────┘
  ┌─ LIB-04 클라우드 업로드 ──────────────┐
  │  Storage: novels/{uid}/{id}_{title}.txt│
  │  → downloadURL 획득                   │
  │  Firestore: users/{uid}/novels/{id}  │
  │  → { title, fileUrl, storagePath,    │
  │       progressRatio: 0,              │
  │       scrollPosition: 0,             │
  │       createdAt, lastReadAt }        │
  └───────────────────────────────────────┘
  → [로딩 스피너 숨김]
  → 서재 목록 갱신 (onSnapshot 자동 반영)
```

**인코딩 변환 로직 (encoding.js):**
```javascript
export async function readFileAsUTF8(file) {
  const buffer = await file.arrayBuffer();
  const detected = jschardet.detect(new Uint8Array(buffer));
  const charset = detected.encoding || 'utf-8';
  const text = new TextDecoder(charset).decode(buffer);
  return new Blob([text], { type: 'text/plain;charset=utf-8' });
}
```

**검증 조건:**
- [ ] EUC-KR 파일 업로드 후 글자 깨짐 없음
- [ ] 1MB 이상 파일 정상 업로드
- [ ] 업로드 중 스피너 표시, 완료 후 목록 즉시 반영
- [ ] 동일 파일명 중복 업로드 허용 (novelId로 구분)

---

### LIB-05 — 소설 삭제

| 항목 | 내용 |
|------|------|
| 기능 ID | LIB-05 |
| 우선순위 | High |
| Phase | 1 |

**동작 시나리오:**
```
[삭제] 버튼 클릭
  → 확인 모달: "삭제하면 복구할 수 없습니다. 계속하시겠어요?"
  → [취소] / [삭제]
  → [삭제] 선택:
    1. Storage: ref(storagePath).delete()
    2. Firestore: doc(novelId).delete()
  → 목록에서 즉시 제거
```

**검증 조건:**
- [ ] Storage 파일과 Firestore 문서 동시 삭제
- [ ] 삭제 확인 모달 미표시 시 삭제 안 됨

---

## 4. 리더 화면 (RD)

### RD-01 — 이어보기

| 항목 | 내용 |
|------|------|
| 기능 ID | RD-01 |
| 우선순위 | Critical |
| Phase | 1 |

**동작 시나리오:**
```
서재에서 소설 카드 클릭
  → /reader/:novelId 라우트 이동
  → Firestore에서 { fileUrl, scrollPosition } 조회
  → fetch(fileUrl) → 텍스트 다운로드
  → 텍스트 렌더링 완료 후:
    window.scrollTo({ top: scrollPosition, behavior: 'instant' })
```

**검증 조건:**
- [ ] 저장된 위치로 즉시 이동 (애니메이션 없음)
- [ ] 최초 읽기 시 scrollPosition = 0 (상단 시작)
- [ ] 파일 로딩 중 스피너 표시

---

### RD-02 — 자동 저장

| 항목 | 내용 |
|------|------|
| 기능 ID | RD-02 |
| 우선순위 | Critical |
| Phase | 1 |

**저장 로직:**
```javascript
// debounce 1초
const handleScroll = debounce(() => {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const ratio = scrollY / maxScroll;  // 0.0 ~ 1.0

  updateDoc(novelRef, {
    scrollPosition: scrollY,
    progressRatio: ratio,
    lastReadAt: serverTimestamp()
  });
}, 1000);

window.addEventListener('scroll', handleScroll);
```

**검증 조건:**
- [ ] 스크롤 멈춤 1초 후 Firestore 업데이트 확인
- [ ] 빠른 스크롤 중 과도한 API 호출 없음 (debounce 확인)
- [ ] 페이지 이탈 전 마지막 위치 저장

---

### RD-03 — 스마트 헤더

| 항목 | 내용 |
|------|------|
| 기능 ID | RD-03 |
| 우선순위 | High |
| Phase | 1 |

**동작 규칙:**

| 조건 | 헤더 상태 |
|------|-----------|
| 스크롤 다운 (아래로) | 헤더 숨김 (translateY(-100%)) |
| 스크롤 업 (위로) | 헤더 표시 (translateY(0)) |
| 최상단 (scrollY < 50) | 항상 표시 |

**CSS:**
```css
.header {
  transition: transform 0.3s ease;
}
.header.hidden {
  transform: translateY(-100%);
}
```

**검증 조건:**
- [ ] 아래 스크롤 시 헤더 부드럽게 사라짐
- [ ] 위 스크롤 시 헤더 즉시 나타남
- [ ] 최상단에서는 항상 헤더 노출

---

### RD-04 — 뷰어 환경 설정

| 항목 | 내용 |
|------|------|
| 기능 ID | RD-04 |
| 우선순위 | Medium |
| Phase | 1 |

**설정 항목:**

| 설정 | 타입 | 기본값 | 범위 |
|------|------|--------|------|
| 글자 크기 | Number (px) | 18 | 12 ~ 28, 2px 단위 |
| 테마 | Enum | Light | Light / Dark / Sepia |

**테마 정의:**

| 테마 | 배경색 | 글자색 |
|------|--------|--------|
| Light | #FFFFFF | #1a1a1a |
| Dark | #1a1a1a | #e0e0e0 |
| Sepia | #f4ecd8 | #3b2f2f |

**저장 방식:** localStorage (`geulbang_settings`)

**검증 조건:**
- [ ] 글자 크기 변경 즉시 반영
- [ ] 테마 변경 즉시 반영
- [ ] 페이지 재방문 시 이전 설정 유지 (localStorage)

---

### RD-05 — 읽기 방식 설정 (Phase 예약)

| 항목 | 내용 |
|------|------|
| 기능 ID | RD-05 |
| Phase 1 | 스크롤 방식 고정 |
| Phase 2 | 환경설정에 "페이지 모드" 토글 UI 추가 |

> Phase 1에서는 RD-04 설정 패널에 "페이지 모드 (준비 중)" 항목을 비활성화 상태로 표시하여 확장성 예고.

---

## 5. 기능 의존 관계 (Dependency Matrix)

```
SET-01 (익명 로그인)
  └─▶ LIB-01 (소설 목록) — uid 필요
  └─▶ LIB-04 (클라우드 업로드) — uid 필요
  └─▶ RD-02 (자동 저장) — uid 필요

LIB-02 + LIB-03 (파일 선택 + 인코딩 변환)
  └─▶ LIB-04 (클라우드 업로드) — 변환된 Blob 필요

LIB-04 (클라우드 업로드)
  └─▶ LIB-01 (목록 갱신) — onSnapshot 자동

RD-01 (이어보기)
  └─▶ RD-02 (자동 저장) — scrollPosition 갱신
```

---

## 6. Phase 1 완료 기준 (MVP Checklist)

| # | 체크 항목 | 담당 |
|---|-----------|------|
| 1 | 익명 로그인 + Google 연동 동작 | Auth |
| 2 | EUC-KR .txt 파일 깨짐 없이 업로드 | LIB |
| 3 | 1MB 이상 파일 업로드 성공 | LIB |
| 4 | 서재 목록 진행률 Bar 표시 | LIB |
| 5 | 소설 삭제 (Storage + Firestore 동시) | LIB |
| 6 | 이어보기 (저장 위치 복원) | RD |
| 7 | 자동 저장 (debounce 1초) | RD |
| 8 | 스마트 헤더 동작 | RD |
| 9 | 글자 크기 / 테마 설정 저장 | RD |
| 10 | Security Rules 적용 (사용자 격리) | Security |
