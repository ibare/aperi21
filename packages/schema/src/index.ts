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
  | 'negative'   // 에너지 손실, 척력
  /**
   * 먹 — 곡선·글자·무채색 주 대상처럼 **짙게** 그려야 하는 것. 테마의 전경색이다.
   * `muted` 는 배경 정보라 가장 짙게(strong) 써도 회색이다.
   */
  | 'ink';

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
  /**
   * 인스턴스 전체 불투명도 0~1. 기본 1.
   *
   * 옅어지는 잔상 · 페이드 인 하는 캡션처럼 **같은 어휘를 흐리게** 그릴 때 쓴다.
   * 강조 상태(`highlight`)의 알파와 곱해진다.
   */
  opacity?: number;

  /**
   * **빛의 양** 0~1. 밝기 자체가 주장인 그림에 쓴다. 기본은 없음(`opacity` 만 적용).
   *
   * `opacity` 와 다르다. 알파는 화면값을 섞으므로 감마 때문에 실제 나오는 빛의
   * 비가 선언한 값과 어긋난다 — 1/4 로 칠한 것이 눈에는 1/2 쯤으로 보인다.
   * 이 필드는 배경과 색을 **선형광으로 되돌려 섞고 다시 인코딩**한다. 그래서
   * "네 배 옅다" 가 말이 아니라 빛의 양으로 참이 된다.
   *
   * 조각마다 다시 짜면 언젠가 누군가는 알파로 대충 칠하고 그 조각은 거짓말을 한다.
   */
  luminance?: number;

  /**
   * 이 인스턴스를 **월드 사각형 안에만** 그린다. 기본은 없음(자르지 않는다).
   *
   * 한 월드에 판을 나란히 둘 때 쓴다 — 땅에서 본 판의 기차 칸이 달려 나가 경계에
   * 걸치면 옆 판 위로 넘어간다. 점·눈금은 조각이 판 밖 것을 빼면 되지만 **경계에
   * 걸친 사각형은 반만 그릴 방법이 없다** (`reference-frame`).
   *
   * 사각형은 그 프레임의 카메라로 화면에 투영해 자른다. 화면에 고정된 어휘(`gauge` ·
   * `graph` 카드 · `screen` 앵커의 `readout`)에도 똑같이 적용되므로, 거기에 걸면
   * 카메라를 옮길 때 잘리는 자리가 함께 움직인다.
   *
   * 한계: plugin 렌더러(`ray` · `opticalElement` · 회로)는 따르지 않는다 — `opacity` ·
   * `highlight` 와 같은 이유다 (S-render).
   */
  clip?: { min: Vec2; max: Vec2 };
}


// ========================================================================
// 1. 코어 프리미티브 — Kinematics & Forces
// ========================================================================

/**
 * 빛의 세기 채널. 색을 `primitiveColor` 로 얻는 어휘(`body` · `trajectory` · `particleSystem` · `lineSet` ·
 * `region` · `sector`)에만 붙는다 — 다른 렌더러(`graph` · `surface` · plugin)는 이 필드를 구현하지 않으므로
 * 거기에 붙이면 말없이 무시된다 (S-render). 필요한 어휘가 생기면 렌더러를 구현하며 넓힌다.
 */
export interface LightChannel {
  /**
   * **테마와 무관한 빛의 세기** 0~1. 주면 `style.colorRole` · `emphasis` · `luminance` 대신
   * 이 세기의 무채색으로 칠한다 — 0 은 빛이 없음(테마의 `light.none`), 1 은 가득 찬 빛(`light.full`),
   * 그 사이는 선형광으로 섞는다. `opacity` 는 그대로 곱해진다.
   *
   * 색 역할은 **대상**을 가르고 테마마다 밝기가 뒤집힌다(`ink` 는 라이트에서 짙고 다크에서 밝다).
   * 빛의 밝기 자체가 주장인 그림 — 달의 낮 면 · 스크린에 닿은 빛 — 을 역할로 칠하면 라이트 테마에서
   * 「밝은 곳」 이 어둡게 나온다 (장부 G34, `moon-phases` · `polarization`). 빛은 물리량이라 역할이 아니라
   * 이 채널로 칠한다. 빛의 **색**(파장 · 합색)은 아직 없다 — 「빛 색」 트랙에서 같은 채널을 넓힌다.
   */
  light?: number;
}

export interface Body extends BaseMeta, LightChannel {
  type: 'body';
  pos: Vec2;
  shape?: 'point' | 'circle' | 'rect' | 'disc' | 'rod' | 'custom';
  size?: Scalar | Vec2;          // circle/disc: 반지름, rect: [w, h]
  orientation?: number;           // 라디안
  mass?: Scalar;                  // 정보용 (시각에만 반영될 수 있음)
  /**
   * `shape: 'custom'` 의 외형. SVG path 문법이고 **좌표는 `pos` 기준 월드 단위, y 는 위**다.
   * 기본은 채움만 하고 윤곽선은 긋지 않는다 — 필요하면 `outline` 으로 켠다.
   * `orientation` 만큼 돈다.
   */
  customPath?: string;
  /**
   * 속을 채울지. 기본 `'solid'`.
   *
   * `'none'` 이면 윤곽만 긋는다. **같은 크기의 두 물체를 채움으로 가르는 그림**이
   * 이것을 쓴다 — 질량을 크기로 보이면 "큰 쪽이 공기를 더 받으니까" 라는 의심이
   * 붙어 주장이 무너지는 자리가 있다 (`free-fall`).
   */
  fill?: 'solid' | 'none';
  /**
   * 둘레 선. **기본값이 모양마다 다르다** — `point` 와 `custom` 은 `'none'`(채움만),
   * 나머지는 `'line'`(테마의 선 색). 작은 점에 테두리가 붙으면 채운 점이 고리로
   * 읽히고, 자유 경로는 저작자가 그린 모양 그대로 나가야 한다.
   *
   * `'background'` 는 바탕색으로 긋는다. 선이나 다른 물체 위에 겹쳐 놓이는 점이
   * 제 경계를 그 자리에서 떼어 내 읽히게 한다.
   *
   * `'role'` 은 **이 물체의 색**(`style.colorRole`)으로 긋는다. `fill: 'none'` 과
   * 함께 쓰는 자리다 — 속을 비우면 남는 것이 둘레뿐인데 그것이 테마의 선 색으로
   * 고정되면 물체가 바탕에 묻힌다. 같은 크기의 두 물체를 채움/테두리로 가르는
   * 그림에서 가벼운 쪽이 사라져 버린다 (`free-fall`).
   */
  outline?: 'line' | 'background' | 'role' | 'none';
  /**
   * 둘레의 번짐. **`circle`(과 `disc`) 에만 있다** — 다른 모양에서는 무시된다.
   * 기본은 `emphasis: 'strong'` 일 때 켜진다. 짙게 칠하되 후광은 없어야 하는 물체
   * (먹색 공)는 `false` 로 끈다.
   */
  glow?: boolean;
}

