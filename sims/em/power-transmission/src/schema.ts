// ========================================================================
// power-transmission — 선언
// ========================================================================
// 질문: 같은 전력을 먼 마을로 보낼 때 왜 전압을 올리는가.
//
// 발전소 → 긴 송전선 → 마을 을 위아래 두 줄로 둔다. 두 발전소가 같은 전력을 같은 저항의
// 선으로 보낸다. 위는 낮은 전압 그대로, 아래는 변압기로 전압을 올려 보내고 마을 앞에서
// 다시 내린다. 전압이 높은 아래 선에는 같은 전력에 전류가 적게 흐르고(알갱이가 성기고
// 화살표 `I` 가 짧다), 선에서 열로 새는 전력은 전류의 제곱으로 줄어 거의 사라진다.
// 오른쪽 막대 둘이 「선에서 샌 열」 과 「마을이 받은 전력」 을 같은 배율로 견준다.
//
// 변압기가 전압을 바꾸는 원리는 transformer 의 몫, 저항이 열을 내는 것은 joule-heating 의
// 몫이다. 여기서는 두 선의 **전류와 손실의 크기 차이** 하나만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:power-transmission` 와 문자 그대로 일치한다 (C4). */
export const POWER_TRANSMISSION_ID = 'power-transmission';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 발전소가 보내는 전력(kW). 두 줄이 같다. 화면 글자로 그대로 쓴다. */
export const POWER = 100;
/** 송전선 한 가닥의 저항(Ω). 두 줄이 같다. */
export const LINE_RESISTANCE = 5;
/** 위 줄(그대로) · 아래 줄(승압) 송전 전압(kV). 화면 글자로 그대로 쓴다. */
export const VOLTAGE_LOW = 1;
export const VOLTAGE_HIGH = 10;

// ------------------------------------------------------------------------
// 표시 정박값 — 화면에 띄우는 배수 글자. 계산해 띄우지 않고 선언값을 그대로 쓴다
// (S-piece 유효숫자). 위 전압 둘과의 관계(전압 비 · 그 제곱)는 선언할 자리가 없다 (NOTES (c) G143).
// ------------------------------------------------------------------------

/** 아래 줄 전압이 위 줄의 몇 배인가 — 전류는 그 역수만큼 준다. */
export const VOLTAGE_FACTOR = 10;
/** 아래 줄 선 손실이 위 줄의 몇 분의 일인가. */
export const LOSS_DIVISOR = 100;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 스테이지 상수로 둔다.
// ------------------------------------------------------------------------

/** 막대 — 1 kW 가 막대 높이 몇 월드인가. 열 막대와 마을 막대가 같은 배율이다. */
export const BAR_WORLD_PER_KW = 0.016;
/** 선 위 전류 알갱이 밀도 — 1 A 가 월드 길이 1 에 놓는 알갱이 수. 전류가 알갱이 촘촘함으로 보인다. */
export const CARRIERS_PER_WORLD_PER_AMP = 0.05;
/** 알갱이가 선을 따라 흐르는 빠르기(월드/초). 두 줄이 같다 — 전류 차이는 촘촘함 하나로 보인다. */
export const CARRIER_SPEED = 0.8;
/** 전류 화살표 `I` — 1 A 가 화살표 길이 몇 월드인가. */
export const CURRENT_ARROW_PER_AMP = 0.015;
/** 선에서 오르는 열 김 — 선 손실 1 kW 가 김 한 줄기에서 1 초에 내는 김 수. */
export const WISP_RATE_PER_KW = 0.3;
/** 김이 오르는 빠르기(월드/초) · 수명(초). */
export const WISP_RISE = 0.9;
export const WISP_LIFE = 1.0;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 줄이 같은 모양이고 높이만 다르다.
// ------------------------------------------------------------------------

/** 위 줄 · 아래 줄 송전선 높이. */
export const ROW_TOP_Y = 1.0;
export const ROW_BOTTOM_Y = -1.6;

/** 발전소 · 마을 그림의 가운데 x. 송전선은 발전소 오른쪽 끝에서 마을 왼쪽 끝까지. */
export const PLANT_X = -5.4;
export const TOWN_X = 3.8;
/** 발전소 · 마을 그림의 반폭(송전선이 닿는 자리). */
export const PLANT_HALF = 0.45;
export const TOWN_HALF = 0.5;

