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

  /**
   * 배치 힌트. 'screen-hud' (기본) 는 호스트가 제공한 HUD 영역에 스크린 좌표로
   * 렌더. 'world-inline' 은 월드 좌표 anchor 기준 (P-V 다이어그램 등).
   * Phase 2 는 'screen-hud' 만 구현.
   */
  placement?: 'screen-hud' | 'world-inline';
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
// 5-2. 코어 프리미티브 — 정찰에서 승격된 어휘
// ========================================================================
//
// 자유 렌더로 만든 조각들이 손으로 그리던 것을 어휘로 올린 것이다
// (tasks/engine-requirements/REQUIREMENTS.md §3). 조각마다 다시 그리면 조각마다
// 다르게 그려지고, 같은 대상이 같은 모양으로 나오지 않는다.

/**
 * 자유 곡선 경계를 가진 채워진 영역. 물·매질·차오름.
 *
 * `body` 는 원·사각·점·막대뿐이라 "그릇 모양대로 담긴 물" 을 그리지 못하고,
 * `surface` 는 선 하나다.
 */
export interface Region extends BaseMeta {
  type: 'region';
  /** 경계 다각형. 월드 좌표. */
  points: readonly Vec2[];
  /**
   * 한 변을 일렁이게 한다. `edge` 는 `points` 의 인덱스 쌍.
   *
   * `amplitude` 는 **화면 픽셀**이다 — 일렁임은 물리량이 아니라 표현이라
   * 배율을 따라가면 확대했을 때 파도가 된다.
   */
  ripple?: { edge: readonly [number, number]; amplitude: number };
  /** 채움 불투명도. 기본 0.42 — 잠긴 것이 비쳐 보이는 정도. */
  opacity?: number;
  /** 굵게 그릴 변. `points` 의 인덱스 쌍 목록. 생략하면 경계선 없음. */
  outline?: readonly (readonly [number, number])[];
}

/**
 * 방출·이류·수명을 가진 입자 흐름. 물줄기·분출·떠내려가는 것.
 *
 * 입자 배열을 선언하지 않는다. **방출 조건만 주면 렌더러가 흐름을 만든다** —
 * 나이만으로 자리가 정해지므로 상태를 들고 있을 필요가 없고, 흩날림은 출생
 * 번호에서 뽑아 프레임마다 떨지 않는다.
 */
export interface Stream extends BaseMeta {
  type: 'stream';
  /** 방출 지점. 월드. */
  from: Vec2;
  /** 방출 속도. 월드 단위/초. */
  velocity: Vec2;
  /** 등가속도. 중력이면 `[0, -9.8]`. 기본 `[0, 0]`. */
  acceleration?: Vec2;
  /** 초당 방출 개수. */
  rate: number;
  /** 입자 수명(초). 이 나이가 되면 사라진다. */
  life: number;
  /** 획 굵기(화면 px). 나이에 따라 가늘어진다. 기본 2. */
  width?: number;
  /** 흩날림(화면 px). 출생 번호 기반이라 안정적이다. 기본 0. */
  jitter?: number;
  /** 0~1. 0 이면 그리지 않는다. 기본 1. */
  flow?: number;
}

/**
 * 값 하나를 읽히게 두는 것. 월드에 붙는 칩이거나 화면에 고정된 줄이거나.
 *
 * `marker` 는 월드 좌표에 붙는 주석이고 이것은 **값**이다. 값은 자리보다
 * 읽히는 것이 중요해서 배경을 깔고, 넘치면 자리를 넓히는 대신 글자를 줄인다
 * (원칙 6 — 임베드 높이는 마운트 뒤 바뀌지 않는다).
 */
export interface Readout extends BaseMeta {
  type: 'readout';
  /**
   * 월드 좌표에 붙거나, 화면 모서리에 고정되거나.
   *
   * 두 경우 다 `offset` 은 **화면 픽셀**이다. 앵커에서 살짝 띄우는 거리는
   * 물리량이 아니라 배치라, 배율을 따라가면 확대했을 때 멀리 날아간다.
   */
  anchor:
    | { world: Vec2; offset?: Vec2 }
    | {
        screen:
          | 'top-left'
          | 'top-center'
          | 'top-right'
          | 'bottom-left'
          | 'bottom-center'
          | 'bottom-right';
        offset?: Vec2;
      };
  /** 화면에 뜨는 문안. 값은 `vars` 로 끼운다 (C1). */
  text: LocalizedText;
  /** `{name}` 자리에 들어갈 값. */
  vars?: Record<string, string | number>;
  /** 배경 칩을 깐다. 월드 앵커는 기본 true, 화면 고정은 기본 false. */
  chip?: boolean;
  /** 글자 크기(화면 px). 기본 11. */
  fontSize?: number;
  /** 화면 고정일 때 정렬. 기본은 모서리에 맞춘다. */
  align?: 'left' | 'center' | 'right';
}

