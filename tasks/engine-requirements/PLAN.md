# 구현 계획

`REQUIREMENTS.md` 의 이행 순서를 실제 작업 단위로 쪼갠 것. 세 가지를 지킨다.

1. **측정을 먼저 만든다.** 이후 모든 단계가 숫자로 증명된다. 믿음으로 진행하지 않는다.
2. **매 단계 끝에 사이트가 돈다.** 중간에 깨진 채로 다음으로 넘어가지 않는다.
3. **큰 수술은 쪼갠다.** 되돌릴 수 있는 크기로만 움직인다.

안전망이 얇다는 것을 전제로 한다 — 테스트가 리포 전체에 4개뿐이다. 그래서 단계마다
`pnpm -r typecheck` + `pnpm test` 위에 **카탈로그 6종 시각 확인**을 얹는다.

---

## S0. 기준선

### S0-1. 워킹 트리 정리 — **완료** (`b14de90`)

미커밋이 21개 파일 + 4개 디렉터리다. 구현을 시작하기 전에 기준선을 만든다.
논리적으로 다섯 덩이이고, 그중 둘은 처우가 미결이다.

| 덩이 | 내용 | 판단 |
|---|---|---|
| a | 사이트 카탈로그 연동 + 모달 (`apps/catalog`, `bootstrap`, `scripts/gen-*`) | 커밋 |
| b | 관성 계측 (`scripts/piece-inertia.mjs`) | 커밋 |
| c | 설계 문서 (`tasks/engine-requirements/`) | 커밋 |
| d | 1차 조각 3종 (`sims/fluids/`) | **미결** — 이미 카탈로그·bootstrap 이 참조 중이라 빼면 a 가 깨진다 |
| e | 2차 조각 2종 (`tasks/piece-lab/`) | **미결** — 엔진 밖 산출물. S5 검증의 대조군이라 남길 값이 있다 |

d 는 사실상 커밋해야 a 가 성립한다. e 는 남겨 두는 쪽을 권한다 — S5 이후
"엔진 위로 옮겨 붙였을 때 430줄·607줄이 얼마로 줄었나" 를 재는 원본이다.

### S0-2. 측정 도구 — **완료**

`scripts/bundle-budget.mts` 를 만든다.

- 조각별 gz 크기 — 고정 비용(항상 실리는 것)과 조각 비용을 나눠 센다
- **음성 검사** — 조각이 쓰지 않는 능력의 고유 문자열이 산출물에 있으면 실패
  (`pressure-isotropy` 번들에 `pinball`, `ray-tracing` 번들에 `waterVolume` …)
- 결과를 `tasks/engine-requirements/baseline.json` 에 기록

`scripts/bundle-budget.mts` + `pnpm budget`. 기준선을 `baseline.json` 에 기록했다.

```
고정 비용        43.0 KB   host 20.1 + entry·runtime 4.6 + eager 18.3
조각             2.1 ~ 3.9 KB
합계             45.1 ~ 46.9 KB
음성 검사        6/6 실패 — 조각마다 6~12종의 안 쓰는 능력을 받는다
```

`ray-tracing` 은 자기 코드 2.1 KB 를 보려고 **45.1 KB** 를 받고, 표준 렌더러 8종 중
하나도 쓰지 않으면서 8종을 전부 받는다.

> 실패로 시작하는 것이 정상이다. 이 스크립트는 S2·S3 의 성과를 재는 자다.

---

## S1. 데모 잔재 제거 — §1(다) — **완료** (`3788a14`)

지우는 일이라 값이 싸고, 이걸 안 하면 무엇을 만들어도 위에 그리드가 얹힌다.

| 단계 | 대상 | 방식 |
|---|---|---|
| S1-1 | `drawAxisGrid` 무조건 호출 (`Canvas.tsx:357`, `runBundle.ts:361`) | 선언 opt-in, **기본 off** |
| S1-2 | `<CameraControls>` 무조건 렌더 (`Embed.tsx:156`) | 선언 opt-in, **기본 off** |
| S1-3 | `HUD_MARGINS {60,130,180,110}` (`Canvas.tsx:37`) | **켜진 오버레이에서 계산.** 없으면 24 |
| S1-4 | `SCREEN_Y_BIAS = 60` (`camera.ts:13`) | 기본 0, 선언으로 지정 가능 |

