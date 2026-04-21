# aperi21 Scene Graph 프리미티브 — 번들별 역매핑

## 방법

29개 번들을 하나씩 훑으며 "이 번들이 화면에 뭘 그려야 하는가"를 나열하고, 공통된 것을 묶어 프리미티브로 추출했다. 처음 제안한 10여 개에서 검토 결과 **24개 프리미티브 + 2단 구조**가 필요하다는 결론이 나왔다.

---

## 핵심 발견 — 2단 구조가 필요하다

모든 프리미티브를 하나의 평평한 목록으로 두면 두 가지 문제가 생긴다:

1. **도메인 특수성.** 광학의 `Ray`, `Lens`, `Prism`은 다른 어떤 묶음과도 거의 겹치지 않는다. 회로의 `Resistor`, `Battery`, `Wire`도 마찬가지. 이것들을 범용 프리미티브 옆에 나열하면 호스트 코어가 불필요하게 커진다.

2. **확장성.** 새 도메인(예: 유체역학 심화, 플라즈마)이 추가될 때마다 코어를 수정해야 한다.

**해법: 코어 + 도메인 플러그인 구조.**

- **코어 프리미티브**: 여러 묶음에서 공유되는 범용 요소 (Body, Vector, Field, Wave, Graph 등)
- **도메인 플러그인**: 특정 분야 전용 프리미티브 (Optics, Circuit, Fluids 확장)
- 번들은 자기가 필요한 플러그인을 선언하고, 호스트가 동적으로 로드

---

## 코어 프리미티브 (16개)

범용. 여러 번들이 공유함.

### 운동 & 힘 (Kinematics & Forces)

| 이름 | 설명 | 주요 속성 |
|------|------|----------|
| **Body** | 질점 또는 강체 | pos, shape (point/circle/rect/disc/rod), size, mass, orientation |
| **Trajectory** | 시간 경로 | points[], style (solid/dashed/fading) |
| **Vector** | 단일 벡터 (속도·힘·운동량) | from, delta, label, color |
| **Constraint** | 연결·구속 | type (rigid_rod/string/spring), from, to, stiffness |
| **Surface** | 평면·경사면·곡면·벽 | geometry, material hint |
| **Axis** | 회전축 또는 좌표축 | origin, direction, length |

### 장 (Fields)

| 이름 | 설명 | 주요 속성 |
|------|------|----------|
| **VectorField** | 벡터장 (전기장·자기장·유동장) | gridFn(x,y)→[vx,vy], density, style |
| **ScalarField** | 스칼라장 (전위·온도·압력·확률) | gridFn(x,y)→v, colormap, range |
| **FieldLine** | 장선 / 유선 (적분 곡선) | seed, fieldRef, length |

### 파동 (Waves)

| 이름 | 설명 | 주요 속성 |
|------|------|----------|
| **Wave** | 1D/2D 파동 | dimension, wavelength, amplitude, phase, boundary |
| **Emitter** | 파원·광원 | pos, frequency, phase, amplitude |

### 집단 (Collective)

| 이름 | 설명 | 주요 속성 |
|------|------|----------|
| **ParticleSystem** | 다수 입자 (분자·광자·샘플) | count, positions[], velocities[], colorFn |

### 데이터 뷰 (Data Views)

| 이름 | 설명 | 주요 속성 |
|------|------|----------|
| **Graph** | 2D 좌표 그래프 (선·바·히스토그램·페이저) | style, xAxis, yAxis, series[] |
| **Gauge** | 수치 표시 계기 | value, range, unit, label |
| **Marker** | 라벨·화살표 주석·측정 눈금 | pos, text, icon |

### 이벤트 (Events)

| 이름 | 설명 | 주요 속성 |
|------|------|----------|
| **Event** | 순간 시각 효과 (충돌·방출·붕괴 flash) | pos, kind, duration |

---

## 도메인 플러그인 프리미티브

도메인 내에서만 의미가 있는 요소들. 해당 플러그인을 로드한 번들만 사용.

### Optics 플러그인 (2개)

| 이름 | 설명 |
|------|------|
| **Ray** | 광선 (반사·굴절 시 꺾이는 직선 세그먼트 체인) |
| **OpticalElement** | 렌즈·거울·프리즘·슬릿·스크린 (subtype으로 구분) |

### Circuit 플러그인 (3개)

| 이름 | 설명 |
|------|------|
| **CircuitElement** | 저항·전지·축전기·인덕터·스위치 (subtype) |
| **Wire** | 회로 연결선 (경로 기반, 라우팅 자동 가능) |
| **Terminal** | 연결점 (노드) |

