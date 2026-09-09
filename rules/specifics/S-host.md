---
name: S-host
description: 호스트 어댑터·카탈로그 통합·외부 발행 번들의 책임 분리, 의존 일방향, lazy 보존, 단일 registry 인스턴스, 발행 게이트.
type: specific
version: 1
last_verified: 2026-09-09
---

# S-host. 호스트 어댑터 · 발행 규율

## 적용 범위

- `packages/host-tiptap/**` — DSL 파싱 + Tiptap NodeView
- `packages/bootstrap/**` — 카탈로그 단일 출처
- `packages/host-tiptap-bundle/**` — 외부 호스트용 발행 번들

## 책임 분리

- **어댑터 본체**(`host-tiptap`) — DSL 파싱 + NodeView. 카탈로그를 모른다.
- **카탈로그 통합**(`bootstrap`) — `register*` 호출만 모은 부팅 진입점. 어떤 sim/plugin 이
  존재하는지의 단일 출처.
- **발행 번들**(`host-tiptap-bundle`) — 위 둘을 **얇게 re-export 만** 한다.

의존 방향은 **`host-tiptap-bundle → {host-tiptap, bootstrap} → host/schema + sim/plugin`**
일방향이다.

## MUST

### 어댑터 본체

- DSL `{aperi21:<id>}` 파싱을 **자기 파일 안에서** 한다. 파서를 `@aperi21/host` 에 넣지
  않는다. DSL 은 호스트의 관심사다.
- sim 조회는 `loadBundle(id)` / `getBundleById(id)` 로만 한다. 레지스트리 Map 을 직접
  만지지 않는다.
- NodeView 는 `runBundle` 의 handle 을 보관해 `destroy()` 에서 호출한다 (C5).
- NodeView 가 `document.body` 에 임의 요소를 붙이지 않는다.

### 카탈로그 통합

- sim 등록은 반드시 `registerBundleLoader('aperi21:<id>', () => import('@aperi21/sim-<x>'))`
  형식이다. **정적 import 로 sim 을 끌어오면 번들러의 dynamic import 경계가 깨져 sim 별
  chunk lazy 분리가 무너진다.**
- 부팅 함수는 **멱등**이다 (중복 호출에 안전).
- bootstrap 은 `register*` 호출만 한다. 시각화·DSL·NodeView 코드를 두지 않는다.

### 발행 번들 — 단일 registry 인스턴스

- **레지스트리를 담은 패키지(`@aperi21/host`)를 번들에 inline 하지 않는다.**
  rollup `external` + `peerDependencies` 로 두고 호스트가 단일 인스턴스를 설치해 공유한다.
- `inlineDynamicImports: false` 와 sim 별 `manualChunks` 를 유지한다.
- 번들은 re-export 만 한다. 자체 로직(DSL 파서·register 호출·렌더러)을 두지 않는다.
- **`workspace:` 프로토콜을 쓰는 의존은 `pnpm publish` 로만 발행한다.** `npm publish` 는
  프로토콜을 그대로 올려 깨진 의존을 발행한다.

### 발행 전 게이트

순서대로 통과한다.

1. `pnpm -r typecheck`
2. `pnpm test`
3. **`pnpm release:check`** — `scripts/release-check.mts` 가 두 발행 패키지를 pack 해
   tarball 을 풀고 넷을 검사한다: `src` 누출 0 · `workspace:` 잔존 0 · publishConfig
   오버라이드 적용 · **발행본 `.d.ts` 가 발행 대상 밖 패키지를 참조하지 않을 것**.
   CI(`ci.yml`)가 push·PR 마다 같은 스크립트를 돌린다.
4. 규칙 감사 (본 문서의 의존 일방향 · lazy 보존 · 단일 인스턴스)

3번이 없으면 **워크스페이스에서는 멀쩡하고 발행본에서만 죽는** 사고를 못 잡는다.
FACET 이 그 종류로 세 번 겪었다 (`c726076` 메시지 로더, `c53f389` d.ts 타입 전달,
`a8cfe7a` json 플러그인 누락).

## MUST NOT

- **발행 번들이 `@aperi21/sim-*` / `@aperi21/plugin-*` 을 직접 의존하지 않는다.**
  반드시 `@aperi21/bootstrap` 경유.
- bootstrap 이 어댑터나 발행 번들을 import 하지 않는다 (역방향).
- 어댑터가 `SceneGraph` 전처리나 렌더러를 직접 다루지 않는다. 러너가 감추는 추상을 깨지 않는다.

## 이력 — 단일 인스턴스 위반과 해소

`host-tiptap-bundle` 의 rollup `external` 이 `@tiptap/*` 뿐이라 `@aperi21/host` 가
inline 되어 있었다 (AUDIT-v1 위반 1, Critical). 외부 진입점이 하나뿐이라 발현하지
않았을 뿐이다.

`e8de66f` 에서 해소 — host 를 0.2.0 공개 패키지로 분리하고 번들에서 `external` +
`peerDependencies` 로 두었다. 검증: 번들 dist 에 host 런타임 코드 0건, entry 와
runtime chunk 가 `@aperi21/host` 를 external 로 import.

같은 커밋에서 **발행본 `.d.ts` 결함**도 드러났다. 0.1.0 의 `.d.ts` 가 미발행 private
패키지(`@aperi21/host-tiptap` · `@aperi21/bootstrap`)를 import 해 소비자 쪽 타입이
끊겨 있었다. 워크스페이스에서는 멀쩡하고 발행본에서만 죽는 종류라 게이트 3단
(`pnpm pack` 검증) 없이는 잡히지 않는다. `rollup-plugin-dts` 의 `respectExternal: true`
로 고쳤고, 그 항목을 위 게이트 3에 명시했다.
