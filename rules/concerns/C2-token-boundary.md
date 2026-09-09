---
name: C2 색·치수 토큰 경계
description: 색과 치수는 theme·선언 경유로 얻는다. hex/rgba/px 리터럴을 코드에 박지 않는다.
type: concern
version: 1
last_verified: 2026-09-09
---

# C2. 색·치수 토큰 경계

## When to Apply

- `packages/host/src/renderer/**` · `packages/host/src/runtime/**` 이 그리거나 DOM 을 만들 때
- `packages/plugin-*/src/renderers.ts`
- `packages/host-tiptap/src/node-view.ts` 가 컨테이너·플레이스홀더를 꾸밀 때
- `sims/**` 전 영역

## MUST

- 색은 **`theme` 경유**로 얻는다 (`packages/host/src/theme`).
- 임베드 컨테이너의 치수는 **선언에서 온다.** 코드는 선언이 비었을 때의 기본값만 갖고,
  그 기본값도 named 상수로 한 곳에 둔다 (원칙 2).
- 새 색·치수 어휘가 필요하면 **토큰 정의에 추가한 뒤** 소비한다. 소비처에서 임시로
  만들지 않는다.

## MUST NOT

- **hex / rgba 리터럴 금지.** 토큰 정의 파일만 예외.
- **`style.<prop> = '<n>px'` 형태로 화면 치수를 코드에 박지 않는다.**
  `100%` 같은 레이아웃 관용값은 치수가 아니라 배치라 대상이 아니다.
- `sims/**` 에는 색이 **한 건도** 없어야 한다. sim 은 선언이고 색은 표현이다.

## 현재 위반 (AUDIT-v1 대상)

| 파일 | 내용 | 건수 |
|---|---|---:|
| `packages/host-tiptap/src/node-view.ts` | 배지 배경·전경 hex, `4px`·`12px` | 색 3 · 치수 4 |
| `packages/host/src/runtime/runBundle.ts` | `360px` · `320px` · `8px` | 치수 4 |
| `apps/catalog/src/pages/EditorDemoPage.tsx` | 데모 페이지 hex | 색 3 |

`sims/**` 색 리터럴은 0건이다 (`_analysis.md` G4). 이 상태를 잠근다.

## Exception

- `packages/host/src/theme/themes.ts` 는 토큰 정의 자체이므로 색 리터럴을 포함한다.
- `apps/catalog/src/theme/tokens.css` 는 CSS 토큰 정의 파일이다.
- 색 공간 변환 같은 **순수 함수의 수학 상수**는 색 리터럴이 아니다.
