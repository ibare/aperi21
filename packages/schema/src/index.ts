// ========================================================================
// aperi21 Scene Graph TypeScript Schema
// ========================================================================
// 25개 프리미티브 + Bundle/Plugin 인터페이스.
// 설계 결정 #01 을 기반으로 구축.
// ========================================================================


// ========================================================================
// 0. 기본 타입
// ========================================================================

/** 2D 좌표. 월드 단위 (미터). 나중에 3D 확장 시 별도 타입. */
export type Vec2 = readonly [number, number];

/** 스케일링된 값 또는 그 함수. */
export type Scalar = number;

/** 색 역할 — 직접 색상값(#FF0000)은 허용되지 않음. 테마가 해석. */
export type ColorRole =
  | 'primary'    // 현상의 주 대상 (공, 추, 전하)
  | 'secondary'  // 보조 요소 (궤적, 보조선)
  | 'accent'     // 강조 (중요 벡터, 결과값)
  | 'muted'      // 배경 정보
  | 'positive'   // 에너지 증가, 인력
  | 'negative';  // 에너지 손실, 척력

/** 강조 상태. 글의 포커스에 맞춰 번들이 설정. */
export type HighlightState = 'normal' | 'focused' | 'dimmed' | 'warning';

/** 다국어 텍스트 — 세 가지 입력 방식. */
export type LocalizedText =
  | string                            // 'velocity' — 현재 언어
  | { [lang: string]: string }        // { ko: '속도', en: 'velocity' }
  | `@i18n:${string}`;                // '@i18n:physics.velocity' — i18n 키

/** 모든 프리미티브가 상속하는 공통 메타 필드. */
export interface BaseMeta {
  id?: string;
  label?: LocalizedText;
  description?: LocalizedText;
  hidden?: boolean;
  highlight?: HighlightState;
  style?: {
    colorRole?: ColorRole;
    emphasis?: 'strong' | 'medium' | 'subtle';
  };
  tags?: readonly string[];
}


// ========================================================================
// 1. 코어 프리미티브 — Kinematics & Forces
// ========================================================================

export interface Body extends BaseMeta {
  type: 'body';
  pos: Vec2;
  shape?: 'point' | 'circle' | 'rect' | 'disc' | 'rod' | 'custom';
  size?: Scalar | Vec2;          // circle/disc: 반지름, rect: [w, h]
  orientation?: number;           // 라디안
  mass?: Scalar;                  // 정보용 (시각에만 반영될 수 있음)
  customPath?: string;            // shape='custom'일 때 SVG path
}

export interface Trajectory extends BaseMeta {
  type: 'trajectory';
  points: readonly Vec2[];
  style?: BaseMeta['style'] & {
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    fade?: 'none' | 'tail' | 'head';  // 시간 흐름 표현
  };
  closed?: boolean;               // 닫힌 궤적 (궤도)
}

export interface Vector extends BaseMeta {
  type: 'vector';
  from: Vec2;
  delta: Vec2;                    // 끝점 = from + delta
  showMagnitude?: boolean;
  headSize?: Scalar;
}

export interface Constraint extends BaseMeta {
  type: 'constraint';
  subtype: 'rigid_rod' | 'string' | 'spring' | 'rail';
  from: Vec2 | string;            // 좌표 또는 Body ID
  to: Vec2 | string;
  naturalLength?: Scalar;          // spring 전용
  stiffness?: Scalar;              // spring 전용 (정보용)
  coils?: number;                  // spring 시각 표현용
}

export interface Surface extends BaseMeta {
  type: 'surface';
  geometry:
    | { kind: 'ground'; y?: Scalar }                                    // 바닥 무한 평면
    | { kind: 'incline'; origin: Vec2; angle: number; length: Scalar }  // 경사면
    | { kind: 'wall'; from: Vec2; to: Vec2 }                            // 일반 선분
    | { kind: 'arc'; center: Vec2; radius: Scalar; from: number; to: number };
  material?: 'solid' | 'rough' | 'smooth' | 'transparent';
}

export interface Axis extends BaseMeta {
  type: 'axis';
  origin: Vec2;
  direction: Vec2;                 // 정규화 벡터
  length?: Scalar;
  showArrow?: boolean;
}


