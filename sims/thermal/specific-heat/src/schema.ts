// ========================================================================
// specific-heat — 선언
// ========================================================================
// 질문: 같은 질량에 같은 열을 넣으면 온도는 모두 똑같이 오르는가.
//
// 같은 질량 · 같은 처음 온도의 물 · 알루미늄 · 구리 세 덩이를 똑같은 가열기 세 개에
// 올려 같은 시간 동안 데운다. 세 가열기에서 같은 흐름으로 열 알갱이가 들어가는데,
// 온도 막대는 구리가 가장 빠르게, 물이 가장 느리게 오른다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:specific-heat` 와 문자 그대로 일치한다 (C4). */
export const SPECIFIC_HEAT_ID = 'specific-heat';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 비열(J/(kg·K)). kg 단위로 두면 정수라 `String` 으로 옮겨도 유효숫자가 줄지 않는다
 * (0.90 J/(g·K) 는 `String` 을 거치면 `0.9` 가 된다).
 */
export const C_WATER = 4180;
export const C_ALUMINUM = 900;
export const C_COPPER = 385;
/** 세 덩이 모두의 질량(g). */
export const MASS_G = 100;
/** 세 덩이 모두의 처음 온도(℃). */
export const T_START = 20;
/** 가열 단계 동안 가열기 하나가 덩이 하나에 넣는 열(J). 세 가열기가 같다. */
export const HEAT_J = 2000;
/** 가열 단계 동안 가열기 하나에서 덩이로 들어가는 열 알갱이 수 · 알갱이 하나의 이동 시간(초). */
export const GRAINS = 20;
export const GRAIN_TRAVEL = 0.8;
/** 알갱이 자리를 흩는 시드. 세 레인이 같은 시드 — 같은 흐름이 같은 모양으로 보인다. */
export const SEED = 11;
/** 온도 막대 눈금의 아래 · 위 끝(℃). 세 막대가 같은 눈금이다. */
export const AXIS_MIN = 0;
export const AXIS_MAX = 80;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 세 레인이 왼쪽부터 물 · 알루미늄 · 구리. y 는 위.
// ------------------------------------------------------------------------

/** 레인 중심 x 사이 간격. */
export const LANE_GAP = 3;
/** 덩이 크기 [가로, 세로]. 셋이 같다 — 크기 차가 원인으로 읽히지 않게 한다. */
export const BLOCK_SIZE: readonly [number, number] = [1.3, 1.4];
/** 레인 중심에서 덩이 · 가열기 중심까지의 x 차. 막대를 오른쪽에 두려고 왼쪽으로 민다. */
export const BLOCK_DX = -0.25;
/** 덩이 바닥의 y. 그 아래 틈으로 알갱이가 오른다. */
export const BLOCK_BOTTOM = 0.4;
/** 가열기 판의 크기 [가로, 세로]. 윗면이 y = 0 이다. */
export const HEATER_SIZE: readonly [number, number] = [1.3, 0.3];

/** 온도 막대(관)의 폭 · 레인 중심에서 관 중심까지의 x 차. */
export const TUBE_WIDTH = 0.24;
export const TUBE_DX = 0.75;
/** 눈금 AXIS_MIN · AXIS_MAX 가 놓이는 y. */
export const SCALE_BOTTOM = 0;
export const SCALE_TOP = 2.4;

/** 알갱이가 떠나는 y(가열기 윗면)와 닿는 y(덩이 안). */
export const GRAIN_FROM_Y = 0.02;
export const GRAIN_TO_Y = 0.75;
/** 알갱이가 가로로 흩어지는 폭(덩이 폭에 대한 몫). */
export const GRAIN_SPREAD = 0.7;

/** 물질 이름 · 비열 글자의 y — 덩이 위. */
export const NAME_Y = 2.3;
export const SPEC_Y = 2.0;

/**
 * 프레이밍은 주장의 일부다. 가로는 왼쪽 가열기 끝부터 오른쪽 막대의 처음 온도 글자까지,
 * 세로는 가열기 아래 캡션 자리부터 막대 위 끝까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -4.1, maxX: 4.6, minY: -0.75, maxY: 2.6 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 세 덩이를 가열기 위에 올려 둔 채 보이는 동안. */