export interface Trajectory extends BaseMeta, LightChannel {
  type: 'trajectory';
  points: readonly Vec2[];
  style?: BaseMeta['style'] & {
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    /**
     * 옅어지는 방식. `tail` 은 지나온 쪽이, `focus` 는 `focus.at` 에서 멀어질수록 옅다.
     *
     * `'head'` 는 2026-09-16 에 지웠다 — 선언에만 있고 렌더러가 읽지 않았으며
     * 사용처가 0건이었다 (S-render). 필요해지면 그때 그 조각이 요구하는 모양으로 올린다.
     */
    fade?: 'none' | 'tail' | 'focus';
  };
  /**
   * `fade: 'focus'` 가 진하게 남기는 자리. `at` 은 경로 위 위치(0~1), `width` 는
   * 진한 구간의 폭(0~1). 끝이 아니라 **한 점을 중심으로** 양쪽으로 옅어진다 —
   * 곡선에 얹힌 원이 접촉점 근처만 진한 것이 이 꼴이다 (`radius-of-curvature`).
   */
  focus?: { at: number; width: number };
  closed?: boolean;               // 닫힌 궤적 (궤도)
  /**
   * 선 굵기(화면 px). 기본 2 — 곡선·궤적의 굵기다. 축·경계·말뚝 같은 안내선은
   * 1 로 가늘게 준다. 굵기는 물리량이 아니라 위계라 배율을 따라가지 않는다.
   */
  width?: number;
}

export interface Vector extends BaseMeta {
  type: 'vector';
  from: Vec2;
  delta: Vec2;                    // 끝점 = from + delta
  showMagnitude?: boolean;
  headSize?: Scalar;
  style?: BaseMeta['style'] & {
    /** 선 모양. 지나간 자리를 점선으로 남기는 화살표가 쓴다. 기본 `solid`. */
    lineStyle?: 'solid' | 'dashed' | 'dotted';
  };
  /**
   * 이름을 화살표의 어느 쪽에 둘지. 기본 `'auto'` — 화살표가 도는 대로 따라 옮겨
   * 다른 화살표에 올라타지 않게 한다. 끌 수 있는 화살표는 방향이 뒤집히므로
   * 자리를 고정하면 이름이 남의 그림 위에 얹힌다.
   */
  labelSide?: 'auto' | 'cw' | 'ccw';
  /** 이름 뒤에 배경 칩을 깐다. 선 위에 겹쳐도 읽힌다. 기본 false. */
  labelChip?: boolean;
  /**
   * 선 굵기(화면 px). 기본은 테마의 굵은 선. 굵기는 물리량이 아니라 위계라 배율을
   * 따라가지 않는다 — 살아 있는 화살표와 지난 잔상을 굵기로 가른다.
   */
  width?: number;
  /**
   * 둘레. 기본 `'none'`. `'background'` 는 축과 머리를 바탕색으로 한 단 굵게 먼저 깔고
   * 그 위에 긋는다 — 짙은 물체 위를 지나는 화살표가 제 경계를 떼어 내 읽히게 한다
   * (`newtons-third-law`: 먹색 몸 위의 힘).
   *
   * `body.outline` 의 `'background'` 와 목적이 같다(바탕으로 도려내 읽히게). 다른 점은
   * 모양이다 — 물체는 가장자리에 덧긋고, 화살표는 선이라 아래에 넓게 깐다.
   */
  outline?: 'none' | 'background';
}

export interface Constraint extends BaseMeta {
  type: 'constraint';
  subtype: 'rigid_rod' | 'string' | 'spring' | 'rail';
  from: Vec2 | string;            // 좌표 또는 Body ID
  to: Vec2 | string;
  /**
   * `spring` 의 감은 수. 코일 하나는 위·아래로 한 번씩 꺾이는 **물결 한 벌**이다. 기본 4.
   * 감은 수는 고정이고 길이가 늘면 간격이 벌어진다 — 늘어남이 간격으로 보인다 (`spring-force`).
   */
  coils?: number;
  //
  // `naturalLength`·`stiffness` 는 2026-09-12 에 지웠다. "정보용" 이라 적혀
  // 있었고 렌더러가 읽지 않아 그림이 달라지지 않았다 — 선언만 있고 구현이 없는
  // 필드는 저작자에게 거짓말을 한다 (S-render). 용수철의 늘어남이 주장인 조각이
  // 나오면 그때 그 조각이 요구하는 모양으로 올린다.
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

// ========================================================================
// 2. 코어 프리미티브 — Collective
// ========================================================================
//
// 장(field) · 파동(wave) 어휘는 2026-09-12 에 **선언에서 지웠다.** 렌더러가 없어
// 저작자에게 거짓말을 하고 있었고(S-render), 01-broad 배치의 조각들이 그 자리를
// 밟았을 때 원한 것은 기성품 장이 아니었다 — "엔진이 '파동=동심원' 같은 기성품을
// 주면 이 조각의 핵심이 사라진다"(doppler-effect), "장선을 깔아 주는 도구였다면
// 이 조각은 만들 수 없었다"(current-magnetic-field). 필요해지면 그때 정찰이
// 발견한 모양으로 올린다 (원칙 4).

export interface ParticleSystem extends BaseMeta, LightChannel {
  type: 'particleSystem';
  positions: readonly Vec2[];
  /** 자취를 그릴 때의 속도. `trail` 이 참일 때만 쓴다. */
  velocities?: readonly Vec2[];
  sizes?: readonly number[] | number;
  /** 개별 입자의 자취. 속도 반대 방향의 짧은 획이라 속력이 길이로 읽힌다. */
  trail?: boolean;
  /**
   * 입자별 불투명도 0~1. 인스턴스 `opacity` 와 곱해진다. 생략하면 모두 1.
   *
   * 렌더러는 8 단계로 반올림해 **단계마다 경로 하나**로 그린다 — 입자마다 알파가 달라도
   * 인스턴스를 쪼개지 않는다 (`energy-flow-diagram` 의 흩어지며 옅어지는 알갱이).
   * 속도 획(`trail`)에도 같은 값이 걸린다. 반올림하므로 1/16 미만은 그리지 않고, 실제 알파는
   * 선언값과 최대 1/16 다르다.
   */
  opacities?: readonly number[];
  /** 입자 모양. 기본 `'dot'`(원). `'square'` 는 크기를 반변으로 하는 네모 (`tidal-force` 먼지). */
  shape?: 'dot' | 'square';
  /**
   * 입자 점을 그릴지. 기본 true. false 면 꼬리만 남는다 — 알갱이가 아니라 흐르는 획이 주인
   * 그림이 쓴다 (`field-lines`).
   */
  showParticles?: boolean;
  /**
   * 꼬리 모양. 생략한 값은 지금까지의 기본값(0.085 초 · 투명도 0.3 · 가는 선)이다.
   *
   * - `seconds` — 속도 획의 길이 = 속도 × 이 시간(초).
   * - `maxLength` — 속도 획 길이의 상한(**화면 px**). 빠른 입자의 획이 화면을 가로지르지 않게.
   * - `width` — 꼬리 굵기(**화면 px**).
   * - `opacity` — 꼬리 불투명도 0~1. 입자별 `opacities` 와 곱해진다.
   *
   * 기본값이 선 다발 속 빠른 꼬리를 흐리게 만들어 「선이 몰린 곳이 세다」 가 뒤집혀 보였다
   * (`field-lines`, 장부 G40).
   *
   * 위치 이력 잔상(`trails`)은 2026-09-17 에 넣었다가 같은 날 지웠다 — 쓰려던 `phase-space` 가
   * 선분마다 짙기가 달라야 해 `lineSet` 을 골랐고 사용처가 남지 않았다 (원칙 4).
   */
  trailStyle?: { seconds?: number; maxLength?: number; width?: number; opacity?: number };
  //
  // `colorBy`(`'speed'` 등)와 `tags` 는 2026-09-12 에 지웠다. 렌더러가 읽지
  // 않아 저작자에게 거짓말을 하고 있었고(S-render), 쓸 조각도 없었다 —
  // `gas-pressure` 는 "온도에 따라 분자 색을 바꾸지 않는다, 색으로 설명하지
  // 않는다"(S-piece)가 결정이었고 `apparent-brightness` 도 알갱이를 한 색으로
  // 둔다. 색이 물리량을 말해야 하는 조각이 나오면 그때 올린다 (원칙 4).
}


/**
 * 자리마다 값이 있는 **스칼라 장**. 격자 값 배열 하나를 선언하면 렌더러가 작은 이미지 한 장으로
 * 칠해 월드 사각형에 늘려 그린다 (부드럽게 보간).
 *
 * 칸마다 `region` 을 선언하면 프레임마다 선언이 수천 개 생기고 비용이 칸 수에 비례한다 —
 * 간섭 수면이 8208 칸이었다 (`interference`, 장부 G29 · G51). 「선언은 묶음 하나, 그리기는 한 번」.
 *
 * 색은 테마 역할에서 온다. 값이 크기를 **명암**으로 보이는 것이지 대상을 색으로 가르는 것이 아니다.
 * 두 역할을 쓰는 발산형은 **부호**를 색으로 가르므로, 쓰는 조각이 그 판단을 NOTES 에 적는다 (S-piece).
 */
export interface ScalarField extends BaseMeta {
  type: 'scalarField';
  /** 월드 사각형의 두 모서리. */
  min: Vec2;
  max: Vec2;
  /** 격자 가로 · 세로 칸 수. */
  cols: number;
  rows: number;
  /**
   * 칸 값. **행 우선, 첫 행이 월드 위쪽(`max[1]`)** 이다 — 화면에서 읽는 순서와 같다.
   * 길이는 `cols × rows`.
   *
   * `NaN` 인 칸은 **칠하지 않는다**(투명). 원판 · 기울어진 판처럼 사각형이 아닌 영역을 칠할 때
   * 영역 밖 칸을 바탕 값으로 채우면 그 칸이 아래 그림을 가리고, `colors: 'light'` 에서는 어두운
   * 사각형이 된다 (`moon-phases` · `polarization`, 장부 G71).
   */
  values: readonly number[];
  /** 값의 범위. 밖의 값은 끝으로 자른다. */
  range: readonly [number, number];
  /**
   * 색. `high` 만 주면 **순차형** — `range[0]` 은 테마 바탕, `range[1]` 은 `high`.
   * `low` 도 주면 **발산형** — 범위 가운데가 바탕, 음쪽 끝이 `low`, 양쪽 끝이 `high`.
   * 바탕이 0 이라 다크 테마에서도 「잠잠한 곳 = 바탕」 이 뒤집히지 않는다 (장부 G30).
   * 색은 빛의 양(선형광)으로 섞는다 — `luminance` 와 같은 셈.
   *
   * `'light'` 이면 값을 **테마와 무관한 빛의 세기**로 칠한다 — `range[0]` 은 빛 없음, `range[1]` 은
   * 가득 찬 빛. 바탕을 거치지 않아 라이트 · 다크에서 밝은 곳이 늘 밝다 (`LightChannel.light`, 장부 G34).
   */
  colors: { low?: ColorRole; high: ColorRole } | 'light';
}

/**
 * 선 묶음. 선 목록 하나를 선언하면 렌더러가 **불투명도 단계마다 경로 하나**로 긋는다.
 *
 * `trajectory` 여러 개의 조합으로 되지만, 선이 수백 개면 선언 · 그리기가 선 수에 비례한다 —
 * 전기력선 꼬리 950 · 조석력 흐름 획 156 (`field-lines` · `tidal-force`, 장부 G41 · G51). 사용자 결정
 * 「선언은 묶음 하나, 그리기는 한 번」 과 `particleSystem` 이 입자를 한 경로로 묶은 선례를 따른다.
 */
export interface LineSet extends BaseMeta, LightChannel {
  type: 'lineSet';
  /** 선마다 월드 폴리라인(점 둘 이상). */
  lines: readonly (readonly Vec2[])[];
  /** 선별 불투명도 0~1. 인스턴스 `opacity` 와 곱해진다. 생략하면 모두 1. 8 단계로 반올림한다(1/16 미만은 그리지 않음). */
  opacities?: readonly number[];
  /** 굵기(**화면 px**). 생략하면 테마의 보통 굵기. */
  width?: number;
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

/**
 * 계열을 한 축에 놓아 견주는 그림.
 *
 * 2026-09-16 에 `scatter` · `phasor` · `pv` · `spectrum` 과 `horizontal` ·
 * `placement: 'world-inline'` · 축의 `scale: 'log'` 를 지웠다. 선언만 있고 렌더러가
 * 없었고 `sims/**` 사용처가 0건이었다 — 선언만 있는 필드는 저작자에게 거짓말을
 * 한다 (S-render). 필요해지면 그때 그 조각이 요구하는 모양으로 올린다 (원칙 4).
 */
export interface Graph extends Omit<BaseMeta, 'style'> {
  type: 'graph';
  style:
    | 'line'          // 선 그래프 (시간에 따라 자라는 값)
    | 'bar';          // 막대 (에너지, 히스토그램)

