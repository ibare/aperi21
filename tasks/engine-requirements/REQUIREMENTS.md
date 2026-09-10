# 엔진 요구사항 — 구현물 8종에서 역추출

작성 2026-09-09. 상상으로 쓴 스펙이 아니다. 이미 만든 것들이 **실제로 무엇을 손으로
짰는지** 세어서 뽑았다.

## 0. 근거로 삼은 구현물

| # | 구현물 | 규모 | 진입 층 | 자유 렌더 |
|---|---|---|---|---|
| 1 | `sims/physics/projectile` | 607줄 | 선언 | — |
| 2 | `sims/optics/ray-tracing` | 302줄 | 선언 + plugin | plugin-optics |
| 3 | `sims/electronics/dc-circuit` | 571줄 | 선언 + plugin | plugin-circuit |
| 4 | `sims/fluids/pressure-isotropy` | 525줄 | 선언 | — |
| 5 | `sims/fluids/archimedes-principle` | 1127줄 | 선언 + 자유 | **342줄** |
| 6 | `sims/fluids/pressure-and-container-shape` | 906줄 | 선언 + 자유 | **288줄** |
| 7 | `tasks/piece-lab/torricellis-law` | 430줄 | **엔진 밖** | 전부 |
| 8 | `tasks/piece-lab/laminar-vs-turbulent` | 607줄 | **엔진 밖** | 전부 |

7·8은 엔진 족쇄를 푼 상태에서 만든 조각이라 **엔진이 없을 때 무엇을 짜게 되는지**를
그대로 보여 준다. 각각 `NOTES.md` (d)절에 저자가 직접 요구사항을 남겼다.

표준 어휘 사용 실측 — `sims/*/*/src/scene.ts` 전체에서 33건.

```
marker 11   vector 8   surface 5   body 4   trajectory 3   event 2   ray 1
waterVolume 2   dialScale 2   waterStream 1        ← 자유 계층(2개 sim이 자체 정의)
```

`marker` + `vector` 가 19건으로 절반을 넘는다. **물체를 그리는 어휘는 거의 쓰이지
않고, 표시와 화살표로 때우거나 자유 계층으로 탈출한다.**

---

## 1. 문제는 세 갈래다

요구사항을 한 덩이로 쓰면 안 된다. 성격이 다른 셋이 섞여 있다.

### (가) 엔진에 이미 있는데 구현체가 닿지 못한 것

| 있는 것 | 어디 | 못 닿은 증거 |
|---|---|---|
| 캔버스 부트스트랩 (DPR·ResizeObserver·CSS px) | `Canvas.tsx` | 7·8이 각자 `resize()` 재작성. 8은 "폭 계산 때문에 한 번 헤맸다" |
| 월드↔화면 매핑 `toScreen`/`toWorld`/`scale` | `RenderContext` | 7이 `X() Y() P()` 재작성 |
| 테마 토큰 · 선 두께 | `rc.theme` | 7·8이 색 리터럴 직접 사용 |
| 텍스트 폭 재기 `measure.textWidth` | `MeasureService` | 7·8이 `measureText` 직접 호출 |
| 시계 (linear/static/steady_state, 배속, 일시정지) | `time/` | 7·8이 `start/stop/step` 재작성 |

닿지 못한 이유는 하나다. **이 능력들이 전부 `PrimitiveRenderer` 를 등록해야만 열리는
문 안에 있다.** 캔버스 한 장을 열고 그리려면 `Plugin` 객체를 만들고, `primitiveTypes`
를 선언하고, 호스트가 `pluginManager.register` 를 해 줘야 한다. 조각 하나 그리자고
치르는 값이 아니다. 5번 `archimedes` 가 `NOTES.md` 에 "등록은 호스트가 한다"를 따로
적어 둔 것이 그 증거다.

### (나) 엔진에 없어서 매번 다시 짠 것

반복 횟수 순. **2회 이상은 원칙 4의 "두 번째 사례" 기준을 이미 넘겼다.**