/** 아래 줄 변압기 기호(겹친 두 원) — 승압은 발전소 곁, 강압은 마을 곁. 원 반지름 · 두 원 사이. */
export const STEP_UP_X = -4.25;
export const STEP_DOWN_X = 2.75;
export const COIL_RADIUS = 0.17;
export const COIL_SPACING = 0.2;

/** 열 김이 오르는 줄기 자리(x). 두 줄이 같은 자리다. */
export const WISP_XS_FROM = -2.6;
export const WISP_XS_TO = 1.8;
export const WISP_COUNT = 5;

/** 선 아래 — 전압 이름표 x, 전류 화살표 꼬리 x, 선에서 화살표까지 내린 거리. */
export const VOLTAGE_LABEL_X = -3.3;
export const CURRENT_ARROW_FROM = -2.3;
export const CURRENT_ARROW_DROP = 0.32;

/**
 * 전자 표식 — 위 줄 선 위, 마을 곁에 한 번. 알갱이가 전자이고 관례 전류 `I` 와 반대로(마을 → 발전소)
 * 간다는 것을 밝힌다. 화살표 꼬리 x · 길이, 선에서 띄운 높이(월드).
 */
export const ELECTRON_ARROW_FROM = 3.0;
export const ELECTRON_ARROW_LEN = 0.6;
export const ELECTRON_ARROW_LIFT = 0.3;

/** 막대 — 열 막대 · 마을 막대 가운데 x, 반폭, 줄 높이에서 막대 바닥까지 내린 거리. */
export const LOSS_BAR_X = 5.0;
export const TOWN_BAR_X = 6.0;
export const BAR_HALF = 0.24;
export const BAR_BASE_DROP = 0.6;
/** 보낸 전력 점선 기준 — 막대 둘을 가로지르는 선의 좌우 여유. */
export const REFERENCE_OVERHANG = 0.12;

/**
 * 프레이밍은 주장의 일부다. 가로는 발전소 왼쪽부터 기준 점선 이름표까지, 세로는 캡션 줄부터
 * 위 줄 막대 위 끝까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6.1, maxX: 7.4, minY: -3.0, maxY: 2.25 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 두 발전소가 같은 전력을 보내고 전류가 흐르는 것을 보는 동안. */
