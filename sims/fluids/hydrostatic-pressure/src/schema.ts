// ========================================================================
// hydrostatic-pressure — 선언
// ========================================================================
// 질문: 깊이가 두 배면 물이 누르는 압력은 얼마나 커지는가.
//
// 줄에 매단 작은 센서가 물통 속으로 내려간다. 센서 옆면을 누르는 압력 화살표가
// 깊이를 따라 길어지고, 화살표 꼬리가 지나간 자리가 수면에서 출발하는 **곧은
// 쐐기**를 남긴다. 깊이 h 에서 한 번 멈춰 화살표가 p 눈금에 닿고, 깊이 2h 에서는
// 정확히 2p 눈금에 닿는다 — 압력은 깊이에 정비례한다.
//
// 이웃과 겹치지 않는다. 방향과 무관함은 `pressure-isotropy`, 그릇 모양과 무관함은
// `pressure-and-container-shape` 의 몫이다. 이 조각은 「깊이에 정비례」 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:hydrostatic-pressure` 와 문자 그대로 일치한다 (C4). */
export const HYDROSTATIC_PRESSURE_ID = 'hydrostatic-pressure';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 물의 밀도(kg/m³). */
export const RHO = 1000;
/** 중력 가속도(m/s²). */
export const G = 9.8;
/** 깊이 한 칸 h(m). 월드 1 단위 = 1 m 라서 그림의 세로 한 칸이기도 하다. */
export const DEPTH_UNIT = 1;
/** 첫 번째 · 두 번째로 멈추는 깊이(h 의 배수). 1 과 2 — 이 조각이 견주는 두 깊이다. */
export const STOP_1 = 1;
export const STOP_2 = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 수면이 y = 0, 아래가 깊은 쪽이다.
// ------------------------------------------------------------------------

/**
 * 압력 → 화살표 길이 배율(월드 m per Pa). 깊이 h 의 압력(9800 Pa)이 2.1 m 가
 * 되게 잡았다(1.45 로 처음 찍었을 때 그림이 임베드 가로의 절반도 못 썼다).
 * 세로가 배율을 정하므로 남는 가로를 쐐기가 쓴다 — 2p 가 물통 폭을 거의 채운다.
 */
export const ARROW_PER_PA = 2.1 / (RHO * G * DEPTH_UNIT);

/** 센서 중심의 x 와 크기(한 변, m). 물통 오른쪽에 두어 화살표가 왼쪽으로 자랄 자리를 연다. */
export const SENSOR_X = 2.2;
export const SENSOR_SIZE = 0.18;
/** 센서를 매단 줄의 위 끝(물통 위). */
export const STRING_TOP_Y = 0.58;

/** 물통 안쪽 — 왼쪽 벽 · 오른쪽 벽 · 바닥 · 벽 위 끝. */
export const TANK_LEFT = -2.45;
export const TANK_RIGHT = 2.7;
export const TANK_BOTTOM = -2.3;
export const TANK_TOP = 0.32;

/** 깊이 이름표(h · 2h)가 놓이는 x — 오른쪽 벽 바깥. */
export const DEPTH_LABEL_X = 2.95;
/** 압력 이름표(p · 2p)가 놓이는 y — 수면 위, 벽 안쪽. */
export const PRESSURE_LABEL_Y = 0.17;

