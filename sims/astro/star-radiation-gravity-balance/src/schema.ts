// ========================================================================
// star-radiation-gravity-balance — 선언
// ========================================================================
// 질문: 별은 왜 제 무게에 무너지지도, 제 열에 흩어지지도 않는가.
//
// 별의 단면 하나. 어느 층에서나 안으로 당기는 중력과 밖으로 미는 압력(중심 핵융합이
// 데운 가스 · 복사)이 맞선다. 중심이 내는 에너지를 키우면 압력이 이겨 별이 부풀고,
// 부풀며 식어 미는 힘이 줄어 더 큰 크기에서 다시 균형을 찾는다. 줄이면 중력이 이겨
// 오그라들고, 오그라들며 데워져 미는 힘이 커져 더 작은 크기에서 균형을 찾는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:star-radiation-gravity-balance` 와 문자 그대로 일치한다 (C4). */
export const STAR_RADIATION_GRAVITY_BALANCE_ID = 'star-radiation-gravity-balance';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 모두 상대값이다 — 이 조각은 크기의 비와 힘의 비만 말한다.
// ------------------------------------------------------------------------

/** 처음 · 키운 · 줄인 중심 에너지(상대값). */
export const ENERGY_CALM = 1;
export const ENERGY_HIGH = 1.6;
export const ENERGY_LOW = 0.6;
/** 처음 에너지에서 균형을 이루는 반지름(월드). */
export const CALM_RADIUS = 2;
/**
 * 압력이 반지름에 따라 줄어드는 가파름 n — 압력 ∝ 에너지 / Rⁿ. 중력(1/R²)보다 가팔라야(n > 2)
 * 부풀면 압력이 더 빨리 줄고(식음) 오그라들면 더 빨리 커져(데워짐) 균형으로 되돌아온다.
 * 균형 반지름 = 처음 반지름 × (에너지비)^(1/(n−2)) — n = 4 에서 반지름 범위는 약 1.55 ~ 2.53.
 */
export const PRESSURE_EXPONENT = 4;
/** 화살표 길이(월드) = 이 값 × 힘 / (처음 별 표면의 중력). */
export const ARROW_PER_FORCE = 0.6;
/** 안쪽 층의 자리 — 반지름에 대한 비. 별이 통째로 닮은꼴로 커지고 줄어 이 층도 같은 비를 지킨다. */
export const INNER_LAYER = 0.55;
/** 새 균형으로 가라앉는 빠르기. 단계 진행도 p 에서 1 − e^(−k·p) 의 k. */
export const SETTLE_SHARPNESS = 2.5;
/** 중심(핵융합 자리)의 반지름(월드) — 처음 에너지일 때. 에너지에 비례해 커지고 준다. */
export const CORE_RADIUS = 0.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 별의 중심이 원점.
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 에너지를 늘린 직후 처음 별에서 뻗는 압력 화살표(2 + 0.96), 가장 부푼 별(약 2.53),
 * 에너지를 되돌린 직후 가장 작은 별에서 뻗는 압력 화살표(약 1.55 + 1.66)가 모두 들어가고, 아래에 캡션 줄이
 * 남는다. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -6, maxX: 6, minY: -4.0, maxY: 3.3 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 균형에 머물며 두 화살표가 같은 것을 읽는 동안(초). */
