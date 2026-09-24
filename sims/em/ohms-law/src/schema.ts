// ========================================================================
// ohms-law — 선언
// ========================================================================
// 질문: 같은 저항에 전압을 올리면 전류는 어떻게 되는가.
//
// 두 회로가 위아래로 놓인다 — 같은 전지에 작은 저항 · 큰 저항. 전지를 한 칸씩 더해
// 전압을 단계로 올리면 두 회로의 전자 흐름이 함께 빨라지고, 오른쪽 I–V 평면에 단계마다
// 점이 하나씩 찍힌다. 한 저항의 점들은 원점을 지나는 한 직선 위에 놓이고, 저항이 큰
// 회로의 직선은 더 눕는다.
//
// 비옴 소자(다이오드 · 전구)의 휘는 곡선은 iv-characteristic 의 몫이다. 전류가 무엇을
// 세는 것인가는 electric-current 의 몫이라 여기서는 흐름의 빠르기만 쓴다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:ohms-law` 와 문자 그대로 일치한다 (C4). */
export const OHMS_LAW_ID = 'ohms-law';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 단계마다의 전압(V). 전지 칸 1 · 2 · 3 개에 맞춘 정박값이다 — 화면 글자로 그대로 쓴다.
 * 칸 수와 전압이 비례한다는 관계는 선언할 자리가 없다 (NOTES (c) G143).
 */
export const VOLTAGE_1 = 2;
export const VOLTAGE_2 = 4;
export const VOLTAGE_3 = 6;
/** 위 회로의 작은 저항 · 아래 회로의 큰 저항(Ω). */
export const RESISTANCE_SMALL = 5;
export const RESISTANCE_LARGE = 10;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 스테이지 상수로 둔다.
// ------------------------------------------------------------------------

/** 전류 1 A 가 만드는 알갱이 속력(월드/초). 속력이 전류에 비례한다는 것이 그림의 전부다. */
export const FLOW_SPEED_PER_AMP = 1.5;
/** 도선 위 전자 알갱이 간격(월드). 두 회로가 같다 — 촘촘함이 아니라 빠르기만 다르다. */
export const CARRIER_SPACING = 0.7;
/**
 * 알갱이 꼬리 길이 = 속력 × 이 시간(초). 정지 화면에서도 빠르기가 꼬리 길이로 읽힌다.
 * 가장 빠른 흐름의 꼬리가 알갱이 간격을 넘지 않게 잡는다 — 넘으면 꼬리가 이어져 한 줄이 된다.
 */
export const TRAIL_SECONDS = 0.25;
/** I–V 평면 배율 — 1 V 가 가로 몇 월드, 1 A 가 세로 몇 월드인가. */
export const PLOT_WORLD_PER_VOLT = 0.5;
export const PLOT_WORLD_PER_AMP = 2.1;
/** 평면 축이 닿는 값 — 가로축 끝 전압(V) · 세로축 끝 전류(A). 직선도 가로축 끝까지 긋는다. */
export const PLOT_AXIS_VOLTAGE = 7;
export const PLOT_AXIS_CURRENT = 1.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 회로 둘(위 · 아래), 오른쪽에 I–V 평면.
// ------------------------------------------------------------------------

/** 회로 사각형의 왼쪽(전지 쪽) · 오른쪽 x. */
export const LOOP_LEFT = -6.4;
export const LOOP_RIGHT = -2.3;
/** 위 회로의 아래 · 위 변 y. */
export const LOOP_SMALL_BOTTOM = 0.6;
export const LOOP_SMALL_TOP = 1.9;
/** 아래 회로의 아래 · 위 변 y. */
export const LOOP_LARGE_BOTTOM = -1.35;
export const LOOP_LARGE_TOP = -0.05;

/** 전지 칸 — 칸 하나의 간격(월드), 칸 안 두 판 사이, 긴 판(+) · 짧은 판(−)의 반폭. */
export const CELL_PITCH = 0.3;
export const CELL_GAP = 0.09;
export const CELL_LONG_HALF = 0.26;
export const CELL_SHORT_HALF = 0.14;
/** 전지에 붙일 수 있는 칸의 수 — 전지 자리의 높이를 이 칸 수로 미리 잡는다. */
export const CELL_MAX = 3;

/** 저항 지그재그 — 위 변 위 가운데 x, 가로 길이, 톱니 수, 톱니 높이(월드). */
export const RESISTOR_CENTER_X = -4.1;
export const RESISTOR_LENGTH = 1.1;
export const RESISTOR_TEETH = 6;
export const RESISTOR_AMPLITUDE = 0.13;

/** 방향 표식(위 회로 안쪽) — 높이 · 전자 화살표 꼬리 x · 전류 화살표 꼬리 x · 길이. */
export const DIRECTION_Y = 1.25;
export const ELECTRON_ARROW_FROM = -4.55;
export const CURRENT_ARROW_FROM = -4.05;
export const DIRECTION_ARROW_LEN = 0.9;

/** I–V 평면의 원점(월드). */
export const PLOT_ORIGIN_X = -0.6;
export const PLOT_ORIGIN_Y = -1.35;

/**
 * 프레이밍은 주장의 일부다. 가로는 전지 이름표부터 직선 끝 저항 이름표까지, 세로는
 * 캡션 줄부터 위 회로 저항 이름표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -7.6, maxX: 3.8, minY: -2.35, maxY: 2.45 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 전압 단계 하나를 머무는 동안. 흐름의 빠르기를 눈으로 견줄 만큼. */
