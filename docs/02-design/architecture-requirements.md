# Geul-bang — 아키텍처 요구사항 정의서

> PDCA Phase: **DESIGN**
> 문서 버전: v1.0 | 작성일: 2026-04-22

---

## 1. 시스템 아키텍처 다이어그램

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (SPA)                              │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Auth Layer  │  │ Library View │  │     Reader View        │  │
│  │             │  │              │  │                        │  │
│  │ Anonymous   │  │ Novel List   │  │ Scroll Viewer          │  │
│  │ Google Link │  │ File Upload  │  │ Auto Save (debounce)   │  │
│  │ Email Link  │  │ Progress Bar │  │ Smart Header           │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬─────────────┘  │
│         └────────────────┴───────────────────────┘              │
│                           │ Firebase SDK                        │
└───────────────────────────┼──────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
   ┌────────▼────────┐ ┌────▼──────┐ ┌─────▼──────────┐
   │  Firebase Auth  │ │Firestore  │ │Cloud Storage   │
   │                 │ │           │ │                │
   │ signInAnon()    │ │users/     │ │novels/         │
   │ linkWithPopup() │ │  {uid}/   │ │  {uid}/        │
   │                 │ │  novels/  │ │  {novelId}.txt │
   └─────────────────┘ │  {docId}  │ └────────────────┘
                       └───────────┘
```

---

## 2. 데이터 아키텍처

### 2.1 Firestore 스키마

```
users/                          (Collection)
  {uid}/                        (Document)
    novels/                     (Sub-Collection)
      {novelId}/                (Document — 최대 1MB, 메타만 저장하므로 안전)
        id:            String   // 문서 ID (자동 생성)
        title:         String   // 소설 제목 (파일명에서 추출)
        fileUrl:       String   // Cloud Storage 다운로드 URL
        storagePath:   String   // Storage 경로 (삭제 시 필요)
        fileSize:      Number   // 원본 파일 크기 (bytes)
        progressRatio: Number   // 읽기 진행률 0.0 ~ 1.0
        scrollPosition:Number   // 마지막 스크롤 Y 좌표
        createdAt:     Timestamp
        lastReadAt:    Timestamp
```

### 2.2 Cloud Storage 구조

```
novels/
  {uid}/
    {novelId}_{title}.txt       // UTF-8 변환 완료된 파일
```

### 2.3 데이터 흐름

**업로드 플로우:**
```
1. 사용자: 파일 선택 (.txt)
2. Client: FileReader → ArrayBuffer 읽기
3. Client: jschardet.detect() → 인코딩 추정
4. Client: TextDecoder(encoding).decode() → UTF-8 문자열
5. Client: Blob('text/plain;charset=utf-8') 생성
6. Client → Storage: 파일 업로드 → downloadURL 반환
7. Client → Firestore: 메타데이터 문서 생성 (fileUrl 포함)
8. UI: 서재 목록 갱신
```

**읽기 플로우:**
```
1. 사용자: 서재에서 소설 선택
2. Client → Firestore: 해당 novelId 문서 조회 (fileUrl, scrollPosition)
3. Client → Storage: fileUrl로 txt 파일 다운로드
4. Client: 텍스트 렌더링 + window.scrollTo(0, scrollPosition)
5. 사용자: 스크롤 중...
6. Client: scroll 이벤트 → debounce 1초 → progressRatio, scrollPosition 계산
7. Client → Firestore: 해당 문서 update (progressRatio, scrollPosition, lastReadAt)
```

---

## 3. 보안 아키텍처

### 3.1 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 데이터만 CRUD 가능
    match /users/{uid}/novels/{novelId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == uid;
    }
  }
}
```

### 3.2 Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 사용자는 자신의 폴더만 접근 가능
    match /novels/{uid}/{fileName} {
      allow read, write: if request.auth != null
                         && request.auth.uid == uid;
      // 파일 크기 10MB 상한
      allow write: if request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

---

## 4. 비기능 요구사항 아키텍처 반영

| NFR ID | 요구사항 | 아키텍처 반영 |
|--------|----------|--------------|
| NFR-01 | 대용량 파일 처리 | Storage 분리 저장, Firestore에는 URL만 저장 |
| NFR-02 | 스마트 헤더 | scroll direction 감지 → CSS transition으로 헤더 show/hide |
| NFR-03 | 가독성 폰트 | Google Fonts 또는 로컬 폰트(리디바탕, KoPub바탕) CSS 임포트 |

---

## 5. 컴포넌트 구조 (Component Architecture)

```
src/
├── main.jsx
├── App.jsx                    # 라우팅, AuthContext 제공
│
├── contexts/
│   └── AuthContext.jsx        # Firebase Auth 상태 전역 관리
│
├── hooks/
│   ├── useNovels.js           # Firestore 소설 목록 CRUD
│   ├── useReader.js           # 스크롤 저장, 이어보기 로직
│   └── useScrollDirection.js  # 스마트 헤더용 스크롤 방향 감지
│
├── pages/
│   ├── LibraryPage.jsx        # 서재 화면
│   └── ReaderPage.jsx         # 리더 화면
│
├── components/
│   ├── layout/
│   │   └── Header.jsx         # 스마트 헤더
│   ├── library/
│   │   ├── NovelCard.jsx      # 소설 카드 (진행률 Bar 포함)
│   │   └── FileUploader.jsx   # 파일 업로드 + 인코딩 변환
│   ├── reader/
│   │   ├── ReaderSettings.jsx # 글자 크기, 테마 설정 패널
│   │   └── ProgressBar.jsx    # 읽기 진행률 표시
│   └── auth/
│       └── AccountBanner.jsx  # 익명 계정 연동 유도 배너
│
├── services/
│   ├── firebase.js            # Firebase 초기화
│   ├── auth.service.js        # 인증 관련 함수
│   ├── novel.service.js       # Firestore CRUD
│   └── storage.service.js     # Storage 업로드/삭제
│
└── utils/
    └── encoding.js            # jschardet + TextDecoder 로직
```

---

## 6. 상태 관리 전략

| 상태 범위 | 관리 방식 | 해당 데이터 |
|-----------|-----------|------------|
| 전역 (인증) | React Context | uid, isAnonymous, user 객체 |
| 페이지 (서재) | useState + useNovels hook | 소설 목록, 업로드 로딩 상태 |
| 페이지 (리더) | useState + useReader hook | 텍스트 내용, 스크롤 위치, 설정값 |
| 영구 저장 | Firestore | progressRatio, scrollPosition |
| 로컬 임시 | localStorage | 뷰어 설정 (fontSize, theme) |

---

## 7. 아키텍처 검토 체크리스트

- [ ] Firestore 1MB 제한 우회 확인 (Storage 분리)
- [ ] Security Rules 사용자 격리 적용
- [ ] 파일 삭제 시 Storage + Firestore 동시 삭제 로직
- [ ] 익명→정회원 연동 시 UID 유지 확인 (Firebase linkWithPopup)
- [ ] 인코딩 변환 실패 시 에러 처리
- [ ] 대용량 파일 다운로드 시 로딩 UI
