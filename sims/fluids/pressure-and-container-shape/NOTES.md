# pressure-and-container-shape

## (a) 이 조각이 답하는 질문

**담긴 물의 양이 2.5 배 차이 나는데 왜 바닥이 받는 압력은 셋 다 같은가.**

## (b) 동사 — 차오른다 · 나란해진다

두 동사가 화면에서 실제로 일어난다. `opacity` 전환도, 순서대로 나타나는 다이어그램도 아니다.

**차오른다.** 바닥 넓이가 같고 모양만 다른 그릇 셋에 **같은 유량**(0.0025 m³/s)으로 물을
붓는다. 물 폴리곤의 위쪽 변이 실제로 위로 움직이고, 그 변의 폭도 그릇 벽을 따라 매 프레임
바뀐다. 유량이 같으니 수면이 오르는 **속도는 모양마다 다르다** — 위로 좁아지는 그릇은 빠르게,
곧은 그릇은 그다음, 위로 벌어지는 그릇은 가장 느리게. 담긴 부피는 수면에 붙어 함께 올라가는
칩에 계속 갱신된다.

**나란해진다.** 각 그릇은 자기 목표 부피에 이르면 멈춘다. 그래서 셋은 **따로 도착한다** —
1.45 s (3.6 L) → 2.40 s (6.0 L) → 3.60 s (9.0 L). 먼저 도착한 둘이 멈춰 서서 기다리는 동안
마지막 하나가 올라오고, 3.60 s 에 세 수면이 처음으로 한 직선 위에 선다. 그 순간:

- 회색이던 목표 수면선이 accent 로 바뀌고 `highlight: 'focused'` 로 빛난다
- 세 그릇 바닥에서 `event`(flash) 가 동시에 터진다
- 바닥을 누르는 압력 화살표 아홉 개가 **같은 길이**가 된다 (길이 = 수심 × 1/3)
- 세 압력 숫자가 muted 에서 accent 로 올라오며 **2940 Pa** 하나로 모인다

부피 칩은 그때도 9.0 L · 6.0 L · 3.6 L 로 갈려 있다. 그것이 이 조각의 주장이다.

조작기는 슬라이더 하나(수면 높이 h, 0.12–0.32 m)뿐이고, **아무것도 누르지 않아도 3.6 초
안에 화면이 할 말을 마친다.** 슬라이더는 그 뒤에 "다른 높이에서도 그런가" 를 확인하기 위한
것이다 — h 를 내리면 세 그릇이 같은 유량으로 배수되어 다시 나란해지고, 세 압력은 다시
하나의 숫자(예: 0.18 m → 1764 Pa)로 모인다.

### 숫자 검증

| | 벌어지는 | 곧은 | 좁아지는 |
|---|---:|---:|---:|
| 바닥 넓이 A | 0.0200 m² | 0.0200 m² | 0.0200 m² |
| h=0.30 m 에서 폭 | 0.40 m | 0.20 m | 0.04 m |
| 담긴 부피 | **9.000 L** | **6.000 L** | **3.600 L** |
| 바닥 계기압 | **2940 Pa** | **2940 Pa** | **2940 Pa** |

단면 폭 w(y) 는 높이에 선형, 깊이 d = 0.10 m 는 일정 → A(y) = d·w(y), V(h) = d·h·(w0+w(h))/2.
`levelAtVolume` 은 `volumeAtLevel` 의 정확한 역함수이고(왕복 오차 < 1e-6 m), 셋 다
h = 0.30 에서 선언된 값을 소수점까지 재현한다.

## (c) 표준 8종으로 안 된 것

렌더러가 있는 8종은 `body` · `trajectory` · `vector` · `surface` · `marker` · `graph` ·
`event` · `gauge` 다. 이 중 **닿는 것은 전부 표준으로 썼다.**

| 화면 요소 | 프리미티브 |
|---|---|
| 세 그릇이 함께 딛는 바닥선 | `surface` (`kind: 'wall'`) |
| 목표 수면선 (나란해짐의 기준) | `trajectory` |
| 바닥을 누르는 압력 화살표 9개 | `vector` ×9 |
| 나란해지는 순간의 섬광 | `event` (`kind: 'flash'`) ×3 |

**안 된 것 둘.**

1. **모양이 다른 그릇과 그 안에 차오르는 물.** `body` 는 원·사각뿐이라 사다리꼴 물기둥을
   못 그리고, 수면 폭이 높이에 따라 변하는 것을 표현할 방법이 없다. `container` 는 스키마에
   선언돼 있지만 렌더러가 없다(그리고 `bounds` 가 직사각형이라 애초에 모양을 못 담는다).
   `surface` 를 여러 장 겹쳐 벽을 흉내 낼 수는 있어도 **물이 차오르는 면**은 나오지 않는다.