// ========================================================================
// 2. 코어 프리미티브 — Fields
// ========================================================================

/** 벡터장의 계산 방식. 표준 방법 + 커스텀 탈출구. */
export type FieldCompute =
  | { method: 'coulomb'; sources: string[] }           // 전하 ID 배열
  | { method: 'biot-savart'; sources: string[] }        // 전류 요소 ID 배열
  | { method: 'dipole'; source: string }
  | { method: 'gravity'; sources: string[] }            // 점 중력원
  | { method: 'uniform'; vector: Vec2 }
  | { method: 'superposition'; components: FieldCompute[] }
  | { method: 'custom'; fn: (x: number, y: number, scene: SceneGraphRefs) => Vec2 };

export interface VectorField extends BaseMeta {
  type: 'vectorField';
  compute: FieldCompute;
  density?: number;                // 격자 밀도 (기본값은 호스트)
  arrowStyle?: 'uniform' | 'magnitude-scaled';
  colorByMagnitude?: boolean;
}

/** 스칼라장 계산 방식. */
export type ScalarCompute =
  | { method: 'potential-coulomb'; sources: string[] }
  | { method: 'gaussian'; center: Vec2; sigma: number; amplitude: number }
  | { method: 'grid'; data: number[][]; origin: Vec2; cellSize: number }
  | { method: 'custom'; fn: (x: number, y: number, scene: SceneGraphRefs) => number };

export interface ScalarField extends BaseMeta {
  type: 'scalarField';
  compute: ScalarCompute;
  colormap?: 'diverging' | 'sequential' | 'thermal' | 'probability';
  range?: [number, number];
  contours?: boolean;              // 등고선 표시
}

export interface FieldLine extends BaseMeta {
  type: 'fieldLine';
  seed: Vec2;
  follows: string;                 // VectorField ID
  length?: number;                 // 추적 길이
  direction?: 'forward' | 'backward' | 'both';
  step?: number;                   // 적분 스텝
}


// ========================================================================
// 3. 코어 프리미티브 — Waves
// ========================================================================

export interface WaveSource {
  pos: Vec2;
  frequency: number;
  phase?: number;
  amplitude?: number;
  polarization?: { axis: Vec2; kind: 'linear' | 'circular-lh' | 'circular-rh' };
}

export interface Wave extends BaseMeta {
  type: 'wave';
  dimension: '1d' | '2d';
  sources: readonly WaveSource[];
  speed: number;
  time: number;                    // 현재 시간
  boundary?: 'absorbing' | 'reflecting' | 'periodic';
  range?: { x?: [number, number]; y?: [number, number] };  // 렌더 범위
  colormap?: ScalarField['colormap'];
}

export interface Emitter extends BaseMeta {
  type: 'emitter';
  pos: Vec2;
  frequency: number;
  kind?: 'isotropic' | 'directional';
  direction?: Vec2;                // directional 전용
}


// ========================================================================
// 4. 코어 프리미티브 — Collective
// ========================================================================

export interface ParticleSystem extends BaseMeta {
  type: 'particleSystem';
  positions: readonly Vec2[];
  velocities?: readonly Vec2[];
  sizes?: readonly number[] | number;
  colorBy?: 'uniform' | 'speed' | 'index' | 'tag';
  tags?: readonly string[];        // colorBy='tag'
  trail?: boolean;                 // 개별 입자의 자취
}


// ========================================================================
// 5. 코어 프리미티브 — Data Views
// ========================================================================

export interface GraphSeries {
  id?: string;
  label?: LocalizedText;
  data: readonly { x: number; y: number }[];
  colorRole?: ColorRole;
}

export interface Graph extends Omit<BaseMeta, 'style'> {
  type: 'graph';
  style:
    | 'line'          // 선 그래프 (파형, 감쇠)
    | 'bar'           // 막대 (에너지, 히스토그램)
    | 'scatter'       // 산점 (위상공간)
    | 'phasor'        // 페이저 (AC 회로)
    | 'pv'            // PV 다이어그램 (열역학)
    | 'spectrum';     // 스펙트럼 라인