/**
 * 눈금. 장치에 붙는 눈금판(`dial`)과 축처럼 놓이는 눈금자(`linear`).
 *
 * `gauge` 는 화면 좌상단에 쌓이는 가로 막대라 장치 옆에 붙지 못한다.
 */
export interface Scale extends BaseMeta {
  type: 'scale';
  shape: 'linear' | 'dial';
  /** `dial` 은 중심, `linear` 는 시작점. 월드. */
  pos: Vec2;
  /** `dial` 은 반지름, `linear` 는 길이. 월드 단위. */
  size: number;
  /** `linear` 의 방향. 기본 `[1, 0]`. */
  direction?: Vec2;
  range: readonly [number, number];
  value: number;
  /**
   * 지침이 출발한 자리. 주면 여기서 `value` 까지 부채꼴(또는 띠)이 자란다.
   * 두 눈금이 같은 범위를 쓰면 그 크기가 매 순간 견줄 수 있다.
   */
  origin?: number;
  /** 눈금선을 놓을 값. 생략하면 균등 8칸. */
  tickAt?: readonly number[];
  /** 숫자를 붙일 값. 여기 있는 것만 붙는다 — 다 붙이면 읽을 것이 많아진다. */
  labelAt?: readonly number[];
  /** 지금 값 옆에 붙는 단위. 표식이라 번역 대상이 아닐 수 있다 (C1). */
  unit?: LocalizedText;
  /** 소수 자릿수. 기본 2. 유효숫자는 주장의 일부라 자동으로 줄이지 않는다. */
  digits?: number;
}

/**
 * 두 점 사이를 재는 표시. 치수선.
 *
 * `elbow` 를 주면 ㄴ자로 꺾어 잰다 — 수면에서 구멍까지의 깊이처럼 가로세로가
 * 섞인 거리를 잴 때 직선으로 그으면 대각선이 되어 다른 값을 재는 것처럼 보인다.
 */
export interface Dimension extends BaseMeta {
  type: 'dimension';
  from: Vec2;
  to: Vec2;
  /** ㄴ자로 꺾는다. 기본 false(직선). */
  elbow?: boolean;
  /** 곁들이는 문안. 값은 `vars` 로 끼운다 (C1). */
  text?: LocalizedText;
  vars?: Record<string, string | number>;
}


/**
 * 수명 있는 소용돌이 다발이 만드는 속도장.
 *
 * 보통 **보이지 않는다.** 이것이 하는 일은 `filament` 를 감고 접는 것이고,
 * 화면에 나타나는 것은 그 결과다.
 *
 * 소용돌이에 수명을 주는 것이 핵심이다. 수명이 없으면 소용돌이가 흐름과 거의
 * 같은 속도로 함께 떠내려가 한 방향으로만 계속 밀고, 실은 벽에 붙어 직선으로
 * 흐른다 — 난류가 아니라 큰 파도가 된다.
 */
export interface VortexField extends BaseMeta {
  type: 'vortexField';
  /** 장이 덮는 영역. */
  bounds: { min: Vec2; max: Vec2 };
  /** 흐름 속도(월드/초). 소용돌이가 이것을 타고 떠내려간다. */
  drift: Vec2;
  /** 소용돌이 세기. 0 이면 잔잔하다. */
  gain: number;
  /** 동시에 사는 개수. 기본 34. */
  count?: number;
  /** 반지름 범위(월드). */
  radius: readonly [number, number];
  /** 흐름이 이만큼 흐르는 동안 산다(월드 거리). */
  span: readonly [number, number];
  /** 보이게 그린다. 기본 false. */
  visible?: boolean;
}

/**
 * 흐름을 따라 흐르며 교란이 커지거나 잦아드는 실. 염료.
 *
 * 주입부에서 **늘 같은 크기의** 흔들림을 주기적으로 넣는다. 그 흔들림이 하류로
 * 가면서 `growth` 의 부호에 따라 지수적으로 커지거나 사라진다. 커진 자리에서만
 * `field` 의 속도장이 실제로 작용해 실을 감고 접고 벽까지 끌고 간다.
 *
 * 입력이 매끄럽게 변하는데 출력이 어느 지점에서 확 바뀌는 것 — 그 대비가
 * 이 어휘가 존재하는 이유다.
 */
