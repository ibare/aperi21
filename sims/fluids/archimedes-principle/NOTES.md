# archimedes-principle

## (a) 이 조각이 답하는 질문

부력은 왜 하필 밀려난 물의 무게와 같은가.

## (b) 동사를 화면에서 어떻게 일어나게 했나

동사는 둘이다. **넘친다**, 그리고 **두 저울이 마주 움직인다**.

### 넘친다

그릇은 주둥이까지 가득 찬 넘침 그릇(overflow can)이다. 수면이 주둥이에 물려 있어
새 물이 들어갈 자리가 없다 — 그래서 물체가 밀고 들어간 부피가 **그대로** 주둥이로
넘어간다. 이 "자리가 없다" 가 답의 절반이라, 수위가 오르는 그림이 아니라 수위가
꿈쩍 않고 넘치기만 하는 그림으로 만들었다.

화면에서 실제로 일어나는 것:

- 물체가 위에서 내려와 수면에 **닿고**, 잠기면서 물이 주둥이로 **밀려 나간다.**
- 물줄기는 포물선(수평 속도 일정 + 낙하 가속)으로 떨어지고, 그 안에서 물방울 넷이
  실제로 **흘러간다**. 굵기는 잠기는 **속도**에 비례한다 — 물체가 멈추면 물도 멎는다.
- 컵의 수면이 **차오른다.** 1.0 L 를 컵 안쪽 넓이(0.13 m × 0.10 m)로 나눈 만큼,
  즉 화면에서 22 px 만큼 실제로 올라온다. 눈속임 없이 부피에서 나온 높이다.
- 잠긴 부분은 물빛(반투명 secondary) **아래로 덮인다.** 물이 물체 위에 그려지는
  것 자체가 "잠겼다" 의 표현이다.

### 두 저울이 마주 움직인다

같은 눈금(0–20 N)을 쓰는 **똑같이 생긴 눈금판 저울 둘**이 나란히 걸려 있다.
왼쪽은 물체를 매달고, 오른쪽은 넘친 물을 받는 컵을 매단다.

- 왼쪽 지침은 19.60 N 에서 **반시계로** 내려가고, 오른쪽 지침은 0 에서 **시계로**
  올라간다. 두 저울의 눈금 매핑이 같으므로, 두 지침이 매 순간 도는 **각도의 크기가
  정확히 같다.** 문자 그대로 마주 움직인다.
- 각 눈금판에는 **처음 자리에서 지금 자리까지의 부채꼴**이 자란다. 두 부채꼴은
  절반쯤 잠긴 중간 상태에서도 **매 순간 합동**이다. 왼쪽이 잃은 만큼 오른쪽이 얻는
  것이 도형 하나로 보인다 — 이것이 이 조각의 주장이다.
- 부채꼴 아래 `−4.90 N` / `+4.90 N` 처럼 부호만 다른 같은 수가 뜬다.
- 물체 위의 **부력 화살표**가 세 번째 거울이다. 넘친 물의 무게와 같은 길이로 자란다.

수는 전부 호스트가 확정한 값에서 나온다: 19.6 N → 9.8 N, 넘친 물 0 → 9.8 N,
부력 0 → 9.8 N, 밀려난 물 0 → 1.0 kg.

### 자동으로 끝까지 간다

`timeModel: 'linear'` 로 마운트 즉시 시작한다. 1.2 초 접근(두 저울이 꼼짝 않는
구간 — 기준값을 먼저 보여준다) → 4.6 초 침수 → 완전히 잠긴 자리에서 멈춘다.
아무것도 누르지 않아도 화면이 할 말을 마친다.

조작기는 **슬라이더 하나**다. "매 순간 같다" 를 읽는 사람이 아무 깊이에서나 직접
확인하라는 것이 유일한 용도다. 잡는 순간 자동 진행이 멈추고(`state.manual`) 손을
따른다. 뒤로 끌면 물줄기는 그리지 않는다(넘친 물이 거꾸로 흘러 들어가는 그림은
거짓이므로) — 두 눈금만 되짚어 간다.

## (c) 표준 8종으로 안 된 것

`CORE_RENDERERS` 8종 중 골격은 표준 어휘로 그대로 썼다.

| 대상 | 프리미티브 |
|---|---|
| 실험대 | `surface` (ground) |
| 그릇·주둥이·컵 외곽 | `surface` (wall) × 9 |
| 물체 | `body` (rect, 0.10 × 0.10 m) |
| 부력 | `vector` |
| "주둥이까지 가득" · "줄어든 무게 = 넘친 물의 무게" | `marker` (label) |