### EM 플러그인 (2개)

| 이름 | 설명 |
|------|------|
| **Charge** | 대전체 (+/-, 크기·위치, 장 생성원) |
| **Coil** | 코일 (전자기 유도 — 3D 코일의 2D 표현) |

### Thermodynamics 플러그인 (1개)

| 이름 | 설명 |
|------|------|
| **Container** | 용기·피스톤 (기체 상자) |

### Modern 플러그인 (1개)

| 이름 | 설명 |
|------|------|
| **EnergyLevels** | 에너지 준위 다이어그램 |

**도메인 프리미티브 합계: 9개**

**전체 합계: 코어 16 + 도메인 9 = 25개**

---

## 번들별 요구 프리미티브 매핑

### 역학 (Mechanics)

| 번들 | 요구 프리미티브 | 플러그인 | 비고 |
|------|---------------|---------|------|
| **projectile** | Body, Trajectory, Vector, Surface | — | v3 데모 구현됨. 기본 코어만. |
| **oscillation** | Body, Constraint (string/spring), Trajectory, Vector | — | Constraint의 subtype이 핵심 — 진자는 string, 용수철은 spring, 물리 진자는 rigid_rod. |
| **circular_motion** | Body, Trajectory (원), Vector, Constraint, Axis | — | 원운동은 Constraint로 "고정된 반지름"을 강제. |
| **central_force_orbit** | Body (두 개, 다른 스케일), Trajectory, Vector, VectorField (중력장, 선택적) | — | 중심 질량 vs 위성의 시각적 차이 중요. |
| **collision** | Body (여러), Vector, Trajectory, Event (충돌 순간 flash) | — | Event 프리미티브가 교육적으로 유용. |
| **inclined_plane** | Body, Surface (경사면), Vector (수직항력·마찰·중력·합력) | — | Surface가 반드시 필요. |
| **rigid_rotation** | Body (rod/disc shape), Axis, Vector (각속도·토크) | — | Body의 shape 속성이 강체 표현의 핵심. |

### 파동·진동 (Waves)

| 번들 | 요구 프리미티브 | 플러그인 | 비고 |
|------|---------------|---------|------|
| **wave_1d** | Wave (1D), Emitter, Marker (마디·배) | — | 경계 조건은 Wave의 boundary 속성. |
| **wave_2d** | Wave (2D), Emitter, ScalarField (강도) | — | 2D Wave는 ScalarField와 경계가 모호 — 설계 필요. |
| **interference** | Wave (2D), Emitter, ScalarField (간섭 패턴), OpticalElement (슬릿·스크린), Graph (강도 프로파일) | Optics | 슬릿·스크린은 광학 플러그인 공유. |
| **fourier_synthesis** | Wave (1D, 여러 개), Graph (합성 파형) | — | 고조파별 Wave를 합성하는 시각화. |

### 광학 (Optics)

| 번들 | 요구 프리미티브 | 플러그인 | 비고 |
|------|---------------|---------|------|
| **ray_tracing** | Ray, OpticalElement (렌즈·거울·프리즘), Body (광원·물체·상), Marker | Optics | 시간 축이 없는 정적 기하 — 다른 구조. |
| **polarization** | Wave (polarization state 메타), OpticalElement (편광자), Vector (편광 방향) | Optics | 편광은 Wave의 확장 속성으로 처리. |

### 열역학 (Thermodynamics)

| 번들 | 요구 프리미티브 | 플러그인 | 비고 |
|------|---------------|---------|------|
| **ideal_gas** | Container, Graph (PV 다이어그램), Gauge (P·V·T) | Thermo | PV 다이어그램이 사실상 주연 뷰. |
| **kinetic_theory** | ParticleSystem, Container, Graph (속도 분포 히스토그램) | Thermo | 다수 입자 성능이 관건. |
| **heat_transfer** | ScalarField (온도 분포), Surface (재료 경계), VectorField (대류 흐름, 선택적) | — | 격자 기반 연속체 시뮬레이션. |
| **heat_engine** | Container, Graph (PV 사이클), Gauge (효율) | Thermo | 사이클 애니메이션. |

### 전자기 (Electromagnetism)