  series: readonly GraphSeries[];

  xAxis?: { label?: LocalizedText; range?: [number, number] };
  /**
   * **`line` 전용.** `bar` 는 세로가 계열 구분이라 세로 범위에 뜻이 없어 읽지 않는다.
   * 적용 범위를 적어 두지 않으면 `bar` 저작자에게는 지키지 않는 약속이 된다 (S-render).
   */
  yAxis?: { label?: LocalizedText; range?: [number, number] };

  /** 눈금 격자. 기본 꺼짐 — 크롬은 기본이 전부 꺼짐이다 (원칙 2). */
  showGrid?: boolean;
  /** 기준선. */
  reference?: { value: number; label?: LocalizedText };
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
export interface Region extends BaseMeta, LightChannel {
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
  /**
   * 채움 불투명도. 기본 0.42 — 잠긴 것이 비쳐 보이는 정도.
   * 인스턴스 전체 알파(`opacity`)와는 다르다 — 이것은 면만, 그것은 전체를 흐린다.
   */
  fillOpacity?: number;
  /**
   * 옅은 색을 **불투명하게** 깐다 — 배경색 위에 `fillOpacity` 만큼 올린 색으로 덮는다.
   *
   * 반투명(기본)은 같은 색 도형 둘이 겹치면 겹친 곳이 짙어져 **다른 것처럼 보인다.**
   * "같은 대상 = 같은 색" 을 지키려면 겹쳐도 같은 색이어야 한다. 대신 아래 것은 가린다 —
   * 잠긴 것이 비쳐 보여야 하는 매질에는 쓰지 않는다.
   */
  opaque?: boolean;
  /**
   * 면의 결. 기본 `'solid'`. `'hatch'` 는 채움 위에 바탕색 사선을 긋는다.
   *
   * **같은 대상의 다른 몫**을 색이 아니라 결로 가르는 자리다 — 쌓인 넓이 중 축 아래
   * 넓이가 깎아 내는 몫 (`acceleration-time-graph`). 색을 바꾸면 다른 대상으로 읽히고
   * 색으로 설명하는 것이 된다 (S-piece). `body.fill` 과 같은 이름이고 `'solid'` 의 뜻도 같다.
   */
  fill?: 'solid' | 'hatch';
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
 * 화면 위의 자리. 월드 좌표에 붙거나, 화면 모서리에 고정되거나.
 *
 * 두 경우 다 `offset` 은 **화면 픽셀**이다. 앵커에서 살짝 띄우는 거리는 물리량이
 * 아니라 배치라, 배율을 따라가면 확대했을 때 멀리 날아간다. readout · 캡션 슬롯 ·
 * 조작기가 같은 모양을 쓴다.
 */
export type Anchor =
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
  anchor: Anchor;
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
  /**
   * 글꼴. `mono` 는 숫자·값, `text` 는 문장. 기본은 월드 앵커 `mono`(값 칩), 화면 고정
   * `text`. 월드에 붙는 문장(원 옆 캡션)은 `text` 로 준다.
   */
  font?: 'text' | 'mono';
  /** 기울임. 물리 기호(`Δv`)처럼 수식 글자로 읽혀야 할 때. */
  italic?: boolean;
  /** 굵기. 기본 `normal`. */
  weight?: 'normal' | 'bold';
  /**
   * 뷰포트 밖으로 밀려나면 안으로 당긴다. 기본 false.
   *
   * 좁은 컨테이너에서 값이 잘려 나가는 것을 조각마다 손으로 막던 자리다.
   */
  clamp?: boolean;
  /** 놓일 자리가 모자라면 아예 그리지 않는다. 기본 false — 잘린 글자를 남기지 않는다. */
  hideWhenClipped?: boolean;
  /**
   * 줄바꿈 폭(화면 px). 주면 이 폭 안에서 줄을 나눈다. 생략하면 한 줄이다.
   * 캡션 슬롯의 `wrapWidth` 가 이리로 내려온다.
   */
  wrapWidth?: number;
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
  /**
   * **`dial` 전용.** `origin` 을 줬을 때 눈금판 아래에 ±차이 글자(`+12 kg`)를 쓸지.
   * 기본 true. `linear` 에는 차이 글자가 없어 읽지 않는다.
   *
   * 끄는 자리는 차이를 **수가 아니라 부채꼴로만** 보여야 하는 그림이다 — 수를 늘리지
   * 않으려 평소 눈금에서 벗어난 만큼을 호로만 보인다 (`apparent-weight`). 부채꼴은
   * 그대로 그린다.
   */
  showDelta?: boolean;
}

/**
 * 두 각 사이를 쓸고 지나간 부채꼴. 채움과 테두리 위의 호를 한 덩어리로 그린다.
 *
 * `scale`(dial)로 대신하지 않는다 — 그것은 눈금판이라 **각도자로 읽힌다.** 회전이
 * 점점 빨라지는 것이 주장인 조각에서 눈금이 각도 표시로 읽히면 "같은 시간에 도는
 * 각이 커진다" 가 "눈금이 원래 그렇게 생겼다" 로 뒤집힌다 (`angular-acceleration`).
 */
export interface Sector extends BaseMeta, LightChannel {
  type: 'sector';
  center: Vec2;
  radius: Scalar;
  /** 시작 각(라디안, 월드 x 축에서 반시계). */
  from: number;
  /** 끝 각. `from` 보다 작아도 된다 — 그 방향으로 쓸고 간다. */
  to: number;
  /** 채움 불투명도. 기본 0.22 — 아래에 깔린 것이 비쳐 보이는 정도. */
  fillOpacity?: number;
  /**
   * 테두리 위에 덧긋는 호의 굵기(화면 px). 0 이면 긋지 않는다. 기본은 테마의 굵은 선.
   * 굵기는 물리량이 아니라 위계라 배율을 따라가지 않는다.
   */
  rimWidth?: number;
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

/**
 * 지나간 자국의 목록. **조각이 자리를 주고, 엔진이 나이 들여 지운다.**
 *
 * 01-broad 배치에서 여섯 조각이 각자 짠 것이다 — 파면이 태어난 자리(doppler),
 * 벽을 때린 자국과 압력 누적(gas-pressure), 바닥을 지난 박자(pendulum), 울렁임의
 * 마디(beats), 0.3 초마다 찍은 위치(inertial-frame · ramp-energy). 균일 간격이냐
 * 불규칙한 사건이냐만 다를 뿐 전부 `{자리 · 나이 · 세기}` 목록이라 하나로 둔다
 * (C4 — 같은 대상에 두 이름을 두지 않는다).
 *
 * `stream` 과 다르다. `stream` 은 `from`·`velocity`·`acceleration` 으로 **선언이
 * 궤적을 정하는** 등가속 분사다. 이것은 조각이 임의의 시각·자리를 주고 엔진은
 * 그리기만 한다.
 *
 * **사건을 감지하는 것은 조각의 physics 다.** 프레임 사이 영점 교차를 보간해
 * 잡는 일은 sim 이 하고 배열을 상태에 쌓아 선언으로 넘긴다 — 렌더러는 선언과
 * theme 만 읽는다 (S-render).
 */
export interface Trace extends BaseMeta {
  type: 'trace';
  /** 자국들. 조각이 만든 순서 그대로 그린다. */
  marks: readonly {
    /** 월드 좌표. */
    pos: Vec2;
    /**
     * 이 자국의 나이(초). `life` 에 대한 비율로 옅어진다. 생략하면 늙지 않는다 —
     * 스트로보처럼 지나온 자리를 지우지 않고 남기는 경우다.
     */
    age?: number;
    /** 0~1. 이 자국의 세기. 크기와 진하기에 함께 걸린다. 기본 1. */
    strength?: number;
    /**
     * 이 자국만의 `tick` 방향(월드). 생략하면 인스턴스의 `direction`.
     *
     * 자국마다 방향이 다른 **방사 배치**가 이것을 쓴다 — 바퀴 테두리를 가로지르는
     * 눈금은 자국마다 다른 쪽을 본다 (`angular-acceleration`).
     */
    direction?: Vec2;
  }[];
  /** 자국이 사라지기까지(초). `age` 를 준 자국에만 쓴다. */
  life?: number;
  /** 자국 하나의 모양. 기본 `dot`. */
  shape?: 'dot' | 'ring' | 'tick';
  /**
   * 자국 크기. **모양마다 단위가 다르다** — `dot`·`ring` 은 **화면 px** 반지름,
   * `tick` 은 **월드 단위** 길이다. 기본 2.
   *
   * 다른 것이 사고가 아니라 쓰임이다. `dot`·`ring` 은 사건을 가리키는 표식이라
   * 배율과 무관해야 하고, `tick` 은 길이 자체가 그림의 일부라 — 통로를 가로지르는
   * 금, 바퀴 테두리를 가로지르는 눈금 — 배율을 따라가야 한다. 좁은 임베드에서
   * 금만 그대로면 제 자리를 넘어간다.
   */
  size?: number;
  /**
   * `ring` 이 나이와 함께 퍼지는 끝 반지름(화면 px). 주면 `size` 에서 이 값까지
   * 자란다 — 사건이 일어난 순간의 짧은 강조(통과 섬광 · 도착 표시)가 이 꼴이다.
   */
  spreadTo?: number;
  /** `tick` 의 방향(월드). 기본 세로. 자국마다 다르면 `marks[].direction` 으로 준다. */
  direction?: Vec2;
  /**
   * `ring` 이 도는 각도 범위(라디안, 월드 x 축에서 반시계). 생략하면 온전한 원.
   *
   * **반쪽만 있어야 하는** 사건이 쓴다 — 지면에서 퍼지는 착지 파문을 온전한 원으로
   * 그리면 땅 밑으로도 퍼진다.
   */
  arc?: readonly [number, number];
  /** 획 굵기(화면 px). `ring`·`tick` 에만. 기본 1.5. */
  width?: number;
}

export interface Event_ extends BaseMeta {
  type: 'event';
  pos: Vec2;
  kind: 'flash' | 'burst' | 'pulse';
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
// 9. Scene Graph 합치기
// ========================================================================
//
// 전자기(charge · coil) · 열(container) · 현대물리(energyLevels) 어휘도 2026-09-12 에
// 지웠다. 같은 이유다 — 선언만 있고 렌더러가 없었고, `sims/**` 사용처가 0건이었다.
// 쓰임 없이 미리 만든 어휘는 FACET 이 빌트인 view 15종으로 실패한 모양 그대로다
// (원칙 4, REQUIREMENTS.md §3.1).

/** 모든 프리미티브의 discriminated union. */
export type Primitive =
  // 코어
  | Body | Trajectory | Vector | Constraint | Surface
  | ParticleSystem
  | Graph | Gauge | Marker
  | Region | Stream | Readout | Scale | Sector
  | Dimension
  | VortexField | Filament | Trace
  | ScalarField | LineSet
  | Event_
  // 도메인
  | Ray | OpticalElement
  | CircuitElement | Wire | Terminal;

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
export type ControllerSpec = ControllerInstance & ControllerKind;

/**
 * 조작기 선언은 **인스턴스**다 (원칙 7). 코어의 조작기는 클래스이고, 조각은 그것을
 * 몇 개든 선언한다. 같은 종류를 둘 쓰려고 종류 이름을 따로 만들지 않는다.
 */
export interface ControllerInstance {
  /**
   * 조각 안에서 유일한 이름. 러너가 이것으로 인스턴스를 만들고 드래그를 잇는다.
   * 에디터가 인스턴스를 가리키는 이름이기도 하다 — 바뀌지 않게 둔다.
   */
  id: string;