**표준 어휘로 되지 않은 것이 셋이고, 억지로 조합하는 대신 직접 그렸다** (원칙 4).

1. **`waterVolume`** — 그릇에 담긴 물. `body`/rect 는 잠긴 부분을 물빛으로 덮지
   못하고, 수면이 일렁이지도, 부피에서 나온 높이로 차오르지도 못한다.
2. **`waterStream`** — 넘어가는 물줄기. `trajectory` 는 선이지 굵기·물방울·유량을
   가진 물줄기가 아니다. `event`(burst/pulse)는 순간이지 지속이 아니다.
3. **`dialScale`** — 눈금판 저울. `gauge` 는 화면 좌상단에 `id` 해시로 슬롯을 잡는
   **가로 막대 HUD** 다(`renderGauge` 의 `x = 24, y = 24 + slot * 30`). 장치 옆에
   붙지도, 서로 마주 보지도, 각도 폭으로 변화량을 견주게 하지도 못한다. 이 조각의
   동사가 정확히 그 두 가지 — 각자 제 장치에 붙어 있을 것, 마주 움직일 것 —
   이라서 `gauge` 로는 질문에 답할 수 없다.

렌더러는 전부 이 패키지 안에 있다: `src/archimedes-principle-stage.ts`.
S-sim 「자유 렌더 계층 (예약)」이 예고한 `<name>-stage.ts` 자리를 그대로 썼다.
프리미티브 **타입 선언**은 `src/schema.ts` 에 둔다 — `scene.ts` 와 렌더러가 같은
타입을 봐야 하는데, `scene.ts` 가 렌더러 파일을 import 하면 선언이 렌더러를
참조하게 되기 때문이다 (원칙 1). 의존 방향은 `stage → schema`, `scene → schema` 다.

### 등록 — 호스트가 할 일

`Plugin` 모양으로 내놓았으므로 `packages/host` 를 고칠 필요가 없다.
`PluginManager` 가 `primitiveTypes` · `renderers` · `zHints` 를 그대로 받는다.

`packages/bootstrap/src/index.ts` 에 두 줄:

```ts
// installAperi21Plugins(host) 안
const { archimedesPrincipleStagePlugin } = await import('@aperi21/sim-archimedes-principle');
host.pluginManager.register(archimedesPrincipleStagePlugin);
```

```ts
// registerAperi21Bundles() 안
registerBundleLoader('aperi21:archimedes-principle', async () => {
  const m = await import('@aperi21/sim-archimedes-principle');
  return registerBundle('aperi21:archimedes-principle', m.archimedesPrincipleBundle);
});
```

주의할 점:

- `PluginManager.register` 는 같은 id 를 두 번 받으면 throw 한다. 기존
  `installAperi21Plugins` 의 `pluginsInstalledFor` WeakSet 가드 안에 넣으면 된다.
- 플러그인 id 는 `@aperi21/sim-archimedes-principle`, version `0.1.0`.
  등록 타입은 `waterVolume` · `waterStream` · `dialScale` 셋이며 셋 다 현재
  `RendererRegistry` 에 비어 있는 이름이다(스키마 `Primitive` 유니온에도 없다).
- z 힌트는 플러그인이 들고 있다: `waterVolume 45` · `waterStream 46` ·
  `dialScale 62`. 물이 `body`(40) 위에 반투명으로 덮여야 "잠겼다" 로 읽힌다.
- 렌더러가 등록되지 않으면 `runBundle` 의 루프가 조용히 건너뛴다 — 그릇 외곽선과
  물체만 나오고 물·물줄기·저울이 통째로 사라진다. 등록 누락은 에러가 아니라
  **빈 화면**으로 나타나므로 배선 후 눈으로 한 번 확인하는 편이 좋다.
- **더 가벼운 대안**: 플러그인이 과하다면 `archimedesPrincipleRenderers`
  (`Record<string, PrimitiveRenderer>`) 와 `ARCHIMEDES_Z_HINTS` 를 그대로
  export 해 두었으므로 `host.rendererRegistry.register(type, fn, z)` 로 직접
  넣어도 된다. 다만 그 경우 언등록·롤백을 호스트가 직접 챙겨야 한다.

## (d) 만들면서 막힌 지점

**1. 세로 픽셀이 생각보다 훨씬 적다.**

`Camera.fitToBounds` 는 경계의 **중점**을 화면 `height/2 + SCREEN_Y_BIAS(60)` 에
맞춘다. 그래서 위아래 가용 픽셀이 비대칭인데, `min(availU, availD)` 로 스케일이
정해지므로 실제 세로 가용은 `캔버스 높이 − 192` 밖에 안 된다. 경계에 여백을 더해도
중점이 따라 움직여 소용이 없다(위·아래 span 이 항상 같아진다).