> 이 목록을 읽는 법 — 여기 있는 것은 **조각에게 쥐여 줄 도구가 아니라 코어가
> 가져야 할 어휘의 내용물**이다. 자유 렌더로 만든 것들은 최종 형태가 아니라
> **코어에 무엇이 있어야 하는지 알아내려고 만든 정찰**이다 (§3).

| 요구 | 반복 | 실제로 짠 것 |
|---|---|---|
| **입자 방출·이류·수명·퇴출** | 5·7·8 (3회) | `DROPLETS` 루프 / `drawJets` / 염료+부유물 190개 |
| **채워진 영역 + 자유 곡선 수면** | 5·6·7 (3회) | `renderWaterVolume` / `renderPressureVessel` / `drawTank` |
| **배경 깔린 텍스트 칩** | 6·7·8 (3회) | `drawChip` / 깊이 라벨 / 캡션 |
| **안정 난수 (출생 번호 해시)** | 7·8 (2회) | `hash()` / `newVortex()`. 7은 "프레임마다 새로 뽑으면 물줄기가 떤다" |
| **속도 잔상 획** | 7·8 (2회) | 0.006초 전 위치까지 선 긋기 / 부유물 길이 |
| **국면 시계 + 캡션 슬롯 교차 페이드** | 7·8 (2회) | 2.6초 주기 표지 / 4문장 슬롯 |
| **선언적 자동 시퀀스 + 유휴 복귀** | 7·8 (2회) | `seqV`/`holdStartOf` (5초 뒤 정박값 복귀) |
| **라벨 충돌 회피 배치** | 6·7 (2회) | 칩 위치 손계산 / 7은 **실제로 버그가 났다** (깊이 라벨이 벽을 뚫음) |
| **값 끼운 문안 + 3층 조회** | 5·6 (2회) | `message()` 헬퍼 재작성 |
| **눈금자 / 눈금판 위젯** | 5·8 (2회) | `dialScale` 부채꼴 / Re 눈금 |
| **dt 상한 + 가시성 정지** | 7·8 (2회) | 탭 복귀 폭주 방지, `IntersectionObserver` |
| 감쇠 추종 스칼라 `x += (t−x)(1−e^(−dt/τ))` | 8에서만 4회 | 값·마커·알파·페이드 |
| 프리롤 (N스텝 미리 돌리고 첫 프레임) | 8 (1회) | 460스텝 ≈ 7.7초 |
| 정박값 포매터 | 8 (1회) | `2300.796 → "2300"` (반올림하면 2301, 표를 배신) |
| 검증된 난류 속도장 | 8 (1회) | **네 번 재튜닝**. 벽 붙음 → 톱니 진동 → 빈 껍질 → 지금 |
| 넘칠 때 글자 줄여 담기 | 6 (1회) | `drawGivensLine`, 원칙 6의 귀결 |
| 1차원 스케일 위젯 **배선만** | 8 (1회) | 값↔픽셀·포인터 캡처·클램프·유휴 복귀 |

### (다) 엔진이 강제해서 방해한 것

| 강제 | 위치 | 피해 |
|---|---|---|
| `drawAxisGrid` 무조건 호출 | `Canvas.tsx:357`, `runBundle.ts:361` | 7·8 둘 다 "그리드는 **여기서 거리를 재라**는 지시" 라며 명시적으로 거부 |
| `<CameraControls>` 무조건 렌더 | `Embed.tsx:156` | 7은 "프레이밍이 곧 주장" — 카메라를 주면 독자가 함정을 복원 |
| `HUD_MARGINS {60,130,180,110}` | `Canvas.tsx:37` | 1차 조각 3종이 12~13배 축소됨 |
| `SCREEN_Y_BIAS = 60` | `camera.ts:13` | 위와 합쳐 중심 아래 48px만 남김 |
| 정사각형에 가까운 무대 | 임베드 기본 | 8은 9:1 가로 비율이 **필수**였다 |
| 월드 좌표계 요구 | `SceneGraph` | 8은 관 길이가 몇 미터인지 **주장하지 않기로** 했다. 강요하면 없는 값을 지어낸다 |