  /**
   * 이 인스턴스가 보이는 조건 — state 의 **boolean 한 곳**을 가리키는 경로.
   * 생략하면 언제나 보인다.
   *
   * 값도 식도 아닌 **이름**이다. 부정(`!x`) · 비교(`a > 2300`) · 논리 결합을
   * 넣지 않는다 — 그 순간 선언이 로직을 담게 된다 (원칙 2). 조건을 계산하는
   * 것은 조각의 physics 이고, 선언은 그 결과가 놓인 자리만 가리킨다.
   */
  visibleWhen?: string;

  /**
   * 독자가 이 조작기를 **잡고 있는 동안** true 가 되는 state 의 boolean 경로.
   *
   * 자동 진행과 조작기가 같은 값을 밀 때 필요하다 — 손대기 전에는 조각이
   * 자동으로 값을 정하고, 잡는 순간 자동이 양보하며, 놓으면 조각이 정한 방식으로
   * 돌아간다. **무엇으로 돌아갈지는 조각이 안다**(`laminar-vs-turbulent` 는 가장
   * 가까운 정박값으로, `lenz-law` 는 놓는 순간의 속도로). 러너는 잡혔다는
   * 사실만 적고, 그 뒤는 조각의 `step` 이 한다.
   *
   * `scale-drag` 는 `binds.held` 로 이미 같은 일을 했다. 한 조각이 아니라 여섯이
   * 각자 이 규약을 손으로 짰으므로 인스턴스 공통으로 올린다 (01-broad).
   *
   * `visibleWhen` 과 같이 **경로 이름**이다. 식을 넣지 않는다.
   */
  heldPath?: string;

