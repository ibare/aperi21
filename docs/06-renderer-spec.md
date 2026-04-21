# aperi21 호스트 렌더러 스펙

Scene Graph 선언을 실제 화면에 그리는 호스트 렌더러의 설계 명세.
Bundle과 Plugin 양쪽이 의존하는 **계약**을 정의한다.

---

## 1. 렌더러의 책임 범위

### 렌더러가 하는 일

1. **Scene Graph 해석** — Bundle이 뱉은 프리미티브 배열을 순회하며 적절한 렌더 함수 호출
2. **참조 해석** — `id` 기반 참조(FieldLine → VectorField, Wire → CircuitElement.terminal)를 매 프레임 해결
3. **좌표 변환** — 월드 좌표 ↔ 스크린 좌표 (카메라 포함)
4. **테마 적용** — `colorRole`을 현재 테마의 실제 색상으로 변환
5. **i18n 해석** — `LocalizedText`를 현재 언어로 resolve
6. **파생 프리미티브 계산** — VectorField 샘플링, FieldLine 적분, Wave 중첩 등 표준 계산
7. **렌더 순서 결정** — 의존성 그래프로 정렬 (Field가 FieldLine보다 먼저 계산)
8. **애니메이션 보간** — 시간 의존 프리미티브(Event flash, 강조 전환)의 상태 갱신

### 렌더러가 하지 않는 일

- **물리 시뮬레이션** — Bundle의 `step`이 담당
- **컨트롤러 UI 그리기** — 별도 Controller 시스템 (다음 섹션)
- **HUD 렌더링** — 정보 패널, 뷰 탭은 React 레이어
- **입력 처리** — Controller 시스템 또는 카메라 시스템
- **사운드** — 이번 스펙에서 제외

경계를 명확히: 렌더러는 **Scene Graph를 픽셀로 바꾸는 함수**다. 그 이상도 이하도 아니다.

---

## 2. 렌더링 파이프라인

프레임 하나를 그리는 순서:

```
[프레임 시작]
    ↓
1. 배경 클리어 (스테이지 색상)
    ↓
2. 환경 효과 렌더 (입자: 비·별)
    ↓
3. Scene Graph 전처리
    - 프리미티브 인덱싱 (id → primitive 맵)
    - 의존성 그래프 구성 (참조 관계)
    - 위상 정렬 (field → fieldLine 순서)
    - 계산 메모이제이션 (VectorField 샘플 등)
    ↓
4. 월드 공간 프리미티브 렌더
    - z-order: 배경 장 → 궤적 → 벡터 → 본체 → 이벤트
    ↓
5. 스크린 공간 오버레이 (Graph, Gauge, HUD 연결선)
    ↓
6. 디버그 오버레이 (개발 모드)
    ↓
[프레임 끝]
```

### z-order 규칙

프리미티브가 명시적 `zIndex`를 가지지 않는다. 대신 **타입별 기본 z-레이어**를 호스트가 정의:

| z | 레이어 | 타입 |
|---|-------|------|
| 0 | 배경 장 | ScalarField, VectorField (배경 모드) |
| 10 | 구조물 | Surface, Container, OpticalElement, Wire |
| 20 | 궤적·장선 | Trajectory, FieldLine, Ray |
| 30 | 파동 | Wave |
| 40 | 물체 | Body, Charge, CircuitElement, Coil, ParticleSystem |
| 50 | 벡터·이벤트 | Vector, Axis, Event |
| 60 | 주석 | Marker, Gauge |
| 70 | 스크린 오버레이 | Graph (데이터 뷰) |

같은 레이어 안에서는 Scene Graph 배열 순서대로.

---

## 3. RenderContext — 렌더 함수가 받는 것

모든 프리미티브 렌더 함수는 동일한 컨텍스트를 받는다.

