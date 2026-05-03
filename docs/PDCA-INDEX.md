# Geul-bang — PDCA 문서 인덱스

> 작성일: 2026-04-22 | 최종 수정: 2026-04-28 | 현재 단계: DO 완료 (Firebase 연결 대기)

---

## PDCA 진행 상태

```
[P] PLAN    ██████████ 완료  → docs/01-plan/Geul-bang-plan.md
[D] DESIGN  ██████████ 완료  → docs/02-design/
[D] DO      ██████████ 완료  → docs/03-do/implementation-notes.md
[C] CHECK   ░░░░░░░░░░ 대기  → docs/04-check/ (Firebase 연결 후)
[A] ACT     ░░░░░░░░░░ 대기  → 개선 반복
```

---

## 문서 목록

| PDCA | 문서 | 경로 | 상태 |
|------|------|------|------|
| PLAN | 상세 플랜 | [docs/01-plan/Geul-bang-plan.md](01-plan/Geul-bang-plan.md) | ✅ 완료 |
| DESIGN | 기술 스택 정의서 | [docs/02-design/tech-stack.md](02-design/tech-stack.md) | ✅ 완료 |
| DESIGN | 아키텍처 요구사항 정의서 | [docs/02-design/architecture-requirements.md](02-design/architecture-requirements.md) | ✅ 완료 |
| DESIGN | 기능 명세서 | [docs/02-design/feature-spec.md](02-design/feature-spec.md) | ✅ 완료 |
| DO | 구현 노트 | [docs/03-do/implementation-notes.md](03-do/implementation-notes.md) | ✅ 완료 |
| CHECK | Gap 분석 결과 | docs/04-check/ | ⏳ 구현 후 실행 |

---

## 핵심 설계 결정 요약

| 결정 | 내용 |
|------|------|
| 저장 방식 | 파일 본문 → Storage, 메타 → Firestore (1MB 제한 우회) |
| 인코딩 | 브라우저에서 jschardet 감지 + TextDecoder 변환 (서버리스) |
| 인증 | 익명 즉시 이용 → 선택적 Google 연동 (진입 장벽 최소화) |
| 스크롤 저장 | debounce 1초 후 Firestore 업데이트 (API 최적화) |

---

## 다음 단계

```
1. Firebase 프로젝트 생성 및 .env 환경 변수 입력
   → Authentication (익명 + Google) 활성화
   → Firestore / Storage Security Rules 적용
2. npm run dev 로 실제 동작 확인
3. Gap 분석 실행 → docs/04-check/ 작성
```