  series: readonly GraphSeries[];

  xAxis?: { label?: LocalizedText; range?: [number, number]; scale?: 'linear' | 'log' };
  yAxis?: { label?: LocalizedText; range?: [number, number]; scale?: 'linear' | 'log' };

  // 스타일별 추가 속성
  showGrid?: boolean;
  horizontal?: boolean;            // bar 전용
  reference?: { value: number; label?: LocalizedText };  // 기준선
}

export interface Gauge extends BaseMeta {
  type: 'gauge';
  value: number;
  range?: [number, number];
  unit?: LocalizedText;
  kind?: 'linear' | 'radial' | 'digital';
}

export interface Marker extends BaseMeta {
  type: 'marker';
  pos: Vec2;
  kind: 'label' | 'ruler' | 'annotation' | 'pin';
  text?: LocalizedText;
  icon?: string;
  target?: string;                 // 주석이 가리키는 프리미티브 ID
}


// ========================================================================
// 6. 코어 프리미티브 — Events
// ========================================================================

export interface Event_ extends BaseMeta {
  type: 'event';
  pos: Vec2;
  kind: 'flash' | 'burst' | 'pulse' | 'decay' | 'emission';
  duration: number;                 // 초
  startedAt: number;               // 시뮬레이션 시간
  intensity?: number;
}


// ========================================================================
// 7. 도메인 플러그인 — Optics
// ========================================================================

export interface Ray extends BaseMeta {
  type: 'ray';
  segments: readonly Vec2[];       // 꺾인 점들의 체인
  wavelength?: number;             // nm, 색 분산용
  intensity?: number;
  showArrow?: boolean;
}

export interface OpticalElement extends BaseMeta {
  type: 'opticalElement';
  subtype:
    | 'mirror-flat' | 'mirror-concave' | 'mirror-convex'
    | 'lens-convex' | 'lens-concave' | 'lens-thin'
    | 'prism' | 'slit' | 'screen' | 'polarizer' | 'wave-plate';
  pos: Vec2;
  orientation: number;             // 라디안 (표면 법선 기준)
  size?: Scalar;                   // 렌즈·거울: 높이, 슬릿: 폭
  focalLength?: Scalar;            // 렌즈·거울 전용
  refractiveIndex?: number;        // 프리즘 전용
  polarizerAngle?: number;         // polarizer 전용
}


// ========================================================================
// 8. 도메인 플러그인 — Circuit
// ========================================================================

export interface CircuitElement extends BaseMeta {
  type: 'circuitElement';
  subtype:
    | 'resistor' | 'battery' | 'capacitor' | 'inductor'
    | 'switch' | 'ground' | 'ammeter' | 'voltmeter' | 'lamp';
  pos: Vec2;
  rotation: 0 | 90 | 180 | 270;    // 회로는 격자 회전만 허용
  value?: number;
  unit?: string;                   // 'Ω' | 'V' | 'F' | 'H' | 'A'
  state?: 'open' | 'closed';       // switch 전용
}

export interface Wire extends BaseMeta {
  type: 'wire';
  from: string;                    // 'elementId.terminalName' 예: 'R1.a'
  to: string;
  path?: readonly Vec2[];          // 명시 경로. 없으면 호스트가 라우팅
}

export interface Terminal extends BaseMeta {
  type: 'terminal';
  pos: Vec2;
  kind?: 'node' | 'junction';
}


// ========================================================================
// 9. 도메인 플러그인 — EM
// ========================================================================

export interface Charge extends BaseMeta {
  type: 'charge';
  pos: Vec2;
  value: number;                   // Coulombs. 양수/음수로 부호 표시
  visualSize?: Scalar;
}

export interface Coil extends BaseMeta {
  type: 'coil';
  axis: { from: Vec2; to: Vec2 };
  turns: number;
  radius: number;
  current?: number;                // 방향성 시각화
}


// ========================================================================
// 10. 도메인 플러그인 — Thermodynamics
// ========================================================================

export interface Container extends BaseMeta {
  type: 'container';
  bounds: { min: Vec2; max: Vec2 };
  piston?: { axis: 'x' | 'y'; position: number };  // 피스톤 위치
  walls?: ('top' | 'right' | 'bottom' | 'left')[];
  showInsulation?: boolean;
}