두 `NOTES.md` 가 독립적으로 같은 목록을 냈다는 점이 중요하다. 격리된 두 저자가
같은 것을 거부했다. 취향이 아니다.

---

## 2. 네 번째 문제 — 크기

앞의 세 갈래는 "무엇을 만들까" 였다. 이것은 **만든 것을 어떻게 실어 보내는가** 이고,
성격이 달라서 따로 세운다.

이것이 §3의 전제다. **코어가 어휘를 마음껏 넓힐 수 있으려면 조각이 쓰는 것만
실려야 한다.** 그 구조가 없으면 어휘를 늘릴 때마다 모든 조각이 무거워지고,
결국 조각이 직접 그리는 쪽으로 되돌아간다. 크기 구조는 어휘 확장의 **전제 조건**이지
별도 관심사가 아니다.

### 2.1 지금 얼마인가 (gzip 실측, 2026-09-09)

> `pnpm budget` 이 재고 `baseline.json` 이 이 수치의 SSOT 다.

| 조각 하나를 여는 데 | gz | 무엇 |
|---|---|---|
| `@aperi21/host` | **20.1 KB** | 통짜. renderer 8종 + controller 6종 + camera + time + particles + runtime |
| `runtime` chunk | **4.3 KB** | 어댑터 + bootstrap |
| **eager plugin·stage** | **18.3 KB** | plugin-optics + plugin-circuit + `archimedes` **전체** + `container-shape` **전체** |
| — 고정 합계 | **43.0 KB** | |
| 조각 자신 | 2.1 ~ 6.3 KB | `ray-tracing` 2.1 / `projectile` 2.8 / `dc-circuit` 2.7 / `pressure-isotropy` 3.9 |

`projectile` 하나를 보는 독자는 **45.7 KB 중 2.7 KB만 자기가 보는 것**을 받는다.
**94 %가 엔진이고, 그중 18.3 KB는 자기가 열지도 않은 다른 조각의 코드다.**

### 2.2 발현 셋

**(1) 통짜 커널.** `packages/host/src/index.ts` 가 11개 모듈을 전부 재수출한다.
그중 `controller/` 만 1131줄이고 절반이 발사체 전용(`pinball-launcher`·`angle-dial`)이다.
슬라이더 하나 쓰는 조각도 핀볼 런처를 받는다.

**(2) eager 로드 — 조각 수에 선형.** 결정적 문제다.

```ts
// packages/bootstrap/src/index.ts — installAperi21Plugins()
await Promise.all([
  import('@aperi21/plugin-optics'),
  import('@aperi21/plugin-circuit'),
  import('@aperi21/sim-pressure-and-container-shape'),   // ← sim 전체
  import('@aperi21/sim-archimedes-principle'),           // ← sim 전체
]);
```

lazy loader 로 등록해 놓고 옆에서 eager 로 끌어온다. 이유는 **자유 렌더 계층이
`Plugin` 계약을 타기 때문**이다. `Plugin` 은 `pluginManager.register()` 로 미리
등록돼야 하고, 그러려면 모듈이 먼저 로드돼야 한다.

sim 6개 중 자유 렌더를 쓰는 2개 때문에 11.4 KB 가 항상 실린다. **조각이 600개가 되고
그중 절반이 자기 시각화를 직접 그리면 — §0 표를 보면 그게 정상 경로다 — 부트스트랩이
300개를 전부 로드한다.** 산술적으로 1.7 MB 다.

이 문제의 뿌리는 §1(가)와 **같다.** 자유 렌더가 `Plugin` 이라는 무거운 문을 통과해야
한다는 것. 그 문을 없애면 두 문제가 함께 사라진다.

**(3) 중복이 아니라 총량.** `@aperi21/host` 는 이미 `external` + `peerDependency` 다
(원칙 3). 그래서 **N배 중복은 없다.** 그러나 external 은 총량을 줄이지 않는다 —
호스트가 통짜 host 를 한 번 받을 뿐이다. 오히려 원칙 3이 총량 문제를 만든다.
"갈라지면 안 되니 하나로 묶는다" 가 "하나로 묶였으니 전부 받는다" 가 된다.

