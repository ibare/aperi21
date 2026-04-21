# aperi21 설계 결정 #01 — Scene Graph 잔여 문제

프리미티브 매핑 과정에서 미결로 남았던 네 가지 문제에 대한 결정. 이 결정들이 확정되어야 TypeScript 스키마와 첫 번들 구현이 일관되게 진행된다.

---

## 결정 A — Wave 2D와 ScalarField의 관계

### 문제

2D 파동(수면파, 2D 음파)은 시각적으로 "시간에 따라 변하는 스칼라장"처럼 보인다. `wave_2d`, `interference`, `wave_particle_duality` 번들에서 둘의 경계가 모호했다. 통합할지 분리할지, 아니면 상속 관계로 둘지.

### 고려한 대안

1. **Wave를 ScalarField의 특수 경우로 흡수.** 2D Wave는 `ScalarField` + animated 속성. 장점: 프리미티브 수 절감, 렌더링 파이프라인 단일화. 단점: Bundle 작성자가 매번 파원 식·경계 조건·중첩을 손으로 짜야 함.

2. **Wave를 독립 프리미티브로 분리.** 고유 파라미터(파장·주파수·위상·속도·경계)를 가짐. 호스트가 이것들로부터 자동 계산. 장점: Bundle이 간결. 단점: 프리미티브 수 증가.

3. **Wave가 내부적으로 ScalarField로 변환되는 파이프라인.** 바깥에서는 분리된 프리미티브지만, 호스트 내부 렌더링은 공유.

### 결정

**대안 3 — Wave는 독립 프리미티브로 유지, 내부적으로 ScalarField로 변환되는 파이프라인.**

Bundle은 파동의 물리적 파라미터로 선언:

```typescript
{
  type: 'wave',
  dimension: '2d',
  sources: [
    { pos: [0, 0], frequency: 2, phase: 0, amplitude: 1 },
    { pos: [3, 0], frequency: 2, phase: 0, amplitude: 1 },
  ],
  speed: 1,
  time: state.t,
  boundary: 'absorbing',  // or 'reflecting', 'periodic'
}
```

호스트는 내부적으로:
- 각 파원으로부터 파동을 계산
- 중첩 원리로 합산
- ScalarField 렌더 파이프라인 활용 (colormap, 격자 해상도)

이러면 Bundle 작성자는 물리적 언어로 말하고, 호스트는 구현 자유도를 가진다. 간섭·회절·도플러 효과도 같은 `wave` 프리미티브로 표현 가능 — 파원이 움직이면 도플러, 슬릿이 있으면 `OpticalElement`와 조합.

### 영향

- Wave 프리미티브의 스키마가 복잡해짐 (sources 배열, boundary)
- 호스트에 `wavePipeline` 모듈 추가 필요
- ScalarField는 여전히 독립적으로 임의 스칼라 분포용 (온도·전위·확률)
- 1D Wave는 같은 프리미티브의 `dimension: '1d'`로 통합

---

## 결정 B — 프리미티브 간 참조 구조

### 문제

EM 번들에서 Charge들이 VectorField를 생성하고, FieldLine이 그 장을 따라간다. 이런 데이터 흐름을 Scene Graph에서 어떻게 표현할지. 단순 병렬 배열로는 부족하다.

### 고려한 대안

1. **암묵적 위치 기반 참조.** "같은 Scene 안의 모든 Charge가 VectorField에 기여". 간편하지만 통제력 없음 — 일부 전하만 골라 쓸 수 없음.

2. **함수 클로저 참조.** VectorField에 JavaScript 함수를 주입. 자유도 최고, 그러나 호스트 최적화 불가능 · 직렬화 불가능 · 테스트 불가능.

3. **ID 기반 선언적 참조 + 호스트 표준 계산.** 프리미티브에 `id`를 주고, 참조 프리미티브가 ID로 연결. 계산 방법은 `compute.method: 'coulomb'` 같은 호스트 내장 함수 이름으로 지정.

### 결정

**대안 3 — ID 기반 선언적 참조 + 표준 계산 라이브러리.**

```typescript
scene(state) {
  return [
    { id: 'q1', type: 'charge', pos: [0, 0], value: +1 },
    { id: 'q2', type: 'charge', pos: [2, 0], value: -1 },
    {
      id: 'eField',
      type: 'vectorField',
      compute: { method: 'coulomb', sources: ['q1', 'q2'] },
    },
    {
      type: 'fieldLine',
      seed: [1, 0.5],
      follows: 'eField',
      length: 100,
    },
  ];
}
```

호스트가 제공하는 **표준 계산 라이브러리** (MVP에서 시작):
- `coulomb` — 점전하 전기장
- `biot-savart` — 전류 요소의 자기장
- `dipole` — 쌍극자장
- `gravity` — 중력장 (점 중력원)
- `uniform` — 균일장 (상수 벡터)
- `superposition` — 위 방법들의 합