/**
 * 프레이밍은 주장의 일부다. 가로는 물통과 오른쪽 깊이 이름표까지, 세로는 줄 위 끝부터
 * 물통 바닥 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.75, maxX: 3.25, minY: -2.85, maxY: 0.7 } as const;

// ------------------------------------------------------------------------
// 시간표 — 길이의 기본값 (단계 경계는 scene · physics 가 timeline 에게 묻는다)
// ------------------------------------------------------------------------

/** 수면에서 h 까지 · h 에서 2h 까지 내려가는 동안(초). 한 칸마다 같은 시간이다. */
export const DESCEND = 2.4;
/** h 에서 멈춰 p 를 읽는 동안. */
export const HOLD_1 = 1.8;
/** 2h 에서 멈춰 2p 를 읽는 동안. 주장이 마무리되는 자리라 길게 둔다. */
export const HOLD_2 = 3.2;
/** 다음 주기로 넘어가며 흐려지는 동안. */
export const FADE = 0.7;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const hydrostaticPressureMessages = Object.freeze({
  'label.title': { ko: '정수압', en: 'Hydrostatic pressure' },
  'label.stage': { ko: '물통', en: 'Water tank' },
  'label.view': { ko: '옆에서 본 물통', en: 'Tank from the side' },
  /** 눈금 이름표. 깊이 h · 압력 p 는 수식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.depth1': { ko: 'h', en: 'h' },
  'label.depth2': { ko: '2h', en: '2h' },
  'label.pressure1': { ko: 'p', en: 'p' },
  'label.pressure2': { ko: '2p', en: '2p' },
  'caption.descend1': {
    ko: '센서가 내려갈수록 물이 누르는 압력이 커진다',
    en: 'As the sensor sinks, the water presses on it harder',
  },
  'caption.hold1': {
    ko: '깊이 h 에서 압력은 p',
    en: 'At depth h the pressure is p',
  },
  'caption.descend2': {
    ko: '더 내려가도 압력은 같은 비율로 커진다 — 꼬리 자취가 곧은 선이다',
    en: 'Deeper still, the pressure grows at the same rate — the trail stays straight',
  },
  'caption.hold2': {
    ko: '깊이가 두 배(2h)면 압력도 두 배(2p)다',
    en: 'Twice as deep (2h), twice the pressure (2p)',
  },
} satisfies Record<string, LocalizedText>);

export type HydrostaticPressureMessageKey = keyof typeof hydrostaticPressureMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: HydrostaticPressureMessageKey): LocalizedText => hydrostaticPressureMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: HydrostaticPressureMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const hydrostaticPressureSchema: BundleSchema = {
  id: HYDROSTATIC_PRESSURE_ID,
  title: text('label.title'),
  category: 'fluids',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 센서가 내려가고, 두 번 멈추고, 다시 수면에서 시작한다.
  parameters: [],

  stages: [
    {
      id: 'tank',
      label: text('label.stage'),
      constants: { rho: RHO, g: G, depthUnit: DEPTH_UNIT, stop1: STOP_1, stop2: STOP_2 },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /**
   * 세로로 2h 가 넘는 물통을 담아야 한다. 가로는 2p 화살표가 들어갈 만큼만 쓰고
   * 남는 가로는 둔다 — 세로를 더 주면 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침이 판정 장치다. 쐐기와 눈금선은 물 **위**, 화살표 · 센서 **아래** 에 깔려야
   * 한다. 층 순서로는 `region`(물 · 쐐기)이 물체와 화살표 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 수면 → h 로 내려감 → 멈춤(p) → 2h 로 내려감 → 멈춤(2p) → 흐려짐.
   * 두 번의 내려감이 같은 길이라, 한 칸 내려가는 동안 화살표가 같은 만큼 자라는
   * 것이 속도로도 보인다.
   */
  timeline: {
    phases: [
      { id: 'descend-1', duration: DESCEND, ease: 'smooth', caption: key('caption.descend1') },
      { id: 'hold-1', duration: HOLD_1, caption: key('caption.hold1') },
      { id: 'descend-2', duration: DESCEND, ease: 'smooth', caption: key('caption.descend2') },
      { id: 'hold-2', duration: HOLD_2, caption: key('caption.hold2') },
      { id: 'fade', duration: FADE, caption: key('caption.hold2') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 센서가 수면 아래로 들어가 화살표가 자라기 시작한
   * 자리에서 연다. 0 이면 화살표가 없는 빈 수면이 먼저 보인다.
   */
  startAt: 0.9,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 미터가 아니라 **h · 2h 와
   * p · 2p 두 칸**이라 거리 격자를 깔지 않고 네 선만 직접 긋는다.
   */

  messages: hydrostaticPressureMessages,
};