```typescript
interface RenderContext {
  // 그리기 대상
  ctx: CanvasRenderingContext2D;

  // 좌표 변환
  toScreen(world: Vec2): Vec2;
  toWorld(screen: Vec2): Vec2;
  scale: number;                    // 픽셀 / 월드 단위
  viewport: { width: number; height: number };

  // 테마
  theme: Theme;

  // 다국어
  i18n: I18n;

  // 시간
  time: number;                     // 시뮬레이션 시간 (애니메이션용)
  deltaTime: number;                // 이번 프레임 dt

  // Scene 참조 (다른 프리미티브 조회)
  scene: SceneGraphRefs;

  // 계산 서비스 (표준 장 계산 등)
  compute: ComputeService;

  // 측정 서비스 (텍스트 크기 등)
  measure: MeasureService;
}
```

### Theme

```typescript
interface Theme {
  mode: 'light' | 'dark';

  // colorRole → 실제 색상 (emphasis 반영)
  resolveColor(role: ColorRole, emphasis?: Emphasis): string;

  // 표준 색상 토큰
  background: string;
  foreground: string;
  muted: string;
  line: string;
  grid: string;

  // 타이포그래피
  fontFamily: string;
  fontFamilyMono: string;

  // 간격·반경
  radiusSmall: number;
  radiusMedium: number;
  strokeWidth: { thin: number; regular: number; thick: number };
}
```

**중요**: 렌더 함수는 절대 `ctx.fillStyle = '#FF0000'` 직접 설정 금지. 반드시 `theme.resolveColor('primary')`를 거친다. 이 규율이 다크/라이트 전환 일관성의 유일한 보장.

### I18n

```typescript
interface I18n {
  lang: string;
  resolve(text: LocalizedText): string;
  format(value: number, unit?: string): string;  // 숫자·단위 현지화
}
```

### ComputeService

설계 결정 B의 표준 계산 함수들을 실행하는 서비스.

```typescript
interface ComputeService {
  // 벡터장 샘플링
  vectorField(compute: FieldCompute, x: number, y: number): Vec2;

  // 스칼라장 샘플링
  scalarField(compute: ScalarCompute, x: number, y: number): number;

  // 장선 적분 (RK4 기반)
  integrateFieldLine(
    seed: Vec2,
    field: FieldCompute,
    opts: { length: number; step: number; direction: 'forward' | 'backward' | 'both' }
  ): Vec2[];

  // 파동 샘플링 (Wave 프리미티브 내부용)
  waveAmplitude(sources: WaveSource[], pos: Vec2, time: number, speed: number): number;
}
```

### MeasureService

```typescript
interface MeasureService {
  textWidth(text: string, fontSize: number): number;
  textBounds(text: string, fontSize: number): { width: number; height: number };
}
```

---

## 4. 프리미티브 렌더러 시그니처

모든 프리미티브 렌더러는 동일한 함수 형태.

```typescript
type PrimitiveRenderer<T extends Primitive> = (
  ctx: RenderContext,
  primitive: T,
) => void;
```

호스트는 타입별로 렌더러를 등록해둠:

```typescript
const coreRenderers: { [K in Primitive['type']]?: PrimitiveRenderer<any> } = {
  body: renderBody,
  trajectory: renderTrajectory,
  vector: renderVector,
  // ...
};
```

Plugin은 자기 프리미티브 타입의 렌더러를 추가:

```typescript
const opticsPlugin: Plugin = {
  id: 'optics',
  primitiveTypes: ['ray', 'opticalElement'],
  renderers: {
    ray: renderRay,
    opticalElement: renderOpticalElement,
  },
};
```

렌더링 주 루프:

```typescript
for (const primitive of orderedScene) {
  const renderer = rendererRegistry[primitive.type];
  if (!renderer) continue;           // 알 수 없는 타입 무시 (경고만)
  if (primitive.hidden) continue;
  applyBaseMeta(ctx, primitive);     // 강조·스타일 공통 처리
  renderer(ctx, primitive);
}
```

### applyBaseMeta 공통 처리

BaseMeta의 `highlight` 상태에 따라 `ctx.globalAlpha` 조정 등을 공통 처리해서 각 렌더러가 반복 코드를 안 쓰게 만든다.