### 2.3 정체성과 능력을 가른다

원칙 3이 실제로 지키려는 것은 **정체성** 이지 코드 전체가 아니다.

| | 갈라지면 | 크기 | 정책 |
|---|---|---|---|
| **정체성** — registry Map, 계약 타입, 무대 생애 | **틀린다.** 등록한 것을 못 찾는다 | 작아야 한다 | 단일 인스턴스 강제. `external` + peer |
| **능력** — 도구, 어휘, 솔버 | **느려질 뿐 틀리지 않는다.** 상태가 없으니까 | 크다 | 자유롭게 쪼갠다. 최악의 경우 중복돼도 정확하다 |

지금 둘이 한 패키지에 있다. **정체성을 공유하려고 능력 전부를 받고 있는 것이다.**

이 구분에서 `external` 의 기준이 나온다 — **크기가 아니라 모듈 레벨 상태의 유무.**

### 2.4 20 과 80 — 트리셰이킹이 실제로 되려면

요구는 이것이다. **엔진 기능이 100이면, 뭘 만들어도 들어가는 20만 항상 실리고,
나머지 80은 그 조각이 실제로 쓴 것만 실린다.**

패키지를 쪼개는 것만으로는 되지 않는다. 지금 셰이킹이 **0인** 기계적 이유가 있다.

```ts
// packages/host/src/host.ts — Host 생성자
for (const [type, renderer] of Object.entries(CORE_RENDERERS)) {   // 렌더러 8종
  this.rendererRegistry.register(type, renderer);
}
this.controllerRegistry.register(new PinballLauncherController());  // 컨트롤러 5종
this.controllerRegistry.register(new AngleDialController());
this.controllerRegistry.register(new PlacementController());
this.controllerRegistry.register(new ValueEditController());
this.controllerRegistry.register(new SliderController());
this.computeRegistry.registerVector('uniform', uniformVectorField); // 계산 2종
this.computeRegistry.registerVector('gravity', gravityVectorField);
```

**`new Host()` 한 번이 엔진의 모든 능력을 살려낸다.** 조각이 슬라이더 하나만 써도
핀볼 런처가 실린다. `sideEffects: false` 는 이미 선언돼 있지만 아무 소용이 없다 —
생성자 안의 `new PinballLauncherController()` 는 번들러가 지울 수 없는 참조다.
`CORE_RENDERERS` 객체 리터럴도 마찬가지로 8종을 한 덩이로 묶어 둔다.

그래서 조건은 셋이다.

#### 조건 1 — 코어는 능력을 모른다

`Host` 생성자에서 등록 코드를 **전부 걷어낸다.** 코어에 남는 것은 빈 registry,
계약 타입, 무대 생애뿐이다. 코어가 어떤 렌더러·컨트롤러의 이름도 알지 못하면,
코어를 import 해도 그것들이 따라오지 않는다.

이것이 "항상 실리는 20" 의 정의다. **20은 크기로 정하는 게 아니라 의존으로 정해진다 —
능력을 하나도 참조하지 않는 것만 20에 들어간다.**

#### 조건 2 — 능력은 등록이 아니라 import 로 붙는다

```ts
registry.get('particles')                       // ✗ 번들러가 모른다. 전부 살려 둔다
import { particles } from '@aperi21/kit-particles'   // ✓ 번들러가 안다
```

문자열 키 조회는 정적 분석을 죽인다. 능력은 registry 에 넣지 않는다.

registry 가 남는 자리는 하나뿐이다 — **조각을 찾는 것.** 호스트는 글 속의
`{aperi21:<id>}` 문자열에서 조각을 찾아야 하므로 문자열 조회가 필연이고,
그건 이미 `registerBundleLoader` 라 lazy 가 보존된다. **거기까지다.**

#### 조건 3 — 선언과 정적 참조를 생성기가 잇는다

여기가 어려운 지점이다. `SceneGraph` 는 `{ type: 'body' }` 라는 **데이터**여서
번들러가 무엇이 쓰이는지 알 수 없다. 선언 우선(원칙 2)과 정적 분석이 정면으로
충돌한다.