S1-3 은 개념이 틀린 게 아니다 — 주석대로 ViewTabs·InfoPanel·ParamPanel·angle-dial·
pinball-launcher 를 피하려는 값이다. **하드코딩이 문제다.** 오버레이가 꺼지면 마진도
없어야 한다.

**위험** — S1-4 는 `fitToBounds` 계산에 들어가므로 6종 전부의 프레이밍이 바뀐다.
`projectile` 은 오버레이가 있으니 마진이 살아 있어야 하고, `fluids` 3종은 화면이
커져야 한다. 눈으로 확인한다.

**검증** — 카탈로그 6종 스크린샷 전후 비교. 1차 조각 3종의 12~13배 축소가 풀리는지.

---

## S2. eager 로드 끊기 — §2.2(2) — **완료** (`d2eb779`)

선형 증가를 여기서 끊는다. **조각 수가 늘어나기 전에 해야 값이 싸다.**

| 단계 | 내용 |
|---|---|
| S2-1 | `Bundle` 에 `renderers?: Record<string, PrimitiveRenderer>` 자리 추가 (옵셔널이라 non-breaking) |
| S2-2 | `registerBundle` 이 그것을 등록 — 등록 시점이 `loadBundle` 이므로 lazy 가 보존된다 |
| S2-3 | `archimedes` · `container-shape` 의 자유 렌더를 `Plugin` → `bundle.renderers` 로 이관 |
| S2-4 | `installAperi21Plugins` 의 sim import 2건 제거 |

이걸로 §1(가)의 "Plugin 등록이라는 무거운 문" 도 함께 열린다. 조각이 자기 시각화를
직접 그리는 데 `Plugin` 객체를 만들 필요가 없어진다.

**검증** — 음성 검사: entry chunk 에 `waterVolume` · `dialScale` 없음.
고정 비용 43.0 → **약 31.6 KB** (sim 2종 11.4 KB 회수).

---

## S3. 코어와 능력 분리 — §2.4 조건 1·2·3 — **완료** (`c3f31d6`)

가장 큰 수술. 셋으로 쪼개 **매 단계가 동작하는 상태**를 유지한다.

### S3-A. 주입 가능하게 만든다 (기본값은 그대로)

`createHost(config)` 가 `renderers` · `controllers` · `compute` 를 받는다.
**인자가 없으면 지금과 완전히 같다.** 아무것도 깨지지 않는다.

`new Host()` 는 `createHost` 한 곳에서만 불린다 — 영향 범위가 좁다는 것을 확인했다.

### S3-B. 선언 → import 생성기

`pnpm gen` 이 각 sim 의 `scene.ts` 선언을 훑어 옆에 생성한다.

```ts
// sims/<category>/<name>/src/capabilities.generated.ts
import { body, vector, marker } from '@aperi21/vocab-core';
import { slider } from '@aperi21/kit-input';
export const capabilities = { renderers: { body, vector, marker }, controllers: { slider } };
```

저작자는 선언만 쓴다 (원칙 2 유지). 이 단계는 **파일을 만들 뿐 아직 쓰지 않는다.**

### S3-C. 기본값 제거 — 셰이킹이 실제로 발생하는 지점

`Host` 생성자의 자동 등록 15건을 걷어낸다. `runBundle` 이 생성물에서 능력을 받는다.

**검증** — 음성 검사: `pressure-isotropy` 번들에 `pinball` 없음.
고정 비용 31.6 → **목표 15 KB**.

**위험** — 여기가 가장 위험하다. 6종 전부가 생성물을 갖춰야 동작한다.
S3-B 가 먼저 끝나 있어야 하고, S3-C 는 한 번에 넘긴다.

---

## S4. 프리미티브 5종 승격 — **완료**

`REQUIREMENTS.md` §3.3. 자유 렌더가 정찰해 온 것을 코어 어휘로 올린다.