  /**
   * 이 조작기가 state 를 건넬 때(누르기 · 끌기)와 **놓을 때**(취소 포함) 조각 시계를 **0(주기 첫머리)으로**
   * 되돌린다. 기본 false. state 는 건드리지 않는다. 값이 같아도 손잡이를 누르기만 하면 되돌린다 —
   * 조작기는 누르는 순간 state 를 건넨다.
   *
   * 값을 바꾸면 연출을 처음부터 다시 보여야 하는 조각이 쓴다 — 두 추의 차이를 바꾸면
   * 두 기계를 출발 높이부터 다시 놓는다 (`atwood-machine`). 시간표는 조각 시계의 함수라
   * 조각이 스스로 시계를 되돌릴 방법이 없다. 그래서 03 `river-crossing` 은 `step` 안에서
   * 제 시계를 따로 적분해 우회했다.
   *
   * `startAt` 으로 가지 않는다 — 그것은 도착한 순간의 앞당김이고, 이것은 다시 놓기다.
   * 끄는 동안에는 바뀔 때마다 0 으로 붙잡히므로 **놓는 순간부터** 흐른다. 상태를 쌓는
   * 조각은 시계만으로 처음이 되지 않는다 — 그때는 `heldPath` 로 알아채 `step` 이 비운다.
   */
  restart?: boolean;
}

export type ControllerKind =
  | {
      /**
       * 그림 속 자리를 누른다. **아무것도 그리지 않는다** — 그 자리에 그려진 물체가 곧 손잡이다.
       * 누르면 러너가 `binds.pressed` 경로에 true 를 적고, 지우는 것은 조각의 `step` 이다
       * (`button` 과 같은 규약).
       *
       * `button` 은 화면 구석의 칩이라 「이 물체를 골라라」 가 되지 않는다. 컵 · 책 · 책상을
       * 눌러 그 물체부터 떼어 내는 일이 이것이다 (`free-body-diagram`). 물체마다 인스턴스
       * 하나를 선언한다.
       *
       * 자리는 **월드 사각형**이다. 조작기 선언은 정적이라 움직이는 물체를 따라가지 않는다 —
       * 물체가 쉬는 자리를 준다. 사각형이 겹치면 **조작기 선언 전체에서** 앞선 것이 잡힌다 —
       * 다른 손가락이 이미 잡고 있는 인스턴스는 건너뛴다.
       */
      type: 'press-area';
      binds: { pressed: string };
      area: { min: Vec2; max: Vec2 };
    }
  | {
      /**
       * 누르는 단추. 누르면 러너가 `binds.pressed` 경로에 true 를 적는다.
       *
       * **false 로 되돌리는 것은 조각의 `step` 이다** — 누름을 소비한 걸음에서 지운다.
       * 러너가 되돌리면 다음 걸음이 오기 전에 사라질 수 있다. 지금 눌러도 소용없는
       * 때(이미 놓인 공)에 무시하는 것도 조각이 정한다.
       *
       * `reset-buttons` 는 되돌리기로 뜻과 문안이 고정이라 조각의 동작을 걸 수 없다.
       * 줄을 놓는 순간을 독자가 고르는 일이 이것이다 (`centripetal-force`).
       */
      type: 'button';
      binds: { pressed: string };
      /** 단추 글자. 화면에 뜨는 문안은 선언이 가진다 (C1). */
      label: LocalizedText;
      /**
       * 자리. 생략하면 오른쪽 아래에서 선언 순서대로 쌓인다. 기본 자리는 **종류마다**
       * 세므로 `reset-buttons` 와 함께 쓰면 겹친다 — 그때는 `at` 을 준다.
       */
      at?: Anchor;
      /** 크기 `[너비, 높이]`(화면 px). 생략하면 내용에 맞춘 기본값. */
      size?: Vec2;
    }
  | {
      type: 'pinball-launcher';
      binds: { power: string; trigger: string };  // state 필드 경로 매핑
      powerRange?: [number, number];
      /** 자리. 생략하면 오른쪽 아래에서 선언 순서대로 왼쪽으로 쌓인다. */
      at?: Anchor;
      /**
       * 튜브 크기 `[너비, 높이]`(화면 px). 생략하면 기본값.
       * 높이는 뷰포트에 맞춰 줄어들 수 있다 — 글 한복판의 임베드는 높이가
       * 바뀌지 않아야 하므로 넘치면 담는 쪽을 택한다 (원칙 6).
       */
      size?: Vec2;
      /** 이름표. `{power}` 자리에 당긴 세기(%)가 들어간다. 생략하면 프레임워크 문구. */
      label?: LocalizedText;
    }
  | {
      type: 'angle-dial';
      binds: { angle: string };
      range?: [number, number];       // degrees
      tickAt?: number[];
      /** 자리. 생략하면 왼쪽 아래에서 선언 순서대로 오른쪽으로 쌓인다. */
      at?: Anchor;
      /**
       * 반지름(화면 px). 생략하면 기본값. 반원 다이얼의 상자는 `2r × r` 이라
       * 자유도가 하나뿐이므로 `size` 가 아니라 반지름이다.
       */
      radius?: number;
      /** 이름표. 생략하면 프레임워크 문구. */
      label?: LocalizedText;
    }
  | {
      type: 'slider';
      /**
       * 잡고 있는 동안을 알려면 `ControllerInstance.heldPath` 를 쓴다 — 조작기 종류와
       * 무관하게 러너가 적어 주는 공통 규약이다 (01-broad 에서 여섯이 각자 짜던 것을
       * 올렸다). 같은 사실에 이름을 둘 두지 않는다.
       */
      binds: { value: string };
      range: [number, number];
      label: LocalizedText;
      unit?: string;
      /**
       * 값이 붙는 간격. 주면 끌린 값을 `range[0] + k·step` 중 가장 가까운 곳에 붙인다 —
       * **기준점은 `range[0]`** 이다(`ParamDef.step` 은 0 을 기준으로 붙는다). 생략하면
       * 연속으로 움직인다.
       */
      step?: number;
      /** 값 표시의 소수 자릿수. 기본 2. 유효숫자는 주장의 일부라 자동으로 줄이지 않는다. */
      digits?: number;
      /** 자리. 생략하면 오른쪽 위에서 선언 순서대로 아래로 쌓인다. */
      at?: Anchor;
      /** 크기 `[너비, 높이]`(화면 px). 생략하면 기본값. */
      size?: Vec2;
    }
  | {
      /**
       * 값을 후보 중에서 고르는 칩 줄.
       *
       * `env-toggles` · `stage-tabs` · `view-tabs` 와 같은 칩 모양(`controller/chips.ts`)을
       * 쓰되 바꾸는 것이 **파라미터 값**이다. 환경이나 단계로 모델링하면 뜻이 어긋난다 —
       * 질량 2 / 10 / 50 kg 은 환경이 아니라 그 물체의 값이다 (`free-fall`).
       */
      type: 'param-chips';
      binds: { value: string };
      /** 고를 것들. 화면에 뜨는 문안은 선언이 가진다 (C1). */
      options: readonly { value: number | string; label: LocalizedText }[];
      /**
       * 자리. 생략하면 왼쪽 아래에서 선언 순서대로 **아래로** 쌓인다 — 칩 폭이 글자
       * 길이를 따라가 가로 간격을 미리 알 수 없어서다 (`reset-buttons` 도 같다).
       */
      at?: Anchor;
      /** 줄 이름표. 생략하면 이름표 없이 칩만 놓는다. */
      label?: LocalizedText;
    }
  | {
      /**
       * 그림 속 한 점을 잡아 끈다. 방향과 길이를 한꺼번에 바꾼다.
       *
       * `scale-drag` 는 직선 트랙 위 1 차원이고, `angle-dial` 은 따로 뜨는 다이얼이며,
       * `placement` 는 팔레트에서 끌어다 놓는 것이다. **그림 안에 있는 점 자체가
       * 손잡이**인 경우가 이것이다 — 화살표의 머리를 잡는 일 (`vector-addition`).
       *
       * 누르는 동안 `binds.held` 가 true. 손을 뗀 뒤 자동 진행으로 돌아가는 일은
       * sim 이 한다.
       */
      type: 'point-drag';
      binds: { pos: string; held: string };
      /** 잡히는 반경(화면 px). 생략하면 기본값. */
      grabRadius?: number;
      /**
       * 끌린 자리를 이 점들 중 가장 가까운 곳에 붙인다. 굽은 길 위를 끄는 경우다
       * (`radius-of-curvature`). **무엇이 제약인지는 조각이 정한다** — 엔진이 경로를
       * 알아서 고르지 않는다.
       */
      snapTo?: readonly Vec2[];
      /**
       * 손잡이 모양. 기본 `'dot'` — 채운 점. `'ring'` 은 테두리만 긋는다.
       *
       * 손잡이가 화살표 머리 위에 얹히면 채운 점이 머리를 가려 "이 화살표의 끝" 이
       * 아니라 "따로 있는 점" 으로 읽힌다. 테두리만 두르면 끝점이 비쳐 보인다
       * (`vector-decomposition`).
       */
      handle?: 'dot' | 'ring';
    }
  | {
      /**
       * 눈금을 직접 끌어 값을 잡는다. 그림 속 눈금(`scale` linear)과 **같은 자리**를
       * `track` 으로 선언한다 — 따로 뜨는 슬라이더 상자가 아니라 눈금 그 자체가 손잡이다.
       *
       * 누르는 동안 `binds.held` 가 true, 놓으면 false. 손을 뗀 뒤 자동 진행으로
       * 돌아가는 일은 sim 이 한다 — 무엇으로 돌아갈지는 sim 이 안다.
       */
      type: 'scale-drag';
      binds: { value: string; held: string };
      /** 트랙. 월드 좌표. `direction` 기본 `[1, 0]`, `size` 는 월드 길이. */
      track: { pos: Vec2; direction?: Vec2; size: number };
      /** 트랙 양 끝의 값(`binds.value` 의 단위). */
      range: [number, number];
    }
  | {
      type: 'placement';                 // 드래그 앤 드롭으로 요소 배치
      binds: { positions: string };      // 배치된 위치 배열 경로
      placeableTypes: string[];
      /** 팔레트 자리. 생략하면 왼쪽 위에서 선언 순서대로 아래로 쌓인다. */
      at?: Anchor;
      /** 견본 한 칸의 크기 `[너비, 높이]`(화면 px). 생략하면 기본값. */
      size?: Vec2;
      /** 팔레트 이름표. 생략하면 프레임워크 문구. */
      label?: LocalizedText;
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
      /**
       * 자리. 생략하면 `target` 프리미티브를 따라간다 — 그것도 못 찾으면 기본 자리.
       * 코어가 자리를 고정하지 않는다 (원칙 7 ③).
       */
      at?: Anchor;
      /** 패널 크기 `[너비, 높이]`(화면 px). 생략하면 기본값. */
      size?: Vec2;
      /** 유효 범위. 정의되지 않으면 입력 검증을 하지 않음. */
      range?: [number, number];
      unit?: string;
      label?: LocalizedText;
    }
  | {
      /**
       * 파라미터 상자 — `BundleSchema.parameters` 를 한자리에 모아 조작한다.
       *
       * 예전에는 러너가 파라미터가 하나라도 있으면 자동으로 띄웠다. 그러면
       * 저작자가 "이 조각은 값을 만지게 하지 않는다" 를 고를 수 없다 (원칙 2).
       * 이제 선언해야 뜬다.
       */
      type: 'param-panel';
      /** 보일 파라미터 id. 생략하면 선언된 파라미터 전부. */
      params?: string[];
      /** 자리. 생략하면 왼쪽 위에서 선언 순서대로 아래로 쌓인다. */
      at?: Anchor;
      /** 크기 `[너비, 높이]`(화면 px). 생략하면 기본값. */
      size?: Vec2;
      /** 이름표. 생략하면 프레임워크 문구. */
      label?: LocalizedText;
      /** 되돌리기 단추를 둘지. 기본 true. */
      reset?: boolean;
    }
  | {
      /**
       * 뷰 탭 — `BundleSchema.views` 사이를 오간다.
       *
       * **고를 것이 하나뿐이면 선언해도 그리지 않는다.** 탭 하나는 조작기가
       * 아니라 크롬이다 (S-piece).
       */
      type: 'view-tabs';
      /** 자리. 생략하면 왼쪽 위에서 선언 순서대로 아래로 쌓인다. */
      at?: Anchor;
      /** 크기 `[너비, 높이]`(화면 px). 생략하면 내용에 맞춘 기본값. */
      size?: Vec2;
    }
  | {
      /**
       * 스테이지 탭 — `BundleSchema.stages` 사이를 오간다.
       *
       * `view-tabs` 와 같이, 고를 것이 하나뿐이면 그리지 않는다 (S-piece).
       */
      type: 'stage-tabs';
      /** 자리. 생략하면 왼쪽 위에서 선언 순서대로 아래로 쌓인다. */
      at?: Anchor;
      /** 크기 `[너비, 높이]`(화면 px). 생략하면 내용에 맞춘 기본값. */
      size?: Vec2;
      /** 이름표. 생략하면 프레임워크 문구. */
      label?: LocalizedText;
    }
  | {
      /**
       * 환경 토글 — `BundleSchema.environments` 를 켜고 끈다. 지금 스테이지에서
       * 쓸 수 있는 것만 나온다(`availableInStages`).
       *
       * 켤 것이 없으면 그리지 않는다.
       */
      type: 'env-toggles';
      /** 자리. 생략하면 왼쪽 위에서 선언 순서대로 아래로 쌓인다. */
      at?: Anchor;
      /** 크기 `[너비, 높이]`(화면 px). 생략하면 내용에 맞춘 기본값. */
      size?: Vec2;
      /** 이름표. 생략하면 프레임워크 문구. */
      label?: LocalizedText;
    }
  | {
      /**
       * 되돌리기 단추. 프레이밍을 되돌릴지 상태를 되돌릴지는 선언이 고른다 —
       * 카메라 버튼은 프레이밍의 권한을 독자에게 넘기는 것이라 저작 결정이다
       * (원칙 4).
       */
      type: 'reset-buttons';
      /** 무엇을 되돌릴지. 생략하면 둘 다. */
      targets?: ('camera' | 'state')[];
      /** 자리. 생략하면 오른쪽 아래에서 선언 순서대로 왼쪽으로 쌓인다. */
      at?: Anchor;
      /** 크기 `[너비, 높이]`(화면 px). 생략하면 내용에 맞춘 기본값. */
      size?: Vec2;
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
  };