export const READY = 1.5;
/** 세 가열기가 켜지는 동안. */
export const ON = 0.6;
/** 같은 열이 들어가며 막대가 오르는 동안. */
export const HEAT = 5.0;
/** 세 가열기가 꺼지는 동안. */
export const OFF = 0.5;
/** 멈춘 막대를 읽는 동안 · 다음 주기로 흐려지는 동안. */
export const HOLD = 3.5;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const specificHeatMessages = Object.freeze({
  'label.title': { ko: '비열', en: 'Specific heat' },
  'label.stage': { ko: '세 물질 · 같은 가열기', en: 'Three materials, identical heaters' },
  'label.view': { ko: '덩이와 온도 막대', en: 'Blocks and temperature bars' },
  /** 물질 이름. */
  'label.water': { ko: '물', en: 'Water' },
  'label.aluminum': { ko: '알루미늄', en: 'Aluminium' },
  'label.copper': { ko: '구리', en: 'Copper' },
  /** 비열 글자. 값은 선언한 비열을 끼운다 (C1). */
  'label.specificHeat': { ko: '{c} J/(kg·K)', en: '{c} J/(kg·K)' },
  /** 덩이 질량 글자. */
  'label.mass': { ko: '{m} g', en: '{m} g' },
  /** 처음 온도 글자. */
  'label.temp': { ko: '{t} ℃', en: '{t} ℃' },
  /** 가열이 끝난 뒤 덩이마다 받은 열. */
  'label.heat': { ko: '+{q} J', en: '+{q} J' },
  'caption.ready': {
    ko: '같은 질량 {m} g, 같은 {t} ℃ 의 물 · 알루미늄 · 구리가 똑같은 가열기 위에 있다',
    en: 'Water, aluminium and copper — the same {m} g, the same {t} ℃ — sit on identical heaters',
  },
  'caption.on': {
    ko: '세 가열기를 같은 세기로 켠다',
    en: 'All three heaters are switched on at the same setting',
  },
  'caption.heat': {
    ko: '같은 흐름으로 열이 들어가는 동안 구리 막대가 가장 빠르게, 물 막대가 가장 느리게 오른다',
    en: 'The same stream of heat flows into each — the copper bar climbs fastest, the water bar slowest',
  },
  'caption.off': {
    ko: '세 가열기를 함께 끈다',
    en: 'All three heaters are switched off together',
  },
  'caption.hold': {
    ko: '세 덩이가 똑같이 {q} J 을 받았다 — 물 막대는 조금, 구리 막대는 가장 높이 올라 있다',
    en: 'Each block took in the same {q} J — the water bar rose a little, the copper bar the most',
  },
} satisfies Record<string, LocalizedText>);

export type SpecificHeatMessageKey = keyof typeof specificHeatMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SpecificHeatMessageKey): LocalizedText => specificHeatMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SpecificHeatMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const specificHeatSchema: BundleSchema = {
  id: SPECIFIC_HEAT_ID,
  title: text('label.title'),
  category: 'thermal',
  timeModel: 'periodic',

  // 조작기가 없다 — 비열 · 질량 · 열 · 처음 온도는 스테이지 상수다. 주장은 「같은 열에
  // 서로 다르게 오른다」 이고, 그것은 세 레인을 나란히 두면 누르지 않아도 선다.
  parameters: [],

  stages: [
    {
      id: 'three-materials',
      label: text('label.stage'),
      constants: {
        cWater: C_WATER,
        cAluminum: C_ALUMINUM,
        cCopper: C_COPPER,
        massG: MASS_G,
        tStart: T_START,
        heatJ: HEAT_J,
        grains: GRAINS,
        grainTravel: GRAIN_TRAVEL,
        seed: SEED,
        axisMin: AXIS_MIN,
        axisMax: AXIS_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'blocks-and-bars', label: text('label.view'), default: true }],

  /** 세로가 비싸다. 덩이 + 위 이름 + 아래 가열기 + 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 알갱이는 덩이 **위**에, 막대 채움은 관 바탕 위에, 관 둘레는
   * 채움 위에 그려야 한다. 층 순서로는 `region`(막대)이 알갱이(`body`)를 덮는다.
   */
  drawOrder: 'scene',

  /** 한 주기 = 올려 둠 → 켬 → 같은 열이 들어감 → 끔 → 멈춘 막대 → 흐려짐. */
  timeline: {
    phases: [
      { id: 'ready', duration: READY, caption: key('caption.ready') },
      { id: 'on', duration: ON, ease: 'smooth', caption: key('caption.on') },
      { id: 'heat', duration: HEAT, caption: key('caption.heat') },
      { id: 'off', duration: OFF, ease: 'smooth', caption: key('caption.off') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 가열이 시작되고 조금 지난 자리에서 연다. */
  startAt: 2.7,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { m: 'massText', t: 'startText', q: 'heatText' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **세 막대가 처음 온도 선에서
   * 얼마나 올랐는가** 다. 세 막대가 같은 눈금 · 같은 바닥을 써서 그 높이를 눈으로 견준다.
   */

  messages: specificHeatMessages,
};
