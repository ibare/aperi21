// ========================================================================
// iv-characteristic — 선언
// ========================================================================
// 질문: 전압을 올리면 전류가 늘 비례해 따라오는가.
//
// I–V 평면 하나에 세 소자의 곡선을 차례로 그린다. 전압을 역방향 끝에서 순방향 끝까지
// 쓸어 올리는 동안 강조색 점이 곡선을 따라 움직이며 먹색 곡선을 남긴다.
//   저항 — 원점을 지나는 직선.
//   전구 — 차가울 때 저항이 저항 소자와 같아 처음엔 그 직선을 따르다가, 뜨거워지며 눕는다.
//   다이오드 — 역방향과 문턱 아래에서는 가로축에 붙어 있다가 문턱을 넘자 치솟는다.
//
// 같은 저항에서 전압 단계로 직선을 얻는 것은 ohms-law 의 몫, 온도가 저항을 바꾸는 속사정
// (격자 떨림 · 나르개 수)은 temperature-and-resistance 의 몫이다. 여기서는 곡선의 모양만 견준다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:iv-characteristic` 와 문자 그대로 일치한다 (C4). */
export const IV_CHARACTERISTIC_ID = 'iv-characteristic';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 저항 소자(Ω). 곡선이 원점을 지나는 직선이 된다. */
export const RESISTANCE = 10;
/**
 * 전구의 차가울 때 저항(Ω). 저항 소자와 같게 두어, 원점 근처에서 두 곡선이 겹쳤다가
 * 전구 쪽만 눕는 것이 보이게 한다.
 */
export const BULB_COLD_RESISTANCE = 10;
/**
 * 전구 저항이 전압 1 V 마다 느는 몫(Ω/V). 필라멘트가 뜨거워질수록 저항이 커진다는 것을
 * R = R₀ + k|V| 로 근사한 모형 계수다 — 실제 전구의 I ∝ V^0.6 근처 모양을 낸다.
 */
export const BULB_RESISTANCE_PER_VOLT = 2;
/** 다이오드 문턱 전압(V). 가로축 눈금과 캡션에 그대로 쓴다. */
export const DIODE_THRESHOLD = 0.7;
/** 문턱에서 흐르는 다이오드 전류(A). 평면 배율로 몇 px 이라 「거의 0」 으로 보인다. */
export const DIODE_CURRENT_AT_THRESHOLD = 0.02;
/**
 * 다이오드 무릎의 날카로움(V) — 전류가 e 배 느는 전압 폭. 작을수록 문턱에서 곧게 선다.
 * I = I_th (exp((V − V_th)/w) − exp(−V_th/w)) 로 원점에서 0 이 되게 둔다.
 */
export const DIODE_KNEE_WIDTH = 0.04;

/** 쓸어 올리는 전압 구간(V) — 역방향 끝 · 순방향 끝. */
export const SWEEP_VOLTAGE_MIN = -1.5;
export const SWEEP_VOLTAGE_MAX = 6;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2).
// ------------------------------------------------------------------------

/** 평면이 담는 전류 구간(A). 곡선은 이 위 · 아래 끝에서 멈춘다 — 다이오드는 위 끝에서 멎는다. */
export const PLOT_CURRENT_MIN = -0.2;
export const PLOT_CURRENT_MAX = 0.65;
/** 평면 배율 — 1 V 가 가로 몇 월드, 1 A 가 세로 몇 월드인가. */
export const PLOT_WORLD_PER_VOLT = 1.2;
export const PLOT_WORLD_PER_AMP = 3.6;

/**
 * 프레이밍은 주장의 일부다. 가로는 역방향 축 끝부터 저항 이름표까지, 세로는 캡션 줄부터
 * 세로축 이름 위까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.3, maxX: 8.0, minY: -1.5, maxY: 2.85 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 저항 곡선을 쓸어 긋는 동안. */