export const HOLD_CALM = 3.5;
export const HOLD = 2.5;
/** 중심 에너지를 바꾸는 동안(초). 이 동안 별은 아직 제 크기다 — 한쪽이 이기는 순간을 먼저 본다. */
export const CHANGE = 1;
/** 별이 새 균형으로 부풀거나 오그라드는 동안(초). */
export const SETTLE = 5;
export const RETURN = 4.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const starRadiationGravityBalanceMessages = Object.freeze({
  'label.title': { ko: '복사압과 중력의 평형', en: 'Radiation pressure and gravity in balance' },
  'label.stage': { ko: '별 하나', en: 'One star' },
  'label.view': { ko: '별의 단면', en: 'Cross-section of a star' },
  /** 화살표 이름. 한 낱말이지만 분야 원어 약자가 아니라 언어마다 다르다 — 문안. */
  'label.gravity': { ko: '중력', en: 'gravity' },
  'label.pressure': { ko: '압력', en: 'pressure' },
  'label.calmSize': { ko: '처음 크기', en: 'original size' },
  'caption.calm': {
    ko: '어느 층에서나 안으로 당기는 중력과 밖으로 미는 압력이 같다 — 별은 제 크기를 지킨다',
    en: 'At every layer the inward pull of gravity and the outward push of pressure are equal — the star keeps its size',
  },
  'caption.swell': {
    ko: '중심에서 내는 에너지가 늘자 압력이 이겨 별이 부푼다 — 부풀수록 식어 미는 힘이 줄어든다',
    en: 'The core puts out more energy, pressure wins and the star swells — as it swells it cools and the push weakens',
  },
  'caption.big': {
    ko: '압력과 중력이 다시 같아졌다 — 더 큰 별이 되어 새 균형에 멈췄다',
    en: 'Pressure and gravity are equal again — the star has settled into a new balance, larger than before',
  },
  'caption.shrink': {
    ko: '에너지가 줄자 중력이 이겨 별이 오그라든다 — 오그라들수록 데워져 미는 힘이 커진다',
    en: 'The energy drops, gravity wins and the star shrinks — as it shrinks it heats up and the push grows',
  },
  'caption.small': {
    ko: '다시 같아졌다 — 더 작고 뜨거운 별이 되어 균형을 찾았다',
    en: 'Equal again — the star has found its balance as a smaller, hotter star',
  },
  'caption.return': {
    ko: '에너지가 처음으로 돌아가면 별도 밀려 나가 처음 크기에서 다시 멈춘다',
    en: 'When the energy returns to where it began, the star is pushed back out and stops at its original size',
  },
} satisfies Record<string, LocalizedText>);

export type StarRadiationGravityBalanceMessageKey = keyof typeof starRadiationGravityBalanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StarRadiationGravityBalanceMessageKey): LocalizedText =>
  starRadiationGravityBalanceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StarRadiationGravityBalanceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const starRadiationGravityBalanceSchema: BundleSchema = {
  id: STAR_RADIATION_GRAVITY_BALANCE_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 에너지가 늘고, 별이 부풀어 멈추고, 줄고, 오그라들어 멈추고, 돌아간다.
  parameters: [],

  stages: [
    {
      id: 'one-star',
      label: text('label.stage'),
      constants: {
        energyCalm: ENERGY_CALM,
        energyHigh: ENERGY_HIGH,
        energyLow: ENERGY_LOW,
        calmRadius: CALM_RADIUS,
        pressureExponent: PRESSURE_EXPONENT,
        arrowPerForce: ARROW_PER_FORCE,
        innerLayer: INNER_LAYER,
        settleSharpness: SETTLE_SHARPNESS,
        coreRadius: CORE_RADIUS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'cross-section', label: text('label.view'), default: true }],

  /** 원판 하나라 세로가 그림 크기를 정한다. 기본 높이로 둔다 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 별의 칠이 맨 아래, 그 위에 층 고리, 화살표는 맨 위에 와야
   * 별 안쪽을 향하는 중력 화살표가 칠에 묻히지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 균형 → 에너지 늘림 → 부풂 → 큰 균형 → 에너지 줄임 → 오그라듦 → 작은 균형 →
   * 에너지 되돌림 → 처음 크기로. 바꾸는 단계(`boost` · `cut` · `restore`) 동안 별은 아직 제 크기라
   * 한쪽이 이기는 것이 먼저 보이고, 가라앉는 단계(`swell` · `shrink` · `return`)에서 크기가 따라간다.
   */
  timeline: {
    phases: [
      { id: 'calm', duration: HOLD_CALM, caption: key('caption.calm') },
      { id: 'boost', duration: CHANGE, ease: 'smooth', caption: key('caption.swell') },
      { id: 'swell', duration: SETTLE, caption: key('caption.swell') },
      { id: 'big', duration: HOLD, caption: key('caption.big') },
      { id: 'cut', duration: CHANGE, ease: 'smooth', caption: key('caption.shrink') },
      { id: 'shrink', duration: SETTLE, caption: key('caption.shrink') },
      { id: 'small', duration: HOLD, caption: key('caption.small') },
      { id: 'restore', duration: CHANGE, ease: 'smooth', caption: key('caption.return') },
      { id: 'return', duration: RETURN, caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 균형을 1 초 남짓 보고 곧 에너지가 늘기 시작한다. */
  startAt: 2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정역학 평형의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: starRadiationGravityBalanceMessages,
};
