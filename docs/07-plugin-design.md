# aperi21 Plugin 시스템 설계

렌더러 스펙이 "프리미티브를 픽셀로 바꾸는 방법"을 정했다면, Plugin 시스템은 "코어에 없는 도메인 프리미티브를 어떻게 확장하는지"를 정의한다.

## 1. Plugin이 해결하는 문제

코어에 모든 프리미티브를 넣으면 호스트가 비대해지고, 대부분의 사용 사례에서 쓰지 않는 무게를 질질 끌고 다니게 된다. 포물선 Bundle이 `Ray`, `CircuitElement`, `Charge` 렌더러를 다 짊어질 이유가 없다.

Plugin은 다음을 책임진다:

1. **도메인 프리미티브 등록** — 타입 이름과 렌더러를 호스트에 추가
2. **도메인 전용 계산 확장** — 표준 `compute` 서비스에 `refract`, `biot-savart` 같은 메서드 추가
3. **도메인 유틸리티 제공** — Ray tracing, Circuit 해석, Wire 라우팅 같은 **Bundle이 호출하는 헬퍼 함수**
4. **렌더 순서 힌트** — 자기 프리미티브의 z-레이어 제안 (호스트가 최종 결정)

**Plugin이 하지 않는 것:**
- Bundle을 제공하지 않음 (Bundle은 별도 패키지)
- 전역 상태를 만들지 않음
- 호스트의 핵심 루프를 수정하지 않음

---

## 2. Plugin 인터페이스

```typescript
export interface Plugin {
  // === 식별 ===
  id: string;                              // 예: '@aperi21/plugin-optics'
  version: string;                         // semver
  label: LocalizedText;

  // === 코어 확장 ===
  primitiveTypes: readonly string[];       // 이 플러그인이 제공하는 타입들

  renderers: {
    [type: string]: PrimitiveRenderer<any>;
  };

  // === 선택적 확장 ===
  computeMethods?: {
    vector?: Record<string, VectorComputeFn>;
    scalar?: Record<string, ScalarComputeFn>;
  };

  zHints?: Record<string, number>;         // 프리미티브 타입 → z-레이어 제안

  utilities?: Record<string, unknown>;     // Bundle이 호출하는 도메인 헬퍼

  // === 생명주기 훅 (선택) ===
  onRegister?(host: HostAPI): void;        // 등록 시 호출
  onFrame?(ctx: RenderContext): void;      // 매 프레임 시작 시 (캐시 준비 등)
  onUnregister?(): void;                   // 해제 시 (cleanup)

  // === 의존 관계 ===
  requires?: string[];                     // 다른 Plugin ID들 (예: ['@aperi21/plugin-em'])
  conflicts?: string[];                    // 같이 로드될 수 없는 Plugin ID들
}
```

### HostAPI

Plugin이 호스트에 접근해야 할 일이 있을 때 사용. 주로 `onRegister`에서 컨피그를 읽거나 서비스에 등록.

```typescript
export interface HostAPI {
  registerComputeMethod(kind: 'vector' | 'scalar', name: string, fn: Function): void;
  registerUtility(namespace: string, key: string, value: unknown): void;
  getService<T>(id: string): T | undefined;
  logger: { warn(msg: string): void; info(msg: string): void };
}
```

---

## 3. 등록과 로딩

### MVP 전략: 정적 등록

```typescript
// 앱 엔트리포인트
import { createHost } from '@aperi21/host';
import { opticsPlugin } from '@aperi21/plugin-optics';
import { circuitPlugin } from '@aperi21/plugin-circuit';
import { emPlugin } from '@aperi21/plugin-em';
import { projectileBundle } from '@aperi21/bundle-projectile';
import { rayTracingBundle } from '@aperi21/bundle-ray-tracing';

const host = createHost({
  plugins: [opticsPlugin, circuitPlugin, emPlugin],
});

host.registerBundle(projectileBundle);
host.registerBundle(rayTracingBundle);
```

Plugin들이 번들 시점에 트리 셰이킹되고, 런타임 불확실성이 없다. MVP에 가장 적합.

### 향후: 동적 로딩

Bundle의 schema에 `plugins: ['optics']`가 선언되어 있고, 아직 로드되지 않았다면 Embed 렌더 직전에 `await import()`. Code-splitting이 자동으로 됨.

```typescript
async function prepareBundleEmbed(bundle: Bundle): Promise<void> {
  const required = bundle.schema.plugins ?? [];
  for (const pluginId of required) {
    if (!host.hasPlugin(pluginId)) {
      const mod = await import(`@aperi21/plugin-${pluginId}`);
      host.registerPlugin(mod.default);
    }
  }
}
```