export interface Filament extends BaseMeta {
  type: 'filament';
  /** 주입 지점. */
  from: Vec2;
  /** 흐름 속도(월드/초). */
  speed: number;
  /** 흐름 방향. 기본 `[1, 0]`. */
  direction?: Vec2;
  /** 흐름이 지나는 총 길이(월드). 증폭은 이 길이에 대해 잰다. */
  length: number;
  /** 중심선에서 벗어날 수 있는 최대 거리(월드). 관의 반폭. */
  halfWidth: number;
  /**
   * 교란 성장률 σ. 변위가 이동 거리에 대해 `exp(σ · Δx / length)` 를 따른다.
   * 양수면 스스로 커지고, 0 이면 그대로 통과하고, 음수면 점성이 지운다.
   */
  growth: number;
  /** 주기적으로 넣는 흔들림. 크기는 월드, 주기·지속은 초. */
  seed: { amplitude: number; period: number; duration?: number };
  /** 실을 감고 접는 장. `vortexField` 의 id. */
  field?: string;
  /** 실 굵기(화면 px). 기본 2. */
  width?: number;
  /**
   * 알갱이 간격(**화면 px**). 실의 밀도. 기본 2.
   *
   * 월드로 잡으면 배율에 따라 밀도가 달라져, 확대했을 때 실이 성겨지고 끊긴다.
   * 밀도는 물리량이 아니라 그림의 결이다.
   */
  spacing?: number;
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
  | Region | Stream | Readout | Scale | Dimension
  | VortexField | Filament
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
  /**
   * 지정되면 슬라이더가 호스트의 paramValues 가 아니라 Bundle state 의 이 경로를
   * 직접 단일 소스로 삼는다. controller 가 같은 경로에 쓰는 경우(예: 발사체의
   * angle-dial → 'launch.theta') 슬라이더와 controller 표시값이 자동 동기화된다.
   */
  statePath?: string;
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
    }
  | {
      /**
       * 소자·프리미티브에 붙어 값을 편집하는 컨트롤러. MVP 는 DC Circuit
       * 에서 저항값·기전력 등을 편집하는 용도로 사용.
       */
      type: 'value-edit';
      /** state 상의 값 경로. */
      binds: { value: string };
      /** 편집 대상 프리미티브 id. 해당 프리미티브의 screen bbox 위에 UI 가 떠 있음. */
      target: string;
      /** 유효 범위. 정의되지 않으면 입력 검증을 하지 않음. */
      range?: [number, number];
      unit?: string;
      label?: LocalizedText;
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

  /**
   * 호스트가 자동으로 생성하는 오버레이 뷰. 기본은 모두 true.
   * - energy: view.id === 'energy' 일 때 derivedValues(ke, pe, total) 기반
   *   에너지 바 HUD 를 호스트가 자동 렌더.
   */
  autoViews?: {
    energy?: boolean;
  };

  /**
   * 임베드 캔버스 치수. 화면에 나타나는 것은 저작 결정이므로 선언에 둔다 (원칙 2).
   *
   * **마운트 후에는 바뀌지 않는다.** 글 한복판에 박히는 그림이라 높이가 변하면
   * 위아래 문단이 밀린다. 내용이 커지는 그림은 흔한 크기만큼 자리를 미리 잡고
   * 넘치면 간격을 줄여 담는다 (원칙 6).
   *
   * 생략하면 호스트 기본값을 쓴다.
   */
  canvas?: {
    /** 픽셀. 기본 360. */
    height?: number;
    /** 픽셀. 기본 320. */
    minHeight?: number;
  };

  /**
   * 화면에 딸려 나오는 크롬. **기본은 전부 꺼짐이다.**
   *
   * 그리드는 중립적인 장식이 아니라 "여기서 거리를 재라" 는 지시이고, 카메라
   * 버튼은 프레이밍의 권한을 독자에게 넘기는 것이다. 둘 다 그림이 무엇을
   * 주장하는지를 바꾸므로 저작 결정이다 — 선언이 켠다 (원칙 2·4).
   *
   * 근거: `tasks/piece-lab` 두 조각의 NOTES 「엔진이 절대 강제하면 안 되는 것」.
   * 격리된 두 조각이 독립적으로 같은 목록을 거부했다.
   */
  chrome?: {
    /** 월드 m 단위 거리 축 그리드와 라벨. 기본 false. */
    grid?: boolean;
    /** 카메라 팬·줌·리셋 버튼. 기본 false. */
    cameraControls?: boolean;
  };

  /**
   * 카메라 프레이밍. 생략하면 월드 원점이 뷰포트 중앙에 온다.
   */
  camera?: {
    /**
     * 월드 원점을 뷰포트 중앙에서 아래로 내릴 픽셀. 기본 0.
     *
     * 지면에서 위로 날아가는 그림처럼 세로 쓰임이 한쪽으로 치우친 경우에만
     * 쓴다. 기본값이 아니라 **그 그림의 선택**이다.
     */
    screenYBias?: number;
  };

  /**
   * 저작자가 정한 화면 문안. 조회 3층 중 **1층**이며 언제나 이긴다 (C1).
   *
   * 키는 코드의 호출부가 쓰는 것과 같다 — 프레임워크 문구를 덮어쓰려면 그쪽 키를
   * 그대로 쓰면 된다 (`ui.cameraControls.reset`). sim 고유 문안은 네임스페이스
   * 없이 짧게 (`label.energy`).
   *
   * 이 선언은 장차 에디터로 불특정 다수가 만든다. 시각화가 무엇이라 말하는지도
   * 저작 결정이므로, 문안이 코드에 있으면 저작자가 손댈 수 없다.
   */
  messages?: Record<string, LocalizedText>;
}

