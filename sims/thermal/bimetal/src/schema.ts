// ========================================================================
// bimetal — 선언
// ========================================================================
// 질문: 팽창률이 다른 두 금속을 붙인 띠는 데우면 왜, 어느 쪽으로 휘는가.
//
// 한 끝을 물린 띠. 위 장은 황동(잘 늘어난다), 아래 장은 강철. 데우면 황동이 더 늘어
// 볼록한 바깥이 되며 띠가 아래로 휘고, 실온보다 식히면 황동이 더 줄어 오목한 안쪽이
// 되며 위로 휜다.
//
// 휜 정도는 두 장의 늘음 차에서 계산하되 과장 배율로 키워 그리고, 그 배율을 화면에 알린다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:bimetal` 와 문자 그대로 일치한다 (C4). */
export const BIMETAL_ID = 'bimetal';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 띠의 길이(mm) — 물린 끝에서 자유 끝까지. */
export const LENGTH_MM = 100;
/** 한 장의 두께(mm). 두 장이 같다 — 두 장 가운데 사이 거리가 이 값이다. */
export const LAYER_MM = 0.5;
/** 황동 · 강철의 선팽창 계수 α 의 가수(×10⁻⁶ /K). */
export const ALPHA_BRASS_E6 = 19;
export const ALPHA_STEEL_E6 = 12;
/** 실온(곧은 띠) · 데운 온도 · 식힌 온도(℃). */
export const T_ROOM = 20;
export const T_HOT = 120;
export const T_COLD = -40;
/**
 * 휨 과장 배율. 휜 각을 이만큼 키워 그린다. 100 mm 띠를 100 K 데우면 실제로는 약 8° 휜다 —
 * 보이기는 하나 식힐 때(약 5°) 곧은 자리와 가려 읽기 어렵다. 화면에 이 배율을 적는다.
 */
export const EXAGGERATION = 4;
/** 온도계 눈금의 아래 · 위 끝(℃). */
export const AXIS_MIN = -60;
export const AXIS_MAX = 140;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 물린 끝이 원점, 띠는 +x 로 뻗는다. y 는 위.
// ------------------------------------------------------------------------

/** 띠를 그리는 길이(월드) — `LENGTH_MM` 이 이 길이다. */
export const STRIP_WORLD = 5;
/**
 * 한 장을 그리는 두께(월드). 실제 비율(0.5 : 100)이면 선 한 줄이라 두 장이 갈리지 않는다 —
 * 물건을 보이게 하는 그림 치수다. 휨 계산은 이 값이 아니라 `LAYER_MM` 을 쓴다.
 */
export const LAYER_WORLD = 0.24;
/** 물림쇠(띠를 무는 벽 토막)의 가로 · 위아래 끝. */
export const CLAMP_W = 0.5;
export const CLAMP_BOTTOM = -0.55;
export const CLAMP_TOP = 0.55;
/** 이름표를 붙이는 자리 — 띠 길이에 대한 몫. */
export const NAME_AT = 0.2;
/** 과장 배율 알림 글자의 자리. */
export const NOTE_POS: readonly [number, number] = [2.5, 1.45];

/** 온도계 관의 중심 x · 아래 · 위 끝 y · 폭과 아래 알뿌리 반지름. */
export const THERMO_X = -1.7;
export const THERMO_BOTTOM = -0.9;
export const THERMO_TOP = 1.3;
export const THERMO_WIDTH = 0.26;
export const BULB_R = 0.22;

/**
 * 프레이밍은 주장의 일부다. 가로는 온도계 눈금 글자부터 띠 끝까지, 세로는 가장 아래로 휜
 * 띠 끝 · 캡션 자리부터 가장 위로 휜 띠 끝 · 알림 글자까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.9, maxX: 5.4, minY: -2.1, maxY: 1.6 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 실온의 곧은 띠를 읽는 동안. */