해소는 생성기다. 저작자는 선언만 쓰고, 빌드가 선언을 훑어 import 목록을 뽑는다.

```ts
// 저작자가 쓰는 것 — 지금과 같다
scene: [{ type: 'body', ... }, { type: 'vector', ... }]

// pnpm gen 이 뽑아 주는 것 — 조각 옆에 생성된다
import { body, vector } from '@aperi21/vocab-core';
export const vocab = [body, vector];        // 정적 참조. 나머지 6종은 안 실린다
```

`scripts/gen-*.mts` 로 이미 하고 있는 일이라 새 문화가 아니다.

#### 증명 — 예산보다 음성 검사가 먼저다

숫자 예산(§R10)은 새는 것을 **늦게** 알려 준다. 즉시 잡는 것은 음성 검사다.

- 조각 하나만 넣은 최소 앱을 빌드해 산출물을 문자열로 훑는다
- 슬라이더만 쓰는 조각의 번들에 `pinball` 이 있으면 **실패**
- 자유 렌더만 쓰는 조각의 번들에 `renderTrajectory` 가 있으면 **실패**

"트리셰이킹이 될 것이다" 를 믿지 않고 **없음을 확인한다.** 이 검사가 `release:check`
에 들어가는 것이 §R10 예산표보다 앞선다.

#### 이 결정이 무르는 것

- **원칙 3의 범위가 좁아진다.** "레지스트리 경유" 는 조각 조회에만 남고, 능력에는
  적용하지 않는다. 원칙 3이 지키려던 것은 단일 인스턴스이지 조회 방식이 아니었다.
- **`new Host()` 한 줄의 편의가 사라진다.** 조각마다 자기가 쓸 능력을 넘겨야 한다.
  그 수고는 생성기가 대신 진다 (조건 3).

---

## 3. 프리미티브 후보 — 정찰의 수확

### 3.1 자유 렌더는 목적지가 아니라 정찰이다

`archimedes`(342줄)와 `pressure-and-container-shape`(288줄)가 자기 시각화를 직접
그린 것은 **그렇게 사는 것이 옳아서가 아니다.** 코어에 무엇이 있어야 하는지
알아내려고 만든 것이다. `tasks/piece-lab` 두 조각(430·607줄)도 같다.

그래서 이것들의 수확은 "조각이 그릴 수 있게 하는 도구" 가 아니라 **코어에 올릴
새 프리미티브 목록**이다. §2의 트리셰이킹 구조가 그것을 가능하게 한다 — 코어가
어휘를 100개 가져도 조각은 자기가 선언한 것만 받는다.

**승격 기준은 사례 횟수가 아니다.** 한 번밖에 안 쓰였다고 미루는 것은 코드
재사용률의 관점이지 어휘 완비의 관점이 아니다. FACET 이 실패한 것은 **쓰임 없이
상상으로** 빌트인 view 15종을 만든 일이었고, 정찰이 실제로 필요로 해서 발견한
것은 성격이 다르다. 남는 기준은 하나다 — **상상으로 만들지 않는다.**

### 3.2 후보와 판정

네 구현물이 손으로 그린 것을 세었다.

| 후보 | 나온 곳 | 횟수 | 판정 |
|---|---|---:|---|
| **채워진 영역 + 자유 곡선 경계** | `waterVolume` · `vessel` · `drawTank` | 3 | **승격** |
| **입자 스트림** | `waterStream` 물방울 · `drawJets` · 염료 실 · 부유물 | 4 | **승격** |
| **값 표시** (칩 · 화면 고정 문안) | `drawChip` · `readout` · `drawHoleLabels` · `captions` | 4 | **승격** |
| **눈금** (눈금판 · 눈금자) | `dialScale` · Re 눈금 | 2 | **승격** |
| **치수선** | `drawDepths` · `h = 0.30 m` 선 | 2 | **승격** |
| 동시 표지 | `drawPulse` | 1 | **불필요** — `trajectory` + `marker` 로 됐다 |
| 속도장 (수명 있는 소용돌이) | `newVortex`/`swirlX`/`swirlY` | 1 | **승격** (`vortexField`) |
| 교란이 증폭·감쇠하는 실 | 염료 실 | 1 | **승격** (`filament`) |