| 번들 | 요구 프리미티브 | 플러그인 | 비고 |
|------|---------------|---------|------|
| **electric_field** | Charge, VectorField, FieldLine, ScalarField (전위) | EM | Charge가 장의 생성원. |
| **dc_circuit** | CircuitElement, Wire, Terminal, Gauge | Circuit | 완전히 다른 시각 언어. |
| **ac_circuit** | CircuitElement, Wire, Terminal, Graph (파형·페이저) | Circuit | DC와 같은 프리미티브 + Graph. |
| **magnetic_field** | Charge (운동 중), VectorField, FieldLine, Coil, Body (자석) | EM | Coil 프리미티브 필요. |
| **em_induction** | Coil, Body (자석), Vector (자속), Graph (유도 전류) | EM | Coil + Graph. |
| **charged_particle** | Body (입자), Trajectory, Vector, VectorField (E, B) | EM | 기본 코어 + EM. |

### 유체 (Fluids)

| 번들 | 요구 프리미티브 | 플러그인 | 비고 |
|------|---------------|---------|------|
| **hydrostatics** | Body, Container, ScalarField (압력 분포), Vector (부력·중력), Gauge | — | 기본 코어로 커버. |
| **fluid_flow** | VectorField (유동), FieldLine (유선), Surface (관 벽), Gauge (속도·압력) | — | FieldLine으로 streamline 표현. |

### 현대물리 (Modern Physics)

| 번들 | 요구 프리미티브 | 플러그인 | 비고 |
|------|---------------|---------|------|
| **atomic_spectrum** | EnergyLevels, Event (전이 이벤트), Graph (스펙트럼), Emitter (광자) | Modern | 에너지 준위가 주연. |
| **radioactive_decay** | ParticleSystem (원자), Event (붕괴), Graph (지수 감소) | — | ParticleSystem + Graph. |
| **photoelectric** | Body (금속·전자), Emitter (광자), Event (방출), Vector, Graph (진동수-KE) | — | 이산 이벤트 시각화. |
| **wave_particle_duality** | ParticleSystem, Wave, ScalarField (누적 확률), OpticalElement (슬릿) | Optics | 간섭의 입자 버전. |

---

## 프리미티브 사용 빈도 통계

**코어 프리미티브별 사용 번들 수** (중복 계산):

| 프리미티브 | 사용 번들 수 | 비고 |
|-----------|------------|------|
| Body | 17 | 가장 기본적 |
| Vector | 14 | 힘·속도 시각화 |
| Trajectory | 11 | 시간 경로 |
| Graph | 11 | 데이터 뷰의 핵심 |
| VectorField | 7 | EM·유체 중심 |
| ScalarField | 6 | 장·분포 |
| ParticleSystem | 4 | 다체 전용 |
| Wave | 5 | 파동 전용 |
| Constraint | 3 | 진동·원운동 |
| Surface | 5 | 경사면·벽·경계 |
| Emitter | 5 | 파원·광원 |
| Event | 4 | 이산 순간 |
| FieldLine | 4 | 장선·유선 |
| Marker | 대부분 | 주석·라벨 |
| Gauge | 5 | 수치 표시 |
| Axis | 2 | 회전축 |

**도메인 프리미티브별 사용 번들 수**:

| 프리미티브 | 플러그인 | 사용 번들 |
|-----------|---------|----------|
| Ray | Optics | 1 (ray_tracing) |
| OpticalElement | Optics | 3 (ray_tracing, interference, polarization, duality) |
| CircuitElement | Circuit | 2 (dc, ac) |
| Wire | Circuit | 2 |
| Terminal | Circuit | 2 |
| Charge | EM | 3 |
| Coil | EM | 2 |
| Container | Thermo | 3 |
| EnergyLevels | Modern | 1 (atomic_spectrum) |

---

## 중요한 관찰들

### 1. Graph가 생각보다 자주 쓰인다
11개 번들이 Graph를 요구. PV 다이어그램, 에너지 바, 히스토그램, 스펙트럼, 페이저, 지수 감소 — 전부 2D 좌표 그래프의 변종이다. **단일 Graph 프리미티브에 여러 `style`로 통합하는 것이 맞다** (bar / line / scatter / phasor / histogram). 각각 따로 만들면 중복.

### 2. Wave와 ScalarField의 경계가 모호
2D 파동 전파는 "파동"이지만 시각적으로는 "시간 변하는 스칼라장"과 구별이 어렵다. 1D Wave는 명확한 프리미티브지만, 2D Wave는 ScalarField의 animated 특수 경우로 통합 가능. **설계 결정 필요**: 통합 / 분리 / 상속.