```typescript
function applyBaseMeta(ctx: RenderContext, p: Primitive): void {
  const canvas = ctx.ctx;
  canvas.save();

  switch (p.highlight ?? 'normal') {
    case 'focused':
      canvas.globalAlpha = 1;
      canvas.shadowColor = ctx.theme.resolveColor('accent');
      canvas.shadowBlur = 8;
      break;
    case 'dimmed':
      canvas.globalAlpha = 0.3;
      break;
    case 'warning':
      canvas.globalAlpha = 1;
      // warning stroke overlay는 렌더러 후처리에서
      break;
    default:
      canvas.globalAlpha = 1;
  }
}

// 렌더 후 복원
function finalizeBaseMeta(ctx: RenderContext, p: Primitive): void {
  ctx.ctx.restore();
}
```

---

## 5. 주요 프리미티브 렌더 알고리즘

각 프리미티브가 어떻게 그려지는지 핵심 로직만. 전체 구현은 코드 단계에서.

### Body

```
shape === 'circle' or 'point':
  const screenPos = ctx.toScreen(p.pos)
  const radius = (p.size ?? 0.2) * ctx.scale
  fill with theme.resolveColor(p.style.colorRole, p.style.emphasis)
  
  if emphasis === 'strong':
    add radial glow (opacity 0.3)
  
  draw 1px stroke with theme.line
  draw label (if p.label) below

shape === 'rod':
  orient by p.orientation
  drawn as rectangle with rounded ends

shape === 'rect' / 'disc':
  standard rectangle / filled ellipse
```

### Trajectory

```
if points.length < 2: skip

if style.fade === 'tail':
  for each segment [i → i+1]:
    alpha = i / (length-1)           // 뒤로 갈수록 진함
    stroke with colorRole × alpha

else:
  single polyline stroke
```

### Vector

```
const from = ctx.toScreen(p.from)
const to = ctx.toScreen([p.from[0] + p.delta[0], p.from[1] + p.delta[1]])
const len = distance(from, to)

if len < 2: skip                    // 너무 짧은 벡터는 렌더 생략

draw line from → to with colorRole
draw arrowhead at to:
  triangle with head size 6 (또는 p.headSize)
  
if p.showMagnitude:
  label = |delta|
  draw at midpoint

if p.label:
  draw at 40% from start
```

### Constraint

```
subtype === 'rigid_rod':
  single line with moderate width

subtype === 'string':
  thin line, slight catenary curve (시각적 효과)

subtype === 'spring':
  zigzag coil with (p.coils ?? 8) turns
  자연 길이와 현재 길이의 비율로 압축/신장 표현

subtype === 'rail':
  double parallel lines
```

### Surface

```
switch geometry.kind:
  case 'ground':
    solid line across viewport at y=geometry.y
    light fill below (0.15 alpha)
  
  case 'incline':
    polygon from origin along angle for length
    hatch pattern for 'rough' material
  
  case 'wall':
    polyline from.to.to with thick stroke
  
  case 'arc':
    canvas.arc with center.radius.from.to
```

### VectorField

**성능 핵심**. 매 프레임 수백 개 화살표를 그림.

```
1. Grid 생성
   density (기본 20) × viewport 크기로 샘플 포인트 배열

2. 각 포인트에서 compute 서비스로 벡터 샘플
   v = ctx.compute.vectorField(p.compute, x, y)

3. 화살표 렌더링
   길이 = |v| × arrowScale
   색상 = arrowStyle === 'magnitude-scaled' 이면 magnitude → colormap
          아니면 colorRole

4. 최적화
   - 너무 작은 벡터 (|v| < threshold) 스킵
   - 너무 큰 벡터 클램프 (시각 보호)
   - 같은 프레임에서 compute 결과 메모이제이션
```

### ScalarField

**이미지 기반 렌더**가 가장 빠르다.

```
1. OffscreenCanvas 생성 (뷰포트 크기)
2. 픽셀 루프 (또는 저해상도 격자 + 보간)
   for each pixel (px, py):
     const [wx, wy] = ctx.toWorld([px, py])
     const value = ctx.compute.scalarField(p.compute, wx, wy)
     const color = colormap(value, p.range ?? auto)
     setPixel
3. drawImage onto main ctx

contours:
  별도 패스로 등치선 추출 (marching squares)
```

### FieldLine

```
1. 시드에서 시작
2. compute 서비스의 integrateFieldLine 호출
   → 월드 좌표 점 배열
3. 폴리라인으로 스트로크
4. direction === 'both' 이면 forward + backward 모두
5. 끝부분에 작은 화살표 (장의 방향 표시)
```

