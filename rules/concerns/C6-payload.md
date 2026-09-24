---
name: C6 페이로드 경계
description: 조각이 쓰지 않는 능력은 그 조각의 번들에 실리지 않는다. 등록이 아니라 import 로 붙인다.
type: concern
version: 1
last_verified: 2026-09-10
---

# C6. 페이로드 경계

## 왜 있는가

**어휘를 넓힐 수 있는 것은 조각이 쓰는 것만 실리기 때문이다.** 이 구조가 없으면
어휘를 하나 늘릴 때마다 모든 조각이 무거워지고, 결국 조각이 코어를 버리고 직접
그리는 쪽으로 되돌아간다. 크기는 별도 관심사가 아니라 **어휘 확장의 전제 조건**이다.

2026-09-09 실측 — 조각 하나를 여는 데 gz 44.3 KB 를 받았고 그중 2.8 KB 만 그 조각이었다.
`new Host()` 한 번이 렌더러 8종 · 컨트롤러 5종 · 계산 2종을 살려 냈기 때문이다.

## When to Apply

- `packages/host/src/host.ts` — 능력 등록
- `packages/host/src/renderer/**` · `controller/**` — 어휘·조작기 추가
- `packages/bootstrap/src/**` — loader 배선, 능력 생성물
- `packages/host-tiptap-bundle/rollup.config.mjs` — chunk 분리
- `scripts/gen-capabilities.mts` · `scripts/bundle-budget.mts`

## MUST

- **코어는 능력을 모른다.** `createHost()` 는 `capabilities` 를 주지 않으면 아무
  렌더러·조작기·계산도 등록하지 않는다. 능력은 조각이 가져온다.
- **능력은 `import` 로 붙인다.** 문자열 키 조회(`registry.get('x')`)는 번들러가
  무엇이 쓰이는지 알 수 없게 만들어 전부를 살려 둔다.
- **레지스트리는 조각 조회에만 쓴다.** 글 속 `{aperi21:<id>}` 에서 조각을 찾는 것은
  문자열 조회가 필연이고, `registerBundleLoader` 라 lazy 가 보존된다. 거기까지다.
- **어휘를 추가하면 같은 커밋에서 셋을 맞춘다** — 렌더러 구현 · `CORE_RENDERERS`
  등록 · `scripts/lib/capabilities.mts` 의 추출 표. 마지막을 빠뜨리면 그 어휘를
  선언한 조각이 렌더러를 못 받아 **아무것도 그려지지 않는다.**
- **부팅 시 반드시 실행되는 경로에서 조각을 import 하지 않는다.** `import()` 로
  써 있어도 부팅 때 꼭 불리면 그것은 eager 다.
- **생성물은 조각과 같은 chunk 에 들어간다.** `manualChunks` 가 `capabilities/<cat>/<name>`
  을 `sim-<cat>-<name>` 으로 보낸다. 이 규칙이 없으면 `runtime` 으로 가서 모든 조각이 받는다.

## MUST NOT

- **모듈 최상위에서 능력을 인스턴스화하지 않는다.** `export const X = { a: new AController() }`
  는 번들러가 부수 효과로 보고 지우지 못한다. 함수로 감싼다 — 한 벌 전체를 감싸는
  `standardCapabilities()` 와, 항목마다 만드는 법을 두는 생성물의
  `{ 'a': () => new AController() }` 가 그 형태다. 뒤의 것은 C5 의 요구이기도 하다 —
  host 는 문서 전체가 공유하므로 조작기 인스턴스는 임베드마다 만들어야 한다.
- 배럴 재수출로 남의 모듈을 끌어오지 않는다.
- `sideEffects: false` 를 어기는 최상위 부수 효과를 두지 않는다.

## 검증

```sh
pnpm budget          # 크기 + 음성 검사
pnpm budget --build  # 빌드부터
```

**음성 검사가 수치 예산보다 앞선다.** 예산은 새는 것을 늦게 알려 주고, 음성 검사는
즉시 잡는다 — *슬라이더만 쓰는 조각의 번들에 `pinball` 이 있으면 실패*.

기준선은 `tasks/engine-requirements/baseline.json` 이다. 조각 하나만 쓰는 최소 앱을
esbuild 로 두 번 번들해(비minify 는 음성 검사용, minify 는 크기용) 잰다.

## Exception

- `standardCapabilities()` 는 표준 한 벌 전부를 참조한다. 능력을 가려 쓸 이유가 없는
  소비자(개발 도구·전체 미리보기)를 위한 길이며, **아무도 부르지 않으면 실리지 않는다.**
- `apps/catalog` 은 전시장이라 조각을 모두 보여 준다. 다만 조회는 실제 소비자와
  같은 경로(`loadBundle`)를 쓴다 — 특별 경로를 쓰면 "실제 호스트에서 되는지" 를
  여기서 검증하지 못한다.