**MVP에선 하지 않음.** 번들 사이즈 최적화가 필요해질 때 도입.

### 등록 프로세스

```
registerPlugin(plugin):
  1. 의존성 확인 — requires의 모든 Plugin이 이미 등록되어 있는가
  2. 충돌 확인 — conflicts와 현재 등록된 Plugin이 겹치지 않는가
  3. 프리미티브 타입 네임스페이스 충돌 확인
     - 이미 등록된 타입 이름이 있으면 에러
  4. computeMethods 네임스페이스 충돌 확인
  5. 렌더러 등록
  6. computeMethods 등록
  7. utilities 등록
  8. zHints 등록
  9. onRegister 훅 호출
  10. 등록 완료 로그
```

등록 실패 시 전체 롤백. 부분 등록 상태는 허용하지 않음.

---

## 4. 네임스페이스와 충돌 방지

### 프리미티브 타입 이름

플러그인 간 충돌을 피하기 위해 **전역 유일**해야 한다. 스키마에서 이미 고유 이름을 쓰고 있다:

- Optics: `ray`, `opticalElement`
- Circuit: `circuitElement`, `wire`, `terminal`
- EM: `charge`, `coil`
- Thermo: `container`
- Modern: `energyLevels`

같은 이름을 여러 Plugin이 쓰려고 하면 등록 시 에러.

### ComputeMethod 이름

Plugin 안에서 `method: 'refract'`처럼 문자열 ID로 참조된다. 충돌 방지를 위해 **Plugin이 자기 prefix를 권장**하되 강제하지는 않음:

- EM: `coulomb`, `biot-savart`, `dipole` (이 중 `coulomb`, `gravity`, `uniform`은 호스트 코어 제공)
- Optics: `refract`, `reflect`
- Thermo: `temperature-gradient`
- 커스텀: `custom`

충돌 시 에러, Plugin 제작자가 이름을 바꿔 해결.

### Utility 네임스페이스

Utility는 `host.utilities[pluginId]?.methodName` 형태로 접근. Plugin ID가 이미 고유하므로 자연스럽게 분리:

```typescript
// Bundle에서
import { useHost } from '@aperi21/react';
const host = useHost();
const segments = host.utilities['optics']?.traceRay(origin, direction, elements);
```

---

## 5. 개별 Plugin 설계

### Optics Plugin

**ID**: `@aperi21/plugin-optics`

**제공 프리미티브**: `ray`, `opticalElement`

**제공 계산**:
- `refract(angle, n1, n2)` — 스넬 법칙
- `reflect(vec, normal)` — 반사 법칙

**제공 유틸리티**:
```typescript
utilities: {
  optics: {
    traceRay(params: {
      origin: Vec2;
      direction: Vec2;
      elements: OpticalElement[];
      maxBounces?: number;
      minIntensity?: number;
      wavelength?: number;
    }): { segments: Vec2[]; finalIntensity: number; terminated: 'absorbed' | 'escaped' | 'max-bounces' };

    findImage(object: Vec2, lens: OpticalElement): Vec2 | null;  // 박막 렌즈 공식
    
    focalPoint(lens: OpticalElement): Vec2;
  }
}
```

**왜 유틸리티가 필요한가**: 광선 추적은 기하 계산이 복잡하다. 각 Bundle(ray_tracing, interference, polarization, photoelectric)이 이걸 재구현하면 버그와 불일치가 생긴다. Plugin이 검증된 구현을 제공하고 Bundle은 `scene()`에서 호출만 한다.

**사용 예** (Bundle 내부):
```typescript
scene({ state }) {
  const { segments } = host.utilities.optics.traceRay({
    origin: state.lightSource,
    direction: state.rayDirection,
    elements: state.lenses,
  });
  
  return [
    { type: 'ray', segments, style: { colorRole: 'accent' } },
    ...state.lenses,  // OpticalElement 프리미티브들
  ];
}
```

**z-hints**:
- `opticalElement`: 12 (구조물과 같이)
- `ray`: 22 (궤적 레이어)

**의존성**: 없음

---

### Circuit Plugin

**ID**: `@aperi21/plugin-circuit`

**제공 프리미티브**: `circuitElement`, `wire`, `terminal`

**제공 계산**: 없음 (회로는 필드가 아님)

