// ========================================================================
// light-clock — 선언
// ========================================================================
// 질문: 움직이는 시계는 **왜** 느려지는가?
//
// 두 거울 사이를 빛이 오가는 시계 — 빛이 거울에 닿을 때마다 한 번 째깍인다. 똑같은
// 빛 시계 둘을 나란히 두고 하나만 옆으로 0.8c 로 움직인다. 두 시계에서 동시에 빛을
// 쏘면, 정지한 틀에서 움직이는 시계의 빛은 비스듬한 긴 길을 간다. 빛의 빠르기는
// 둘 다 c 이므로 움직이는 시계의 빛은 늦게 닿는다 — 한 째깍이 길다.
// 빛이 간 길(ct) · 거울 사이(cτ) · 시계가 옆으로 간 거리(vt)가 직각삼각형을 이루고,
// 빗변과 세로 다리의 비가 γ 다 (ct : cτ = 5 : 3).
//
// 결과(지나가는 시계의 바늘이 느리게 돈다, 5 대 3)는 이웃 time-dilation 의 몫이다.
// 여기서 일어나는 것은 「빛이 비스듬히 더 먼 길을 간다」 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:light-clock` 와 문자 그대로 일치한다 (C4). */
export const LIGHT_CLOCK_ID = 'light-clock';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 움직이는 빛 시계의 속력 v/c. γ = 1/√(1−β²) = 5/3 이 되는 값이다. */
export const BETA = 0.8;
/** β = 0.8 에 맞춘 γ 의 표시값(분자 · 분모). 계산해 줄이지 않고 선언한다 — β 와 짝으로 바꾼다(G143). */
export const GAMMA_NUM = 5;
export const GAMMA_DEN = 3;
/** 거울 사이(월드). 빛 시계의 제 한 째깍 동안 빛이 가는 길 = cτ. */
export const MIRROR_GAP = 1.8;
/** 정지한 빛 시계의 한 째깍(빛이 거울 사이를 한 번 가는 시간, 초) = τ. 빛의 빠르기 c = 거울 사이 / τ. */
export const TICK_PERIOD = 1.2;
/** 움직이는 빛 시계가 빛을 쏘는 자리(월드 x). 정지한 빛 시계는 x = 0 에 있다. */
export const START_X = 1.8;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초).
// ------------------------------------------------------------------------

/** 움직이는 빛 시계가 발사 자리로 미끄러져 오는 동안. 빛은 아직 없다. */
export const READY = 0.5;
/** 두 시계에서 동시에 빛이 떠나 정지한 시계의 빛이 위 거울에 닿기까지 = τ. */
export const RISE = TICK_PERIOD;
/** 움직이는 시계의 빛이 마저 위 거울에 닿기까지 = (γ − 1)τ. β 와 짝으로 바꾼다(G129). */
export const LAG = ((GAMMA_NUM - GAMMA_DEN) / GAMMA_DEN) * TICK_PERIOD;
/** 움직이는 시계가 오른쪽으로 계속 가며 흐려지는 동안. 빛의 길과 그 째깍의 자리가 남는다. */
export const EXIT = 0.6;
/** 남은 길 위에 직각삼각형을 작도하는 동안. */
export const BUILD = 1.4;
/** γ 가 나타나는 동안. */
export const REVEAL = 0.5;
/** 삼각형과 γ 를 읽는 동안. */
export const HOLD = 2.2;
/** 작도가 흐려지며 다음 주기로 넘어가는 동안. */
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 배치 — 월드. 아래 거울이 y = 0, 위 거울이 y = 거울 사이.
// ------------------------------------------------------------------------

/** 거울의 가로 길이(월드). 두 시계가 같다 — 같은 시계다. */
export const MIRROR_LEN = 0.9;
/** 시계 이름표를 위 거울에서 띄우는 높이(월드). */
export const CLOCK_LABEL_GAP = 0.38;
/** 정지한 빛 시계의 거울 사이를 재는 세로 치수선의 x. */
export const REST_DIM_X = -0.62;

