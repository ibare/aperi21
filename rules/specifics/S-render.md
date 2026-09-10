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

**목록과 z 층의 기준은 코드다** — `CORE_RENDERERS`(`renderer/primitives/index.ts`)와
`DEFAULT_Z_LAYERS`(`renderer/registry.ts`). 어휘는 계속 늘어나므로 이 문서에 개수나
목록을 옮겨 적지 않는다. 옮겨 적으면 어휘가 늘 때마다 낡는다.

층 순서에서 지켜야 할 관계는 값이 아니라 **이유**다.

- 매질(`region`)은 물체 **위**에 반투명으로 덮인다 — 잠긴 것이 비쳐 보여야 "잠겼다" 로 읽힌다
- 속도장(`vortexField`)은 그것을 참조하는 실(`filament`)보다 **먼저** 돈다
- 값(`readout`)은 주석 위에 온다 — 가려지면 읽을 수 없다

plugin 이 `primitiveTypes` 로 더 확장한다 — optics `['ray','opticalElement']`,
circuit `['circuitElement','wire','terminal']`.

> 2026-09-10 에 자유 렌더 정찰에서 일곱이 승격됐다 — `region` · `stream` · `readout` ·
> `scale` · `dimension` · `vortexField` · `filament`
> (`tasks/engine-requirements/REQUIREMENTS.md` §3).

## MUST

- 렌더러는 **`SceneGraph` 선언과 theme 만 읽는다.** sim 의 상태나 physics 를 참조하지 않는다.
- 색은 theme 경유 (C2). 치수는 선언 경유 (원칙 2).
- **어휘를 추가하면 같은 커밋에서 셋을 맞춘다** — 렌더러 구현 · `CORE_RENDERERS`
  등록 · `scripts/lib/capabilities.mts` 의 추출 표 (C6). 마지막을 빠뜨리면 그 어휘를
  선언한 조각이 렌더러를 못 받아 **아무것도 그려지지 않는다.**
- **z 층을 `DEFAULT_Z_LAYERS` 에 명시한다.** 빠뜨리면 기본값으로 밀려 순서가
  뒤집힌다. 실제로 `vortexField` 를 빠뜨려 `filament` 가 먼저 돌았고, 장을 못 찾은
  `undefined` 가 저장소에 캐시되어 **영원히 소용돌이가 0** 이었다 — 화면은 그려지고
  타입도 통과하고 예외도 안 났다.
- **알파는 `setAlpha(c, a)` 로만 넣는다.** `globalAlpha` 에 직접 대입하면 `applyBaseMeta` 가
  붙인 기준 알파(강조 상태 × `opacity`)가 지워진다 — 잔상이 옅어지지 않는데 예외도 없고
  타입도 통과한다. 한계: plugin 렌더러는 host 에 의존하지 않아 이 헬퍼를 쓸 수 없고
  `applyBaseMeta` 도 부르지 않는다. 그래서 plugin 프리미티브(`ray` 등)는 `opacity` ·
  `highlight` 를 따르지 않는다.
- **`rc.store` 를 쓰는 어휘는 순서에 기대지 않는다.** 서로 참조하는 어휘는 어느
  쪽이 먼저 돌아도 되도록 **빈 상태를 만들 수 있어야** 한다.
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

## 자유 렌더 계층 — 정찰이지 목적지가 아니다

조각은 `Bundle.renderers` 로 자기 시각화를 직접 그릴 수 있다. `Plugin` 을 만들지
않는다 — plugin 은 여러 sim 이 공유하는 도메인 어휘를 위한 것이고 호스트가 미리
등록해야 하므로, 조각 하나가 쓰려고 태우면 그 조각이 부팅만으로 통째로 로드된다 (C6).

**그 상태는 한시적이다.** 자유 렌더는 *코어에 무엇이 있어야 하는지 알아내는 중*
이라는 뜻이고, 알아내면 어휘로 올리고 그 코드는 지운다. 승격과 대기실 비우기는
**같은 커밋**에서 한다.

승격 기준은 원칙 4 — *상상으로 만들지 않는다*. **사례 횟수는 기준이 아니다.**
정찰이 실제로 필요로 해서 발견한 것은 하나여도 올린다. 다만 표준 어휘 조합으로
되는 것은 올리지 않는다.

판정 사례는 `S-piece.md` 「판정 사례」를 본다.

> 2026-09-09 에 두 sim 이 자유 렌더를 썼고(342 + 288줄), 2026-09-10 에 일곱 어휘로
> 승격되며 둘 다 0 이 됐다.

## 현재 위반 (AUDIT-v1 대상)

- `runBundle.ts` 가 캔버스 껍데기의 높이를 `360px` / `320px` 로 코드에 박고 있다.
  껍데기를 러너가 만드는 것 자체는 맞으나, **치수가 선언이 아니다** (원칙 2 · C2).

## PREFER

- 마운트 후 높이 불변을 **전수 회귀 테스트로 고정한다** (Phase 5 Track E).
  FACET 은 완제품 둘이 이 함정에 빠진 뒤 `canvas-height.test.ts` 를 만들었다.