**제공 유틸리티**:
```typescript
utilities: {
  circuit: {
    // 회로 해석 (Kirchhoff 해석)
    solve(params: {
      elements: CircuitElement[];
      wires: Wire[];
    }): {
      byElement: {
        [id: string]: { current: number; voltage: number; power: number };
      };
      nodeVoltages: { [nodeId: string]: number };
      totalPower: number;
    };

    // 터미널 월드 좌표 계산 (element의 subtype + pos + rotation)
    terminalPosition(element: CircuitElement, terminalName: 'a' | 'b'): Vec2;

    // Wire 경로 자동 라우팅 (Manhattan)
    routeWire(from: Vec2, to: Vec2, obstacles?: Vec2[][]): Vec2[];

    // 토폴로지 검증
    validate(elements: CircuitElement[], wires: Wire[]): {
      errors: string[];
      shorts: string[];
      openCircuits: string[];
    };
  }
}
```

**왜 이렇게 많은가**: 회로 Bundle(dc_circuit, ac_circuit)은 단순 시각화가 아니라 **회로 해석**을 수행해야 한다. Kirchhoff 방정식을 풀어 각 소자의 전류·전압을 계산해야 게이지가 값을 표시할 수 있다. 이걸 Bundle마다 구현하는 건 무의미한 중복.

`solve()`의 구현은 간단한 경우 Nodal Analysis, 복잡한 경우 modified nodal analysis (MNA). MVP는 DC만 지원, AC는 phasor 기반으로 확장.

**Wire 라우팅**: Bundle이 `from: 'R1.a', to: 'R2.b'`로 선언하면 Plugin이 실제 경로(점들의 배열)를 계산. Manhattan 라우팅이 회로도 관습에 맞음. 

**렌더러 특이사항**:
- `circuitElement`의 subtype에 따라 전혀 다른 렌더 (저항 지그재그, 축전기 두 판, 전지 선 두 개 등)
- 회전은 격자 기반(0/90/180/270)만 허용 — 회로도 관습
- 값 라벨 자동 배치

**z-hints**:
- `wire`: 11
- `circuitElement`: 40
- `terminal`: 41 (element 위에)

**의존성**: 없음

---

### EM Plugin

**ID**: `@aperi21/plugin-em`

**제공 프리미티브**: `charge`, `coil`

**제공 계산** (코어와 병행):
- `coulomb-potential(pos, sources)` — 전위
- `biot-savart-straight(pos, wire)` — 직선 전류 자기장
- `biot-savart-loop(pos, loop)` — 원형 전류 자기장
- `dipole-field(pos, dipole)` — 쌍극자장

**참고**: `coulomb`, `gravity`, `uniform`은 **호스트 코어**에서 제공 (자주 쓰이므로). EM Plugin은 EM 특유의 계산만 추가.

**제공 유틸리티**:
```typescript
utilities: {
  em: {
    // Coil의 자기장은 복잡해서 유틸로
    coilField(pos: Vec2, coil: Coil): Vec2;

    // 등전위선 추출
    equipotentialLines(charges: Charge[], levels: number[]): Vec2[][];

    // 전기선속 계산 (가우스 법칙)
    flux(surface: Surface, field: VectorField): number;
  }
}
```

**렌더러 특이사항**:
- `charge`: 크기는 |value|에 비례, 색은 부호(+면 warm, -면 cool)
- `coil`: 원통형 실루엣 + 전류 방향 화살표

**z-hints**:
- `charge`: 40 (Body와 같이)
- `coil`: 40

**의존성**: 없음

---

### Thermodynamics Plugin

**ID**: `@aperi21/plugin-thermo`

**제공 프리미티브**: `container`

**제공 계산**: 없음

**제공 유틸리티**:
```typescript
utilities: {
  thermo: {
    // PV 다이어그램용 사이클 경로 생성
    buildCycle(stages: Array<{
      type: 'isothermal' | 'adiabatic' | 'isobaric' | 'isochoric';
      from: { P: number; V: number };
      to: { P: number; V: number };
      gamma?: number;  // 단열 전용
    }>): { path: Array<{ P: number; V: number }>; efficiency: number };

    // 이상기체 방정식
    idealGas(two_of: { P?; V?; T?; n? }): { P: number; V: number; T: number; n: number };

    // Maxwell-Boltzmann 분포
    speedDistribution(T: number, m: number, v: number): number;
  }
}
```

**렌더러 특이사항**:
- `container`: 벽 두께, 단열재 표현(해칭), 피스톤 위치에 따라 내부 영역 변함
- 기체 분자 렌더는 ParticleSystem으로 처리되므로 container는 "그릇"만

**z-hints**:
- `container`: 10 (구조물)

**의존성**: 없음

---

### Modern Physics Plugin

