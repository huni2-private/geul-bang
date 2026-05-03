📚 Geul-bang (개인용 웹 소설 리더) 기획 및 설계 문서

문서 버전: v1.0
작성일: 2026-04-22
작성자: PageDrop 개발팀 (PM, CTO, FE, BE, UI/UX, QA)
승인자: PO (Product Owner)

1. 프로젝트 개요 (Project Overview)

**'PageDrop'**은 사용자가 텍스트(.txt) 파일을 간편하게 업로드하고, 기기 제약 없이 언제 어디서나 편안하게 이어서 읽을 수 있는 개인용 클라우드 웹 소설 리더기입니다.

2. 요구사항 명세서 (Requirement Specification)

2.1 기능적 요구사항 (Functional Requirements)

FR-01 [인증]: 사용자는 사이트 접속 시 자동으로 익명 계정이 발급되어 즉시 서비스를 이용할 수 있어야 한다.

FR-02 [계정 연동]: 익명 사용자는 데이터 영구 보존을 위해 설정에서 Google 또는 이메일 계정으로 연동(Upgrade)할 수 있어야 한다. (Q2-B안 반영)

FR-03 [파일 업로드]: 사용자는 로컬의 .txt 파일을 업로드할 수 있어야 한다.

FR-04 [인코딩 자동 변환]: EUC-KR(ANSI) 등 다양한 인코딩으로 작성된 파일을 업로드할 경우, 브라우저에서 이를 감지하여 UTF-8로 자동 변환해야 한다. (Q4-B안 반영)

FR-05 [뷰어-스크롤]: 소설 읽기는 상하 스크롤 방식을 기본으로 제공하며, 추후 설정 메뉴를 통해 페이지 넘김(스와이프) 방식을 선택할 수 있는 확장성을 가져야 한다. (Q3-C안 반영)

FR-06 [자동 동기화]: 뷰어에서 스크롤 위치가 변경될 때마다 읽은 위치(%)가 클라우드에 자동 저장되어야 한다.

2.2 비기능적 요구사항 (Non-Functional Requirements)

NFR-01 [대용량 처리]: 장편 소설(1MB 이상) 업로드 시 데이터베이스 제한에 걸리지 않도록 파일 원본과 메타데이터를 분리하여 저장해야 한다. (Q1-B안 반영)

NFR-02 [UI/UX]: 읽기 몰입도를 위해 스크롤 다운 시 헤더가 숨겨지고, 스크롤 업 시 헤더가 나타나는 반응형 UI를 적용해야 한다.

NFR-03 [가독성]: 리디바탕, KoPub바탕 등 가독성 높은 웹 폰트를 내장하여 제공해야 한다.

3. 시스템 아키텍처 (System Architecture)

3.1 기술 스택

Frontend: React, Tailwind CSS, Lucide-React (Icons)

Backend/BaaS: Firebase (Authentication, Firestore, Cloud Storage)

Utility: jschardet (인코딩 감지)

3.2 데이터 흐름 및 저장 전략 (Q1-B안 반영 아키텍처)

기존의 Firestore 단일 저장 방식의 용량 한계(1MB)를 극복하기 위해 하이브리드 저장 방식을 채택합니다.

graph TD
    A[Client Browser] -->|1. txt 파일 업로드| B(인코딩 자동 변환)
    B -->|2. 파일 저장| C[(Firebase Cloud Storage)]
    C -->|3. URL 반환| A
    A -->|4. 메타데이터 저장| D[(Firestore Database)]
    D -->|5. 서재 목록/읽은 위치 동기화| A


[DB 스키마: Firestore (users/{uid}/novels/{novelId})]

id (String): 문서 ID

title (String): 소설 제목 (파일명 기준)

fileUrl (String): Firebase Storage에 저장된 txt 파일의 다운로드 URL

progressRatio (Number): 읽은 진행률 (0.0 ~ 1.0)

scrollPosition (Number): 마지막 스크롤 Y 좌표

createdAt (Timestamp): 업로드 일시

lastReadAt (Timestamp): 마지막으로 읽은 일시

4. 유스케이스 (Use Cases)

액터 (Actor)

익명 사용자 (Anonymous): 앱에 최초 접속한 사용자. 브라우저 캐시 삭제 시 데이터 유실 위험이 있음.

정회원 (Registered): 소셜/이메일 계정을 연동하여 데이터를 안전하게 보존 중인 사용자.

유스케이스 다이어그램 설명

UC-01 소설 관리: - 소설 업로드 (Includes: 인코딩 자동 변환)

소설 삭제

UC-02 소설 읽기:

소설 열기 (Includes: Cloud Storage에서 txt 다운로드 & 이전 스크롤 위치로 이동)

뷰어 설정 (글자 크기 조절, 테마 변경)

자동 저장 (스크롤 위치 감지 시 백그라운드 작동)

UC-03 계정 관리:

계정 연동 (익명 -> 정회원 승격)

5. 기능 명세서 (Functional Specification)

5.1 서재 화면 (Library View)

기능 ID

기능명

상세 설명

비고

LIB-01

내 서재 목록

Firestore에서 lastReadAt 기준 내림차순으로 소설 목록 출력

각 카드에 진행률(%) Bar 표시

LIB-02

파일 업로드

<input type="file" accept=".txt">를 통한 파일 선택



LIB-03

인코딩 변환

선택된 파일의 바이너리를 읽어 jschardet으로 인코딩 감지 후 TextDecoder로 UTF-8 변환

깨짐 방지 핵심 로직

LIB-04

클라우드 업로드

변환된 텍스트를 Blob으로 만들어 Firebase Storage에 업로드 후 URL을 Firestore에 저장

로딩 스피너 표시

LIB-05

소설 삭제

삭제 확인 모달 제공. 승인 시 Firestore 문서 및 Storage 파일 동시 삭제



5.2 리더 화면 (Reader View)

기능 ID

기능명

상세 설명

비고

RD-01

이어보기

소설 진입 시, 저장된 scrollPosition으로 뷰포트 자동 이동 (window.scrollTo)



RD-02

자동 저장

사용자가 스크롤을 멈춘 후 1초(Debounce) 뒤 현재 위치 계산 및 Firestore 업데이트

API 호출 최적화

RD-03

스마트 헤더

스크롤을 내리면(읽기 중) 상단 헤더가 숨겨지고, 위로 올리면 나타남

몰입감 극대화

RD-04

뷰어 환경 설정

글자 크기(px 단위) 증가/감소, 테마(Light/Dark/Sepia) 변경 지원



RD-05

읽기 방식 설정

[Phase 1] 스크롤 방식 고정. [Phase 2] 환경설정에 '페이지 모드' 토글 UI 예약

Q3-C안 반영

5.3 설정 및 계정 (Settings & Auth)

기능 ID

기능명

상세 설명

비고

SET-01

자동 익명 로그인

앱 최초 로드 시 Firebase signInAnonymously() 호출



SET-02

계정 보존 안내

익명 계정일 경우 서재 상단에 "데이터 분실 주의: 계정 연동하기" 배너 노출



SET-03

소셜 연동

Google 로그인 등을 통해 현재의 익명 계정 데이터(UID)를 정식 계정으로 병합(Link)

Firebase linkWithPopup 사용

[다음 단계 (Next Steps)]
PO님의 본 문서 최종 승인 후, 프론트엔드/백엔드 개발자는 본 명세서의 아키텍처(Q1)와 인코딩 로직(Q4)을 반영하여 실제 동작 가능한 MVP(최소 기능 제품) 코드를 구현합니다.