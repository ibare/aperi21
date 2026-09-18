// ========================================================================
// wien-displacement-law — 선언
// ========================================================================
// 질문: 흑체의 온도를 올리면 복사 곡선의 봉우리는 얼마나 옮겨 가는가.
//
// 봉우리 높이를 맞춘 흑체 복사 곡선 하나가 온도를 두 배씩(3000 → 6000 → 12000 K) 올릴 때마다
// 원점 쪽으로 오그라든다. 그래프 위 세 줄에 원점에서 봉우리까지의 파장을 막대로 잰다.
// 새 막대의 복사본이 제 길이만큼 미끄러져 이어 붙으면 앞 온도의 막대 끝에 꼭 닿는다 —
// 짧은 막대 두 개가 긴 막대 하나다. 온도가 두 배면 봉우리 파장은 절반이다 (λ_max = b/T).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 별빛의 색(`star-color-temperature`)과 고전 이론의 파탄(`blackbody-radiation`)은 이웃의 몫이라
// 두지 않는다 — 가시광 칠 · 고전 곡선이 없다. 온도 줄 머리의 작은 빛 견본 원판만 흑체 빛 색으로
// 칠한다(곡선에 칠하면 6000 K 흰빛이 라이트 바탕에 묻힌다 — G92).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:wien-displacement-law` 와 문자 그대로 일치한다 (C4). */
export const WIEN_DISPLACEMENT_LAW_ID = 'wien-displacement-law';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 첫 온도(K). 봉우리가 약 966 nm — 적외선 쪽이다. */
export const T_FIRST = 3000;
/** 둘째 온도(K) — 첫 온도의 두 배. */
export const T_SECOND = 6000;
/** 셋째 온도(K) — 둘째 온도의 두 배. */
export const T_THIRD = 12000;
/** 빈 상수 b(nm · K) = 2898 μm · K. 봉우리 파장 λ_max = b / T. */
export const WIEN_B_NM_K = 2898000;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 그래프 원점(0 nm, 세기 0)이 월드 원점이다.
// ------------------------------------------------------------------------

/** 파장 축이 끝나는 파장(nm)과 그 축의 길이(월드). */
export const NM_AXIS = 2400;
export const GRAPH_W = 14;
/** 곡선 봉우리의 높이(월드). 온도마다 봉우리를 같은 높이로 맞춘다 (NOTES (b)). */
export const PEAK_H = 2.8;
/** 가장 아래 막대 줄이 봉우리 높이에서 떨어진 거리와 줄 사이 간격(월드). */
export const ROW_BASE = 0.55;
export const ROW_GAP = 0.55;
/** 눈금 글자 줄의 높이(월드). */
export const TICK_LABEL_Y = -0.45;
/** 파장 눈금(nm)과 그 이름표 키. */
export const WAVELENGTH_TICKS: readonly { nm: number; key: WienDisplacementLawMessageKey }[] = [
  { nm: 500, key: 'tick.500' },
  { nm: 1000, key: 'tick.1000' },
  { nm: 1500, key: 'tick.1500' },
  { nm: 2000, key: 'tick.2000' },
];

/**
 * 프레이밍은 주장의 일부다. 가로는 온도 줄 머리(빛 견본 · 온도 글자)부터 파장 축 끝까지,
 * 세로는 캡션 줄 · 눈금 글자부터 맨 위 막대 줄까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.5, maxX: 14.6, minY: -1.45, maxY: 4.7 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 첫 온도에 머물며 막대를 읽는 동안(초). */