2. **월드 좌표에 붙는 값 표시.** `gauge` 는 화면 좌상단 고정 막대이고 슬롯을 id 해시로
   정해 셋이 겹칠 수 있으며 `toFixed(2)` 라 `2940.00 Pa` 로 나온다. `graph` 도 HUD 우상단
   고정이다. `marker` 는 월드에 붙지만 `text` 가 `i18n.resolve` 를 타서 `{v}` 플레이스홀더
   치환이 되지 않아 **값이 끼어드는 문안**을 담을 수 없다(C1 이 요구하는 형태).

그래서 이 둘만 **자기 패키지 안의 자유 렌더 계층**이 그린다 (원칙 4, S-sim 「자유 렌더 계층
(예약)」). 파일 이름은 그 예약된 규약대로 `src/pressure-and-container-shape-stage.ts` 다.
프리미티브 타입은 두 개:

| type | 그리는 것 | zHint |
|---|---|---:|
| `pressureVessel` | 그릇 벽 · 차오르는 물 · 부피 칩 · 바닥 압력 숫자 · 그릇 이름 | 15 |
| `pressureReadout` | 수면 높이(`variant: 'level'`, 월드) · 주어진 값(`variant: 'givens'`, screen-hud) | 62 |

이 계층 안에서도 **색은 `rc.theme` 경유로만** 얻고(리터럴 0건), **화면 문자는 키로만**
조회한다 — `rc.i18n.t(key, en, vars)` 3층 규약을 그대로 쓰고 저작자 문안은
`schema.messages` 에 있다.

### 등록 — 호스트가 배선할 것

`@aperi21/schema` 의 `Plugin` 계약을 그대로 만족하는 꾸러미를 패키지가 export 한다.
**호스트 쪽 새 API 가 필요 없다.**

```ts
// packages/bootstrap/src/index.ts — installAperi21Plugins(host) 안
const { pressureAndContainerShapeStage } = await import(
  '@aperi21/sim-pressure-and-container-shape'
);
if (!host.pluginManager.has(pressureAndContainerShapeStage.id)) {
  host.pluginManager.register(pressureAndContainerShapeStage);
}
```

- `PluginManager.register` 가 `primitiveTypes` 를 돌며 `rendererRegistry.register(type,
  renderer, zHint)` 까지 해 준다. `runBundle` 도 `react/embed/Canvas.tsx` 도 같은
  `host.rendererRegistry` 를 조회하므로 두 진입점 모두 자동으로 그려진다.
- **Host 인스턴스당 정확히 한 번.** 같은 plugin id 를 두 번 넣으면 throw 한다.
  (위 `has()` 가드 또는 `installAperi21Plugins` 의 `WeakSet` 가드로 충분하다.)
- plugin id 는 `'@aperi21/sim-pressure-and-container-shape/stage'`.
- 직접 배선하고 싶으면 두 줄로도 된다:
  `host.rendererRegistry.register('pressureVessel', renderPressureVessel, 15)` /
  `host.rendererRegistry.register('pressureReadout', renderPressureReadout, 62)`.

번들 등록은 다른 sim 과 같다:

```ts
registerBundleLoader('aperi21:pressure-and-container-shape', async () => {
  const m = await import('@aperi21/sim-pressure-and-container-shape');
  return registerBundle('aperi21:pressure-and-container-shape', m.pressureAndContainerShapeBundle);
});
```

**등록 순서 주의** — 렌더러가 없으면 `runBundle` 은 조용히 건너뛴다(`if (!renderer) continue`).
그릇이 안 보이면 에러가 아니라 등록 누락이다.

**이름 충돌 주의** — 프리미티브 타입 이름은 `RendererRegistry` 전역에서 한 벌이다. 지금
`sims/fluids/**` 에 등록된 다른 이름(`waterVolume`·`waterStream`·`dialScale`)과는 겹치지
않지만, 같은 `pressure*` 접두를 쓰는 sim 이 뒤에 붙으면 `PluginManager.register` 가 throw
한다. 그때는 `schema.ts` 의 `VESSEL_PRIMITIVE_TYPE`·`READOUT_PRIMITIVE_TYPE` 두 상수만
고치면 되고, 나머지 코드는 전부 이 상수를 참조한다.

## (d) 막히거나 판단한 지점

