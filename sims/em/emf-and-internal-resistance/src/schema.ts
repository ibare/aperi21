// ========================================================================
// emf-and-internal-resistance — 선언
// ========================================================================
// 질문: 전지에서 전류를 많이 끌어 쓰면 단자 전압은 어떻게 되는가.
//
// 왼쪽에 회로 한 벌이 있다 — 점선 상자(전지) 안에 기전력 ε 칸과 작은 내부 저항 r 이
// 한 줄로 들어 있고, 바깥에 부하 R 이 이어진다. 스위치를 닫고 바깥 저항을 단계마다
// 줄이면 전류(전자 흐름)가 빨라지고, 전지 옆 전위 막대에서 r 에서 내려가는 몫(사선)이
// 커지는 만큼 단자 전압(채움)이 낮아진다. 오른쪽 V–I 평면에는 단계마다 점이 찍혀
// 절편 ε 에서 내려가는 한 직선 위에 놓인다.
//
// 전압 · 전류 비례(원점을 지나는 직선)는 ohms-law 의 몫이고, 고리를 도는 전위 계단은
// kirchhoffs-voltage-law 의 몫이다. 여기서는 전지 **안** 에서 잃는 몫 하나만 본다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:emf-and-internal-resistance` 와 문자 그대로 일치한다 (C4). */
export const EMF_AND_INTERNAL_RESISTANCE_ID = 'emf-and-internal-resistance';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 기전력 ε(V). 화면 글자로 그대로 쓴다. */
export const EMF = 6;
/** 내부 저항 r(Ω). */
export const INTERNAL_RESISTANCE = 1;
/** 단계마다의 바깥 저항(Ω) — 줄여 갈수록 전류를 많이 끌어 쓴다. */
export const LOAD_1 = 5;
export const LOAD_2 = 2;
export const LOAD_3 = 1;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 스테이지 상수로 둔다.
// ------------------------------------------------------------------------

/** 전류 1 A 가 만드는 알갱이 속력(월드/초). */
export const FLOW_SPEED_PER_AMP = 0.6;
/** 도선 위 전자 알갱이 간격(월드). 모든 단계에서 같다 — 빠르기만 바뀐다. */
export const CARRIER_SPACING = 0.62;
/** 알갱이 꼬리 길이 = 속력 × 이 시간(초). 가장 빠른 꼬리가 간격을 넘지 않게. */
export const TRAIL_SECONDS = 0.16;
/** 1 V 가 몇 월드 높이인가 — 전위 막대와 V–I 평면이 같은 배율이라 ε 높이가 나란하다. */
export const WORLD_PER_VOLT = 0.36;
/** V–I 평면 가로 배율 — 1 A 가 몇 월드인가. */
export const PLOT_WORLD_PER_AMP = 0.85;
/** 평면 축이 닿는 값 — 가로축 끝 전류(A) · 세로축 끝 전압(V). 직선도 가로축 끝까지 긋는다. */
export const PLOT_AXIS_CURRENT = 4;
export const PLOT_AXIS_VOLTAGE = 7;
/**
 * 저항 지그재그 길이 배율 — 1 Ω 이 몇 월드인가. 바깥 R 과 내부 r 이 같은 배율 · 같은 톱니
 * 간격이라, 같은 저항이면 같은 크기로 보인다. 바깥 저항이 줄면 지그재그가 짧아진다.
 */
export const RESISTOR_WORLD_PER_OHM = 0.38;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 전위 막대, 가운데 회로, 오른쪽에 V–I 평면.
// ------------------------------------------------------------------------

/** 회로 사각형의 왼쪽(전지 쪽) · 오른쪽 x, 아래 · 위 변 y. */
export const LOOP_LEFT = -5.3;
export const LOOP_RIGHT = -2.2;
export const LOOP_BOTTOM = -1.3;
export const LOOP_TOP = 1.75;

/** 전지 상자(점선) — 반폭 · 아래 · 위 y. 상자 끝이 단자다. */
export const BOX_HALF = 0.42;
export const BOX_BOTTOM = -0.85;
export const BOX_TOP = 1.3;

/** ε 칸 — + 판(긴 판) y, 두 판 사이, 긴 판 · 짧은 판 반폭. */
export const CELL_PLUS_Y = 0.95;
export const CELL_GAP = 0.1;
export const CELL_LONG_HALF = 0.26;
export const CELL_SHORT_HALF = 0.14;

