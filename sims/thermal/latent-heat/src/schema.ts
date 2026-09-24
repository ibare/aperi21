// ========================================================================
// latent-heat — 선언
// ========================================================================
// 질문: 계속 같은 세기로 데우는데 왜 온도가 멈추는 구간이 있는가.
//
// −20 ℃ 얼음 1 kg 을 일정한 세기로 쉬지 않고 데운다. 왼쪽 그릇에서는 얼음이 줄고
// 물이 늘다가(녹음), 다시 물이 줄고 김이 는다(끓음). 오른쪽 시간-온도 곡선은 그동안
// 0 ℃ 와 100 ℃ 에서 평평하게 누워 있다 — 열은 계속 들어가는데 온도가 멈춰 있다.
// 평평한 구간의 길이는 녹음 334 kJ · 끓음 2260 kJ 을 넣는 데 걸린 시간이다.
//
// 상평형 그림(압력에 따라 경계를 건너는 방식)은 이웃 `phase-diagram` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:latent-heat` 와 문자 그대로 일치한다 (C4). */
export const LATENT_HEAT_ID = 'latent-heat';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 얼음의 질량(kg). */
export const MASS_KG = 1;
/** 처음 온도 · 녹는점 · 끓는점(℃). */
export const T_START = -20;
export const T_MELT = 0;
export const T_BOIL = 100;
/** 얼음 · 물의 비열(kJ/(kg·K)). */
export const C_ICE = 2.09;
export const C_WATER = 4.18;
/** 녹음 · 끓음의 잠열(kJ/kg). */
export const L_FUSION = 334;
export const L_VAPOR = 2260;
/**
 * 가열 세기(kJ 를 조각 시계 1 초에). 실제 가열기보다 훨씬 세다 — 녹이고 끓이는 데
 * 실제로 걸리는 수십 분을 12 초에 담는다. 이 수는 화면에 띄우지 않는다 (NOTES b).
 */
export const POWER = 250;
/** 곡선 온도축의 아래 · 위 끝(℃). 표시 범위라 스테이지에서 바꾼다 (원칙 2). */
export const AXIS_MIN = -30;
export const AXIS_MAX = 120;
/** 김 알갱이 수 · 알갱이가 김 기둥을 한 번 오르는 데 걸리는 시간(초) · 자리 시드. */
export const STEAM_DOTS = 42;
export const STEAM_RISE_S = 2.4;
export const SEED = 7;
/** 그릇 속 얼음 조각 수. */
export const ICE_CUBES = 4;

/** 기본 상수에서 나오는 단계별 열량(kJ). 시간표의 기본 단계 길이가 여기서 온다. */
const E_ICE = MASS_KG * C_ICE * (T_MELT - T_START);
const E_MELT = MASS_KG * L_FUSION;
const E_WATER = MASS_KG * C_WATER * (T_BOIL - T_MELT);
const E_BOIL = MASS_KG * L_VAPOR;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. y 는 위. 왼쪽 그릇, 오른쪽 시간-온도 곡선.
// ------------------------------------------------------------------------

/** 그릇 안쪽의 왼쪽 · 오른쪽 x, 바닥 · 윗가장자리 y. */
export const POT_X0 = 0;
export const POT_X1 = 2.2;
export const POT_BOTTOM = 0.55;
export const POT_TOP = 2.35;
/** 얼음이 모두 녹았을 때의 물 높이(그릇 바닥에서). */
export const WATER_FULL = 1.1;
/** 얼음 조각의 처음 한 변. 녹는 동안 남은 질량의 제곱근으로 줄어든다. */
export const ICE_SIDE = 0.42;
/** 얼음이 물에 뜰 때 물 위로 나오는 몫(한 변에 대한). */
export const ICE_ABOVE = 0.1;
/** 가열기 판 [가로, 세로]. 윗면이 y = 0 이다. */
export const HEATER_SIZE: readonly [number, number] = [2.4, 0.3];
/** 열 화살표의 아래 끝 y 와 길이. 가열기 윗면에서 그릇 바닥 아래까지. */
export const HEAT_ARROW_Y = 0.07;
export const HEAT_ARROW_LEN = 0.38;
/** 김 기둥의 위 끝 y. */
export const STEAM_TOP = 3.55;
/** 상 이름 글자의 오른쪽 끝 x(그릇 왼쪽). */
export const PHASE_LABEL_X = -0.2;
/** 김 이름 글자의 y. */
export const STEAM_LABEL_Y = 3.0;