  /**
   * 그리는 순서. 기본 `layer` — 어휘별 층(`DEFAULT_Z_LAYERS`)을 따른다.
   *
   * `scene` 이면 **scene 에 쓴 순서대로** 그린다(먼저 쓴 것이 아래). "이 선은 이 면 위"
   * 처럼 겹침이 판정 장치인 그림이 고른다. 그때 층이 지켜 주던 관계(매질은 물체 위,
   * 값은 주석 위)를 지키는 책임은 저작자에게 넘어가고, `zHints` 도 무시된다. 캡션
   * 슬롯만 엔진이 맨 위에 둔다.
   */
  drawOrder?: 'layer' | 'scene';

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
   * 조각 시계를 이만큼 앞당겨 연다(초). 기본 0.
   *
   * *독자가 도착한 순간 이미 진행 중* 을 만드는 선언이다 (S-piece MUST). 시간표
   * 안에 있던 것을 여기로 올렸다 — 시간표 없는 조각도 시계를 앞당겨야 한다.
   */
  startAt?: number;

  /**
   * 마운트 전에 `step` 을 이만큼 미리 굴린다(초). 기본 0.
   *
   * `startAt` 과 다른 일을 한다. `startAt` 은 **시계**를 앞당기므로 모든 것이
   * 시각의 함수인 조각에는 그것으로 충분하지만, 상태를 **누적**하는 조각은
   * 시계만 옮겨도 화면이 비어 있다 — 분자가 아직 제자리에 있고, 공이 아직
   * 출발선에 있다. 그런 조각은 초기 상태에서 실제로 여러 걸음을 걸어야 한다.
   *
   * 01-broad 에서 조각 아홉이 이것을 손으로 짰다(`for` 루프 540회 · 분자 2초분).
   * 규범이 요구하는 일이면 규범을 지키는 장치도 함께 있어야 한다.
   *
   * 고정 걸음으로 굴리므로 같은 선언은 언제나 같은 초기 화면을 만든다.
   */
  preroll?: number;