/** 내부 저항 지그재그의 가운데 y(왼쪽 변 위, 전지 상자 안). */
export const INTERNAL_CENTER_Y = -0.05;

/** 바깥 저항 — 위 변 위 가운데 x. */
export const LOAD_CENTER_X = -3.75;
/** 두 저항 공통 — 톱니 하나의 길이, 톱니 높이(월드). */
export const RESISTOR_TOOTH_PITCH = 0.19;
export const RESISTOR_AMPLITUDE = 0.11;

/** 스위치 — 아래 변 위 받침점 x · 닿는 점 x · 열렸을 때 들린 높이(월드). */
export const SWITCH_PIVOT_X = -4.05;
export const SWITCH_CONTACT_X = -3.45;
export const SWITCH_OPEN_LIFT = 0.32;

/** 전위 막대 — 왼쪽 · 오른쪽 x. 바닥은 회로 아래 변과 같은 높이(= 평면 원점 높이). */
export const BAR_LEFT = -7.65;
export const BAR_RIGHT = -7.3;

/** 방향 표식(회로 안쪽) — 높이 · 전자 화살표 꼬리 x · 전류 화살표 꼬리 x · 길이. */
export const DIRECTION_Y = 0.95;
export const ELECTRON_ARROW_FROM = -3.85;
export const CURRENT_ARROW_FROM = -3.55;
export const DIRECTION_ARROW_LEN = 0.7;

/** V–I 평면의 원점(월드). 세로는 막대 바닥과 같다. */
export const PLOT_ORIGIN_X = -0.7;
export const PLOT_ORIGIN_Y = LOOP_BOTTOM;

/**
 * 프레이밍은 주장의 일부다. 가로는 전위 막대 왼쪽 이름표부터 평면 가로축 이름까지,
 * 세로는 캡션 줄부터 바깥 저항 이름표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -8.25, maxX: 3.45, minY: -2.35, maxY: 2.45 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 스위치가 열린 채 머무는 동안 — 전류 0, 단자 전압 = ε. */