// ========================================================================
// 11. 도메인 플러그인 — Modern
// ========================================================================

export interface EnergyLevel {
  n: number;                       // 양자수
  energy: number;                  // eV
  label?: LocalizedText;
  occupancy?: number;              // 전자 수
}

export interface EnergyLevels extends BaseMeta {
  type: 'energyLevels';
  pos: Vec2;                       // 다이어그램 좌상단
  levels: readonly EnergyLevel[];
  transitions?: readonly {
    from: number;                  // n_from
    to: number;                    // n_to
    active?: boolean;              // 현재 하이라이트
    wavelength?: number;           // nm
  }[];
  size?: Vec2;
}


// ========================================================================
// 12. Scene Graph 합치기
// ========================================================================

/** 모든 프리미티브의 discriminated union. */
export type Primitive =
  // 코어
  | Body | Trajectory | Vector | Constraint | Surface | Axis
  | VectorField | ScalarField | FieldLine
  | Wave | Emitter
  | ParticleSystem
  | Graph | Gauge | Marker
  | Event_
  // 도메인
  | Ray | OpticalElement
  | CircuitElement | Wire | Terminal
  | Charge | Coil
  | Container
  | EnergyLevels;

/** Scene Graph = 프리미티브 배열. */
export type SceneGraph = readonly Primitive[];

/** ID 참조 해석을 위한 Scene 참조 인터페이스. */
export interface SceneGraphRefs {
  byId(id: string): Primitive | undefined;
  ofType<T extends Primitive['type']>(type: T): Extract<Primitive, { type: T }>[];
}


// ========================================================================
// 13. Bundle 인터페이스
// ========================================================================

/** Bundle 파라미터 정의 (카탈로그의 parameters와 대응). */
export interface ParamDef {
  id: string;
  label: LocalizedText;
  unit?: string;
  range?: [number, number];
  default: number;
  step?: number;
}

/** Stage 정의 (공간 속성). */
export interface StageDef {
  id: string;
  label: LocalizedText;
  description?: LocalizedText;
  constants: Record<string, number>;  // 예: { g: 9.8, hasAtmosphere: 1 }
}

/** Environment 정의 (상황, 라이브 토글 가능). */
export interface EnvironmentDef {
  id: string;
  label: LocalizedText;
  description?: LocalizedText;
  availableInStages: string[];        // 호환 스테이지 ID 목록
  effects: Record<string, number>;    // 예: { drag: 0.08, wind: 0 }
}

/** 뷰 정의 (관점 탭). */
export interface ViewDef {
  id: string;
  label: LocalizedText;
  description?: LocalizedText;
  default?: boolean;
}

/** Controller 선언 — Bundle이 어떤 조작 UI를 요구하는지. */
export type ControllerSpec =
  | {
      type: 'pinball-launcher';
      binds: { power: string; trigger: string };  // state 필드 경로 매핑
      powerRange?: [number, number];
    }
  | {
      type: 'angle-dial';
      binds: { angle: string };
      range?: [number, number];       // degrees
      tickAt?: number[];
    }
  | {
      type: 'drag-bob';
      binds: { displacement: string };
      constraints?: { shape: 'line' | 'arc' | 'plane'; extent: number };
    }
  | {
      type: 'vector-drag';
      binds: { origin: string; vector: string };
    }
  | {
      type: 'slider';
      binds: { value: string };
      range: [number, number];
      label: LocalizedText;
      unit?: string;
    }
  | {
      type: 'placement';                 // 드래그 앤 드롭으로 요소 배치
      binds: { positions: string };      // 배치된 위치 배열 경로
      placeableTypes: string[];
    };

/** Bundle의 정적 스키마. */
export interface BundleSchema {
  id: string;
  label: LocalizedText;
  category: string;
  operation: LocalizedText;
  timeModel:
    | 'linear' | 'periodic' | 'orbit'
    | 'continuous' | 'steady_state' | 'static'
    | 'quasistatic' | 'statistical' | 'discrete';
  parameters: ParamDef[];
  stages: StageDef[];
  environments: EnvironmentDef[];
  views: ViewDef[];
  plugins?: string[];                    // 예: ['optics', 'em']
}