처음 설계(캔버스 420, 눈금판 반지름 0.11 m)로는 눈금판이 화면에서 21 px 이 되어
눈금값을 읽을 수 없었다. 대응:

- 매다는 보(support beam)를 없애 월드 높이를 줄였다.
- 눈금판을 물리적 크기가 아니라 **계기의 크기**로 다시 잡았다 (0.16 m).
- 캔버스를 460 px 로 올렸다 (`canvas.height === minHeight` — 마운트 후 불변, 원칙 6).

결과: 눈금판 반지름 45 px, 눈금값 14 px, 물체 28 px, 컵 수위 상승 22 px,
물줄기 굵기 5 px. 폭 560~900 px 어디서도 잘리지 않고 슬라이더 HUD(우상단
220 × 44)와도 겹치지 않는다.

**2. 물줄기가 컵 벽을 뚫었다.**

물줄기는 x 가 선형, y 가 t² 인 포물선이라 **낙하가 뒤로 몰린다.** 컵을 멀리 두면
컵 왼쪽 벽에 닿는 지점에서 이미 테두리보다 낮아져, 물이 벽을 관통해 들어가는
그림이 됐다. 조건을 풀면 `주둥이–컵벽 가로거리 < 착수점까지 거리의 0.55배` 라,
컵을 주둥이 쪽으로 당겨(가로 간격 0.07 m, 착수 0.155 m) 해결했다. 잠긴 정도
0~1 전 구간에서 여유 0.0185 m 를 확인했다. `scene.ts` 의 `cup` 주석에 남겼다.

**3. 슬라이더가 상태를 직접 고쳐 쓴다.**

`SliderController` 는 `writePath` 로 `state.submersion` 을 통째로 갈아끼운다.
그래서 물리가 "지난 프레임에 내가 쓴 값" 을 따로 들고 있지 않으면 (a) 사람이
손댔는지 알 수 없고, (b) 넘치는 기세를 `submersion` 변화량으로 계산할 때 손으로
끈 움직임이 통째로 사라진다(직전 값과 현재 값이 같아져 항상 0). `autoSubmersion`
필드를 두어 둘 다 해결했다. `physics.ts` 안에 주석으로 남겼다.

**4. 자유 렌더 계층 프리미티브가 `Primitive` 유니온 밖이다.**

`SceneGraph` 는 `readonly Primitive[]` 이고 유니온은 schema 패키지에서 닫혀 있다.
`schema.ts` 의 `asPrimitive()` 한 곳에서만 이 경계를 넘게 모아 두었다.
호스트 쪽에서 `Primitive` 유니온을 열어 줄 계획이 있다면 이 함수가 지워질 자리다.

**5. `@i18n:` 은 저작자 문안을 못 본다.**

`I18nResolver.resolve()` 의 `@i18n:` 분기는 호스트 사전(2층)만 본다 —
`BundleSchema.messages`(1층)는 `t()` 에서만 걸린다. 그래서 프리미티브의
`label`/`text` 필드에 `@i18n:` 키를 넣으면 저작자 선언이 무시된다. 대신
`schema.ts` 의 `text(key)` 로 선언에서 `LocalizedText` 객체를 직접 꺼내 쓴다.
문안은 `archimedesPrincipleMessages` 한 곳에만 있고, 그 표가 그대로
`schema.messages` 이므로 저작자 오버라이드 경로도 함께 열려 있다.

## 검증

`node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` 통과.

`pnpm install` 이 금지되어 있어 워크스페이스 링크가 없었으므로,
`node_modules/@aperi21/schema` → `packages/schema` 와 `node_modules/typescript`
심링크를 이 패키지 안에만 직접 만들어 타입체크했다(pnpm 이 만드는 것과 같은
모양이고 `node_modules` 는 gitignore 대상이다). 다음 `pnpm install` 이 덮어쓴다.

그 밖에 확인한 것:

- `weightLost === spilledWeight` 를 잠긴 정도 0~1 의 101 지점에서 검사 — 최대 오차 1.8e-15.
- 완전 침수에서 19.60 / 9.80 / 9.80 / 9.80 N.
- 만수위 0.127 m < 컵 안쪽 높이 0.18 m (넘치지 않는다).
- 가짜 2D 컨텍스트로 세 렌더러 전부 호출 — 예외 없음.
- 색 리터럴 0건, `ko ? … : …` 삼항식 0건, 화면 문자열 리터럴 0건,
  `@aperi21/host`·`plugin-*` import 0건.