  /**
   * 시간표. 조각이 **아무것도 누르지 않아도 할 말을 마치는** 순서를 선언한다 (S-piece).
   *
   * 단계의 길이·순서·이징·캡션은 저작 결정이다 (원칙 2). 코드에 두면
   * "이 단계를 0.3 초 더 길게" 를 저작자가 할 수 없다. 엔진이 시각에서 지금 단계와
   * 진행도를 계산해 `scene` 에 `timeline` 으로 넘긴다.
   */
  timeline?: TimelineDef;

  /**
   * 캡션 슬롯 하나. 선언하면 엔진이 캡션을 그린다 — 지금 단계의 `caption` 키,
   * 없으면 `text` 키의 문안. 슬롯이 하나뿐인 것은 구조다: *캡션이 둘이면 조각이
   * 둘이다* (S-piece).
   *
   * 이 슬롯을 쓰는 조각은 scene 에 id `caption` 을 두지 않는다 (엔진 예약).
   */
  caption?: CaptionSlotDef;

  /**
   * 저작자가 정한 화면 문안. 조회 3층 중 **1층**이며 언제나 이긴다 (C1).
   *
   * 키는 코드의 호출부가 쓰는 것과 같다 — 프레임워크 문구를 덮어쓰려면 그쪽 키를
   * 그대로 쓰면 된다 (`ui.resetButtons.state`). sim 고유 문안은 네임스페이스
   * 없이 짧게 (`label.energy`).
   *
   * 이 선언은 장차 에디터로 불특정 다수가 만든다. 시각화가 무엇이라 말하는지도
   * 저작 결정이므로, 문안이 코드에 있으면 저작자가 손댈 수 없다.
   */
  messages?: Record<string, LocalizedText>;
}

// ------------------------------------------------------------------------
// 시간표 · 캡션 슬롯
// ------------------------------------------------------------------------

/** 진행도에 거는 이징. 이름만 선언한다 — 곡선은 엔진이 안다. */
export type TimelineEase = 'linear' | 'smooth' | 'inOutCubic';

export interface TimelinePhase {
  /** 단계 이름. scene 이 `at('grow')` 처럼 부른다. 한 시간표 안에서 겹치지 않는다. */
  id: string;
  /** 초. 0 보다 크다. */
  duration: number;
  /** 이 단계 진행도(`progress` · `at`)의 이징. 기본 `linear`. */
  ease?: TimelineEase;
  /**
   * 이 단계 동안의 재생 속도. 기본 1, 0 보다 크다. `0.2` 면 다섯 배 느리게 흐른다.
   *
   * 순식간에 지나가는 일을 **눈으로 보게** 할 때 쓴다. 시간 엔진이 통째로 느려지므로
   * 물줄기·실·step 이 함께 느려진다. `duration` 은 조각 시계(물리 시간)로 센다 —
   * 0.72 초 단계를 0.144 로 두면 화면에서는 5 초 동안 흐른다.
   */
  timeScale?: number;
  /**
   * 이 단계에 캡션 슬롯이 말할 문안 키(`messages`). 이웃 단계가 같은 키면 한 문장이
   * 이어지는 것이라 다시 페이드하지 않는다.
   */
  caption?: string;
}

/**
 * 한 주기의 단계 목록. **끝나면 처음으로 돌아간다** — 조각은 문단 옆에 늘 놓여 있어서
 * 끝난 화면이 남으면 할 말을 멈춘 것이 된다.
 */
export interface TimelineDef {
  phases: TimelinePhase[];
}

export interface CaptionSlotDef {
  anchor: Readout['anchor'];
  align?: Readout['align'];
  /** 화면 px. 생략하면 readout 기본값. */
  fontSize?: number;
  /** 생략하면 본문 먹색(`muted` · `strong`). */
  style?: BaseMeta['style'];
  /** 문안이 바뀔 때 페이드 인 하는 시간(초). 기본 0 — 바로 바뀐다. */
  fade?: number;
  /** 단계가 캡션을 말하지 않을 때의 문안 키. 시간표가 없는 조각은 이것만 쓴다. */
  text?: string;
  /**
   * 줄바꿈 폭(화면 px). 주면 이 폭 안에서 줄을 나눈다. 생략하면 한 줄이다.
   *
   * 세로가 비싼 조각이 남는 가로를 캡션에 내주는 배치가 이것을 쓴다 — 세로 낙하는
   * 화면의 왼쪽만 쓰므로 오른쪽에 문장을 세운다 (`terminal-velocity`).
   */
  wrapWidth?: number;

