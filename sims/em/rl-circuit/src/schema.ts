// ========================================================================
// rl-circuit — 선언
// ========================================================================
// 질문: 코일이 든 회로의 스위치를 닫으면 전류는 왜 단숨에 오르지 못하는가.
//
// 전지 · 코일 · 저항 · 스위치가 한 고리다. 닫는 순간 코일이 전지 전압을 **전부** 맡아
// 버티고 전류는 0 에서 출발한다. 전류가 차는 만큼 저항에 걸리는 전압(전류 × 저항)이 커지고,
// 전지 전압은 그대로이니 코일이 맡던 몫이 그만큼 저항으로 넘어간다. 코일 몫이 0 이 되면
// 전류는 전지 전압 ÷ 저항 에 다 찬다. 인덕턴스가 크면 같은 일이 더 느리게 일어난다.
//
// 화면: 왼쪽 회로, 오른쪽에 높이가 전지 전압인 기둥 하나 — 위가 코일 몫, 아래가 저항 몫.
// 둘의 경계가 올라가는 것이 「코일이 저항에 자리를 넘겨준다」 이다. 이웃 `rc-circuit` 의
// τ 그래프(τ 마다 같은 비로 주는 막대)는 되풀이하지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:rl-circuit` 와 문자 그대로 일치한다 (C4). */
export const RL_CIRCUIT_ID = 'rl-circuit';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전지 전압(V). 전지 이름표 · 기둥 꼭대기 이름표가 이 값을 그대로 쓴다. */
export const EMF = 6;
/** 저항(Ω). 다 찬 전류 = 전지 전압 ÷ 저항 = 2 A. */
export const RESISTANCE = 3;
/** 코일의 인덕턴스(H) — 칩 「작은 L」. 시간 상수 L/R = 0.8 초. */
export const INDUCTANCE = 2.4;
/** 큰 인덕턴스(H) — 칩 「큰 L」. 시간 상수 1.6 초 — 같은 일이 두 배 느리게 일어난다. */
export const INDUCTANCE_LARGE = 4.8;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2).
// ------------------------------------------------------------------------

/** 전압(V) → 기둥 높이(월드). 전지 전압 6 V 가 고리 높이(2.4)와 같다. */
export const VOLT_SCALE = 0.4;
/** 전류(A) → 전류 화살표 길이(월드). 다 찬 2 A 가 2 월드. */
export const ARROW_SCALE = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 회로, 오른쪽에 전압 기둥.
// ------------------------------------------------------------------------

/** 회로 고리의 네 변. 전지는 왼쪽 변, 코일은 위 변, 저항은 오른쪽 변, 스위치는 아래 변. */
export const LOOP_LEFT = -5.4;
export const LOOP_RIGHT = -1.8;
export const LOOP_TOP = 1.2;
export const LOOP_BOTTOM = -1.2;

/** 전지 — 왼쪽 변 가운데 높이, 두 판 사이 간격, 긴 판(+) · 짧은 판(−)의 반 길이. */
export const BATTERY_Y = 0;
export const BATTERY_PLATE_GAP = 0.22;
export const BATTERY_LONG_HALF = 0.4;
export const BATTERY_SHORT_HALF = 0.2;

/** 코일 — 위 변 가운데, 전체 폭, 감은 혹의 수 · 혹 높이. */
export const COIL_X = -3.6;
export const COIL_WIDTH = 1.8;
export const COIL_TURNS = 5;
export const COIL_HUMP = 0.26;

/** 저항 — 오른쪽 변 가운데 높이, 지그재그 전체 길이 · 옆으로 꺾이는 폭 · 마디 수. */
export const RES_Y = 0;
export const RES_LENGTH = 1.2;
export const RES_ZIG = 0.16;
export const RES_ZIGS = 6;

/** 스위치 — 아래 변. 전류는 아래 변을 오른쪽에서 왼쪽으로 흐른다. 경첩이 오른쪽, 닿는 곳이 왼쪽. */
export const SWITCH_HINGE_X = -3.1;
export const SWITCH_CONTACT_X = -4.1;

/** 전류 화살표 — 코일 아래 고리 안쪽의 높이. 가로 가운데는 고리 가운데. */
export const ARROW_Y = 0.62;

/** 전압 기둥 — 왼쪽 · 오른쪽 가장자리. 바닥은 고리 아래 변 높이다. */
export const COLUMN_LEFT = 0.3;
export const COLUMN_RIGHT = 1.0;
export const COLUMN_BASE = LOOP_BOTTOM;

/**
 * 프레이밍 — 전지 이름표 왼끝부터 기둥 이름표 너머, 세로는 캡션 줄부터 코일 이름표
 * 위까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -6.6, maxX: 2.0, minY: -2.1, maxY: 1.8 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 스위치가 열려 전류가 없는 동안. */
