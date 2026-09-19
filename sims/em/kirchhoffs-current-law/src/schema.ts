// ========================================================================
// kirchhoffs-current-law — 선언
// ========================================================================
// 질문: 갈림점(마디)에서 전하는 어디로 가는가.
//
// 전지에서 온 본선 하나가 마디에서 저항이 다른 세 가지로 갈린다. 본선 · 가지마다 같은
// 간격의 전자 알갱이가 전류에 비례한 빠르기로 흐른다. 마디 바로 앞 · 바로 뒤의 문을
// 같은 시간 동안 지난 알갱이를 세어 오른쪽 판에 네모로 쌓는다 — 들어온 것 한 더미,
// 가지마다 나간 것 한 더미. 세 더미를 한 줄로 포개면 들어온 더미와 높이가 같다.
// 아래 가지의 저항을 바꿔 나뉘는 몫을 바꾼 뒤 다시 세도 또 같다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:kirchhoffs-current-law` 와 문자 그대로 일치한다 (C4). */
export const KIRCHHOFFS_CURRENT_LAW_ID = 'kirchhoffs-current-law';

// ------------------------------------------------------------------------
// 물리량 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전지의 전압(V). 내부 저항 · 도선 저항은 없다고 둔다. */
export const EMF = 6;
/** 세 가지의 저항(Ω). 아래 가지는 두 값 사이를 오간다 — 처음 값(a) · 바꾼 값(b). */
export const R1 = 2;
export const R2 = 3;
export const R3_A = 6;
export const R3_B = 2;
/**
 * 표시 배율 — 1 A 가 1 초에 문으로 내보내는 알갱이 수. 실제 전자 수가 아니라 셀 수 있는
 * 수다. 세는 단계 길이(초) × 이 값 × 전류(A) 가 한 더미의 네모 수가 된다.
 */
export const CARRIERS_PER_AMP_SECOND = 0.5;
/** 알갱이 사이 간격(월드). 모든 도선에서 같다 — 도선의 알갱이 밀도가 같다. 빠르기 = 알갱이 수/초 × 간격. */
export const CARRIER_SPACING = 0.4;
/** 알갱이 꼬리 길이 = 빠르기 × 이 시간(초). 빠른 가지일수록 꼬리가 길다. */
export const TRAIL_SECONDS = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 조각의 배치 계산이다.
// ------------------------------------------------------------------------

/** 들어오는 마디 A 와 다시 모이는 마디 B. */
export const NODE_A: readonly [number, number] = [-3, 0];
export const NODE_B: readonly [number, number] = [3, 0];
/** 세 가지의 높이(위 · 가운데 · 아래)와 가로로 곧게 뻗는 구간의 양 끝 x. */
export const BRANCH_Y = [1.4, 0, -1.4] as const;
export const ROW_START_X = -2.1;
export const ROW_END_X = 2.1;
/** 저항 중심 x. `circuitElement` resistor 는 소자 로컬 ±1 을 두 단자로 쓴다. */
export const RESISTOR_X = 0;
/** 본선 — B 에서 오른쪽 · 아래로 돌아 왼쪽 변을 올라 A 로 들어온다. */
export const LOOP_RIGHT = 3.9;
export const LOOP_LEFT = -4.6;
export const LOOP_BOTTOM = -2.4;
/** 전지 — 왼쪽 변 위의 가운데 높이, 두 판 사이 간격, 긴 판(+) · 짧은 판(−)의 반 길이. */
export const BATTERY_Y = -1.2;
export const BATTERY_PLATE_GAP = 0.24;
export const BATTERY_LONG_HALF = 0.42;
export const BATTERY_SHORT_HALF = 0.22;
/** 문 — 들어오는 문은 마디 A 에서 본선을 따라 이만큼 앞, 나가는 문은 가지마다 이 x. */
export const IN_GATE_BEFORE = 0.55;
export const OUT_GATE_X = -1.55;

/** 세는 판 — 들어온 더미 x, 가지마다 나간 더미 x(첫째가 포갠 더미 자리), 바닥 높이, 네모 사이. */
export const IN_COL_X = 5.0;
export const OUT_COL_X = [5.95, 6.55, 7.15] as const;
export const TALLY_BASE_Y = -2.05;
export const TALLY_PITCH = 0.3;

/**
 * 프레이밍은 주장의 일부다. 가로는 전지 이름표부터 셋째 더미 이름표까지, 세로는 위 가지
 * 이름표 위부터 더미 이름표 · 캡션 줄 아래까지. 가장 큰 더미(여덟)가 들어가도록 처음부터 잡는다.
 */
