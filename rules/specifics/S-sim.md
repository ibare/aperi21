---
name: S-sim
description: sims/<category>/<name>/src 의 파일 구성과 각 파일의 책임. sim 은 선언과 순수 물리만 담는다.
type: specific
version: 1
last_verified: 2026-09-09
---

# S-sim. 시뮬레이션 패키지 구조

## 적용 범위

`sims/<category>/<name>/src/**/*.ts`

## 표준 구성 — 6파일

세 sim 이 이미 같은 구성을 쓴다 (`_analysis.md` G6). 그 상태를 규약으로 고정한다.

| 파일 | 역할 | export |
|---|---|---|
| `schema.ts` | `BundleSchema` — id · params · stages · environments · views 선언 | `<name>Schema` |
| `state.ts` | 런타임 상태 타입과 초기 상태 | `<Name>State` · `initialState` |
| `physics.ts` | **순수 함수.** 상태 → 다음 상태. DOM·캔버스·시간을 모른다 | `step` · `derive*` |
| `scene.ts` | 상태 → `SceneGraph` 선언. **그리지 않는다, 선언한다** | `scene` |
| `controllers.ts` | 컨트롤러 선언 (슬라이더 · 다이얼 · 런처) | `controllers` |
| `index.ts` | 위 전부 re-export + `<name>Bundle` 조립 | `<name>Bundle` + 개별 심볼 |

## MUST

- 새 sim 은 위 6파일 구성을 따른다. 파일 이름도 그대로.
- **`physics.ts` 는 순수 함수만 담는다.** 난수를 쓰면 시드를 인자로 받는다.
- **`scene.ts` 는 선언을 만든다.** 캔버스 컨텍스트·좌표 변환·색을 만지지 않는다.
- `schema.ts` 의 `id` 는 등록 키 `aperi21:<id>` 와 문자 그대로 일치한다 (C4).
- 화면에 뜨는 라벨·설명은 `schema.ts` 의 `LocalizedText` 에 둔다 (C1).

## MUST NOT

- **다른 sim 을 import 하지 않는다.** 공유할 것이 생기면 plugin 또는 schema 로 올린다.
- **plugin 의 `render*` 를 import 하지 않는다.** sim 이 plugin 에서 가져오는 것은
  순수 계산 함수와 타입뿐이다 (원칙 1).
- 색 리터럴을 두지 않는다 (C2). 현재 `sims/**` 0건.
- 6파일 외 `.ts` 를 `src/` 루트에 두지 않는다 — **도메인 헬퍼 1파일은 예외**로 허용한다.

## 도메인 헬퍼 예외

`dc-circuit` 이 `topology.ts` 를 갖는다. 회로 위상을 MNA 입력으로 바꾸는 변환이
`physics.ts` 에 두기엔 크고 다른 sim 과 나눌 것도 아니다. 이런 파일은 **1개까지** 허용하되
`index.ts` 에서 re-export 하지 않는다 (내부용).

두 번째 헬퍼가 필요해지면 그것은 plugin 으로 올라갈 신호다.

## 자유 렌더 계층 (예약)

표준 primitive 어휘로 표현할 수 없는 시각화가 나오면 sim 이 직접 그린다 (원칙 4).
그 계층은 아직 **신설되지 않았다** — 현재 `sims/**` 에 자체 렌더러 0건.

계층을 만들 때 이 자리에 `<name>-stage.ts` 규약을 추가한다. 지금 미리 쓰지 않는 이유는
판정할 대상이 없기 때문이다 (`tasks/rules-bootstrap/PLAN.md` 갈래 B).