/** 월드 좌표 경계 상자 — Camera fitToBounds 에 쓰임. */
export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Bundle 의 런타임 상태 — 구체 타입은 Bundle 마다 다름. 타입 파라미터로 받는다.
 * `object` 로 느슨하게 제약 — 구체 Bundle 이 자기 state 타입을 주입할 때
 * index signature 를 강제하지 않기 위함.
 */
export type BundleState = object;

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

  /** 현재 상태 + 뷰 + 스테이지로부터 Scene Graph 선언. */
  scene(params: {
    state: TState;
    view: ViewDef;
    stage: StageDef;
    environments: EnvironmentDef[];
  }): SceneGraph;

  /** 조작 UI 선언. 상태 종속적일 수 있음. */
  controllers(params?: { state: TState }): ControllerSpec[];

  /** 종료 판정 (linear·discrete 타임 모델에서). */
  isTerminated?(state: TState): boolean;

  /** 파생값 (에너지 뷰 등 프레임워크 공통 뷰용). */
  derivedValues?(state: TState, stage: StageDef): Record<string, number>;

  /**
   * Camera 자동 프레이밍 힌트. 사용자가 팬/줌 하기 전까지 호스트가 매 프레임
   * 이 경계를 사용해 fitToBounds. 없으면 기본 경계(화면 너비 기준) 사용.
   */
  boundsHint?(state: TState, stage: StageDef): Bounds;

  /**
   * 이 조각이 자기 시각화를 직접 그릴 때 쓰는 렌더러 (원칙 4 의 탈출구).
   *
   * **`Plugin` 을 만들지 않는다.** plugin 은 여러 sim 이 공유하는 도메인 어휘를
   * 위한 것이고 호스트가 미리 등록해야 하므로, 조각 하나가 쓰려고 태우면 그
   * 조각이 부팅 시점에 통째로 로드된다. 여기 두면 렌더러가 조각과 함께 로드되고
   * 조각과 함께 사라진다.
   *
   * 키는 `SceneGraph` 의 primitive `type` 이다. 표준 어휘와 같은 이름을 쓰지
   * 않는다 (C4).
   */
  renderers?: Record<string, PrimitiveRenderer>;

  /** 위 렌더러의 z 층. 생략하면 기본 층(`DEFAULT_Z_LAYERS`). */
  zHints?: Record<string, number>;
}


// ========================================================================
// 14. Plugin 인터페이스 — docs/07-plugin-design.md §2 기준.
// ========================================================================

/** Plugin 이 호스트에 남기는 로그 채널. */
export interface PluginLogger {
  warn(msg: string): void;
  info(msg: string): void;
}

/**
 * Plugin 의 생명주기 훅·등록 루틴에서 쓰이는 호스트 조작 인터페이스.
 * docs/07-plugin-design.md §2 의 HostAPI 정의를 그대로 반영한다.
 */
export interface HostAPI {
  registerComputeMethod(kind: 'vector', name: string, fn: VectorComputeFn): void;
  registerComputeMethod(kind: 'scalar', name: string, fn: ScalarComputeFn): void;
  registerUtility(namespace: string, key: string, value: unknown): void;
  getService<T>(id: string): T | undefined;
  logger: PluginLogger;
}

/**
 * 도메인 플러그인이 호스트에 기여하는 것. docs/07-plugin-design.md §2 의
 * 전체 계약 (식별 · 코어 확장 · 선택 확장 · 생명주기 훅 · 의존 관계).
 */