**탈출구 — 커스텀 계산.** 표준 라이브러리로 안 되는 경우:

```typescript
{
  id: 'customField',
  type: 'vectorField',
  compute: {
    method: 'custom',
    fn: (x, y, scene) => [vx, vy],
  },
}
```

커스텀 함수는 호스트가 샘플링 시에만 호출. 직렬화는 포기하지만 나머지(최적화·테스트)는 부분 가능.

### 영향

- 모든 프리미티브가 `id?: string`을 공통 메타로 가짐 (결정 D 참조)
- 호스트에 `compute` 모듈 필요 — 표준 계산 함수들의 레지스트리
- Scene Graph가 JSON 직렬화 가능 (표준 계산만 쓰면) — 향후 테스트·저장·재현성에 유리
- FieldLine은 VectorField를 참조하므로 렌더 순서가 중요해짐. 호스트가 의존성 그래프로 정렬해야 함

---

## 결정 C — CircuitElement의 내부 계층

### 문제

저항·축전기·전지·인덕터는 시각적 표현이 완전히 다르다. 이걸 subtype으로 묶을지, 각각을 독립 프리미티브로 둘지.

### 고려한 대안

1. **각 소자를 독립 프리미티브로.** `resistor`, `battery`, `capacitor`, `inductor`, `switch` 각각. 장점: 타입 엄격. 단점: Wire 연결 로직이 모든 소자 타입을 알아야 함.

2. **단일 CircuitElement + subtype.** 하나의 프리미티브 안에서 `subtype` 속성으로 분기. 공통 구조(두 터미널, 값, 배치)는 공유, 시각적 표현만 subtype별로.

### 결정

**대안 2 — 단일 `circuitElement` + `subtype` 속성.**

```typescript
{
  id: 'R1',
  type: 'circuitElement',
  subtype: 'resistor',  // resistor | battery | capacitor | inductor | switch | ground
  pos: [2, 3],
  rotation: 0,  // 0, 90, 180, 270
  value: 100,
  unit: 'Ω',
  label: 'R₁',
}
```

**근거:**
- 모든 2-단자 소자가 공통 골격을 공유 (두 터미널, 위치, 회전, 값)
- 터미널 좌표는 subtype + rotation으로 호스트가 자동 계산 — Bundle이 신경 쓸 필요 없음
- Wire 연결 로직이 단일화됨: `Wire`는 `{ from: 'R1.a', to: 'B1.+' }`처럼 소자 ID + 터미널 이름만 참조
- 새 소자 추가 비용 = subtype 하나 추가 + 렌더러에 그리기 함수 하나

**3-단자 이상 소자 (트랜지스터, OP-amp)는?** 별도 `multiTerminalElement` 프리미티브로 둔다. 회로 플러그인이 나중에 확장.

### 영향

- Circuit 플러그인에 단 세 개의 프리미티브: `circuitElement`, `wire`, `terminal`
- 호스트가 subtype별 렌더 함수 레지스트리 유지
- 회로 토폴로지는 Wire들의 `from`/`to` 참조로 그래프 재구성 가능 — 시뮬레이션 엔진(Kirchhoff 해석)이 이 그래프를 소비

---

## 결정 D — 공통 메타 필드

### 문제

모든 프리미티브가 label·접근성·강조·테마 오버라이드를 받아야 한다. 이것들을 프리미티브별로 따로 정의하면 일관성이 깨진다.

### 결정

**모든 프리미티브는 `BaseMeta`를 공통으로 상속한다.**

```typescript
interface BaseMeta {
  // 참조
  id?: string;

  // 표시
  label?: LocalizedText;        // 사용자 가시
  description?: LocalizedText;  // 접근성 (스크린 리더)

  // 상태
  hidden?: boolean;              // 시각 숨김, 데이터 유지
  highlight?: HighlightState;    // 'normal' | 'focused' | 'dimmed' | 'warning'

  // 스타일 (제한적)
  style?: {
    colorRole?: ColorRole;       // 'primary' | 'secondary' | ...
    emphasis?: 'strong' | 'medium' | 'subtle';
  };

  // 그룹화
  tags?: string[];
}

type LocalizedText = string | { [lang: string]: string } | `@i18n:${string}`;
type HighlightState = 'normal' | 'focused' | 'dimmed' | 'warning';
type ColorRole = 'primary' | 'secondary' | 'accent' | 'muted' | 'positive' | 'negative';
```

### 각 필드의 근거

**`id`**: 결정 B의 참조 시스템을 위해 필수. 프리미티브의 자체 정체성보다는 다른 프리미티브가 나를 참조할 수 있게 하는 용도.

**`label` / `description`**: 세 가지 입력 방식 허용
- `"속도"` — 단일 문자열, 현재 언어로 가정
- `{ ko: "속도", en: "Velocity" }` — 인라인 다국어
- `"@i18n:physics.velocity"` — i18n 키 참조 (호스트가 해석)