**ID**: `@aperi21/plugin-modern`

**제공 프리미티브**: `energyLevels`

**제공 계산**: 없음

**제공 유틸리티**:
```typescript
utilities: {
  modern: {
    // 에너지 전이 → 방출/흡수 파장
    transitionWavelength(from: EnergyLevel, to: EnergyLevel): number;  // nm

    // 수소 준위 생성 (Bohr 모형)
    hydrogenLevels(nMax: number): EnergyLevel[];

    // 스펙트럼 라인 그룹 (라이먼·발머·파셴)
    spectrumSeries(type: 'lyman' | 'balmer' | 'paschen', nMax: number): {
      transitions: Array<{ from: number; to: number; wavelength: number }>;
    };
  }
}
```

**렌더러 특이사항**:
- `energyLevels`: 수평선들이 에너지 값에 비례한 y 위치. 전이는 화살표. active 전이는 하이라이트.
- 스펙트럼 라인 렌더는 Graph(style: 'spectrum')로 처리

**z-hints**:
- `energyLevels`: 65 (스크린 오버레이)

**의존성**: 없음

---

## 6. 호스트 코어에 남는 Compute

Plugin이 도메인 특수 계산을 추가한다면, 코어에는 뭘 남길까?

**가장 보편적인 것들**:
- `uniform` — 상수 벡터장 (중력 균일장, 전기 균일장 둘 다 씀)
- `gravity` — 점 중력원 (궤도 번들)
- `coulomb` — 점전하 전기장 (너무 자주 쓰여서 코어. 기술적으로는 EM이지만 예외)
- `superposition` — 여러 compute의 합
- `custom` — 탈출구

**코어에 두는 이유**: 여러 Plugin이 공통으로 쓰거나, Plugin 없이도 쓸 일이 있음.

**Plugin에 두는 이유**: 해당 도메인 특유 (refract는 Optics 전용).

---

## 7. Plugin 테스트 전략

각 Plugin이 **호스트 없이 독립 테스트 가능해야 함**.

### 테스트 유형

1. **유틸리티 함수 테스트** — 순수 함수라 쉬움
   ```typescript
   test('Circuit solver: 직렬 저항', () => {
     const result = circuitPlugin.utilities.circuit.solve({
       elements: [battery(9), resistor(100), resistor(200)],
       wires: [...],
     });
     expect(result.byElement.R1.current).toBeCloseTo(0.03, 3);
   });
   ```

2. **계산 함수 테스트** — 알려진 입력에서 알려진 출력
   ```typescript
   test('Coulomb potential at known point', () => {
     const V = coreCompute.scalar.coulombPotential(
       { method: 'potential-coulomb', sources: ['q1'] },
       1, 0,
       mockScene,
     );
     expect(V).toBeCloseTo(expected);
   });
   ```

3. **렌더러 테스트** — 모의 ctx로 호출해서 명령 캡처
   ```typescript
   test('CircuitElement: 저항 렌더러 호출 순서', () => {
     const mockCtx = createMockRenderContext();
     circuitPlugin.renderers.circuitElement(mockCtx, resistorPrimitive);
     expect(mockCtx.calls).toContainCommand('beginPath');
     // 지그재그 경로 확인
   });
   ```

4. **스냅샷 테스트** — SVG 출력 (렌더 결과를 SVG로 뽑아 비교)

5. **통합 테스트** — 실제 Canvas에 렌더해서 픽셀 비교 (더 무겁지만 회귀 검출에 좋음)

---

## 8. Plugin 패키지 구조

각 Plugin은 독립 npm 패키지. 모노레포 구조:

```
aperi21/
├── packages/
│   ├── host/                          # @aperi21/host
│   ├── schema/                        # @aperi21/schema (타입 정의)
│   ├── plugin-optics/                 # @aperi21/plugin-optics
│   ├── plugin-circuit/                # @aperi21/plugin-circuit
│   ├── plugin-em/                     # @aperi21/plugin-em
│   ├── plugin-thermo/                 # @aperi21/plugin-thermo
│   ├── plugin-modern/                 # @aperi21/plugin-modern
│   ├── bundle-projectile/             # @aperi21/bundle-projectile
│   ├── bundle-oscillation/
│   ├── ... (29개 Bundle)
│   ├── react/                         # @aperi21/react (React 컴포넌트)
│   └── tiptap/                        # @aperi21/tiptap (에디터 플러그인)
```

