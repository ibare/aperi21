// ========================================================================
// zeeman-effect — 선언
// ========================================================================
// 질문: 원자를 자기장 속에 두면 그 원자가 내는 스펙트럼 선은 어떻게 되는가.
//
// 자기장이 없으면 위 준위(l=1)의 세 상태 mₗ = +1 · 0 · −1 은 에너지가 같아 선이 하나다. 자기장을
// 걸면 그 셋이 mₗ μ_B B 만큼씩 어긋나 위 준위가 셋으로 갈라지고, 아래 준위(l=0)로 떨어지는 빛도
// 세 줄로 갈라진다(정상 제이만 효과). 자기장을 키우면 준위 사이도 선 사이도 그만큼 더 벌어진다.
//
// 이웃과 겹치지 않는 자리 — `bohr-model` 은 궤도 사이의 도약과 빛 하나, `hydrogen-spectrum` 은 여러
// 준위의 낙차가 띠에 쌓이는 선 목록, `stern-gerlach` 는 불균일 자기장이 원자 빔을 두 갈래로 가르는
// 것이다. 이 조각은 **고른 자기장이 한 준위를 가르고, 그래서 한 선이 갈라지는 것** 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:zeeman-effect` 와 문자 그대로 일치한다 (C4). */
export const ZEEMAN_EFFECT_ID = 'zeeman-effect';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 화면에 뜨는 수는 계산값이 아니라 여기 선언한 정박값이다 (S-piece 유효숫자).
// ------------------------------------------------------------------------

/** 갈라지기 전 선의 파장(nm). 카드뮴의 빨간 선 — 정상 제이만 효과의 교과서 선이다. */
export const LINE_NM = 643.8;
/** 그 선의 빛 한 알의 에너지(eV) = hc / λ. 준위 그림에서 두 준위 사이 높이의 기준이다. */
export const LINE_EV = 1.926;
/** hc(eV · nm). 에너지 어긋남을 파장 어긋남으로 옮기는 데 쓴다 — Δλ = λ² ΔE / hc. */
export const HC_EV_NM = 1239.84;
/** 보어 마그네톤 μ_B(eV/T). mₗ 하나당 에너지 어긋남 = μ_B B. */
export const BOHR_MAGNETON_EV_PER_T = 0.00005788;

/**
 * 위 준위 · 아래 준위의 궤도 양자수 l. 정상 제이만 효과의 가장 단순한 짝(p → s)이다 —
 * 위 준위가 2l+1 개 상태로 갈라지고, 아래 준위(l=0)는 갈라지지 않는다.
 */
export const UPPER_L = 1;
export const LOWER_L = 0;

/** 자기장의 두 정박값(T) — 처음 켤 때 · 키운 뒤. 화면에 `{b} T` 로 뜬다. */
export const FIELD_LOW_T = 1;
export const FIELD_HIGH_T = 2;

/**
 * 준위 그림의 갈라짐 배율. 1 T 에서 어긋남(5.8×10⁻⁵ eV)은 두 준위 사이(1.9 eV)의 3 만분의 1 이라
 * 같은 축척이면 한 줄이다. 준위 그림에서만 이만큼 키운다 — 분광기 창은 배율 없이 실제 파장 축척이다
 * (창 폭 `windowNm`). 화면에 알리지 않은 이유는 NOTES (b).
 */
export const LEVEL_SPLIT_MAGNIFICATION = 4000;

/**
 * 분광기 창이 덮는 파장 폭(nm). 창은 선 둘레를 크게 확대해 본 것이다 — 1 T 에서 선 사이
 * 0.019 nm 가 창 폭의 6 분의 1 쯤으로 보인다. 이 폭이 창의 축척이고 배율은 따로 없다.
 */
export const WINDOW_NM = 0.12;
/** 창 아래 축척 막대가 나타내는 파장 폭(nm). `{w} nm` 로 뜬다. */
export const SCALE_BAR_NM = 0.02;

// ------------------------------------------------------------------------
// 배치 — 월드 단위.
// ------------------------------------------------------------------------

/**
 * 준위 그림. 아래 준위(l=0) 높이 `yLower`, 자기장이 없을 때의 위 준위(l=1) 높이 `yUpper`.
 * 위 준위는 왼쪽 토막(`x0`–`xStub`)이 하나이고, `xFan` 에서 셋으로 벌어져 `x1` 까지 간다.
 * 낙차는 `dropX0`–`dropX1` 사이에 mₗ 이 큰 것부터 고르게 선다.
 */
export const LEVELS = {
  x0: -28,
  xStub: -23,
  xFan: -20,
  x1: -6,
  yLower: -5,
  yUpper: 7,
  dropX0: -16,
  dropX1: -10,
} as const;

/** 분광기 창 — 월드 사각형. 파장은 왼쪽에서 오른쪽으로 길어진다. */
export const WINDOW = { x0: 2, x1: 30, y0: -5, y1: 2 } as const;

/** 창 위의 자기장 눈금자 — 시작 자리 · 길이 · 높이. 0 T 가 왼쪽 끝. */
export const FIELD_SCALE = { x0: 6, length: 20, y: 6 } as const;