  /**
   * **상태**로 문안을 고른다. 시간표 단계로 나눌 수 없는 캡션을 위한 것이다 —
   * 진자가 근사의 경계를 넘었을 때, 세 공이 모두 바닥에 내려섰을 때처럼 문장이
   * 갈리는 시점이 시각이 아니라 상태에 달린 경우다 (01-broad 3조각).
   *
   * 위에서부터 훑어 **참인 첫 항목**의 문안을 쓴다. 아무것도 참이 아니면 단계의
   * 캡션, 그것도 없으면 `text`. 슬롯은 여전히 하나다 (S-piece).
   *
   * `when` 은 state 의 boolean 경로 **이름**이다. 비교식(`ball.y < 0.01`)을 넣지
   * 않는다 — 조건을 계산하는 것은 조각의 physics 이고 선언은 그 결과를 가리킨다
   * (원칙 2, `visibleWhen` 과 같은 규약).
   */
  cases?: readonly { when: string; text: string }[];

  /**
   * 문안의 `{이름}` 자리에 끼울 값. 키는 문안 속 이름, 값은 state 의 **경로 이름**이다.
   *
   * 캡션이 지금 값을 말해야 하는 조각이 쓴다 — 구간의 평균 속도, 떠밀린 거리처럼
   * 문장 안에 수가 들어가는 경우다 (`average-velocity` · `river-crossing`). 이것이
   * 없으면 그런 조각은 슬롯을 버리고 scene 에 글자를 따로 두어야 해서, 캡션이
   * 하나라는 것을 엔진이 지켜 주지 못한다.
   *
   * 경로가 가리키는 값은 **문자열이나 수**다. 자릿수는 조각이 정해 문자열로 둔다 —
   * 유효숫자는 주장의 일부라 엔진이 줄이지 않는다. 단위·낱말은 state 가 아니라
   * 문안 틀에 둔다 (C1). 값이 없으면 던진다 — `{drift}` 가 그대로 화면에 뜨는데
   * 예외가 없으면 조용히 틀린다.
   *
   * `cases.when` 과 같이 식을 넣지 않는다 (원칙 2).
   */
  vars?: Record<string, string>;
}

/**
 * 엔진이 매 프레임 시간표를 시각에서 계산한 값. **선언이 아니라 scene 에 넘기는 인자**다.
 *
 * 모두 조각 시계 `t` 의 함수라 같은 시각은 언제나 같은 값이다. 없는 단계 id 를
 * 부르면 던진다 — 빈 값으로 넘어가면 화면이 조용히 틀린다.
 */
export interface TimelineFrame {
  /** 조각 시계(초) = 흐른 시간 + `startAt`. */
  readonly t: number;
  /** 한 주기의 길이(초) = 단계 길이의 합. */
  readonly period: number;
  /** 주기 번호. 0 부터. */
  readonly cycle: number;
  /** 주기 안 시각(초). */
  readonly u: number;
  /** 지금 단계 id. */
  readonly phase: string;
  /** 지금 단계의 진행도 0~1 (이징 적용). */
  readonly progress: number;
  /** 지금 단계의 재생 속도. 러너가 시간 엔진에 건다. */
  readonly timeScale: number;
  /** 지금 캡션 키. 단계가 말하지 않으면 없다. */
  readonly caption?: string;
  /** 지금 캡션이 시작된 뒤 흐른 시간(초). 페이드용. */
  readonly captionAge: number;
  /** 이번 주기에서 그 단계의 진행도 — 전에는 0, 동안 0~1 (이징 적용), 뒤에는 1. */
  at(id: string): number;
  /** 그 단계가 시작하는 주기 안 시각. */
  start(id: string): number;
  /** 그 단계가 끝나는 주기 안 시각. */
  end(id: string): number;
  duration(id: string): number;
  /**
   * 주기 안 임의 구간 [from, to] 의 진행도. 단계로 나눌 수 없는 시차 출발(기둥 i 가
   * i 초에 떠난다)에 쓴다.
   */
  span(from: number, to: number, ease?: TimelineEase): number;
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
    /** `schema.timeline` 을 선언한 조각에만 온다. */
    timeline?: TimelineFrame;
  }): SceneGraph;

  /**
   * 조작 UI 선언 — **데이터다** (원칙 7 ④). 에디터가 인스턴스를 추가 · 이동 ·
   * 삭제하려면 목록이 정적으로 읽혀야 하므로 함수가 아니다.
   *
   * 상태에 따라 달라지는 것은 선언이 **상태 경로를 가리켜** 표현한다
   * (`visibleWhen`). 조건 계산은 조각의 physics 에 그대로 남는다 — 선언은
   * "어디를 보라" 만 말하고 식을 담지 않는다 (원칙 2).
   */
  readonly controllers: readonly ControllerSpec[];

  /** 종료 판정 (linear·discrete 타임 모델에서). */
  isTerminated?(state: TState): boolean;


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

/**
 * 렌더러가 보는 테마 — **그림 축 하나뿐이다.**
 *
 * 코어가 제공하는 조작기의 색·치수(`UiTheme`)는 여기 없다. 렌더러가 그것까지
 * 보면 두 축을 나눈 뜻이 사라진다 — 조작기 모양을 바꾸려다 그림이 함께 바뀐다.
 * 모서리 반경도 없다. 둥근 모서리는 상자를 그리는 UI 의 어휘이고, 그림에는
 * 상자가 없다.
 */
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
  /**
   * 빛의 세기 채널(`LightChannel.light` · `ScalarField.colors: 'light'`)의 양 끝.
   * **어느 테마에서나 `none` 이 `full` 보다 어둡다** — 테마가 고르는 것은 톤이지 극성이 아니다.
   */
  light: { none: string; full: string };
  /** 본문 글꼴 패밀리. */
  fontFamily: string;
  /** 모노 글꼴 패밀리 (숫자·라벨). */
  fontFamilyMono: string;
  /** 그림 안 글자 크기(px). */
  fontSize: { small: number; regular: number; large: number };
  /** 선 두께 토큰. 다섯 단 — 눈금·외곽·벡터가 굵기로 갈라져야 한다. */
  strokeWidth: {
    hair: number;
    thin: number;
    regular: number;
    thick: number;
    heavy: number;
  };
}

export interface I18n {
  /** 현재 언어 코드. */
  lang: string;
  resolve(text: LocalizedText): string;
  /**
   * 키로 문안을 찾는다 — 저작자 선언(1층) → locale 번들(2층) → 호출부 en 원본(3층).
   * 값은 `{name}` 자리에 끼운다 (C1).
   */
  t(key: string, en: string, vars?: Record<string, string | number>): string;
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