export const SCENE_BOUNDS = { minX: -5.8, maxX: 7.65, minY: -3.35, maxY: 2.1 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/**
 * 세는 동안 · 포개는 동안 · 견주는 동안 · 저항을 바꾼 뒤 흐름을 보는 동안.
 *
 * 문을 지나는 알갱이가 세는 창의 경계와 겹치지 않게, 세기 시작하는 순간 문 앞 알갱이가
 * 반 간격 앞에 오도록 알갱이 줄을 맞춘다(physics). 두 번째 세기에서도 그 자리가 되려면
 * 첫 세기 시작부터 둘째 세기 시작까지 도선마다 흐른 알갱이 수가 정수여야 한다 —
 * 기본값에서는 도선마다 알갱이 수/초가 0.5 의 배수라 그 사이 단계 길이의 합이 짝수 초면 된다(6 + 2 초).
 * 이 관계는 선언할 자리가 없다(G129, NOTES).
 */
export const COUNT = 2;
export const STACK = 1;
export const HOLD = 3;
export const SWAP = 2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const kirchhoffsCurrentLawMessages = Object.freeze({
  'label.title': { ko: '키르히호프 전류 법칙', en: "Kirchhoff's current law" },
  'label.operation': { ko: '마디에서의 전하 보존', en: 'Conservation of charge at a junction' },
  'label.stage': { ko: '세 가지', en: 'Three branches' },
  'label.view': { ko: '회로', en: 'Circuit' },
  'label.node': { ko: '마디', en: 'junction' },
  'label.in': { ko: '들어온 것', en: 'in' },
  'label.out': { ko: '나간 것', en: 'out' },
  'label.emf': { ko: '{v} V', en: '{v} V' },
  /** 가지 이름 · 전지 극 · 전자 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.r1': { ko: 'R₁', en: 'R₁' },
  'label.r2': { ko: 'R₂', en: 'R₂' },
  'label.r3': { ko: 'R₃', en: 'R₃' },
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  'caption.count': {
    ko: '마디로 들어온 알갱이와 세 가지로 나간 알갱이를 같은 동안 센다',
    en: 'Counting, over the same interval, the particles entering the junction and those leaving by each of the three branches',
  },
  'caption.stack': {
    ko: '세 가지로 나간 더미를 한 줄로 포갠다',
    en: 'The three outgoing piles are stacked into one column',
  },
  'caption.equal': {
    ko: '포갠 높이가 들어온 더미와 같다 — 마디에 남는 알갱이는 없다',
    en: 'The stacked column is exactly as tall as the incoming pile — nothing is left behind at the junction',
  },
  'caption.swapDown': {
    ko: '아래 가지의 저항을 {r3a} Ω 에서 {r3b} Ω 로 줄였다 — 그 가지의 흐름이 빨라졌다',
    en: 'The lower branch resistor is lowered from {r3a} Ω to {r3b} Ω — the flow in that branch speeds up',
  },
  'caption.countAgain': {
    ko: '나뉘는 몫이 달라진 채로 다시 센다',
    en: 'Counting again, now that the current divides differently',
  },
  'caption.equalAgain': {
    ko: '몫은 달라졌어도 나간 것을 모두 포개면 여전히 들어온 것과 같다',
    en: 'The shares have changed, yet everything that left, stacked together, still equals what came in',
  },
  'caption.swapBack': {
    ko: '아래 가지의 저항을 {r3a} Ω 로 되돌렸다',
    en: 'The lower branch resistor is set back to {r3a} Ω',
  },
} satisfies Record<string, LocalizedText>);

export type KirchhoffsCurrentLawMessageKey = keyof typeof kirchhoffsCurrentLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: KirchhoffsCurrentLawMessageKey): LocalizedText => kirchhoffsCurrentLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: KirchhoffsCurrentLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const kirchhoffsCurrentLawSchema: BundleSchema = {
  id: KIRCHHOFFS_CURRENT_LAW_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 세고, 포개고, 저항을 바꿔 다시 센다.
  parameters: [],

  stages: [
    {
      id: 'three-branches',
      label: text('label.stage'),
      constants: {
        emf: EMF,
        r1: R1,
        r2: R2,
        r3a: R3_A,
        r3b: R3_B,
        carriersPerAmpSecond: CARRIERS_PER_AMP_SECOND,
        carrierSpacing: CARRIER_SPACING,
        trailSeconds: TRAIL_SECONDS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'circuit', label: text('label.view'), default: true }],

  /** 회로 하나와 세는 판, 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 알갱이는 전선 · 저항 기호 **위**, 이름표는 맨 위. 층 순서로는 plugin 기호가 알갱이 위로 올 수 있다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = (센다 → 포갠다 → 견준다) × 두 가지 저항 배치, 사이마다 저항 바꾸기.
   *
   * 단계 id 의 끝 글자(`-a` · `-b`)가 그 단계의 저항 배치다 — `swap-b` 가 시작하는 순간
   * 아래 가지가 `r3b` 로 바뀌고, `swap-a` 가 시작하는 순간 `r3a` 로 돌아온다. 알갱이가
   * 흐른 거리는 단계마다 (빠르기 × 흐른 시간) 을 이어 더한 닫힌 식이라 같은 시각은 같은
   * 화면이고 주기 경계에서 튀지 않는다.
   */
  timeline: {
    phases: [
      { id: 'count-a', duration: COUNT, caption: key('caption.count') },
      { id: 'stack-a', duration: STACK, ease: 'smooth', caption: key('caption.stack') },
      { id: 'hold-a', duration: HOLD, caption: key('caption.equal') },
      { id: 'swap-b', duration: SWAP, caption: key('caption.swapDown') },
      { id: 'count-b', duration: COUNT, caption: key('caption.countAgain') },
      { id: 'stack-b', duration: STACK, ease: 'smooth', caption: key('caption.stack') },
      { id: 'hold-b', duration: HOLD, caption: key('caption.equalAgain') },
      { id: 'swap-a', duration: SWAP, caption: key('caption.swapBack') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 알갱이가 도선을 채워 흐르고 첫 네모들이 쌓여 있다. */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식 · 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 저항 값은 스테이지 상수다 — state 가 글자로 옮겨 둔다(G133 우회).
    vars: { r3a: 'r3a', r3b: 'r3b' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 거리가 없다 — 세는 것은 네모의 수다. */

  messages: kirchhoffsCurrentLawMessages,
};