1. **`Primitive` 유니온이 닫혀 있다.** 자유 렌더 계층의 타입은 유니온에 없는데
   `SceneGraph = readonly Primitive[]` 다. 호스트는 문자열 `type` 으로 렌더러를 찾으므로
   런타임에는 문제가 없어서, `scene.ts` 의 `declare()` **한 함수에서만** 좁혔다. 자유 렌더
   계층이 규약으로 승격되면 스키마에 `type: string` 을 허용하는 탈출구(예:
   `CustomPrimitive extends BaseMeta { type: string }`)가 유니온에 하나 필요하다.

2. **`RenderContext.i18n` 이 `t` 를 모른다.** 실제로 `runBundle` 이 넘기는 것은
   `t`·`withMessages` 를 갖춘 `HostI18n` 인데 스키마의 `I18n` 에는 `lang`·`resolve` 뿐이라,
   렌더러에서 타입 가드(`hasKeyedLookup`)로 좁히고 없으면 호출부 en 원본으로 떨어지게 했다.
   `RenderContext.i18n` 을 `t` 까지 포함하도록 넓히면 이 가드가 사라진다 — C1 이 요구하는
   3층 조회를 렌더러가 쓰려면 사실상 필수다.

3. **`isTerminated` 를 일부러 구현하지 않았다.** `LinearTimeEngine.markTerminated()` 는
   편도다 — `runBundle` 은 종료 뒤 `start()`/`reset()` 을 다시 부르지 않으므로 `tick` 이
   영원히 0 을 반환한다. 물이 다 찼다고 종료를 알리면 그 뒤 슬라이더가 죽는다. 그래서
   "다 찬 상태" 는 종료가 아니라 `state.leveled` 로만 표현한다.

4. **카메라의 `SCREEN_Y_BIAS = 60` 이 세로 배율을 아래쪽으로 묶는다.** `fitToBounds` 의
   가용 공간이 위 204px / 아래 84px(360 높이 기준)로 갈려 배율은 항상 아래쪽에 잡힌다.
   이 조각은 바닥 아래(압력 화살표·숫자)에 내용이 있어 그 제약을 정면으로 받는다. 그래서
   `canvas.height` 를 **400**(기본 360)으로 선언했고, 그 대신 늘 비는 화면 위쪽 띠를
   "주어진 값" 두 줄이 쓰도록 그 블록만 screen-hud 배치로 두었다.

5. **`trajectory` 가 `style.lineStyle: 'dashed'` 를 무시한다.** 선언은 규약대로 두었지만
   실선으로 그려진다. 목표 수면선은 색(muted → accent)과 `highlight` 로만 상태를 말한다.

6. **`surface` 의 `kind: 'ground'` 는 화면 아래 절반을 muted 15% 로 덮는다.** 압력 화살표와
   숫자가 그 아래에 있어 "지하" 로 읽히므로 `kind: 'wall'` 선분을 썼다.

7. **S-sim 과의 어긋남 하나.** S-sim 은 "6파일 외 `.ts` 예외 1개는 `index.ts` 에서
   re-export 하지 않는다(내부용)" 고 하지만, 자유 렌더 계층은 호스트가 등록해야 하는
   물건이라 `index.ts` 에서 export 한다. 도메인 헬퍼(내부용)와 자유 렌더 계층(외부 등록용)은
   성격이 다르므로 S-sim 「자유 렌더 계층」 절을 쓸 때 이 구분을 명시하면 좋겠다.

8. **`pnpm install` 을 돌리지 못했다(지시).** 그래서 이 패키지에는 아직 `node_modules` 가
   없고 `@aperi21/schema` 심링크가 없다. 자체 타입체크는 임시 tsconfig 의
   `paths: { "@aperi21/schema": ["packages/schema/src/index.ts"] }` 로 대신 돌렸고
   **에러 0건**이다. 워크스페이스 의존이 연결된 뒤
   `pnpm --filter @aperi21/sim-pressure-and-container-shape typecheck` 를 한 번 돌려 주면
   된다.

9. **레이아웃은 눈이 아니라 계산으로 확인했다.** 실제 `Camera.fitToBounds` 와 기록형
   Canvas2D 스텁으로 640×400 / 800×400 / 420×400 / 640×360 / 360×360 × ko·en × 시간
   0.2–4.6 s 33 프레임을 훑어 (i) 캔버스 밖으로 나가는 텍스트 0건, (ii) 텍스트끼리 겹침
   0건, (iii) 우상단 슬라이더 영역 침범 0건을 확인했다. 실제 브라우저에서 본 것은 아니므로
   글꼴 실측 폭 차이는 남아 있다. 그 때문에 "주어진 값" 두 줄은 폭이 넘치면 자리를 늘리는
   대신 글자를 줄여 담는다 (원칙 6).