| 이름 | 무엇 | 대신하는 손코딩 |
|---|---|---|
| `region` | 자유 곡선 경계를 가진 채워진 영역 | `waterVolume` · `vessel` 물 · `drawTank` |
| `stream` | 방출·이류·수명을 가진 입자 흐름 + 잔상 획 | `waterStream` · `drawJets` · 염료 · 부유물 |
| `readout` | 값 하나를 읽히게 두는 것 (월드 칩 · 화면 고정 줄) | `drawChip` · `readout` · `drawHoleLabels` |
| `scale` | 눈금 — 직선과 원형 | `dialScale` · Re 눈금 |
| `dimension` | 두 점 사이를 재는 표시 | `drawDepths` · 수면 높이 선 |

각 프리미티브마다 **스키마 타입 · 렌더러 · 능력 생성기 표 등록 · 음성 검사 통과**가
한 벌이다. 재료(`kit`)는 필요한 만큼만 만든다 — 프리미티브 구현이 쓸 것이지 조각이
쓸 것이 아니다.

**검증** — 새 어휘를 아무 조각도 쓰지 않는 상태에서 음성 검사 0 이 유지되어야 한다.
어휘가 늘어도 조각이 무거워지지 않는다는 것이 이 구조의 전부다.

---

## S5. 자유 렌더 2종을 어휘로 재구현 — **완료**

`archimedes-principle-stage.ts`(342줄)와 `pressure-and-container-shape-stage.ts`(288줄)를
**지운다.** 승격하고 대기실을 비우지 않으면 같은 그림이 두 곳에 남는다.

**결과** — 890줄 삭제 · 260줄 추가 = **순 630줄 감소**. 화면은 같다.

실측은 archimedes 14.3 → 15.3 KB, container-shape 13.6 → 13.9 KB 로 조금 늘었다.
조각 전용 최소 구현이 일반화된 어휘로 바뀐 값이다. **다음 조각부터는 공짜다** —
두 번째 조각이 `region` 을 쓰면 코드를 짜지 않고, 한 문서에 여러 조각이 있으면
어휘는 한 번만 실린다.

---

## S6. `piece-lab` 2종을 sim 으로 — **완료**

**결과** (주석 제외 실질 코드)

```
torricellis-law        264 → 260 줄   자유 렌더 0. 어휘로만 성립
laminar-vs-turbulent   456 → 299 줄   −34%
```

줄 수는 척도가 아니었다. 그리기 코드는 압축적이고 선언은 장황해서, 없앤 만큼
선언이 자리를 채운다. **실제로 사라진 것은 배관이다** — `hash`(안정 난수) ·
`P`/`X`/`Y`(좌표 매핑) · `resize` · `frame` · `drawJets` · `newVortex` · 프리롤.
`torricelli` 의 캔버스 직접 호출 108줄이 0이 됐다.

`laminar` 에서 어휘 둘을 더 발견해 승격했다 — `vortexField` · `filament`.

---

## S7. 새 후보 판정 — **완료**

- 동시 표지(`drawPulse`) → **불필요.** `trajectory`(점선) + `marker`(점)로 됐다
- 속도장(`newVortex`) → **승격** (`vortexField`)
- 염료 실 → **승격** (`filament`)

사례 횟수를 승격 기준에서 뺐다. 미루는 것은 코드 재사용률의 관점이지 어휘 완비의
관점이 아니다 (REQUIREMENTS §3.2).

---

## S8. 패키지 물리 분리

어휘가 자리를 잡은 뒤에 가른다. S3 로 트리셰이킹이 이미 작동하므로 패키지 경계는
더 이상 크기 문제가 아니다 — `@aperi21/host` 를 external+peer 로 받는 경로 하나만
남았고, 그것은 발행 정책과 함께 판단한다.

---

## 단계별 통과 바

매 단계 공통.

```sh
pnpm -r typecheck
pnpm test
pnpm budget          # S0-2 이후
```

그 위에 **카탈로그 6종 시각 확인**. 테스트가 4개뿐이라 이것이 실질 안전망이다.

`rule-guard` 는 CLAUDE.md 규약대로 각 단계의 계획 직후·수정 직후 두 번 부른다.
커밋은 단계마다 하나씩, **구현 내용을 보고하고 확인받은 뒤에** 한다.