### Wave

```
dimension === '2d':
  ScalarField와 유사하지만 함수가
  amplitude(x, y) = Σ sources.map(s => sinWave(s, x, y, time, speed))
  
  렌더 = ScalarField 픽셀 루프 + sinusoidal 전용 콜로맵 (−1 ~ +1 대칭)

dimension === '1d':
  x축 따라 y = amplitude 그래프로 렌더
```

### Graph

**스크린 공간**에서 렌더 (월드 좌표와 독립).

```
1. Bundle 또는 호스트가 배치 결정
   - 기본: 우측 상단 HUD 영역
   - 번들이 world-position을 지정할 수도 있음 (P-V 다이어그램처럼 인라인 배치)

2. style별 분기:
   case 'bar': 막대 그래프. horizontal 옵션
   case 'line': 라인 그래프
   case 'scatter': 점 산점
   case 'phasor': 원 + 회전 벡터
   case 'pv': 등고선 + 경로 (열역학 전용)
   case 'spectrum': 세로 라인들 (스펙트럼)
   case 'histogram': bar의 특수 경우

3. 축·격자·라벨은 공통
```

### Event

**시간 의존 렌더**. `time - startedAt < duration` 일 때만 그려지고, 진행도에 따라 페이드.

```
progress = (time - startedAt) / duration  (0 ~ 1)

kind === 'flash':
  원형 블룸 (radius grows, alpha fades)

kind === 'burst':
  여러 방향 파티클 (간단한 parametric 분산)

kind === 'pulse':
  동심원 파동 (expanding circle)

kind === 'decay':
  점의 축소 + 페이드

kind === 'emission':
  원점에서 방사형 광선
```

---

## 6. 좌표계와 카메라

### 월드 좌표

- 단위는 **미터**
- Y축은 위가 양수 (수학 관습, 물리적 직관)
- 원점은 관습적으로 발사 지점 또는 중심 천체. Bundle이 결정.

### 스크린 좌표

- 픽셀
- Y축은 아래가 양수 (Canvas 관습)
- `toScreen([wx, wy])` = `[cx + (wx - cam.x) * scale, cy + 60 - (wy - cam.y) * scale]`
  - `+60`: 지면을 화면 중앙보다 약간 아래에 배치 (v3와 동일한 편향)

### Camera

```typescript
interface Camera {
  x: number;        // 월드 x, 뷰포트 중심
  y: number;        // 월드 y
  scale: number;    // 픽셀 / 미터

  userAdjusted: boolean;  // 사용자가 한번이라도 조작했는지

  // 조작
  pan(dx: number, dy: number): void;
  zoom(factor: number, center?: Vec2): void;
  fitToBounds(bounds: Bounds, padding?: number): void;
  reset(): void;
}
```

**자동 프레이밍**: 카메라가 `userAdjusted = false` 상태이고 Bundle에서 `boundsHint`를 제공하면 매 프레임 자동 맞춤. 사용자가 한 번 팬/줌하면 수동 모드로 전환.

---

## 7. 성능 고려사항

### 프레임 예산

목표: **60 FPS (16.6ms/frame)**. 더 복잡한 장면은 30 FPS 허용.

시나리오별 예상 비용:
- 기본 (포물선, 진자): < 2ms
- VectorField 20×20 = 400 arrows: < 4ms
- ScalarField 400×300 = 120k pixels: < 8ms (OffscreenCanvas + ImageData)
- ParticleSystem 1000개: < 3ms (batch)

### 메모이제이션 전략

같은 프레임 안에서 여러 프리미티브가 같은 계산을 할 수 있음:

```typescript
// VectorField와 FieldLine이 같은 charges의 장을 씀
const fieldCache = new Map<string, Vec2[][]>();
```

프레임 시작 시 캐시 클리어, 프레임 안에서는 유지.

### 해상도 적응

사용자 환경이 느리면 ScalarField 격자 해상도를 낮춤:

```typescript
const quality: 'high' | 'medium' | 'low' = adaptiveQuality();
const gridSize = { high: 400, medium: 200, low: 100 }[quality];
```