### 3. Field / FieldLine / Charge의 결합
EM 플러그인의 Charge, 코어의 VectorField, FieldLine은 사실상 하나의 시스템이다. Charge들이 VectorField를 생성하고, FieldLine이 그 장을 따라 그려진다. **이것들이 서로 참조 가능해야 한다** — "이 FieldLine은 이 Charge들의 전기장을 따라간다."

### 4. 회로와 광학은 "거의 섬"
dc/ac 회로가 쓰는 프리미티브(CircuitElement, Wire, Terminal)는 다른 어디에도 안 나온다. 광학의 Ray, OpticalElement도 거의 고립. **플러그인 분리의 타당성이 명확히 드러남.** 이 두 분야는 코어와 분리된 렌더링 파이프라인을 가져도 됨.

### 5. Event 프리미티브의 중요성
충돌, 방출, 붕괴, 전이 — 이산 순간의 시각 효과는 여러 번들에서 필요하다. 이걸 각 번들이 자체 구현하게 두면 시각적 일관성이 깨진다. **Event는 코어에 유지**.

### 6. ParticleSystem은 성능적으로 구별된다
Body를 수백 개 인스턴스화하는 것과 ParticleSystem은 기능적으로 같아 보이지만, 렌더링 구현이 다르다 (batch/instanced rendering). 프리미티브 수준에서 분리하는 것이 맞다.

### 7. 시간 모델이 없는 번들이 있다
`ray_tracing`, `electric_field`, `hydrostatics`는 시간 축이 없다. `step()`이 호출되지 않거나, 호출되어도 상태가 바뀌지 않는 "정적 Bundle". 호스트의 런타임이 이 경우를 특수 처리해야 함 — 시간 컨트롤 UI 숨김, 재계산은 파라미터 변경 시에만.

---

## 잔여 설계 문제

이 매핑을 완료하면서도 아직 답이 안 나온 것들:

### A. Wave 2D를 별도 프리미티브로 둘까, ScalarField로 흡수할까
실용적으로는 **분리** 쪽이 나아 보인다. Wave는 "주파수·파장·위상"이라는 고유 파라미터를 갖고, 수면파 vs 온도장은 시각적 표현이 다르다. 호스트가 Wave를 알면 파원·파장·위상으로부터 자동으로 ScalarField를 생성해줄 수 있음.

### B. 프리미티브들 간의 "참조" 구조
Charge → VectorField → FieldLine은 데이터 흐름이 있다. 이걸 Scene Graph 레벨에서 어떻게 표현할지 — 단순 병렬 배열이 아니라 참조 관계가 필요. 제안:

```typescript
{ id: 'q1', type: 'charge', pos: [0,0], value: +1 }
{ id: 'q2', type: 'charge', pos: [2,0], value: -1 }
{ type: 'vectorField', source: 'computed-from:q1,q2' }
{ type: 'fieldLine', seed: [1,0.5], source: 'ref:vectorField' }
```

ID 기반 참조 시스템. 이건 복잡도를 높이지만 EM 번들의 정직한 표현을 가능하게 함.

### C. CircuitElement의 내부 계층
회로는 소자별로 시각 표현이 완전히 다르다 (저항은 지그재그, 축전기는 두 판, 전지는 긴 선/짧은 선). CircuitElement를 **단일 프리미티브의 subtype**으로 둘지, **각 소자를 독립 프리미티브**로 둘지 결정 필요. 내 직감은 subtype — 호스트가 switch-case로 렌더링.

### D. 접근성 & 라벨링
모든 프리미티브가 `label`, `aria-description` 같은 메타를 받아야 함. 이건 호스트 차원에서 일관되게 강제. 설계 원칙으로 박아두기.

---

## 다음 단계 제안

이 매핑을 근거로 다음 중 하나를 진행할 수 있다:

1. **Scene Graph TypeScript 스키마 작성.** 25개 프리미티브를 discriminated union으로 정의. 호스트의 타입 시스템 출발점.

2. **호스트 코어 렌더러의 대략 스펙.** 어떤 프리미티브를 어떻게 렌더할지, 어떤 것들이 애니메이션 가능한지, 좌표계·스케일·테마를 어떻게 관리할지.

3. **첫 번들(projectile)을 이 Scene Graph 모델로 다시 작성.** v3 데모가 명령형 Canvas 그리기였는데, Scene Graph 방식으로 전환하면 실제 복잡도 감각이 잡힌다. 계약이 Bundle 하나에서 먼저 검증됨.

4. **잔여 설계 문제 4개(A/B/C/D) 결정.** 다음 구현에 직접 영향.

어느 것부터 갈까?