export const OPEN_HOLD = 2.4;
/** 바깥 저항 한 단계를 머무는 동안. 흐름의 빠르기와 막대 높이를 견줄 만큼. */
export const LOAD_HOLD = 2.6;
/** 점들을 잇는 직선이 ε 절편에서 뻗어 나가는 동안. */
export const LINE_GROW = 1.4;
/** 직선을 읽는 동안 · 다음 주기로 넘어가며 점과 직선이 흐려지는 동안. */
export const READ_HOLD = 3.2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const emfAndInternalResistanceMessages = Object.freeze({
  'label.title': { ko: '기전력과 내부 저항', en: 'EMF and internal resistance' },
  'label.operation': { ko: '단자 전압이 낮아지는 이유', en: 'Why the terminal voltage drops' },
  'label.stage': { ko: '부하 줄이기', en: 'Shrinking the load' },
  'label.view': { ko: '회로와 V–I 평면', en: 'Circuit and the V–I plane' },
  /** 값이 끼는 이름표 — 기호 · 단위는 표식이지만 값이 끼므로 문안 키로 둔다 (C1). */
  'label.emfValue': { ko: 'ε = {e} V', en: 'ε = {e} V' },
  'label.internalValue': { ko: 'r = {r} Ω', en: 'r = {r} Ω' },
  'label.loadValue': { ko: 'R = {r} Ω', en: 'R = {r} Ω' },
  'label.pointLoad': { ko: '{r} Ω', en: '{r} Ω' },
  /** 기호 · 축. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.emf': { ko: 'ε', en: 'ε' },
  'label.terminal': { ko: 'V', en: 'V' },
  'label.drop': { ko: 'Ir', en: 'Ir' },
  'label.axisV': { ko: 'V', en: 'V' },
  'label.axisI': { ko: 'I', en: 'I' },
  'label.origin': { ko: '0', en: '0' },
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  'label.current': { ko: 'I', en: 'I' },
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'caption.open': {
    ko: '스위치가 열려 있다 — 전류가 흐르지 않아 단자 전압이 기전력 {e} V 그대로다',
    en: 'The switch is open — no current flows, so the terminal voltage equals the EMF, {e} V',
  },
  'caption.load1': {
    ko: '스위치를 닫아 {r1} Ω 을 이었다 — 전류가 흐르고, 전지 안 r 에서 내려가는 몫만큼 단자 전압이 낮다',
    en: 'The switch closes onto {r1} Ω — current flows, and the terminal voltage sits lower by the drop across r inside the cell',
  },
  'caption.load2': {
    ko: '바깥 저항을 {r2} Ω 으로 줄였다 — 전류가 늘어 r 에서 내려가는 몫이 커지고 단자 전압이 내려간다',
    en: 'The load shrinks to {r2} Ω — more current flows, the drop across r grows, and the terminal voltage falls',
  },
  'caption.load3': {
    ko: '{r3} Ω 으로 더 줄였다 — 전류는 더 늘고 단자 전압은 더 내려간다',
    en: 'Down to {r3} Ω — the current grows again and the terminal voltage falls further',
  },
  'caption.line': {
    ko: '점들은 ε 에서 출발해 내려가는 한 직선 위에 놓인다',
    en: 'The points lie on one straight line that starts at ε and slopes down',
  },
  'caption.read': {
    ko: '많이 끌어 쓸수록 전지 안에서 잃는 몫이 커져 단자 전압이 내려간다',
    en: 'The more current you draw, the more is lost inside the cell, and the lower the terminal voltage',
  },
} satisfies Record<string, LocalizedText>);

export type EmfAndInternalResistanceMessageKey = keyof typeof emfAndInternalResistanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EmfAndInternalResistanceMessageKey): LocalizedText =>
  emfAndInternalResistanceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EmfAndInternalResistanceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const emfAndInternalResistanceSchema: BundleSchema = {
  id: EMF_AND_INTERNAL_RESISTANCE_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 스위치가 닫히고, 바깥 저항이 한 단계씩 줄고, 점이 한 직선에 놓인다.
  parameters: [],

  stages: [
    {
      id: 'shrinking-load',
      label: text('label.stage'),
      constants: {
        emf: EMF,
        internalResistance: INTERNAL_RESISTANCE,
        load1: LOAD_1,
        load2: LOAD_2,
        load3: LOAD_3,
        flowSpeedPerAmp: FLOW_SPEED_PER_AMP,
        carrierSpacing: CARRIER_SPACING,
        trailSeconds: TRAIL_SECONDS,
        worldPerVolt: WORLD_PER_VOLT,
        plotWorldPerAmp: PLOT_WORLD_PER_AMP,
        plotAxisCurrent: PLOT_AXIS_CURRENT,
        plotAxisVoltage: PLOT_AXIS_VOLTAGE,
        resistorWorldPerOhm: RESISTOR_WORLD_PER_OHM,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 막대 · 회로 · 평면, 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 알갱이는 도선 **위**를 흘러야 하고, 평면의 점은 직선 **위**에
   * 찍혀야 「직선 위에 놓인다」 로 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 열림 → 부하 1 → 부하 2 → 부하 3 → 직선 → 읽기 → 흐려짐.
   *
   * 바깥 저항은 단계 **경계에서** 바뀐다(스위치를 닫는 순간 · 저항을 바꿔 끼우는 순간).
   * 단계 안에서는 전류가 일정해 흐름의 빠르기와 막대 높이를 견줄 수 있다. 부하 3 은
   * 흐려짐까지 이어지고, 다음 주기 첫 단계에서 스위치가 다시 열린다.
   */
  timeline: {
    phases: [
      { id: 'open', duration: OPEN_HOLD, caption: key('caption.open') },
      { id: 'load1', duration: LOAD_HOLD, caption: key('caption.load1') },
      { id: 'load2', duration: LOAD_HOLD, caption: key('caption.load2') },
      { id: 'load3', duration: LOAD_HOLD, caption: key('caption.load3') },
      { id: 'line', duration: LINE_GROW, ease: 'smooth', caption: key('caption.line') },
      { id: 'read', duration: READ_HOLD, caption: key('caption.read') },
      { id: 'fade', duration: FADE, caption: key('caption.read') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 전지와 막대 · 평면의 첫 점이 이미 서 있다. */
  startAt: 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 끼우는 값은 스테이지 상수를 state 가 글자로 옮긴 것이다(장부 G133).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { e: 'emf', r1: 'load1', r2: 'load2', r3: 'load3' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 평면의 축은 값의 비례를 보이는 데만 쓰고,
   * 거리 격자를 깔면 회로 쪽에도 「몇 미터인가」 가 끼어든다.
   */

  messages: emfAndInternalResistanceMessages,
};
