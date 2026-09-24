// ========================================================================
// lift-force — 선언
// ========================================================================
// 질문: 날개 위쪽 공기가 더 빠르다는데, 정말 위쪽으로 간 공기가 아래쪽보다 먼저 지나가는가?
//
// 동사: **앞질러 간다.** 같은 순간 한 줄로 뿌린 연기가 날개 앞에서 갈라지고, 위쪽 절반이
// 아래쪽 절반을 앞질러 뒷전을 먼저 떠난다. 빨리 흐르는 위쪽은 압력이 낮다(압력장 명도).
//
// 양력 화살표 · 양력 계수 · 순환 · 속력 숫자 · 유선 · 경계층은 두지 않는다 (원본 NOTES (c)).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:lift-force` 와 문자 그대로 일치한다 (C4). */
export const LIFT_FORCE_ID = 'lift-force';

// ------------------------------------------------------------------------
// 배치 · 물리 상수 — 원본 index.html 의 값을 그대로 둔다
// ------------------------------------------------------------------------

/**
 * 원본 캔버스 860 × 310 px 와 세계 가로 범위 −4.6 ~ 4.6. 세계 단위는 원본과 같고
 * (y 는 위로), 원본 px 는 캔버스 세로 · 압력장 표본 간격을 정하는 데만 쓴다.
 */
export const VIEW = {
  widthPx: 860,
  heightPx: 310,
  xMin: -4.6,
  xMax: 4.6,
} as const;

/** 세계 1 단위당 원본 px. */
export const SCALE = VIEW.widthPx / (VIEW.xMax - VIEW.xMin);
/** 세계 세로 반폭 (캔버스 위아래 끝). */
export const Y_HALF = VIEW.heightPx / 2 / SCALE;

/**
 * 주코프스키 날개 둘레의 퍼텐셜 흐름. 원 평면 중심 μ = −ε, 반지름 a = c + ε.
 * `speedCap` 은 뒷전 뾰족점 근처의 수치 발산만 막는 속력 상한(× U).
 */
export const FLOW = {
  U: 1.6,
  C: 1.0,
  EPS: 0.1,
  speedCap: 3.2,
  /** 날개 안으로 들어간 점을 원 평면에서 둘레 바로 밖으로 밀어내는 배율. */
  pushOut: 1.003,
} as const;

/** 받음각 조작기. 원본 range 0~12, step 1, 기본 8°. */
export const AOA = { min: 0, max: 12, step: 1, default: 8 } as const;

/** 연기 줄. 원본 RELEASE_X · RELEASE_EVERY · TRACK_EVERY · MARKERS · MAX_MARKERS · SPLIT_GAP. */
export const SMOKE = {
  releaseX: -4.45,
  releaseEvery: 0.8,
  trackEvery: 4,
  markers: 150,
  maxMarkers: 1400,
  splitGap: 0.1,
  /** 늘어난 구간에 표지를 넣는 간격 상한 — 이보다 멀면 이미 갈라진 곳이라 넣지 않는다. */
  refineMaxGap: 1.2,
  /** 방출 줄 세로 분포: y = spread · Y_HALF · sign(s) · |s|^power. 가운데에 촘촘하다. */
  spread: 1.05,
  power: 1.5,
  /** 오른쪽 끝을 이만큼 넘은 표지는 더 옮기지 않는다. */
  cullPad: 0.4,
  /** 줄을 지우는 나이(초)와, 모든 표지가 이만큼 넘어가면 지우는 경계. */
  maxAge: 13,
  alivePad: 0.3,
  /** 그릴 때 끊는 간격 — 이보다 멀거나 날개를 가로지르는 구간은 긋지 않는다. */
  drawBreak: 0.35,
} as const;

/** 고정 걸음과 미리 진행 시간. 원본 DT = 1/60 · WARM = 7 초. */
export const DT = 1 / 60;
export const WARM_SECONDS = 7;
/** 실시간 한 프레임에 밀린 걸음의 상한 — 탭이 멈췄다 돌아와도 한꺼번에 몰아 걷지 않는다. */
export const MAX_SUBSTEPS = 6;

/**
 * 압력장. 원본은 `Cp = 1 − |V|²/U²` 를 0.25 간격으로 끊고, 색 한 줄
 * (밝음 = 고압 · 먼 흐름 = 옅은 회색 · 짙은 회청 = 저압)으로 칠했다.
 *
 * 색은 테마가 정한다. 조각은 원본 색 한 줄의 **명도 순서와 간격**만 값으로 옮긴다 —
 * `lightness` 는 원본 색의 명도(sRGB 0~1, 세 성분 평균)이고, 칸 값은 고압 끝에서 얼마나
 * 어두운가(`high − 명도`)다. 값 범위는 `[0, high − low]` 이고 렌더러의 순차형 사상이 칠한다.
 */