/** 곡선 판 — 원점(시간 0, 온도 AXIS_MIN)의 자리와 가로 · 세로 크기. */
export const GRAPH_X0 = 3.7;
export const GRAPH_Y0 = 0.15;
export const GRAPH_W = 8.0;
export const GRAPH_H = 3.25;
/** 곡선이 온도축에서 떨어져 시작하는 거리 — 첫 오름이 축선에 묻히지 않게. */
export const GRAPH_PAD = 0.25;
/** 축이 곡선 끝보다 더 나가는 길이. */
export const AXIS_OVERHANG = 0.3;
/** 평평한 구간을 재는 치수선이 곡선에서 떨어진 거리 · 그 글자가 떨어진 거리. */
export const FLAT_DIM_GAP = 0.2;
export const FLAT_LABEL_GAP = 0.42;

/**
 * 프레이밍은 주장의 일부다. 가로는 상 이름 글자부터 시간축 끝까지, 세로는 가열기 아래
 * 캡션 자리부터 김 기둥 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.15, maxX: 12.45, minY: -0.95, maxY: 3.85 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 가열기를 켜기 전, 얼음이 담겨 있는 동안. */
export const READY = 1.2;
/**
 * 가열 단계 넷의 기본 길이 = 그 단계의 열량 ÷ 가열 세기. 물리는 이 수를 보지 않고
 * 가열이 시작한 뒤 흐른 시간 × 세기로 넣은 열을 센다. 단계는 **캡션만** 고른다 —
 * 단계 길이를 스테이지 상수에서 끌어올 자리가 없다 (NOTES c, G13 · G143).
 */
export const HEAT_ICE = E_ICE / POWER;
export const MELT = E_MELT / POWER;
export const HEAT_WATER = E_WATER / POWER;
export const BOIL = E_BOIL / POWER;
/**
 * 얼음 데우기(0.17 초)는 너무 짧아 곡선의 첫 오름이 눈에 안 잡힌다. 이 단계만 네 배
 * 느리게 흘린다 — 곡선의 모양(가로 = 조각 시계)은 그대로다 (NOTES b).
 */
export const HEAT_ICE_SLOW = 0.25;
/** 가열기를 끄고 곡선을 읽는 동안 · 다음 주기로 흐려지는 동안. */
export const HOLD = 3.2;
export const FADE = 0.6;
/** 도착한 순간 녹음이 시작하고 흐른 시간(초). */
export const ARRIVE_INTO_MELT = 0.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const latentHeatMessages = Object.freeze({
  'label.title': { ko: '잠열', en: 'Latent heat' },
  'label.stage': { ko: '얼음 · 일정한 가열', en: 'Ice, steady heating' },
  'label.view': { ko: '그릇과 시간-온도 곡선', en: 'Pot and temperature–time curve' },
  /** 그릇 속 상 이름. */
  'label.ice': { ko: '얼음', en: 'ice' },
  'label.water': { ko: '물', en: 'water' },
  'label.steam': { ko: '김', en: 'steam' },
  /** 곡선 축 이름. */
  'label.tempAxis': { ko: '온도', en: 'temperature' },
  'label.timeAxis': { ko: '시간 →', en: 'time →' },
  /** 온도축 눈금 글자. 값은 선언한 온도를 끼운다 (C1). */
  'label.tick': { ko: '{t} ℃', en: '{t} ℃' },
  /** 평평한 구간 아래 · 위에 붙는 잠열 글자. 값은 선언한 잠열을 끼운다. */
  'label.latent': { ko: '{l} kJ/kg', en: '{l} kJ/kg' },
  'caption.ready': {
    ko: '{t0} ℃ 얼음 {m} kg 이 가열기 위 그릇에 담겨 있다',
    en: '{m} kg of ice at {t0} ℃ sits in a pot on the heater',
  },
  'caption.heatIce': {
    ko: '일정한 세기로 데운다 — 얼음의 온도가 오른다',
    en: 'Heating at a steady rate — the ice warms up',
  },
  'caption.melt': {
    ko: '같은 세기로 계속 데우는데 온도가 {tm} ℃ 에서 멈췄다 — 얼음이 줄고 물이 는다',
    en: 'Still heating at the same rate, yet the temperature has stopped at {tm} ℃ — the ice shrinks, the water grows',
  },
  'caption.heatWater': {
    ko: '얼음이 다 녹자 온도가 다시 오른다',
    en: 'Once the ice is gone, the temperature climbs again',
  },
  'caption.boil': {
    ko: '물이 끓는 동안 온도가 {tb} ℃ 에서 멈춰 있다 — 물이 줄고 김이 는다',
    en: 'While the water boils, the temperature stays at {tb} ℃ — the water shrinks, the steam grows',
  },
  'caption.hold': {
    ko: '물이 모두 김이 되었다 — {tb} ℃ 에서 멈춘 구간이 {tm} ℃ 에서 멈춘 구간보다 훨씬 길다',
    en: 'All the water is now steam — the flat stretch at {tb} ℃ is far longer than the one at {tm} ℃',
  },
} satisfies Record<string, LocalizedText>);