export const OPEN = 1.0;
/** 스위치 날이 내려와 닿는 동안. 닿는 순간(이 단계의 끝)부터 전류가 찬다. */
export const CLOSE = 0.3;
/**
 * 전류가 눈에 띄게 차오르는 동안. 기본 작은 L(시간 상수 0.8 초)이 끝날 때 98 % 가 차도록 4 배로 잡았다.
 * 큰 L(1.6 초)은 이때 86 % — 나머지는 `settle` 에서 찬다 (NOTES (c) G13).
 */
export const RISE = 3.2;
/**
 * 코일 몫이 얼마 남지 않은 채 마저 넘어가는 동안. 큰 L 도 끝날 때 97.6 % 가 찬다
 * (`rise` + `settle` = 6 초 = 큰 L 시간 상수의 3.75 배).
 */
export const SETTLE = 2.8;
/** 다 찬 채 머무는 동안. */
export const FULL = 1.5;
/** 흐려지며 처음으로 돌아가는 동안. */
export const RESET = 0.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rlCircuitMessages = Object.freeze({
  'label.title': { ko: 'RL 회로', en: 'RL circuit' },
  'label.stage': { ko: '전지 · 코일 · 저항', en: 'Battery, coil and resistor' },
  'label.view': { ko: '회로와 전압 기둥', en: 'Circuit and voltage column' },

  /** 값이 끼는 이름표 — 값은 스테이지 상수를 그대로 끼운다 (C1 · S-piece 유효숫자). */
  'label.volts': { ko: '{v} V', en: '{v} V' },
  'label.coil': { ko: 'L = {l} H', en: 'L = {l} H' },
  'label.resistor': { ko: 'R = {r} Ω', en: 'R = {r} Ω' },
  /** 전지 극 · 전류 · 기둥 몫의 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'label.current': { ko: 'I', en: 'I' },
  'label.shareCoil': { ko: 'L', en: 'L' },
  'label.shareResistor': { ko: 'R', en: 'R' },

  'control.coil': { ko: '코일', en: 'Coil' },
  'option.small': { ko: '작은 L', en: 'small L' },
  'option.large': { ko: '큰 L', en: 'large L' },

  'caption.open': {
    ko: '스위치가 열려 있다 — 전류도, 코일과 저항에 걸린 전압도 없다',
    en: 'The switch is open — no current, and no voltage across the coil or the resistor',
  },
  'caption.close': {
    ko: '스위치를 닫는다',
    en: 'The switch closes',
  },
  'caption.rise': {
    ko: '스위치를 닫아도 전류는 0 에서 서서히 찬다 — 처음엔 코일이 전지 전압을 다 맡아 버티고, 전류가 차는 만큼 그 몫이 저항으로 넘어간다',
    en: 'Even with the switch closed the current starts at zero and fills slowly — at first the coil takes the whole battery voltage, and as the current grows its share passes to the resistor',
  },
  'caption.settle': {
    ko: '코일 몫이 얼마 남지 않았다 — 남은 몫도 점점 느리게 저항으로 넘어간다',
    en: 'Little of the coil’s share is left — what remains passes to the resistor ever more slowly',
  },
  'caption.full': {
    ko: '전류가 다 찼다 — 코일은 더 버티지 않고, 전지 전압은 모두 저항에 걸린다',
    en: 'The current is full — the coil no longer holds back, and the whole battery voltage sits across the resistor',
  },
  'caption.reset': {
    ko: '처음으로 되돌린다',
    en: 'Starting over',
  },
} satisfies Record<string, LocalizedText>);

export type RlCircuitMessageKey = keyof typeof rlCircuitMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RlCircuitMessageKey): LocalizedText => rlCircuitMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RlCircuitMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rlCircuitSchema: BundleSchema = {
  id: RL_CIRCUIT_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        emf: EMF,
        resistance: RESISTANCE,
        inductance: INDUCTANCE,
        inductanceLarge: INDUCTANCE_LARGE,
        voltScale: VOLT_SCALE,
        arrowScale: ARROW_SCALE,
      },
    },
  ],

  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 회로 한 고리와 기둥 하나가 나란하다. */
  canvas: { height: 340, minHeight: 300 },

  /** 경계선은 두 몫 위, 전류 화살표는 목표 점선 화살표 위에 와야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 열림 → 닫음(날이 내려와 닿음) → 차오름 → 마저 참 → 다 참 → 되돌림.
   * 전류는 `close` 가 **끝나는 순간**(날이 닿는 순간)부터 찬다 (physics `contactTime`).
   */
  timeline: {
    phases: [
      { id: 'open', duration: OPEN, caption: key('caption.open') },
      { id: 'close', duration: CLOSE, ease: 'smooth', caption: key('caption.close') },
      { id: 'rise', duration: RISE, caption: key('caption.rise') },
      { id: 'settle', duration: SETTLE, caption: key('caption.settle') },
      { id: 'full', duration: FULL, caption: key('caption.full') },
      { id: 'reset', duration: RESET, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 닫힌 지 0.7 초, 전류가 반쯤 차 경계가 오르고 있다. */
  startAt: 2.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.2,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: rlCircuitMessages,
};