Plugin 패키지 내부:
```
plugin-optics/
├── src/
│   ├── index.ts                       # Plugin export
│   ├── renderers/
│   │   ├── ray.ts
│   │   └── opticalElement.ts
│   ├── compute/
│   │   ├── refract.ts
│   │   └── reflect.ts
│   ├── utilities/
│   │   ├── traceRay.ts
│   │   └── findImage.ts
│   └── __tests__/
│       ├── traceRay.test.ts
│       └── refract.test.ts
├── package.json
└── tsconfig.json
```

`peerDependencies`로 `@aperi21/host`와 `@aperi21/schema`를 선언 (Plugin이 호스트 버전에 의존).

---

## 9. Plugin 버전 호환성

```typescript
// package.json
{
  "peerDependencies": {
    "@aperi21/schema": "^0.1.0",
    "@aperi21/host": "^0.1.0"
  }
}
```

Host가 Plugin을 등록할 때 schema 버전 호환을 검사:

```typescript
if (!semver.satisfies(plugin.schemaVersion, host.supportedSchemaVersion)) {
  throw new PluginVersionError(...);
}
```

MVP에서는 엄격하지 않게. 1.0 이전에는 breaking change가 자유로워야 함.

---

## 10. Plugin 구현 체크리스트

Plugin별 MVP 완료 기준:

### Optics
- [ ] `ray` 렌더러 (꺾인 선분, 색상은 wavelength 또는 colorRole)
- [ ] `opticalElement` 렌더러 (subtype 6종: mirror-flat/concave/convex, lens-convex/concave, prism 최소)
- [ ] `traceRay` 유틸 (교차점 → 반사/굴절 → 반복)
- [ ] `refract`, `reflect` compute
- [ ] 단위 테스트: 45도 굴절, 오목 거울 결상, 프리즘 분산

### Circuit
- [ ] `circuitElement` 렌더러 (subtype 6종: resistor/battery/capacitor/inductor/switch/ground)
- [ ] `wire` 렌더러 (Manhattan 라우팅)
- [ ] `terminal` 렌더러 (작은 원)
- [ ] `solve` 유틸 (DC 노드 해석)
- [ ] `terminalPosition`, `routeWire`, `validate`
- [ ] 단위 테스트: 직렬 R, 병렬 R, 전지+R, 간단 RC

### EM
- [ ] `charge` 렌더러 (크기·부호)
- [ ] `coil` 렌더러 (원통+전류 방향)
- [ ] `biot-savart-straight` compute
- [ ] `coilField`, `equipotentialLines` 유틸
- [ ] 단위 테스트: 쌍극자 전기장선, 솔레노이드 자기장

### Thermo
- [ ] `container` 렌더러 (벽, 피스톤, 단열재)
- [ ] `buildCycle`, `idealGas`, `speedDistribution` 유틸
- [ ] 단위 테스트: 카르노 사이클 경로, 분자 속도 분포

### Modern
- [ ] `energyLevels` 렌더러 (수평선 + 전이 화살표)
- [ ] `hydrogenLevels`, `transitionWavelength`, `spectrumSeries` 유틸
- [ ] 단위 테스트: 수소 스펙트럼 파장, 발머 계열

---

## 11. Plugin 설계가 호스트에 남기는 요구사항

이 설계를 구현하려면 호스트가 다음을 제공해야 한다:

1. **Plugin 등록 관리** (registerPlugin/unregisterPlugin)
2. **Renderer 레지스트리** (type → renderer 매핑)
3. **Compute 레지스트리** (method name → function)
4. **Utility 레지스트리** (pluginId → utilities object)
5. **버전 호환 검사**
6. **의존성/충돌 해결**
7. **HostAPI 객체 생성 및 Plugin에 전달**
8. **프레임 생명주기 훅 (onFrame 호출)**
9. **에러 격리** — 한 Plugin이 죽어도 다른 것들은 살아야 함

이 9가지가 호스트의 `PluginManager` 서브시스템이다.

---

## 12. 다음 단계

Plugin 설계 완료. 이제 남은 순서:

1. **호스트 구현** (PluginManager + 렌더러 + 컨트롤러 시스템 + 카메라)
2. **코어 Plugin 5개 구현** — 위 체크리스트 기반
3. **첫 Bundle 2-3개 구현** — projectile (이미 설계됨), oscillation, ray_tracing
4. **React 통합 레이어** (`@aperi21/react`) — Embed 컴포넌트
5. **Tiptap 플러그인** — 에디터에서 DSL을 렌더

각 단계가 상당한 작업이다. MVP 정의를 여기서 한번 다시 잡는 게 좋겠다 — 29 Bundle을 다 만들 게 아니라, 뭐부터 만들어서 뭘 검증할지.
