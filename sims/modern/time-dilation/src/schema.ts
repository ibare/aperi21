// ========================================================================
// time-dilation — 선언
// ========================================================================
// 질문: 빠르게 움직이는 시계는 정말 느리게 가는가 — 얼마나?
//
// 서로 맞춰 둔 정지 시계들이 한 줄로 서 있고, 그 옆 레일 위로 똑같이 생긴 시계
// 하나가 0.8c 로 지나간다. 지나가는 시계는 정지 시계 하나하나와 **나란히 서는 순간**
// 제 바늘을 견준다. 정지한 틀에서 보면 지나가는 시계의 바늘이 더 느리게 돈다 —
// 정지 시계가 다섯 번 째깍이는 동안 지나가는 시계는 세 번 째깍인다. 한 째깍이
// γ = 5/3 배 길다 (Δt = γΔτ).
//
// 빛 시계 작도(light-clock) · 뮤온 증거(muon-decay-evidence) · 쌍둥이(twin-paradox)는
// 이 조각의 몫이 아니다. 여기서 일어나는 것은 「바늘이 느리게 돈다」 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:time-dilation` 와 문자 그대로 일치한다 (C4). */
export const TIME_DILATION_ID = 'time-dilation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 가로 단위는 정지 시계 사이 간격이다.
// ------------------------------------------------------------------------

/** 지나가는 시계의 속력 v/c. γ = 1/√(1−β²) = 5/3 이 되는 값이다. */
export const BETA = 0.8;
/** β = 0.8 에 맞춘 γ 의 표시값(분자 · 분모). 계산해 줄이지 않고 선언한다 — β 와 짝으로 바꾼다(G143). */
export const GAMMA_NUM = 5;
export const GAMMA_DEN = 3;
/** 정지 시계 한 째깍(바늘 한 바퀴)의 시간(초). 지나가는 시계도 제 틀에서는 같다. */
export const TICK_PERIOD = 1;
/**
 * 정지 시계 사이 간격(월드). 지나가는 시계는 정지 시계 한 째깍 동안 **정확히 한 칸**을
 * 간다 — 그래서 정지 시계 k 옆에 설 때마다 정지 시계들이 막 k 번째 째깍을 마친다.
 */
export const CLOCK_SPACING = 1;
/** 정지 시계 개수. 첫 시계(0)에서 마지막 시계까지 지나가는 동안 정지 시계는 (개수 − 1) 번 째깍인다. */
export const REST_CLOCKS = 6;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초). 합이 째깍 주기의 정수배(10)라 정지 시계 바늘이
// 주기 끝에서 튀지 않는다.
// ------------------------------------------------------------------------

/** 지나가는 시계가 왼쪽 밖에서 나타나는 동안. */
export const APPEAR = 0.4;
/** 첫 정지 시계(0)에 다가오는 동안. 나타남과 합해 한 째깍이다. */
export const APPROACH = 0.6;
/** 정지 시계 줄 옆을 지나는 동안 = (정지 시계 개수 − 1) × 째깍 주기. */
export const PASS = (REST_CLOCKS - 1) * TICK_PERIOD;
/** 줄 끝을 지나 오른쪽으로 빠져나가며 흐려지는 동안. */
export const AFTER = 1.2;
/** 남은 기록과 γ 를 읽는 동안. */
export const HOLD = 2.2;
/** 기록이 흐려지며 다음 주기로 넘어가는 동안. */
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 배치 — 월드. 위에서부터 지나가는 시계 · 레일 · 정지 시계 줄 · 째깍 기록.
// ------------------------------------------------------------------------

/** 시계 문자판 반지름(월드). 두 종류가 같다 — 같은 시계다. */
export const CLOCK_RADIUS = 0.3;
/** 지나가는 시계의 중심 높이와 그 아래 레일 높이. */
export const MOVING_Y = 1.5;
export const RAIL_Y = 1.05;
/** 지나가는 시계의 째깍 기록 숫자가 놓이는 높이(레일 아래). */
export const MOVING_COUNT_Y = 0.84;
/** 정지 시계 줄 높이 · 그 아래 째깍 기록 눈금 · 숫자 높이. */
export const REST_Y = 0;
export const REST_MARK_Y = -0.5;
export const REST_COUNT_Y = -0.72;
/** 지나가는 시계 이름표 높이. */
export const MOVING_LABEL_Y = 2.0;
/** γ 치수선 높이(레일 위). 지나가는 시계가 떠난 뒤에만 나온다. */
export const GAMMA_DIM_Y = 1.3;
/** 정지 시계 줄 이름표의 오른쪽 끝(월드 x). */
export const REST_LABEL_X = -0.5;