Bundle이 간단할 때는 인라인, 다국어 번들은 i18n 키. 호스트는 현재 언어 설정에 따라 자동 해석.

**`highlight`**: 교육적 시나리오에서 "지금 이 요소에 주목"을 표현. 글이 "여기서 vy에 집중해보자"고 말할 때 해당 Vector에 `highlight: 'focused'`를 주면 나머지는 자동 dim.

**`style.colorRole`**: **직접 색상값(`#FF0000`) 금지.** 역할 기반만 허용. 이래야 다크/라이트 테마 전환 시 일관성이 깨지지 않음. 6가지 역할이 충분 — 더 필요하면 그때 추가.

**`tags`**: 필터링용. "모든 힘 벡터를 숨겨라" 같은 일괄 작업. Bundle이 `tags: ['force', 'gravity']` 식으로 분류.

### 영향

- 모든 프리미티브 타입이 `extends BaseMeta`
- 호스트가 BaseMeta를 일관되게 처리 (렌더 전 공통 파이프라인)
- 테마 엔진은 `colorRole`만 보면 됨 — 실제 색상은 현재 테마에서 lookup
- i18n 시스템이 `@i18n:` prefix를 자동 해석

---

## 결정들의 상호작용

네 결정이 서로를 지탱한다:

- **결정 D의 `id`** 가 **결정 B의 참조 시스템**을 가능하게 함
- **결정 A의 Wave 파이프라인**이 내부적으로 ScalarField 렌더를 쓰지만, Bundle 작성자는 Wave 언어로만 말함 → Bundle 간결성
- **결정 C의 subtype 접근**이 **결정 D의 BaseMeta**와 결합해 회로 소자가 자동 라벨·테마 통합
- **결정 B의 표준 계산 라이브러리**가 Bundle의 함수 작성 부담을 줄여 선언성 유지

---

## Bundle 작성 경험 미리보기

이 결정들이 확정되었을 때 Bundle 코드가 어떻게 보이는지 미리 확인.

**포물선 (이미 가장 단순한 경우)**

```typescript
scene(state) {
  return [
    { id: 'trail', type: 'trajectory', points: state.history, style: { colorRole: 'primary' } },
    { id: 'ball', type: 'body', pos: [state.x, state.y], shape: 'circle', size: 0.3 },
    { type: 'vector', from: [state.x, state.y], delta: [state.vx, 0],
      label: { ko: 'vₓ', en: 'vₓ' }, style: { colorRole: 'secondary' } },
    { type: 'vector', from: [state.x, state.y], delta: [0, state.vy],
      label: { ko: 'vᵧ', en: 'vᵧ' }, style: { colorRole: 'accent' } },
    { type: 'surface', geometry: 'ground-plane' },
  ];
}
```

**전기장 (참조 시스템 활용)**

```typescript
scene(state) {
  const charges = state.charges.map((c, i) => ({
    id: `q${i}`,
    type: 'charge',
    pos: c.pos,
    value: c.value,
    label: { ko: `전하 ${i+1}`, en: `Charge ${i+1}` },
  }));

  return [
    ...charges,
    {
      id: 'field',
      type: 'vectorField',
      compute: { method: 'coulomb', sources: charges.map(c => c.id) },
    },
    ...state.fieldLineSeeds.map(seed => ({
      type: 'fieldLine',
      seed,
      follows: 'field',
      length: 80,
    })),
  ];
}
```

**DC 회로 (도메인 플러그인)**

```typescript
scene(state) {
  return [
    { id: 'B1', type: 'circuitElement', subtype: 'battery',
      pos: [0, 0], value: 9, unit: 'V', label: 'B₁' },
    { id: 'R1', type: 'circuitElement', subtype: 'resistor',
      pos: [2, 0], value: 100, unit: 'Ω', label: 'R₁' },
    { id: 'R2', type: 'circuitElement', subtype: 'resistor',
      pos: [2, 2], value: 200, unit: 'Ω', label: 'R₂' },
    { type: 'wire', from: 'B1.+', to: 'R1.a' },
    { type: 'wire', from: 'R1.b', to: 'R2.a' },
    { type: 'wire', from: 'R2.b', to: 'B1.-' },
  ];
}
```

세 예시 모두 **선언적**이고, 코드 없이 데이터만으로 구조가 읽힌다. JSON으로 직렬화 가능. 이게 결정들의 목표였던 상태.

---

## 다음 단계

네 개 결정이 확정되었다. 이를 기반으로:

**다음 → Scene Graph TypeScript 스키마 작성.**

- 25개 프리미티브의 discriminated union
- BaseMeta 및 공통 타입 정의
- Bundle 인터페이스 (schema, step, scene, views, controllers, initialState)
- Plugin 인터페이스
- 호스트가 소비하는 타입 경계

스키마가 완성되면 그것을 컴파일러 삼아 **포물선 번들을 Scene Graph 모델로 재작성**한다.