export const PRESSURE = {
  band: 0.25,
  /** 음쪽 끝(짙은 회청)에 닿는 Cp 크기. */
  lowReach: 1.6,
  lightness: { high: 0.976, free: 0.9137, low: 0.5516 },
  /** 원본 표본 간격(px). 2 px 마다 한 칸. */
  samplePx: 2,
} as const;

/** 압력장 값 범위 — 고압 끝 0, 저압 끝 원본 명도 차. */
export const PRESSURE_RANGE: [number, number] = [0, PRESSURE.lightness.high - PRESSURE.lightness.low];

/** 선 굵기(화면 px) · 짙기. 원본 연기 줄 1.1 px 알파 0.42, 추적 줄 2.4 px. */
export const STROKE = { smokeWidth: 1.1, smokeOpacity: 0.42, trackWidth: 2.4 } as const;

/** 날개 윤곽 표본 수. 원본 240. */
export const AIRFOIL_SAMPLES = 240;

/** 캡션 글자 크기와 줄바꿈 폭(화면 px). 원본 15 px, 조작기 옆 한 줄 칸. */
export const CAPTION = { fontPx: 15, wrapPx: 600, rowPx: 56 } as const;

/**
 * 프레이밍. 원본 캔버스(세계 가로 −4.6~4.6, 세로 ±Y_HALF) 아래에 캡션 · 조작기 줄을 더한다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다.
 */
export const SCENE_BOUNDS = {
  minX: VIEW.xMin,
  maxX: VIEW.xMax,
  minY: -Y_HALF - CAPTION.rowPx / SCALE,
  maxY: Y_HALF,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const liftForceMessages = Object.freeze({
  'label.title': { ko: '양력', en: 'Lift' },
  'label.stage': { ko: '날개 단면', en: 'Wing section' },
  'label.view': { ko: '연기 줄', en: 'Smoke lines' },
  'label.aoa': { ko: '받음각', en: 'Angle of attack' },
  'caption.overtake': {
    ko: '같은 순간 한 줄로 뿌린 연기가 날개 앞에서 갈라져, 위쪽 절반이 아래쪽을 앞질러 간다 — 빨리 흐르는 날개 위쪽의 압력이 아래쪽보다 낮다.',
    en: 'Smoke released in one line at the same instant splits at the wing, and the upper half overtakes the lower half — the faster air above the wing is at lower pressure than the air below.',
  },
  'caption.flat': {
    ko: '받음각이 0° 이면 같은 순간 뿌린 연기 줄의 위아래가 나란히 날개를 지나고, 위아래 압력도 같다.',
    en: 'At 0° angle of attack, the upper and lower halves of a smoke line pass the wing side by side, and the pressure above and below is the same.',
  },
} satisfies Record<string, LocalizedText>);

export type LiftForceMessageKey = keyof typeof liftForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LiftForceMessageKey): LocalizedText => liftForceMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LiftForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const liftForceSchema: BundleSchema = {
  id: LIFT_FORCE_ID,
  title: text('label.title'),
  category: 'fluids',
  timeModel: 'continuous',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 310 px 에 캡션 · 조작기 줄을 더한다. */
  canvas: { height: 400, minHeight: 360 },

  /** 원본의 겹침 순서 — 압력장 · 연기 줄 · 추적 줄 · 날개. */
  drawOrder: 'scene',

  /**
   * 도착한 순간 이미 흐르고 있다. 연기 표지는 적분으로 쌓이는 상태라 시계를 앞당기는
   * `startAt` 으로는 차지 않는다 — 원본처럼 7 초를 고정 걸음으로 미리 걷는다.
   *
   * 시간표 단계는 없다. 원본에 연출 시간표가 없고, 0.8 초마다 뿌리는 방출도 적분 상태의 일이다.
   */
  preroll: WARM_SECONDS,

  /**
   * 슬롯 하나. 원본은 그림 아래 왼쪽에 15 px 한 줄(넘치면 둘). 받음각 0° 일 때만 문장이 바뀐다.
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: CAPTION.fontPx,
    wrapWidth: CAPTION.wrapPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.overtake'),
    cases: [{ when: 'flat', text: key('caption.flat') }],
  },

  // 그리드도 카메라 버튼도 없다 (기본값).

  messages: liftForceMessages,
};