export interface Plugin {
  // ---- 식별 ----
  /** 예: '@aperi21/plugin-optics'. */
  id: string;
  /** semver 버전. requires 에서 버전 제약을 맞추는 기준. */
  version: string;
  /** 사람이 읽는 이름. 다국어 허용. */
  label: LocalizedText;

  // ---- 코어 확장 ----
  /** 이 플러그인이 제공하는 프리미티브 타입들. */
  primitiveTypes: readonly string[];

  /** 프리미티브 타입 → 렌더 함수 맵. */
  renderers: {
    [type: string]: PrimitiveRenderer;
  };

  // ---- 선택적 확장 ----
  /** 플러그인이 추가하는 표준 계산 함수들. */
  computeMethods?: {
    vector?: Record<string, VectorComputeFn>;
    scalar?: Record<string, ScalarComputeFn>;
  };

  /** 프리미티브 타입별 z-레이어 힌트. 호스트가 최종 결정. */
  zHints?: Record<string, number>;

  /** Bundle·다른 Plugin 이 호출할 수 있는 도메인 헬퍼. */
  utilities?: Record<string, unknown>;

  // ---- 생명주기 훅 ----
  /** 등록 시 1회 호출. HostAPI 로 추가 등록·로깅 가능. */
  onRegister?(host: HostAPI): void;
  /** 매 프레임 시작에서 호출. 프레임 스코프 캐시 준비 등. */
  onFrame?(ctx: RenderContext): void;
  /** 해제 시 호출. 자원 정리. */
  onUnregister?(): void;

  // ---- 의존 관계 ----
  /**
   * 필요한 다른 Plugin ID. "@aperi21/plugin-em@^1.2" 처럼 semver 제약을
   * 포함할 수 있다. 제약이 없으면 등록 여부만 검사한다.
   */
  requires?: readonly string[];

  /** 함께 로드될 수 없는 Plugin ID 들. */
  conflicts?: readonly string[];
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

/** 텍스트 측정 등 렌더러가 요청하는 보조 서비스. */
export interface MeasureService {
  textWidth(text: string, fontSize: number): number;
  textBounds(text: string, fontSize: number): { width: number; height: number };
}

/** 호스트가 렌더러에 제공하는 컨텍스트 — docs/06 §3 참조. */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  toScreen(world: Vec2): Vec2;
  toWorld(screen: Vec2): Vec2;
  scale: number;
  viewport: { width: number; height: number };
  theme: Theme;
  i18n: I18n;
  time: number;
  deltaTime: number;
  scene: SceneGraphRefs;
  measure: MeasureService;
  /**
   * 프레임 사이에 남는 저장소. 프리미티브가 자기 id 로 키를 삼는다.
   *
   * 대부분의 어휘는 상태가 필요 없다 — 선언과 시각만으로 자리가 정해진다.
   * 그러나 **누적 적분**은 그렇지 않다. 염료 실의 변위는 속도장을 따라 매
   * 프레임 쌓이는 값이라 닫힌 형태가 없다. 그런 어휘가 여기에 상태를 둔다.
   *
   * 임베드 인스턴스마다 분리되고 `destroy()` 에서 사라진다 (원칙 6, C5).
   * 없을 수도 있다 — 옛 호스트와의 호환을 위해 옵셔널이다.
   */
  store?<T>(key: string, init: () => T): T;
}

export interface Theme {
  resolveColor(role: ColorRole, emphasis?: 'strong' | 'medium' | 'subtle'): string;
  /** 배경(스테이지 기본 배경). */
  background: string;
  /** 일반 전경(텍스트·라인). */
  foreground: string;
  /** 약한 전경(주석·보조 텍스트). */
  muted: string;
  /** 프리미티브 외곽 라인 기본색. */
  line: string;
  /** 격자. */
  grid: string;
  /** 본문 글꼴 패밀리. */
  fontFamily: string;
  /** 모노 글꼴 패밀리 (숫자·라벨). */
  fontFamilyMono: string;
  /** 작은 모서리 반경 (px). */
  radiusSmall: number;
  /** 중간 모서리 반경 (px). */
  radiusMedium: number;
  /** 선 두께 토큰. */
  strokeWidth: { thin: number; regular: number; thick: number };
  /**
   * 구형 호환. 새 코드는 background/foreground/line 을 쓸 것.
   * @deprecated
   */
  backgroundColor?: string;
  /** @deprecated */
  textColor?: string;
  /** @deprecated */
  lineColor?: string;
}

export interface I18n {
  /** 현재 언어 코드. */
  lang: string;
  resolve(text: LocalizedText): string;
  /**
   * 구형 호환.
   * @deprecated `lang` 을 사용.
   */
  currentLang?: string;
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