/** 프레이밍 — 준위 이름표부터 창 오른쪽 끝까지, 아래로 캡션 띠(장부 G24). */
export const SCENE_BOUNDS = { minX: -32.5, maxX: 31.5, minY: -10.6, maxY: 10.9 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 자기장 없이 선 하나를 보이는 동안. */
export const OFF = 2.6;
/** 자기장이 0 → 1 T 로 켜지는 동안 · 1 T 에 머무는 동안. */
export const RAMP_LOW = 1.4;
/** 갈라진 뒤 mₗ 이름표가 나타나는 동안 — 셋이 겹치지 않을 만큼 벌어진 다음이다. */
export const LABEL_IN = 0.5;
export const LOW = 2.4;
/** 1 T → 2 T 로 커지는 동안 · 2 T 에 머무는 동안. */
export const RAMP_HIGH = 1.4;
export const HIGH = 2.8;
/** mₗ 이름표가 사라지는 동안 — 셋이 다시 모여 겹치기 전에. */
export const LABEL_OUT = 0.4;
/** 자기장이 꺼지며 세 줄이 한 줄로 모이는 동안 · 모인 채 잠시. */
export const RAMP_OFF = 1.2;
export const REST = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const zeemanEffectMessages = Object.freeze({
  'label.title': { ko: '제이만 효과', en: 'Zeeman effect' },
  'label.stage': { ko: '카드뮴 빨간 선', en: 'Cadmium red line' },
  'label.view': { ko: '준위와 분광기 창', en: 'Levels and spectroscope window' },
  /** 준위 · 상태 · 자기장 · 단위 기호 — 표식이다 (C1 판정 3). 값은 vars 로 끼운다. */
  'label.orbital': { ko: 'l={l}', en: 'l={l}' },
  'label.ml': { ko: 'mₗ={m}', en: 'mₗ={m}' },
  'label.field': { ko: 'B', en: 'B' },
  'label.tesla': { ko: '{b} T', en: '{b} T' },
  'label.nm': { ko: '{w} nm', en: '{w} nm' },
  /** 낱말이 끼어 문안이다. */
  'label.window': { ko: '분광기 창', en: 'spectroscope window' },
  'label.wavelength': { ko: '파장 →', en: 'wavelength →' },
  'caption.off': {
    ko: '자기장이 없으면 위 준위의 세 상태는 에너지가 같아, 분광기에 선이 하나다',
    en: 'With no magnetic field the three upper states share one energy, so the spectroscope shows a single line',
  },
  'caption.on': {
    ko: '자기장을 걸면 위 준위가 mₗ 에 따라 셋으로 갈라지고, 한 줄이던 선도 세 줄로 갈라진다',
    en: 'Switch on the field and the upper level splits three ways by mₗ — the single line splits into three',
  },
  'caption.stronger': {
    ko: '자기장을 키우면 준위 사이도 선 사이도 더 벌어진다 — 옅은 눈금이 앞의 자리다',
    en: 'A stronger field pushes the levels, and the lines, further apart — the faint ticks mark where they were',
  },
  'caption.offAgain': {
    ko: '자기장을 끄면 세 줄이 다시 한 줄로 모인다',
    en: 'Switch the field off and the three lines merge back into one',
  },
} satisfies Record<string, LocalizedText>);

export type ZeemanEffectMessageKey = keyof typeof zeemanEffectMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ZeemanEffectMessageKey): LocalizedText => zeemanEffectMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ZeemanEffectMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const zeemanEffectSchema: BundleSchema = {
  id: ZEEMAN_EFFECT_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 자기장을 켜고 키우고 끄며 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'cadmium-red',
      label: text('label.stage'),
      constants: {
        upperL: UPPER_L,
        lowerL: LOWER_L,
        lineNm: LINE_NM,
        lineEv: LINE_EV,
        hcEvNm: HC_EV_NM,
        bohrMagnetonEvPerT: BOHR_MAGNETON_EV_PER_T,
        fieldLowT: FIELD_LOW_T,
        fieldHighT: FIELD_HIGH_T,
        levelSplitMagnification: LEVEL_SPLIT_MAGNIFICATION,
        windowNm: WINDOW_NM,
        scaleBarNm: SCALE_BAR_NM,
      },
    },
  ],

  environments: [],

  views: [{ id: 'levels-and-window', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 준위 그림과 분광기 창이 옆으로 놓인다. 세로는 준위 둘과 캡션 줄. */
  canvas: { height: 320, minHeight: 300 },

  /** 겹침은 scene 에 쓴 순서 — 창 바탕 위에 선, 준위선 위에 낙차, 맨 위에 이름표. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 자기장 없음(선 하나) → 1 T 로 켬 → mₗ 이름표 나타남 → 머묾 → 2 T 로 키움 → 머묾 →
   * mₗ 이름표 사라짐 → 끔 → 모인 채 잠시.
   * 자기장의 세기는 세 오르내림 단계의 진행도로 정해진다 — 단계 안을 코드로 가르지 않는다.
   */
  timeline: {
    phases: [
      { id: 'off', duration: OFF, caption: key('caption.off') },
      { id: 'rampLow', duration: RAMP_LOW, ease: 'smooth', caption: key('caption.on') },
      { id: 'labelIn', duration: LABEL_IN, ease: 'smooth', caption: key('caption.on') },
      { id: 'low', duration: LOW, caption: key('caption.on') },
      { id: 'rampHigh', duration: RAMP_HIGH, ease: 'smooth', caption: key('caption.stronger') },
      { id: 'high', duration: HIGH, caption: key('caption.stronger') },
      { id: 'labelOut', duration: LABEL_OUT, ease: 'smooth', caption: key('caption.stronger') },
      { id: 'rampOff', duration: RAMP_OFF, ease: 'smooth', caption: key('caption.offAgain') },
      { id: 'rest', duration: REST, caption: key('caption.offAgain') },
    ],
  },

  /** 도착한 순간 선 하나가 빛나고 있고, 곧 자기장이 켜진다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — ΔE = μ_B B 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: zeemanEffectMessages,
};