export const STEP_HOLD = 2.6;
/** 점들을 잇는 직선이 원점에서 뻗어 나가는 동안. */
export const LINE_GROW = 1.4;
/** 두 직선을 읽는 동안 · 다음 주기로 넘어가며 점과 직선이 흐려지는 동안. */
export const READ_HOLD = 3.2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const ohmsLawMessages = Object.freeze({
  'label.title': { ko: '옴 법칙', en: "Ohm's law" },
  'label.stage': { ko: '두 저항', en: 'Two resistors' },
  'label.view': { ko: '회로와 I–V 평면', en: 'Circuits and the I–V plane' },
  /** 값이 끼는 이름표 — 단위 기호는 표식이지만 값이 끼므로 문안 키로 둔다 (C1). */
  'label.voltage': { ko: '{v} V', en: '{v} V' },
  'label.resistance': { ko: '{r} Ω', en: '{r} Ω' },
  /** 축 · 방향 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.axisV': { ko: 'V', en: 'V' },
  'label.axisI': { ko: 'I', en: 'I' },
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  'label.current': { ko: 'I', en: 'I' },
  'label.origin': { ko: '0', en: '0' },
  'caption.step1': {
    ko: '두 회로에 같은 {v1} V 를 걸었다 — 전자가 흐르고, 전류가 평면에 점으로 찍힌다',
    en: 'Both circuits get the same {v1} V — electrons flow, and each current is marked as a point',
  },
  'caption.step2': {
    ko: '전지를 한 칸 더해 {v2} V — 두 회로의 흐름이 함께 빨라지고 점이 더 높이 찍힌다',
    en: 'One more cell makes {v2} V — both flows speed up together and the points sit higher',
  },
  'caption.step3': {
    ko: '한 칸 더해 {v3} V — 흐름은 더 빨라지고 점은 더 높이 찍힌다',
    en: 'Another cell makes {v3} V — the flows speed up again and the points sit higher still',
  },
  'caption.line': {
    ko: '한 저항의 점들은 원점을 지나는 한 직선 위에 놓인다',
    en: "One resistor's points all lie on a single straight line through the origin",
  },
  'caption.compare': {
    ko: '{r} Ω 은 같은 전압에 전류가 적게 흘러 직선이 더 눕는다',
    en: 'At the same voltage, less current flows through {r} Ω, so its line lies flatter',
  },
} satisfies Record<string, LocalizedText>);

export type OhmsLawMessageKey = keyof typeof ohmsLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: OhmsLawMessageKey): LocalizedText => ohmsLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: OhmsLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const ohmsLawSchema: BundleSchema = {
  id: OHMS_LAW_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 전압이 한 칸씩 오르고, 점이 한 직선에 놓인다.
  parameters: [],

  stages: [
    {
      id: 'two-resistors',
      label: text('label.stage'),
      constants: {
        voltage1: VOLTAGE_1,
        voltage2: VOLTAGE_2,
        voltage3: VOLTAGE_3,
        resistanceSmall: RESISTANCE_SMALL,
        resistanceLarge: RESISTANCE_LARGE,
        flowSpeedPerAmp: FLOW_SPEED_PER_AMP,
        carrierSpacing: CARRIER_SPACING,
        trailSeconds: TRAIL_SECONDS,
        plotWorldPerVolt: PLOT_WORLD_PER_VOLT,
        plotWorldPerAmp: PLOT_WORLD_PER_AMP,
        plotAxisVoltage: PLOT_AXIS_VOLTAGE,
        plotAxisCurrent: PLOT_AXIS_CURRENT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 회로 둘과 평면, 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 알갱이는 도선 **위**를 흘러야 하고, 평면의 점은 직선 **위**에
   * 찍혀야 「직선 위에 놓인다」 로 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 전압 1 단계 → 2 단계 → 3 단계 → 직선 → 두 직선 읽기 → 흐려짐.
   *
   * 전압은 단계 **경계에서** 한 칸씩 오른다(전지 칸을 더하는 순간). 단계 안에서는
   * 흐름의 빠르기가 일정해, 한 단계 동안 빠르기를 견줄 수 있다. 3 단계의 전압은
   * 흐려짐까지 이어지고, 다음 주기 첫 단계에서 1 칸으로 돌아간다.
   */
  timeline: {
    phases: [
      { id: 'step1', duration: STEP_HOLD, caption: key('caption.step1') },
      { id: 'step2', duration: STEP_HOLD, caption: key('caption.step2') },
      { id: 'step3', duration: STEP_HOLD, caption: key('caption.step3') },
      { id: 'line', duration: LINE_GROW, ease: 'smooth', caption: key('caption.line') },
      { id: 'compare', duration: READ_HOLD, caption: key('caption.compare') },
      { id: 'fade', duration: FADE, caption: key('caption.compare') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 전자는 모든 시각에 도선을 채우고 흐른다. 첫 점도 이미 찍혀 있다. */
  startAt: 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 끼우는 값은 스테이지 상수를 state 가 글자로 옮긴 것이다(장부 G133).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { v1: 'voltage1', v2: 'voltage2', v3: 'voltage3', r: 'resistanceLarge' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 평면의 축은 값의 비례를 보이는 데만 쓰고,
   * 거리 격자를 깔면 회로 쪽에도 「몇 미터인가」 가 끼어든다.
   */

  messages: ohmsLawMessages,
};
