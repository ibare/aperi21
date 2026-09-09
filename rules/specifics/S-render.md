---
name: S-render
description: renderer/primitives · plugin 렌더러 · theme 계약 · 캔버스 치수. 프리미티브 어휘의 확장과 sim 자유 렌더 경로.
type: specific
version: 1
last_verified: 2026-09-09
---

# S-render. 렌더러 규율

## 적용 범위

- `packages/host/src/renderer/**` — 표준 primitive 렌더러
- `packages/host/src/runtime/runBundle.ts` — 캔버스 껍데기와 RAF 루프
- `packages/plugin-*/src/renderers.ts` — 도메인 primitive 렌더러
- `packages/react/src/embed/Canvas.tsx` — React 마운트 경로

## 프리미티브 어휘

표준 8종: `body` · `vector` · `surface` · `trajectory` · `marker` · `gauge` · `graph` · `event`.
plugin 이 `primitiveTypes` 로 확장한다 — optics `['ray','opticalElement']`,
circuit `['circuitElement','wire','terminal']`.

## MUST

- 렌더러는 **`SceneGraph` 선언과 theme 만 읽는다.** sim 의 상태나 physics 를 참조하지 않는다.
- 색은 theme 경유 (C2). 치수는 선언 경유 (원칙 2).
- **캔버스 껍데기는 러너가 만든다.** 렌더러가 컨테이너를 만들거나 비우지 않는다.
  러너가 캔버스를 먼저 붙이고 그리기를 호출하므로, 렌더러가 컨테이너를 비우면 그
  캔버스가 떨어져 나간다. **타입도 통과하고 예외도 안 나고 그림만 안 보인다.**
- **마운트 후 캔버스 세로를 바꾸지 않는다** (원칙 6). 내용이 커지는 그림은 흔한 크기만큼
  자리를 미리 잡고 넘치면 간격을 줄여 담는다. 마운트 시점에 한 번 정하는 것은 무방하다.
- plugin 이 primitive 를 추가하면 `primitiveTypes` 선언과 `renderers` 구현을 **같은
  커밋에서** 맞춘다 (C4).

## MUST NOT

- 렌더러가 다른 렌더러를 import 하지 않는다. 조합은 `SceneGraph` 선언의 일이다.
- **쓰임이 없는 프리미티브를 미리 만들지 않는다** (원칙 4). 두 번째 사례가 나온 뒤에 만든다.
- 렌더러가 화면 문자열을 리터럴로 그리지 않는다 (C1).

## 자유 렌더 계층 — 아직 없다

`sims/**` 에 자체 렌더러가 0건이고, sim 단위 확장 경로도 없다. 확장은 plugin 층에만
열려 있다.

FACET 은 공유 view 카탈로그가 **대량 생산에서 유사 화면 복제를 낳는다**고 판정하고
2026-09-09 에 원칙을 뒤집었다. 다만 우리 도메인은 다르다 — 알고리즘 시각화에서 "배열"은
표현 관습이지만 물리에서 "공"·"벡터"·"지면"은 실재하는 대상이라, 같은 프리미티브를 쓰는
것이 복제가 아니라 정확성이다.

그래서 **폐기가 아니라 탈출구 승격**이 우리 결론이다. 계층을 신설하면 이 자리에 규약을
추가한다. 판정 기준은 원칙 4 — *"이 시각화가 답하는 질문의 동사가 프리미티브 조합으로
나오는가."*

지금 조항을 쓰지 않는 이유는 판정할 대상이 없기 때문이다
(`tasks/rules-bootstrap/PLAN.md` 갈래 B, `tasks/facet-insights/ANALYSIS.md` §3).

## 현재 위반 (AUDIT-v1 대상)

- `runBundle.ts` 가 캔버스 껍데기의 높이를 `360px` / `320px` 로 코드에 박고 있다.
  껍데기를 러너가 만드는 것 자체는 맞으나, **치수가 선언이 아니다** (원칙 2 · C2).

## PREFER

- 마운트 후 높이 불변을 **전수 회귀 테스트로 고정한다** (Phase 5 Track E).
  FACET 은 완제품 둘이 이 함정에 빠진 뒤 `canvas-height.test.ts` 를 만들었다.