### 3.3 승격안

표준 8종 옆에 다섯이 선다. 이름은 **무엇을 그리는가**가 아니라 **무엇인가**로 짓는다.

| 이름 | 무엇 | 대신하는 손코딩 |
|---|---|---|
| `region` | 자유 곡선 경계를 가진 채워진 영역. 수면·물기둥·차오름 | `waterVolume` · `vessel` 물 · `drawTank` |
| `vortexField` | 수명 있는 소용돌이 다발이 만드는 속도장. 보통 보이지 않는다 | `newVortex` · `swirlX` · `swirlY` |
| `filament` | 흐름을 따라 흐르며 교란이 증폭·감쇠하는 실. 염료 | 염료 알갱이 적분 · 번짐 |
| `stream` | 방출·이류·수명을 가진 입자 흐름. 잔상 획을 포함 | `waterStream` · `drawJets` · 염료 · 부유물 |
| `readout` | 값 하나를 읽히게 두는 것. 월드 앵커 칩 · 화면 고정 줄 | `drawChip` · `readout` · `drawHoleLabels` |
| `scale` | 눈금. 직선(`linear`)과 원형(`dial`) 두 모양 | `dialScale` · Re 눈금 |
| `dimension` | 두 점 사이를 재는 표시. ㄴ자 치수선 | `drawDepths` · 수면 높이 선 |

`marker`(월드 좌표 주석)와 `readout`(값 표시)은 다르다. `gauge`(화면 좌상단 막대)와
`scale`(장치에 붙는 눈금)도 다르다. 같은 이름을 두 대상에 두지 않는다 (C4).

### 3.4 대기실 규약

자유 렌더는 **정찰의 도구**다. 거기서 발견한 것은 승격하고 대기실을 비운다.

- 자유 렌더는 `Bundle.renderers` 로 온다. 그 조각과 함께 로드되고 함께 사라진다
- 발견한 것은 **사례가 하나여도 승격한다** (§3.2). 미루는 것은 재사용률의 관점이다
- 승격되면 그 조각의 자유 렌더는 **지운다.** 둘을 함께 두지 않는다
- 표준 어휘 조합으로 되는 것은 승격하지 않는다 — 동시 표지가 그랬다

---

## 4. 코어 구조 — 어휘는 밖, 재료는 안

### 4.1 조각이 보는 것은 어휘뿐이다

```
조각          SceneGraph 선언        ← 조각이 아는 것은 여기까지
  ↑
어휘          body vector … region stream readout scale dimension
  ↑                                  ← 공개 계약. 이름과 필드
재료          space draw particles field text motion
  ↑                                  ← 코어 내부. 조각은 모른다
무대          캔버스 · 시계 · 생애 · 가시성
```

**재료(kit)의 소비자는 코어 프리미티브 구현이지 조각이 아니다.** 조각이 `g.filled()`
를 부르게 하면 조각마다 다르게 그리게 되고, 그것이 정확히 우리가 없애려는 것이다.

그래서 **원칙 1은 개정하지 않는다.** sim 은 여전히 선언 타입만 안다. 자유 렌더가
캔버스를 만지는 것은 대기실의 한시적 상태이고, 승격되면 사라진다.

### 4.2 재료 목록 — §1(나)의 다른 얼굴

§1(나)에서 "반복해 짰다" 고 센 것들이 여기 온다. 소비자가 조각이 아니라 프리미티브
구현이라는 점만 다르다.

| 재료 | 쓰는 프리미티브 |
|---|---|
| `space` — 좌표 매핑 · 앵커 · 화면 상수 | 전부 |
| `draw` — 채움 · 폴리라인 · 잔상 획 · 칩 · 부채꼴 | `region` `stream` `readout` `scale` `dimension` |
| `particles` — 방출 · 이류 · 수명 · **안정 해시** | `stream` |
| `text` — 값 포맷 · **정박값** · 폭 재기 · **충돌 회피 배치** | `readout` `scale` `dimension` |
| `motion` — 감쇠 추종 · 국면 시계 · 시퀀스 | `stream` · 승격 대기 중인 동시 표지 |
| `field` — 속도장 · 이류 | 대기 중인 속도장 |