export const ROOM = 1.8;
/** 데우며 띠가 휘는 동안. */
export const HEAT = 2.6;
/** 데운 그림을 읽는 동안. */
export const HOT = 3.2;
/** 실온으로 식으며 곧아지는 동안. */
export const BACK = 1.8;
/** 다시 곧은 띠. */
export const MID = 1.0;
/** 실온보다 식히며 반대로 휘는 동안. */
export const CHILL = 2.4;
/** 식힌 그림을 읽는 동안. */
export const COLD = 3.2;
/** 실온으로 데워지며 곧아지는 동안. 끝나면 실온 그림으로 이어진다. */
export const REWARM = 1.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const bimetalMessages = Object.freeze({
  'label.title': { ko: '바이메탈', en: 'Bimetallic strip' },
  'label.operation': { ko: '팽창률 차이가 만드는 휨', en: 'Bending from unequal expansion' },
  'label.stage': { ko: '황동 · 강철 띠', en: 'Brass–steel strip' },
  'label.view': { ko: '옆에서 본 띠', en: 'Strip from the side' },
  /** 두 장의 이름표 — 색 대신 이름과 결로 가른다. */
  'label.brass': { ko: '황동', en: 'brass' },
  'label.steel': { ko: '강철', en: 'steel' },
  /** 온도계 눈금 글자. 값은 선언한 세 온도를 끼운다 (C1). */
  'label.temp': { ko: '{t} ℃', en: '{t} ℃' },
  /** 과장 배율 알림. */
  'label.exaggeration': {
    ko: '휜 정도는 {x} 배로 키워 그렸다',
    en: 'The bend is drawn {x} times larger',
  },
  'caption.room': {
    ko: '{room} ℃ — 황동과 강철 두 장을 붙인 띠가 곧게 뻗어 있다',
    en: '{room} ℃ — the strip of brass bonded to steel lies straight',
  },
  'caption.heat': {
    ko: '데우자 띠가 아래로 휘기 시작한다',
    en: 'As it is heated, the strip starts to bend downward',
  },
  'caption.hot': {
    ko: '{hot} ℃ — 황동이 볼록한 바깥, 강철이 오목한 안쪽에 놓이게 휘었다',
    en: '{hot} ℃ — it has bent with the brass on the outer, convex side and the steel on the inside',
  },
  'caption.back': {
    ko: '{room} ℃ 로 식으며 띠가 다시 곧아진다',
    en: 'Cooling back to {room} ℃, the strip straightens again',
  },
  'caption.chill': {
    ko: '실온보다 식히자 이번에는 위로 휘기 시작한다',
    en: 'Cooled below room temperature, it now starts to bend upward',
  },
  'caption.cold': {
    ko: '{cold} ℃ — 이번에는 황동이 오목한 안쪽, 강철이 볼록한 바깥에 놓였다',
    en: '{cold} ℃ — now the brass is on the inner, concave side and the steel on the outside',
  },
  'caption.rewarm': {
    ko: '{room} ℃ 로 데워지며 띠가 다시 곧아진다',
    en: 'Warming back to {room} ℃, the strip straightens again',
  },
} satisfies Record<string, LocalizedText>);

export type BimetalMessageKey = keyof typeof bimetalMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BimetalMessageKey): LocalizedText => bimetalMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BimetalMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const bimetalSchema: BundleSchema = {
  id: BIMETAL_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — α 둘 · 두께 · 길이 · 세 온도 · 배율은 스테이지 상수다. 자동 진행이
  // 데움과 식힘을 오가며 휘는 방향이 뒤집히는 것까지 말한다.
  parameters: [],

  stages: [
    {
      id: 'brass-steel',
      label: text('label.stage'),
      constants: {
        lengthMm: LENGTH_MM,
        layerMm: LAYER_MM,
        alphaBrassE6: ALPHA_BRASS_E6,
        alphaSteelE6: ALPHA_STEEL_E6,
        tRoom: T_ROOM,
        tHot: T_HOT,
        tCold: T_COLD,
        exaggeration: EXAGGERATION,
        axisMin: AXIS_MIN,
        axisMax: AXIS_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'strip-side', label: text('label.view'), default: true }],

  /** 세로가 비싸다. 띠는 가로로 길다 — 위아래로 휜 끝 + 캡션 한 줄이면 된다. */
  canvas: { height: 270, minHeight: 230 },

  /**
   * 겹침이 판정 장치다. 곧은 자리 점선은 띠 아래에, 물림쇠는 띠 뿌리 위에, 온도계 채움은
   * 관 바탕 위에, 관 둘레는 채움 위에 그려야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 실온 → 데움 → 데운 그림 → 실온으로 → 곧은 띠 → 식힘 → 식힌 그림 → 실온으로.
   * 마지막 단계가 끝난 그림이 곧 첫 단계의 곧은 띠라 흐려짐이 없다.
   */
  timeline: {
    phases: [
      { id: 'room', duration: ROOM, caption: key('caption.room') },
      { id: 'heat', duration: HEAT, ease: 'smooth', caption: key('caption.heat') },
      { id: 'hot', duration: HOT, caption: key('caption.hot') },
      { id: 'back', duration: BACK, ease: 'smooth', caption: key('caption.back') },
      { id: 'mid', duration: MID, caption: key('caption.room') },
      { id: 'chill', duration: CHILL, ease: 'smooth', caption: key('caption.chill') },
      { id: 'cold', duration: COLD, caption: key('caption.cold') },
      { id: 'rewarm', duration: REWARM, ease: 'smooth', caption: key('caption.rewarm') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 데우며 휘는 도중에서 연다. */
  startAt: 3.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: {
      room: 'roomText',
      hot: 'hotText',
      cold: 'coldText',
    },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 휘는 방향이고, 과장 배율 때문에
   * 격자는 거짓 눈금이 된다.
   */

  messages: bimetalMessages,
};