/** Bundle의 런타임 상태 — Bundle마다 다름. 타입 파라미터로 받음. */
export type BundleState = Record<string, unknown>;

/** Bundle이 구현하는 네 함수. */
export interface Bundle<TState extends BundleState = BundleState> {
  schema: BundleSchema;

  /** 초기 상태 생성. */
  initialState(params: {
    values: Record<string, number>;
    stage: StageDef;
    environments: EnvironmentDef[];
  }): TState;

  /** 한 스텝 전진. 순수 함수. */
  step(params: {
    state: TState;
    dt: number;
    stage: StageDef;
    environments: EnvironmentDef[];
  }): TState;

  /** 현재 상태 + 뷰로부터 Scene Graph 선언. */
  scene(params: {
    state: TState;
    view: ViewDef;
  }): SceneGraph;

  /** 조작 UI 선언. 상태 종속적일 수 있음. */
  controllers(params?: { state: TState }): ControllerSpec[];

  /** 종료 판정 (linear·discrete 타임 모델에서). */
  isTerminated?(state: TState): boolean;

  /** 파생값 (에너지 뷰 등 프레임워크 공통 뷰용). */
  derivedValues?(state: TState, stage: StageDef): Record<string, number>;
}


// ========================================================================
// 14. Plugin 인터페이스
// ========================================================================

/** 도메인 플러그인이 호스트에 기여하는 것. */
export interface Plugin {
  id: string;
  label: string;

  /** 이 플러그인이 제공하는 프리미티브 타입들. */
  primitiveTypes: readonly string[];

  /** 각 프리미티브의 렌더 함수 (호스트의 렌더 컨텍스트에 그림). */
  renderers: {
    [type: string]: PrimitiveRenderer;
  };

  /** 플러그인이 추가하는 표준 계산 함수들 (선택). */
  computeMethods?: {
    vector?: Record<string, VectorComputeFn>;
    scalar?: Record<string, ScalarComputeFn>;
  };
}

export type PrimitiveRenderer = (
  ctx: RenderContext,
  primitive: Primitive,
  scene: SceneGraphRefs,
) => void;

export type VectorComputeFn = (
  x: number, y: number,
  args: unknown,
  scene: SceneGraphRefs,
) => Vec2;

export type ScalarComputeFn = (
  x: number, y: number,
  args: unknown,
  scene: SceneGraphRefs,
) => number;

/** 호스트가 렌더러에 제공하는 컨텍스트. */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  toScreen(world: Vec2): Vec2;
  toWorld(screen: Vec2): Vec2;
  scale: number;
  theme: Theme;
  i18n: I18n;
  time: number;
}

export interface Theme {
  resolveColor(role: ColorRole, emphasis?: 'strong' | 'medium' | 'subtle'): string;
  backgroundColor: string;
  textColor: string;
  lineColor: string;
}

export interface I18n {
  currentLang: string;
  resolve(text: LocalizedText): string;
}


// ========================================================================
// 15. 호스트의 진입점
// ========================================================================

/** Embed 컴포넌트가 받는 props. DSL 파서의 출력 타입. */
export interface EmbedProps {
  bundle: Bundle;
  stageId?: string;
  initialEnvironments?: string[];
  initialValues?: Record<string, number>;
  initialView?: string;
  focus?: string;                           // 설명 시나리오별 축약 (추후)
  plugins?: Plugin[];
  theme?: 'light' | 'dark';
  lang?: string;
}


// ========================================================================
// 참고 — 핵심 제약 재확인
// ========================================================================
// 1. 색상: BaseMeta.style.colorRole만 허용. 직접 색상값 금지.
// 2. 다국어: LocalizedText 세 방식 지원. 호스트가 현재 언어로 해석.
// 3. ID 참조: id가 정의된 프리미티브만 다른 프리미티브가 참조 가능.
// 4. 계산 함수: 가능하면 표준 method 사용. custom 함수는 직렬화 불가 감수.
// 5. Bundle은 렌더링 코드 없음. Scene Graph 선언만.
