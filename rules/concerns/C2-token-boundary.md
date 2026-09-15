---
name: C2 색·치수 토큰 경계
description: 색과 치수는 theme 의 두 축(scene·ui)·선언 경유로 얻는다. hex/rgba/px 리터럴을 코드에 박지 않는다.
type: concern
version: 2
last_verified: 2026-09-14
---

# C2. 색·치수 토큰 경계

## When to Apply

- `packages/host/src/renderer/**` · `packages/host/src/runtime/**` 이 그리거나 DOM 을 만들 때
- `packages/host/src/controller/**` 가 조작기를 그릴 때
- `packages/plugin-*/src/renderers.ts`
- `packages/host-tiptap/src/node-view.ts` 가 컨테이너·플레이스홀더를 꾸밀 때
- `sims/**` 전 영역

## MUST

- 색·글자 크기·선 굵기·여백은 **`theme` 경유**로 얻는다 (`packages/host/src/theme`).
- **자기 축의 토큰만 쓴다.** 테마는 두 축이다.
  - `scene` — 조각의 시각화. 렌더러가 보는 `RenderContext.theme` 이 이것이다.
  - `ui` — 코어가 제공하는 조작기. `ControllerRenderContext.ui` 가 이것이다.

  경계는 타입이 잡는다(조작기 컨텍스트에는 `theme` 이 없다). 그래도 **왜** 나뉘어
  있는지가 중요하다 — 한 벌을 나눠 쓰면 조작기를 옅게 하려는 조정이 조각의 배경
  정보까지 옅게 만든다. 조작기가 그림의 역할색(`positive` 같은)을 빌려 쓰지 않는다.
- 임베드 컨테이너의 치수는 **선언에서 온다.** 코드는 선언이 비었을 때의 기본값만 갖고,
  그 기본값도 named 상수로 한 곳에 둔다 (원칙 2).
- 새 색·치수 어휘가 필요하면 **그 축의 토큰 정의에 추가한 뒤** 소비한다. 소비처에서
  임시로 만들지 않는다.

## MUST NOT

- **hex / rgba 리터럴 금지.** 토큰 정의 파일만 예외.
- **`style.<prop> = '<n>px'` 형태로 화면 치수를 코드에 박지 않는다.**
  `100%` 같은 레이아웃 관용값은 치수가 아니라 배치라 대상이 아니다.
- `sims/**` 에는 색이 **한 건도** 없어야 한다. sim 은 선언이고 색은 표현이다.
- **글자 크기·선 굵기를 숫자로 박지 않는다.** `ctx.font = '11px …'` · `lineWidth = 2` 는
  테마를 갈아 끼워도 바뀌지 않는다 — 색만 따라오고 모양은 코드에 남는다. 그 어휘가
  축에 없으면 축에 추가한다.
- 그 대상이 **그 조작기·그 어휘 고유의 치수**일 때만 named 상수로 남긴다 (파라미터
  상자의 행 높이, 견본 칸의 기호 크기 같은 것). 여백·글자·굵기는 축이 정한다.

## 현재 위반

없다. AUDIT-v1 이 잡았던 둘은 해소됐다 — `node-view.ts` 의 배지 색은 `theme` 경유가
됐고 치수는 `PLACEHOLDER` 상수로, `runBundle.ts` 의 캔버스 치수는 `CANVAS_DEFAULT` +
선언(`BundleSchema.canvas`)으로 옮겼다.

`sims/**` 색 리터럴은 0건이다 (`_analysis.md` G4). 이 상태를 잠근다.

## Exception

- `packages/host/src/theme/themes.ts` 는 토큰 정의 자체이므로 색 리터럴을 포함한다.
- `apps/catalog/src/theme/tokens.css` 는 CSS 토큰 정의 파일이다.
- 색 공간 변환 같은 **순수 함수의 수학 상수**는 색 리터럴이 아니다.
- `apps/catalog` 은 카탈로그 사이트이며 자체 CSS 토큰 체계를 쓴다. 이 규칙은 **임베드
  런타임**(host · plugin · host-tiptap · sims)에 적용된다. `EditorDemoPage.tsx` 의 색
  리터럴 3건은 적용 범위 밖이다 (AUDIT-v1 예외 판정).