품질 결정: 최근 10프레임 평균 FPS 기반 동적 조정.

---

## 8. 개발자 경험 — 디버그 모드

`?aperi21_debug=1` URL 파라미터로 활성화:

- 월드 좌표 그리드 표시 (격자 + 원점 표시)
- 모든 프리미티브의 bounding box 표시
- ID 라벨 표시
- FPS 카운터
- Scene Graph JSON 인스펙터 (우상단 패널)
- 렌더 시간 프로파일 (프리미티브별)

이건 개발 전용. 프로덕션 빌드에서 비활성화.

---

## 9. 에러 처리

### 알 수 없는 프리미티브 타입

```
console.warn(`[aperi21] Unknown primitive type: ${p.type}. Did you forget to load a plugin?`)
→ 해당 프리미티브 스킵, 나머지는 정상 렌더
```

### 참조 해결 실패

```typescript
follows: 'nonexistent-field'
→ console.warn, FieldLine 스킵
```

### 표준 계산 함수 실패

```typescript
compute: { method: 'coulomb', sources: ['q1'] }
// 하지만 q1 id를 가진 charge가 없음
→ console.warn, 빈 벡터장으로 폴백
```

### 성능 저하

프레임이 16ms를 초과하면 디버그 모드에서 빨간 경고. 3초간 지속되면 사용자 알림 (개발 빌드만).

---

## 10. 렌더러 구현 체크리스트

MVP 기준으로 만들 것 목록:

**코어 렌더러 (16개 프리미티브)**
- [ ] Body (point, circle 최소)
- [ ] Trajectory (solid, fade-tail)
- [ ] Vector (with arrowhead, label)
- [ ] Constraint (rigid_rod, spring — string은 rod와 같이 가능)
- [ ] Surface (ground, incline)
- [ ] Axis
- [ ] VectorField (기본 arrow grid)
- [ ] ScalarField (pixel-based + colormap)
- [ ] FieldLine (RK4 적분)
- [ ] Wave (2D sinusoidal 중첩)
- [ ] Emitter
- [ ] ParticleSystem
- [ ] Graph (bar, line 최소 MVP)
- [ ] Gauge (linear)
- [ ] Marker (label, annotation)
- [ ] Event (flash, pulse)

**공통 인프라**
- [ ] RenderContext 구성
- [ ] Theme 엔진 (colorRole 해석)
- [ ] I18n resolver
- [ ] Camera 시스템 (pan/zoom/fit)
- [ ] ComputeService (coulomb, gravity, uniform)
- [ ] 의존성 정렬
- [ ] 메모이제이션 레이어
- [ ] 디버그 모드

**도메인 Plugin 렌더러 (9개)**
- [ ] Ray
- [ ] OpticalElement (subtype별)
- [ ] CircuitElement (subtype별)
- [ ] Wire (라우팅 포함)
- [ ] Terminal
- [ ] Charge
- [ ] Coil
- [ ] Container
- [ ] EnergyLevels

---

## 11. 이 스펙이 Plugin 설계에 주는 제약

다음 단계인 Plugin 설계에서 이 렌더러 스펙이 강제하는 것들:

1. **모든 Plugin 렌더러는 `PrimitiveRenderer<T>` 시그니처를 만족해야 함.** `(ctx: RenderContext, primitive: T) => void`.

2. **Plugin은 자기 프리미티브의 z-레이어를 제안할 수 있되, 호스트가 최종 결정.** 섹션 2의 z-order 테이블은 호스트 기본값이고 Plugin은 hint만 제공.

3. **Plugin은 ComputeService를 확장할 수 있음.** 예: Optics plugin이 `refract` 계산을 추가. 하지만 등록 시 네임스페이스 충돌 검사 필요.

4. **Plugin 렌더러도 직접 색상 금지 규칙을 지킨다.** 반드시 `theme.resolveColor`를 거침.

5. **Plugin의 메모이제이션은 호스트 캐시에 참여.** 자체 캐시를 만들지 않고, `ctx`가 제공하는 프레임 스코프 캐시를 공유.

다음 문서(Plugin 설계)에서 이 제약들을 구체화한다.