export const HOLD_FIRST = 3;
/** 온도를 두 배로 올리는 동안(초) — 곡선이 오그라들고 새 막대가 줄어든다. */
export const HEAT = 2.5;
/** 새 막대의 복사본이 미끄러져 이어 붙는 동안(초). */
export const COPY = 2;
/** 이어 붙은 두 막대를 읽는 동안(초). */
export const REST = 1.5;
/** 다 그린 그림에 머무는 동안(초). */
export const HOLD = 3;
/** 지우고 처음으로 돌아가는 동안(초). */
export const CLEAR = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const wienDisplacementLawMessages = Object.freeze({
  'label.title': { ko: '빈 변위 법칙', en: "Wien's displacement law" },
  'label.operation': { ko: '온도와 최대 파장', en: 'Temperature and peak wavelength' },
  'label.stage': { ko: '두 배씩 오르는 온도', en: 'Temperature doubling' },
  'label.view': { ko: '복사 곡선과 봉우리 막대', en: 'Radiation curve and peak bars' },
  'label.wavelength': { ko: '파장', en: 'wavelength' },
  'label.intensity': { ko: '세기 — 봉우리 높이를 맞췄다', en: 'intensity — peaks scaled to match' },
  /** 온도 — 값과 단위 기호. 단위는 표식이다 (C1 판정 3). */
  'label.temperature': { ko: '{t} K', en: '{t} K' },
  /** 파장 눈금. 수와 단위 기호뿐인 표식이다. */
  'tick.500': { ko: '500 nm', en: '500 nm' },
  'tick.1000': { ko: '1000 nm', en: '1000 nm' },
  'tick.1500': { ko: '1500 nm', en: '1500 nm' },
  'tick.2000': { ko: '2000 nm', en: '2000 nm' },
  'caption.first': {
    ko: '막대는 원점에서 곡선의 봉우리까지 — 봉우리 파장을 잰다',
    en: 'The bar runs from zero to the peak of the curve — it measures the peak wavelength',
  },
  'caption.heat': {
    ko: '온도를 두 배로 올리자 곡선이 원점 쪽으로 오그라들고 봉우리가 짧은 파장으로 옮겨 간다',
    en: 'Doubling the temperature squeezes the curve toward zero and moves the peak to a shorter wavelength',
  },
  'caption.half': {
    ko: '새 막대 두 개를 이으면 앞 막대와 꼭 같다 — 온도가 두 배면 봉우리 파장은 절반이다',
    en: 'Two of the new bars laid end to end match the old one exactly — twice the temperature, half the peak wavelength',
  },
  'caption.heatAgain': {
    ko: '한 번 더 두 배 — 봉우리가 다시 원점 쪽으로 옮겨 간다',
    en: 'Double it once more — the peak moves toward zero again',
  },
  'caption.halfAgain': {
    ko: '이번에도 두 개가 앞 막대 하나다 — 온도가 두 배가 될 때마다 봉우리 파장은 절반이 된다',
    en: 'Again two bars make one of the last — each doubling of temperature halves the peak wavelength',
  },
} satisfies Record<string, LocalizedText>);

export type WienDisplacementLawMessageKey = keyof typeof wienDisplacementLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WienDisplacementLawMessageKey): LocalizedText => wienDisplacementLawMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WienDisplacementLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const wienDisplacementLawSchema: BundleSchema = {
  id: WIEN_DISPLACEMENT_LAW_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 온도가 두 배씩 오르고 막대가 이어 붙는다.
  parameters: [],

  stages: [
    {
      id: 'doubling',
      label: text('label.stage'),
      constants: {
        tFirst: T_FIRST,
        tSecond: T_SECOND,
        tThird: T_THIRD,
        wienB: WIEN_B_NM_K,
      },
    },
  ],

  environments: [],

  views: [{ id: 'curve', label: text('label.view'), default: true }],

  /** 가로로 넓은 그래프다. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침이 판정 장치다 — 축 · 안내 점선 · 잔상 곡선이 아래, 지금 곡선 · 막대 · 봉우리 점이 위. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 첫 온도 → 두 배(오그라듦) → 복사본 이어 붙이기 → 한 번 더 두 배 → 이어 붙이기 →
   * 머묾 → 지움. 온도는 두 오름 단계의 진행도를 로그 온도에 쌓아 얻는다.
   */
  timeline: {
    phases: [
      { id: 'holdFirst', duration: HOLD_FIRST, caption: key('caption.first') },
      { id: 'heat1', duration: HEAT, ease: 'smooth', caption: key('caption.heat') },
      { id: 'copy1', duration: COPY, ease: 'smooth', caption: key('caption.half') },
      { id: 'rest1', duration: REST, caption: key('caption.half') },
      { id: 'heat2', duration: HEAT, ease: 'smooth', caption: key('caption.heatAgain') },
      { id: 'copy2', duration: COPY, ease: 'smooth', caption: key('caption.halfAgain') },
      { id: 'hold', duration: HOLD, caption: key('caption.halfAgain') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.halfAgain') },
    ],
  },

  /** 도착한 순간 첫 곡선과 막대가 이미 서 있고, 곧 온도가 오르기 시작한다. */
  startAt: 1.8,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — λ_max = b/T 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: wienDisplacementLawMessages,
};