export type LatentHeatMessageKey = keyof typeof latentHeatMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LatentHeatMessageKey): LocalizedText => latentHeatMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LatentHeatMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const latentHeatSchema: BundleSchema = {
  id: LATENT_HEAT_ID,
  title: text('label.title'),
  category: 'thermal',
  timeModel: 'periodic',

  // 조작기가 없다 — 주장은 「같은 세기로 데우는데 멈춘다」 이고, 그것은 누르지 않아도
  // 한 주기 안에 선다. 잠열 · 비열 · 질량 · 세기는 스테이지 상수다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        massKg: MASS_KG,
        tStart: T_START,
        tMelt: T_MELT,
        tBoil: T_BOIL,
        cIce: C_ICE,
        cWater: C_WATER,
        lFusion: L_FUSION,
        lVapor: L_VAPOR,
        power: POWER,
        axisMin: AXIS_MIN,
        axisMax: AXIS_MAX,
        steamDots: STEAM_DOTS,
        steamRiseS: STEAM_RISE_S,
        seed: SEED,
        iceCubes: ICE_CUBES,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 세로가 비싸다. 그릇 + 김 기둥 높이에 곡선을 맞추고, 아래에 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 얼음 조각은 물 **위**에, 곡선은 안내 점선 위에, 지금 점은
   * 곡선 위에 그려야 한다. 층 순서로는 `region`(물)이 얼음 · 점을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 담겨 있음 → 얼음 데우기 → 녹음 → 물 데우기 → 끓음 → 멈춘 곡선 → 흐려짐.
   * 가열 네 단계는 열량 ÷ 세기의 기본 길이를 갖고, 그동안 가열기는 쉬지 않는다.
   */
  timeline: {
    phases: [
      { id: 'ready', duration: READY, caption: key('caption.ready') },
      {
        id: 'heat-ice',
        duration: HEAT_ICE,
        timeScale: HEAT_ICE_SLOW,
        caption: key('caption.heatIce'),
      },
      { id: 'melt', duration: MELT, caption: key('caption.melt') },
      { id: 'heat-water', duration: HEAT_WATER, caption: key('caption.heatWater') },
      { id: 'boil', duration: BOIL, caption: key('caption.boil') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 얼음이 녹기 시작하고 조금 지난 자리에서 연다.
   * 곡선에는 벌써 −20 ℃ 에서 0 ℃ 까지의 오름과 평평한 머리가 그려져 있다.
   */
  startAt: READY + HEAT_ICE + ARRIVE_INTO_MELT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { m: 'massText', t0: 'startText', tm: 'meltText', tb: 'boilText' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 곡선에서 읽을 것은 눈금 값이 아니라 **평평하게
   * 누운 두 구간과 그 길이** 다. 온도 눈금은 선언한 세 온도에만 둔다.
   */

  messages: latentHeatMessages,
};