export const FLOW_HOLD = 2.4;
/** 아래 줄 전류가 적다는 것에 눈을 두는 동안(배수 글자가 스며든다). */
export const CURRENT_HOLD = 2.4;
/** 열 막대가 차오르는 동안. */
export const LEAK_GROW = 2.2;
/** 열 손실 배수 글자가 스며드는 동안. */
export const LEAK_NOTE = 2.4;
/** 마을 막대가 차오르는 동안. */
export const ARRIVE_GROW = 2.0;
/** 다 차오른 막대를 견주는 동안. */
export const HOLD = 2.6;
/** 막대 · 배수 글자가 걷히는 동안. */
export const CLEAR = 0.8;
/** 도착한 순간 이미 흐르고 있다 — `flow` 단계에 들어와 1 초 지난 자리. */
export const START_AT = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const powerTransmissionMessages = Object.freeze({
  'label.title': { ko: '송전', en: 'Power transmission' },
  'label.stage': { ko: '같은 전력 · 두 전압', en: 'Same power, two voltages' },
  'label.view': { ko: '두 송전선', en: 'Two transmission lines' },
  /** 도식 이름 — 한 낱말이지만 언어마다 다르다. */
  'label.plant': { ko: '발전소', en: 'plant' },
  'label.town': { ko: '마을', en: 'town' },
  'label.stepUp': { ko: '승압', en: 'step-up' },
  'label.stepDown': { ko: '강압', en: 'step-down' },
  'label.lossBar': { ko: '선의 열', en: 'line heat' },
  'label.townBar': { ko: '마을', en: 'town' },
  /** 값이 끼는 이름표 — 단위 기호는 표식이지만 값이 끼므로 문안 키로 둔다 (C1). */
  'label.voltage': { ko: '{v} kV', en: '{v} kV' },
  'label.power': { ko: '{p} kW', en: '{p} kW' },
  'label.fraction': { ko: '1/{n}', en: '1/{n}' },
  /** 기호 — 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.current': { ko: 'I', en: 'I' },
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  'caption.flow': {
    ko: '두 발전소가 같은 {p} kW 를 같은 송전선으로 보낸다 — 위는 {vLow} kV 그대로, 아래는 {vHigh} kV 로 올려서',
    en: 'Both plants send the same {p} kW down identical lines — the top at {vLow} kV as is, the bottom stepped up to {vHigh} kV',
  },
  'caption.current': {
    ko: '아래 선의 전류 화살표 I 는 위의 1/{k} — 선 위 알갱이도 그만큼 성기다',
    en: 'The current arrow I on the bottom line is 1/{k} of the top one — its dots are that much sparser too',
  },
  'caption.leak': {
    ko: '위 선에서는 열이 쏟아지고 아래 선은 거의 조용하다 — 열 막대가 차오른다',
    en: 'Heat pours off the top line while the bottom line stays nearly quiet — the line-heat bars fill up',
  },
  'caption.leakNote': {
    ko: '아래 줄의 열 막대는 위의 1/{d} — 바닥에 붙어 거의 보이지 않는다',
    en: 'The bottom line-heat bar is 1/{d} of the top one — it hugs the floor, barely visible',
  },
  'caption.arrive': {
    ko: '마을이 받은 전력 — 위 마을 막대는 열 막대만큼 모자라고, 아래 마을 막대는 {p} kW 점선에 거의 붙는다',
    en: 'Power received by each town — the top town bar falls short by the heat bar, the bottom one almost meets the {p} kW line',
  },
} satisfies Record<string, LocalizedText>);

export type PowerTransmissionMessageKey = keyof typeof powerTransmissionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PowerTransmissionMessageKey): LocalizedText => powerTransmissionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PowerTransmissionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const powerTransmissionSchema: BundleSchema = {
  id: POWER_TRANSMISSION_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 두 선이 흐르고, 한 주기 안에 손실 차이를 보인다.
  parameters: [],

  stages: [
    {
      id: 'two-voltages',
      label: text('label.stage'),
      constants: {
        power: POWER,
        lineResistance: LINE_RESISTANCE,
        voltageLow: VOLTAGE_LOW,
        voltageHigh: VOLTAGE_HIGH,
        voltageFactor: VOLTAGE_FACTOR,
        lossDivisor: LOSS_DIVISOR,
        barWorldPerKw: BAR_WORLD_PER_KW,
        carriersPerWorldPerAmp: CARRIERS_PER_WORLD_PER_AMP,
        carrierSpeed: CARRIER_SPEED,
        currentArrowPerAmp: CURRENT_ARROW_PER_AMP,
        wispRatePerKw: WISP_RATE_PER_KW,
        wispRise: WISP_RISE,
        wispLife: WISP_LIFE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 두 줄과 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침 순서가 뜻을 가진다 — 선 위에 알갱이, 막대 위에 기준 점선. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 흐름 → 전류 견줌 → 열 막대 차오름 → 열 손실 배수 → 마을 막대 차오름 → 견줌 → 걷힘.
   *
   * 전류와 열 김은 주기 내내 같다(두 선의 전력 · 전압은 바뀌지 않는다). 단계가 바꾸는 것은
   * 막대와 배수 글자가 드러나는 순서뿐이다.
   */
  timeline: {
    phases: [
      { id: 'flow', duration: FLOW_HOLD, caption: key('caption.flow') },
      { id: 'current', duration: CURRENT_HOLD, ease: 'smooth', caption: key('caption.current') },
      { id: 'leak', duration: LEAK_GROW, ease: 'smooth', caption: key('caption.leak') },
      { id: 'leakNote', duration: LEAK_NOTE, ease: 'smooth', caption: key('caption.leakNote') },
      { id: 'arrive', duration: ARRIVE_GROW, ease: 'smooth', caption: key('caption.arrive') },
      { id: 'hold', duration: HOLD, caption: key('caption.arrive') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.flow') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 끼우는 값은 스테이지 상수를 state 가 글자로 옮긴 것이다(장부 G133).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { p: 'power', vLow: 'voltageLow', vHigh: 'voltageHigh', k: 'voltageFactor', d: 'lossDivisor' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 거리가 없다. */

  messages: powerTransmissionMessages,
};