### 4.3 무대가 지키는 것 (변함 없음)

- devicePixelRatio · ResizeObserver · CSS px 좌표계
- RAF 루프, `dt` 상한, 배속·일시정지
- **프리롤** — N스텝을 그리지 않고 돌린 뒤 첫 프레임
- **가시성 정지** — `IntersectionObserver` + `visibilitychange`
- 마운트 후 세로 불변 (원칙 6), `destroy()` 가 뒷일을 남기지 않음 (C5)

### 4.4 강제하지 않는 것 (변함 없음)

그리드 · 축 · 카메라 버튼 · 트랜스포트 · 제목 · 범례 · 툴팁 · 자동 HUD ·
시리즈별 자동 색 · 화면비. **켜지 않으면 없다** (S1 에서 완료).

### 4.5 페이로드 (§2 의 결론)

- 커널은 정체성만 담는다. 능력은 조각이 가져온다 — **S3 에서 완료**
- 어휘가 늘어도 조각은 자기가 선언한 것만 받는다. 음성 검사가 그것을 지킨다
- external 의 기준은 크기가 아니라 모듈 레벨 상태의 유무
- registry 는 조각 조회에만 쓴다. 능력은 import 로 붙는다

---

## 5. 이행 순서

| 순 | 할 일 | 상태 |
|---|---|---|
| 1 | 크롬을 선언 opt-in 으로 | **완료** (`3788a14`) |
| 2 | 자유 렌더를 Plugin 에서 떼어 `Bundle.renderers` 로 | **완료** (`d2eb779`) |
| 3 | 코어에서 능력을 걷어낸다 — 음성 검사 0 | **완료** (`c3f31d6`) |
| 4 | **프리미티브 5종 승격** — `region` `stream` `readout` `scale` `dimension` | 다음 |
| 5 | **자유 렌더 2종을 어휘로 재구현** — `archimedes` · `container-shape` 의 stage 파일을 지운다 | |
| 6 | `piece-lab` 2종을 sim 으로 — 430·607줄이 얼마로 줄어드는지가 점수다 | |
| 7 | 거기서 나온 새 후보 판정 (동시 표지 · 속도장이 두 번째를 만나는지) | |
| 8 | 패키지 물리 분리 — 어휘가 자리를 잡은 뒤에 가른다 | |

4·5 가 한 벌이다. **승격하고 대기실을 비우지 않으면 같은 그림이 두 곳에 남는다.**

8을 뒤로 미룬 이유 — S3 로 트리셰이킹이 이미 작동하므로 패키지 경계는 더 이상 크기
문제가 아니다. 어휘가 자리를 잡은 뒤에 가르면 한 번에 끝난다.

---

## 6. 규칙 체계에 반영할 것

- **원칙 1 — 개정하지 않는다.** sim 은 선언 타입만 안다. 자유 렌더가 캔버스를 만지는
  것은 승격 대기 중인 한시적 상태다 (§3.4)
- **원칙 4 — 조항 개정.** "공유 부품을 선제적으로 만들지 않는다. 두 번째 사례가
  나온 뒤에 만든다" 에서 **횟수 조건을 뺀다.** 금지되는 것은 *상상으로 만드는 것*
  이고, 정찰이 발견한 것은 사례가 하나여도 승격한다 (§3.2)
- `rules/specifics/S-render.md` 「자유 렌더 계층 — 아직 없다」는 낡았다. 계층이 생겼고
  승격 절차가 그 자리에 온다
- **`S-piece` 신설** — 조각 규범. 대상이 생겼다
- **C6 신설 검토** — 페이로드 관심사. `sideEffects` · 배럴 재수출 · registry eager 등록
- **원칙 3 보강** — external 의 조건은 모듈 레벨 상태의 유무이지 크기가 아니다 (§2.3)