export const RESISTOR_SWEEP = 2.6;
/** 전구 곡선을 쓸어 긋는 동안. 직선에서 벗어나는 것을 볼 만큼 저항보다 조금 길게. */
export const BULB_SWEEP = 3.2;
/** 다이오드 — 역방향 끝에서 문턱까지 가로축을 기는 동안 · 문턱에서 위 끝까지 치솟는 동안. */
export const DIODE_FLAT_SWEEP = 2.4;
export const DIODE_RISE_SWEEP = 1.4;
/** 세 곡선을 견주는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const COMPARE_HOLD = 3.4;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const ivCharacteristicMessages = Object.freeze({
  'label.title': { ko: 'I-V 특성 곡선', en: 'I–V characteristic curves' },
  'label.stage': { ko: '저항 · 전구 · 다이오드', en: 'Resistor, bulb and diode' },
  'label.view': { ko: 'I–V 평면', en: 'The I–V plane' },
  /** 소자 이름표. 조사가 붙지 않아도 언어마다 낱말이 달라 문안이다 (C1 판정 4). */
  'label.resistor': { ko: '저항', en: 'resistor' },
  'label.bulb': { ko: '전구', en: 'bulb' },
  'label.diode': { ko: '다이오드', en: 'diode' },
  'label.reverse': { ko: '역방향', en: 'reverse' },
  /** 값이 끼는 눈금 이름표 — 단위 기호는 표식이지만 값이 끼므로 문안 키로 둔다 (C1). */
  'label.voltage': { ko: '{v} V', en: '{v} V' },
  /** 축 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.axisV': { ko: 'V', en: 'V' },
  'label.axisI': { ko: 'I', en: 'I' },
  'label.origin': { ko: '0', en: '0' },
  'caption.resistor': {
    ko: '저항 — 전압을 쓸어 올리는 동안 점이 한 직선을 긋는다',
    en: 'Resistor — as the voltage sweeps up, the point traces one straight line',
  },
  'caption.bulb': {
    ko: '전구 — 처음엔 저항의 직선을 따르다가 그 아래로 눕는다',
    en: "Bulb — it first follows the resistor's line, then lies down below it",
  },
  'caption.diodeFlat': {
    ko: '다이오드 — 역방향에서도, {vth} V 에 이르기까지도 전류가 0 에 붙어 있다',
    en: 'Diode — in reverse and all the way up to {vth} V, the current stays pinned at 0',
  },
  'caption.diodeRise': {
    ko: '{vth} V 를 넘자 전류가 치솟는다',
    en: 'Past {vth} V, the current shoots up',
  },
  'caption.compare': {
    ko: '세 곡선 가운데 곧은 것은 저항 하나다',
    en: "Of the three curves, only the resistor's is straight",
  },
} satisfies Record<string, LocalizedText>);

export type IvCharacteristicMessageKey = keyof typeof ivCharacteristicMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: IvCharacteristicMessageKey): LocalizedText => ivCharacteristicMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: IvCharacteristicMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const ivCharacteristicSchema: BundleSchema = {
  id: IV_CHARACTERISTIC_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 점이 곡선을 긋고, 세 곡선이 차례로 쌓인다.
  parameters: [],

  stages: [
    {
      id: 'three-devices',
      label: text('label.stage'),
      constants: {
        resistance: RESISTANCE,
        bulbColdResistance: BULB_COLD_RESISTANCE,
        bulbResistancePerVolt: BULB_RESISTANCE_PER_VOLT,
        diodeThreshold: DIODE_THRESHOLD,
        diodeCurrentAtThreshold: DIODE_CURRENT_AT_THRESHOLD,
        diodeKneeWidth: DIODE_KNEE_WIDTH,
        sweepVoltageMin: SWEEP_VOLTAGE_MIN,
        sweepVoltageMax: SWEEP_VOLTAGE_MAX,
        plotCurrentMin: PLOT_CURRENT_MIN,
        plotCurrentMax: PLOT_CURRENT_MAX,
        plotWorldPerVolt: PLOT_WORLD_PER_VOLT,
        plotWorldPerAmp: PLOT_WORLD_PER_AMP,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 평면 하나와 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침이 판정 장치다 — 곡선은 축 **위**에, 지금 점은 곡선 **위**에 놓여야 「축에 붙어 있다」 로 읽힌다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 저항 → 전구 → 다이오드(문턱 아래 · 위) → 견주기 → 흐려짐.
   *
   * 곡선마다 전압을 역방향 끝에서 순방향 끝까지 쓸어 올린다. 점은 곡선 위를 화면 길이에
   * 고르게 움직인다 — 다이오드가 가로축을 기는 동안과 치솟는 동안이 두 단계로 갈린다.
   */
  timeline: {
    phases: [
      { id: 'resistor', duration: RESISTOR_SWEEP, caption: key('caption.resistor') },
      { id: 'bulb', duration: BULB_SWEEP, caption: key('caption.bulb') },
      { id: 'diodeFlat', duration: DIODE_FLAT_SWEEP, caption: key('caption.diodeFlat') },
      { id: 'diodeRise', duration: DIODE_RISE_SWEEP, caption: key('caption.diodeRise') },
      { id: 'compare', duration: COMPARE_HOLD, caption: key('caption.compare') },
      { id: 'fade', duration: FADE, caption: key('caption.compare') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 저항 직선이 벌써 원점을 넘어 뻗고 있다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 끼우는 값은 스테이지 상수를 state 가 글자로 옮긴 것이다(장부 G133).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { vth: 'diodeThreshold' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 곡선의 모양이 요점이지 값을 읽는 것이 아니다 —
   * 격자를 깔면 「몇 A 인가」 를 읽으라는 지시가 된다.
   */

  messages: ivCharacteristicMessages,
};