/**
 * 프레이밍은 주장의 일부다. 가로는 줄 이름표부터 줄 끝을 지나 빠져나가는 자리까지,
 * 세로는 지나가는 시계 이름표 위부터 째깍 기록 숫자 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.3, maxX: 6.4, minY: -1.35, maxY: 2.2 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const timeDilationMessages = Object.freeze({
  'label.title': { ko: '시간 지연', en: 'Time dilation' },
  'label.stage': { ko: '0.8c 로 지나가는 시계', en: 'A clock passing at 0.8c' },
  'label.view': { ko: '정지한 틀', en: 'Rest frame' },
  'label.rest': { ko: '서로 맞춘 정지 시계들', en: 'Synchronized clocks at rest' },
  'label.moving': { ko: '지나가는 시계 {beta}c →', en: 'Passing clock {beta}c →' },
  /** 째깍 기록 눈금에 붙는 수. 센 횟수라 값만 끼운다. */
  'label.count': { ko: '{n}', en: '{n}' },
  /** 정해 둔 β 에 맞춘 γ. 계산해 줄이지 않고 선언값을 쓴다 (S-piece 유효숫자). */
  'label.gamma': { ko: 'γ = {n}/{d}', en: 'γ = {n}/{d}' },
  'caption.approach': {
    ko: '서로 맞춰 둔 정지 시계들 옆으로 똑같은 시계 하나가 빠르게 다가온다',
    en: 'An identical clock races toward a row of synchronized clocks at rest',
  },
  'caption.pass': {
    ko: '나란히 설 때마다 견주면 — 지나가는 시계의 바늘이 더 느리게 돈다',
    en: 'Compared side by side at each clock — the passing clock’s hand turns more slowly',
  },
  'caption.result': {
    ko: '정지한 시계가 {rest}번 째깍이는 동안 지나간 시계는 {moving}번 째깍였다',
    en: 'While the clocks at rest ticked {rest} times, the passing clock ticked only {moving}',
  },
  'caption.gamma': {
    ko: '지나가는 시계가 한 번 째깍일 때 정지한 시계는 γ = {n}/{d} 번 째깍인다',
    en: 'For each tick of the passing clock, the clocks at rest tick γ = {n}/{d} times',
  },
} satisfies Record<string, LocalizedText>);

export type TimeDilationMessageKey = keyof typeof timeDilationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TimeDilationMessageKey): LocalizedText => timeDilationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TimeDilationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const timeDilationSchema: BundleSchema = {
  id: TIME_DILATION_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 시계가 지나가고, 기록이 남고, 다시 온다.
  parameters: [],

  stages: [
    {
      id: 'passing',
      label: text('label.stage'),
      constants: {
        beta: BETA,
        gammaNum: GAMMA_NUM,
        gammaDen: GAMMA_DEN,
        tickPeriod: TICK_PERIOD,
        spacing: CLOCK_SPACING,
        restClocks: REST_CLOCKS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rest-frame', label: text('label.view'), default: true }],

  /** 가로 8.7 칸 · 세로 3.5 칸. 세로가 비싸다 — 줄 둘과 기록 줄만 담는다. */
  canvas: { height: 360, minHeight: 320 },

  /** 째깍 기록의 세로 안내선이 시계 문자판 아래로 지나가야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 다가옴 → 나란히 지남 → 빠져나감 → 기록을 읽음 → 흐려짐.
   * 지나가는 시계의 자리는 `pass` 시작에서 잰 시각의 함수다 — 그 순간 첫 정지 시계
   * 옆에 서고 두 시계가 모두 0 을 가리킨다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.approach') },
      { id: 'approach', duration: APPROACH, caption: key('caption.approach') },
      { id: 'pass', duration: PASS, caption: key('caption.pass') },
      { id: 'after', duration: AFTER, caption: key('caption.result') },
      { id: 'hold', duration: HOLD, caption: key('caption.gamma') },
      { id: 'fade', duration: FADE, caption: key('caption.gamma') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 지나가는 시계가 첫 정지 시계로 다가오는 중이다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { rest: 'restTicks', moving: 'movingTicks', n: 'gammaNum', d: 'gammaDen' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **째깍 수**다 —
   * 기록 눈금과 숫자가 그 자다.
   */

  messages: timeDilationMessages,
};
