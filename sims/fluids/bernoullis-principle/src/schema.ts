// ========================================================================
// bernoullis-principle — 선언
// ========================================================================
// 질문: 관이 좁아지면 물이 꽉 끼니까 좁은 곳의 압력은 오히려 높아져야 하지 않나?
//
// 동사: **내려간다.** 좁은 곳에서 물이 빨라지고, 빨라진 만큼 그 위 물기둥(압력)이
// 내려간다. 압력 몫과 속도 몫의 합은 어디서나 같다.
//
// 유속 · 압력 숫자, 유속 화살표, 마찰 손실은 두지 않는다 (원본 NOTES (c)).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:bernoullis-principle` 와 문자 그대로 일치한다 (C4). */
export const BERNOULLIS_PRINCIPLE_ID = 'bernoullis-principle';

// ------------------------------------------------------------------------
// 배치 · 물리 상수 — 원본 캔버스 860 × 290 px 의 값을 그대로 둔다
// ------------------------------------------------------------------------

/**
 * 숫자는 원본 그대로(캔버스 px, y 는 아래로)다. 월드로 옮기는 것은 `worldX` · `worldY`
 * 하나뿐이다 — 기억으로 옮기다 간격 · 세기를 틀린 앞선 이관을 되풀이하지 않는다.
 */
export const LAYOUT = {
  widthPx: 860,
  heightPx: 290,
  /** CY — 관 중심선. */
  cyPx: 240,
  /** W0 — 입구 관 굵기. */
  w0Px: 60,
  /** X_IN · X_OUT — 관 양 끝. */
  xInPx: 30,
  xOutPx: 830,
  /** XC — 목 중심. */
  xcPx: 430,
  /** PLATEAU · RAMP — 좁은 곳의 평평한 반폭과 오르내리는 길이. */
  plateauPx: 60,
  rampPx: 170,
  /** TOTAL_HEAD — 중심선에서 합 수준선까지. */
  totalHeadPx: 205,
  /** VH0 — 입구 속도 수두. */
  vh0Px: 16,
  /** U0 — 입구 유속(px/s). */
  u0Px: 58,
  /**
   * 관 속 명암 격자 한 칸의 가로 · 세로(px). 가로는 원본이 명암을 칠한 띠 간격 2 px, 세로는 벽
   * 테두리가 계단으로 보이지 않도록 1 px 이다. 격자는 가장 굵은 관(`w0Px`)을 감싼다.
   */
  shadeColPx: 2,
  shadeRowPx: 1,
  /** STATIONS — 유리관 9개의 자리(70 + i · 90). 가운데(430)가 목 중심이다. */
  stationX0Px: 70,
  stationGapPx: 90,
  stationCount: 9,
  /** TUBE_W — 유리관 폭. 유리관 위 끝은 합 수준선 위로 이만큼 더 선다. */
  tubeWPx: 14,
  tubeOverPx: 8,
  /** 합 수준선이 첫 · 끝 유리관 밖으로 뻗는 길이. */
  levelOverPx: 20,
  /** 이름표 — 합 수준선 위로 띄우는 거리, 가운데 유리관 옆으로 띄우는 거리. */
  levelLabelDyPx: 14,
  shareLabelDxPx: 8,
  /** '압력 몫' 을 물기둥 윗면 아래로 내리는 거리. */
  pressureLabelDyPx: 14,
  /** '속도 몫' 을 숨기는 호박색 구간 길이. */
  velocityLabelMinPx: 22,
  labelFontPx: 12,
  captionFontPx: 15,
} as const;

/** 월드 한 단위 = 원본 100 px. */
export const PX_PER_UNIT = 100;

/** 원본 가로 px → 월드 x. 목 중심이 0 이다. */
export function worldX(px: number): number {
  return (px - LAYOUT.xcPx) / PX_PER_UNIT;
}

/** 원본 캔버스 y(아래로 증가) → 월드 y(위로 증가). 관 중심선이 0 이다. */
export function worldY(px: number): number {
  return (LAYOUT.cyPx - px) / PX_PER_UNIT;
}

/** RELEASE — 입구에서 물감 띠를 흘려 넣는 간격(초). */
export const RELEASE = 0.3;

/**
 * 자동으로 바뀌는 좁은 곳 굵기(입구 대비). 원본 `autoRatio(t) = 0.67 + 0.31 cos(2π(t+5)/16)`.
 * 주기 첫머리가 가장 고른 관(0.98)이고, 원본은 그 5 초 뒤에서 열린다 → `startAt`.
 */
export const AUTO = { mean: 0.67, swing: 0.31, period: 16, startAt: 5 } as const;

/** 슬라이더 범위 — 좁은 곳 굵기. 원본 `min 0.36 · max 1 · step 0.01`. */
export const THROAT_RANGE: [number, number] = [0.36, 1];
export const THROAT_STEP = 0.01;
/** 가장 좁은 굵기. 명암 범위의 옅은 끝이 이것으로 고정된다(원본 `HP_MIN`). */
export const THROAT_MIN = THROAT_RANGE[0];

/**
 * 캡션이 '굵기가 고르면 …' 으로 바뀌는 굵기(원본 `captionFor` 의 0.95). 0.95 에서 목과 입구의
 * 물기둥 차이가 약 2 px 이라 '같다' 와 어긋나지 않는다.
 */
export const EVEN_RATIO = 0.95;

/**
 * 한 주기 안에서 자동 굵기가 `EVEN_RATIO` 이상인 반폭(초) — 주기 첫머리 앞뒤로 이만큼.
 * 시간표의 단계 경계가 캡션 문턱과 같은 자리에 오도록 문턱에서 옮긴 값이다 (≈ 1.13 초).
 */