/**
 * 프레이밍은 주장의 일부다. 가로는 정지 시계 치수 이름표부터 움직이는 시계가 빠져나가는
 * 자리와 γ 까지, 세로는 이름표 위부터 vt 이름표 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.5, maxX: 6.5, minY: -1.05, maxY: 2.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lightClockMessages = Object.freeze({
  'label.title': { ko: '빛 시계', en: 'Light clock' },
  'label.stage': { ko: '0.8c 로 움직이는 빛 시계', en: 'A light clock moving at 0.8c' },
  'label.view': { ko: '정지한 틀', en: 'Rest frame' },
  'label.rest': { ko: '정지한 빛 시계', en: 'Light clock at rest' },
  'label.moving': { ko: '움직이는 빛 시계 {beta}c →', en: 'Moving light clock {beta}c →' },
  /** 삼각형 세 변의 기호. 수식 표기라 표식이다 (C1 판정 3) — 언어마다 같다. */
  'symbol.ct': { ko: 'ct', en: 'ct' },
  'symbol.vt': { ko: 'vt', en: 'vt' },
  'symbol.ctau': { ko: 'cτ', en: 'cτ' },
  /** 정해 둔 β 에 맞춘 γ. 계산해 줄이지 않고 선언값을 쓴다 (S-piece 유효숫자). */
  'label.gamma': { ko: 'γ = ct / cτ = {n}/{d}', en: 'γ = ct / cτ = {n}/{d}' },
  'caption.ready': {
    ko: '똑같은 빛 시계 둘 — 하나는 멈춰 있고, 하나는 옆으로 {beta}c 로 움직인다',
    en: 'Two identical light clocks — one at rest, one moving sideways at {beta}c',
  },
  'caption.rise': {
    ko: '두 시계에서 빛이 동시에 떠난다 — 빠르기는 똑같이 c, 움직이는 시계의 빛은 비스듬히 간다',
    en: 'Light leaves both clocks at once — both at speed c, but the moving clock’s light travels on a slant',
  },
  'caption.lag': {
    ko: '정지한 시계는 째깍였는데, 같은 빠르기로 간 움직이는 시계의 빛은 아직 위 거울에 닿지 못했다',
    en: 'The clock at rest has ticked, yet the moving clock’s light, just as fast, has not reached its mirror',
  },
  'caption.arrive': {
    ko: '비스듬한 긴 길을 다 가서야 위 거울에 닿는다 — 움직이는 시계의 한 째깍이 더 길다',
    en: 'Only after the longer slanted path does it reach the mirror — the moving clock’s tick takes longer',
  },
  'caption.triangle': {
    ko: '빛이 간 길 ct, 거울 사이 cτ, 시계가 옆으로 간 vt 가 직각삼각형을 이룬다',
    en: 'The light’s path ct, the mirror gap cτ and the sideways shift vt form a right triangle',
  },
  'caption.gamma': {
    ko: '빗변 ct 는 거울 사이 cτ 의 {n}/{d} 배 — 같은 빠르기의 빛에게 한 째깍이 γ 배 길어진다',
    en: 'The slant ct is {n}/{d} of the gap cτ — at the same light speed, one tick lasts γ times longer',
  },
} satisfies Record<string, LocalizedText>);

export type LightClockMessageKey = keyof typeof lightClockMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LightClockMessageKey): LocalizedText => lightClockMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LightClockMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lightClockSchema: BundleSchema = {
  id: LIGHT_CLOCK_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 빛이 떠나고, 늦게 닿고, 그 길 위에 삼각형이 선다.
  parameters: [],

  stages: [
    {
      id: 'moving',
      label: text('label.stage'),
      constants: {
        beta: BETA,
        gammaNum: GAMMA_NUM,
        gammaDen: GAMMA_DEN,
        mirrorGap: MIRROR_GAP,
        tickPeriod: TICK_PERIOD,
        startX: START_X,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rest-frame', label: text('label.view'), default: true }],

  /** 가로 8 칸 · 세로 3.5 칸. 세로가 비싸다 — 거울 사이 하나와 이름표 줄만 담는다. */
  canvas: { height: 360, minHeight: 320 },

  /** 작도선이 빛의 길 아래로, 빛 알갱이가 맨 위로 오도록 scene 순서로 그린다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 다가옴 → 동시 발사(정지 시계 째깍까지) → 움직이는 빛이 마저 닿음 →
   * 시계가 빠져나감 → 삼각형 작도 → γ → 읽기 → 흐려짐.
   * 빛의 자리는 `rise` 시작에서 잰 시각의 함수다 — 그 순간 두 시계에서 빛이 떠난다.
   */
  timeline: {
    phases: [
      { id: 'ready', duration: READY, caption: key('caption.ready') },
      { id: 'rise', duration: RISE, caption: key('caption.rise') },
      { id: 'lag', duration: LAG, caption: key('caption.lag') },
      { id: 'exit', duration: EXIT, caption: key('caption.arrive') },
      { id: 'build', duration: BUILD, ease: 'smooth', caption: key('caption.triangle') },
      { id: 'reveal', duration: REVEAL, caption: key('caption.gamma') },
      { id: 'hold', duration: HOLD, caption: key('caption.gamma') },
      { id: 'fade', duration: FADE, caption: key('caption.gamma') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 두 빛이 막 떠나 위 거울로 가는 중이다. */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    /** 스테이지 상수에서 만든 문자열(`initialState`) — 문안에 수를 박지 않는다 (G133 우회). */
    vars: { beta: 'caption.beta', n: 'caption.n', d: 'caption.d' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 견줄 것은 칸 수가 아니라 **두 길이**(빗변과
   * 거울 사이)다 — 컴퍼스 호가 한쪽을 다른 쪽으로 옮겨 견준다.
   */

  messages: lightClockMessages,
};