export const EVEN_HALF_SECONDS =
  (Math.acos((EVEN_RATIO - AUTO.mean) / AUTO.swing) * AUTO.period) / (2 * Math.PI);

/**
 * 관 속 물 명암. 원본은 파랑 한 색상에서 밝기만 84% → 44% 로 바꿨다(짙을수록 높은 압력).
 * 관 속은 `scalarField` 순차형(범위 [0, 1], 0 = 바탕), 물기둥은 `region` 의 `luminance` 로 칠한다 —
 * 둘 다 `secondary` 를 바탕에 빛의 양으로 섞는 같은 셈이라 같은 값이면 같은 색이다. 가장 낮은
 * 압력이 `min`, 가장 높은 압력이 `max`. 범위는 가장 좁은 관 기준으로 고정이라 조작값에 따라
 * 명암이 흔들리지 않는다.
 */
export const SHADE = { min: 0.3, max: 1 } as const;

/** 속도로 바뀐 몫(호박색)의 채움 농도. 원본 `globalAlpha 0.85`. */
export const VELOCITY_FILL = 0.85;
/** 물감 띠의 짙기와 굵기. 원본은 먹색 알파 0.55 · 굵기 1.4 px. */
export const STRIP = { opacity: 0.55, widthPx: 1.4 } as const;
/** 선 굵기(화면 px). 원본 관 벽 2 · 유리관 1.2 · 합 수준선 1. */
export const LINE_PX = { wall: 2, tube: 1.2, level: 1 } as const;

/**
 * 프레이밍. 원본 캔버스(0~860 × 0~290 px)에 캡션 한 줄(위)과 슬라이더(아래) 자리를 더한다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다.
 */
export const SCENE_BOUNDS = {
  minX: worldX(0),
  maxX: worldX(LAYOUT.widthPx),
  minY: worldY(LAYOUT.heightPx + 40),
  maxY: worldY(-16),
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const bernoullisPrincipleMessages = Object.freeze({
  'label.title': { ko: '베르누이 원리', en: "Bernoulli's principle" },
  'label.stage': { ko: '벤투리관', en: 'Venturi tube' },
  'label.view': { ko: '물기둥', en: 'Water columns' },
  'label.throat': { ko: '좁은 곳의 굵기', en: 'Throat width' },
  'label.level': { ko: '두 몫의 합은 어디서나 이 높이', en: 'The two shares always add up to this height' },
  'label.velocityShare': { ko: '속도 몫', en: 'speed share' },
  'label.pressureShare': { ko: '압력 몫', en: 'pressure share' },
  'caption.narrow': {
    ko: '좁은 곳에서 물이 빨라지고, 빨라진 만큼 그 위 물기둥(압력)이 내려간다.',
    en: 'In the narrow part the water speeds up, and the column above it (pressure) drops by just as much.',
  },
  'caption.even': {
    ko: '굵기가 고르면 물의 빠르기도 고르고, 물기둥 높이도 어디서나 같다.',
    en: 'When the tube is even, the water flows equally fast and every column stands at the same height.',
  },
} satisfies Record<string, LocalizedText>);

export type BernoullisPrincipleMessageKey = keyof typeof bernoullisPrincipleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BernoullisPrincipleMessageKey): LocalizedText => bernoullisPrincipleMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BernoullisPrincipleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const bernoullisPrincipleSchema: BundleSchema = {
  id: BERNOULLIS_PRINCIPLE_ID,
  title: text('label.title'),
  category: 'fluids',
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'venturi', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'columns', label: text('label.view'), default: true }],

  /** 원본 캔버스 290 px 에 캡션 한 줄과 슬라이더 줄을 더한다. */
  canvas: { height: 400, minHeight: 360 },

  /** 원본의 겹침 순서 — 명암 · 물감 띠 · 벽 · 호박색 · 물기둥 · 유리관 · 수준선 · 이름표. */
  drawOrder: 'scene',

  /**
   * 원본은 주기 첫머리(가장 고른 관)에서 5 초 지난 자리(굵기 0.55, 좁아지는 중)에서 열린다.
   */
  startAt: AUTO.startAt,

  /**
   * 한 주기 16 초 — 좁은 곳 굵기가 0.98 → 0.36 → 0.98 로 코사인을 따라 오르내린다.
   * 굵기 자체는 scene 이 주기 안 시각(`u / period`)에서 읽고, 단계는 **캡션이 바뀌는 자리**만
   * 가른다.
   *
   * - `even-out` — 주기 첫머리부터 굵기가 0.95 아래로 내려가기까지. 고른 관.
   * - `narrow` — 좁아졌다가 다시 풀리는 동안.
   * - `even-in` — 굵기가 다시 0.95 를 넘어 주기 끝까지.
   *
   * 독자가 슬라이더를 만진 뒤에는 캡션 슬롯의 `cases` 가 조작값으로 문장을 고른다.
   */
  timeline: {
    phases: [
      { id: 'even-out', duration: EVEN_HALF_SECONDS, caption: key('caption.even') },
      { id: 'narrow', duration: AUTO.period - 2 * EVEN_HALF_SECONDS, caption: key('caption.narrow') },
      { id: 'even-in', duration: EVEN_HALF_SECONDS, caption: key('caption.even') },
    ],
  },

  /** 슬롯 하나. 원본처럼 그림 위 왼쪽 한 줄, 15 px, 페이드 없음. */
  caption: {
    anchor: { screen: 'top-left' },
    align: 'left',
    fontSize: LAYOUT.captionFontPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'manualEven', text: key('caption.even') },
      { when: 'manualNarrow', text: key('caption.narrow') },
    ],
  },

  // 그리드도 카메라 버튼도 없다 (기본값).

  messages: bernoullisPrincipleMessages,
};
