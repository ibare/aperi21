// ========================================================================
// sound-through-materials — 선언
// ========================================================================
// 질문: 소리는 무엇을 타고 오는가. 무엇을 지나느냐에 따라 달라지는가.
//
// 판 하나에 네 통 — 쇠 · 물 · 공기 · 진공(공기를 뺀 통) — 이 나란히 붙어 있다. 망치로 판을 한 번
// 두드리면 네 통이 같은 떨림을 받는다. 떨림은 알갱이에서 알갱이로 건너가 통 끝의 「듣는 곳」 에
// 닿는데, 쇠에서 가장 먼저, 물, 공기 순으로 닿는다. 알갱이가 없는 진공 통으로는 아무것도 건너가지
// 않아 듣는 곳이 끝까지 켜지지 않는다.
//
// 이웃과 가르는 것 — `wave-speed-in-medium` 은 줄의 장력 · 선밀도가 펄스 빠르기를 정하는 경주(막대 ·
// 눈금), `sound-source-vibration` 은 떨림이 있어야 소리가 나온다(퍼지는 고리), `longitudinal-wave` 는
// 제자리에서 앞뒤로 흔들리는 입자의 빽빽함 무늬다. 이 조각은 **무엇을 지나느냐**(쇠 · 물 · 공기 ·
// 진공) 하나를 가른다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:sound-through-materials` 와 문자 그대로 일치한다 (C4). */
export const SOUND_THROUGH_MATERIALS_ID = 'sound-through-materials';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 쇠 속 소리 빠르기(m/s). 이름표의 수가 이 값이다. */
export const SPEED_STEEL = 5000;
/** 물 속 소리 빠르기(m/s). */
export const SPEED_WATER = 1500;
/** 공기 속 소리 빠르기(m/s). */
export const SPEED_AIR = 340;
/** 통의 길이(m). 판에서 듣는 곳까지. */
export const LANE_LENGTH = 10;
/** 떨림 덩어리(펄스)의 반폭 σ(m). 네 통에서 같다 — 모양은 같고 빠르기만 다르다. */
export const PULSE_WIDTH = 0.45;
/** 알갱이가 밀려나는 폭(m). */
export const PULSE_AMPLITUDE = 0.2;
/** 알갱이 간격(m) — 쇠 · 물 · 공기. 진공에는 알갱이가 없다. */
export const SPACING_STEEL = 0.15;
export const SPACING_WATER = 0.22;
export const SPACING_AIR = 0.3;
/** 알갱이 흩뿌림 폭(간격 대비) — 쇠는 0(반듯한 격자), 물 · 공기는 흩어져 있다. */
export const JITTER_STEEL = 0;
export const JITTER_WATER = 0.3;
export const JITTER_AIR = 0.42;
/** 알갱이 흩뿌림 시드 — 같은 시드는 같은 배치다. */
export const SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 통은 x 축을 따라 놓이고 판의 오른쪽 면이 x = 0 이다.
// ------------------------------------------------------------------------

/** 네 통의 가운데 높이 — 위부터 쇠 · 물 · 공기 · 진공. */
export const LANE_Y = { steel: 3.9, water: 2.6, air: 1.3, vacuum: 0 } as const;
/** 통의 반 높이. */
export const LANE_HALF = 0.45;
/** 판 두께 · 판이 통 위아래로 더 나온 길이. */
export const PLATE_W = 0.18;
export const PLATE_OVERHANG = 0.1;
/** 듣는 곳 — 통 끝에서 떨어진 간격과 반지름. */
export const EAR_GAP = 0.32;
export const EAR_R = 0.17;
/** 통 이름표 자리 — 듣는 곳 오른쪽. */
export const LABEL_X = LANE_LENGTH + 0.72;
/** 「듣는 곳」 이름표 높이 — 맨 위 통 위. */
export const EAR_LABEL_Y = LANE_Y.steel + LANE_HALF + 0.3;
/** 망치 머리 반지름 · 치는 높이(물 통과 공기 통 사이) · 출발 자리 · 자루(머리에서 끝까지). */
export const MALLET_R = 0.26;
export const MALLET_HIT_Y = (LANE_Y.water + LANE_Y.air) / 2;
export const MALLET_START = [-1.25, 3.0] as const;
export const MALLET_HANDLE = [-0.55, 1.05] as const;

/**
 * 프레이밍 — 가로는 망치 자루 끝부터 이름표 끝까지, 세로는 진공 통 아래부터 「듣는 곳」 이름표 위
 * 캡션 줄 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.0, maxX: 13.4, minY: -0.75, maxY: 5.35 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (조각 시계 초 = 물리 초)
// ------------------------------------------------------------------------

/** 판을 두드리는 망치 — 화면에서 그대로. */
export const STRIKE = 0.6;
/**
 * 친 망치가 출발 자리로 물러나는 동안. 두드림과 합쳐 0.9 초라 건너감이 시작하는 화면 시각은 그대로다.
 * 떨림은 판 뒤(2σ)에서 출발하므로 이 동안 통 안의 알갱이는 아직 가만히 있다.
 */
export const RECOIL = 0.3;
/**
 * 건너감 — 가장 느린 공기 속 떨림이 판 뒤 출발 자리(2σ)에서 통 끝을 조금 넘을 때까지. 기본값으로 센다.
 * 물리는 이 단계의 길이와 진행도로 시각을 읽는다(`τ = duration · at`). 기본값으로 약 0.034 초.
 */
export const TRAVEL = ((LANE_LENGTH + 2 * PULSE_WIDTH) / SPEED_AIR) * 1.05;
/** 건너감을 화면에서 흘리는 시간(초). 실시간 0.03 초는 눈으로 볼 수 없다. */
export const TRAVEL_ON_SCREEN = 5;
export const SLOW_MOTION = TRAVEL / TRAVEL_ON_SCREEN;
/** 결과를 읽는 동안 · 흐려지는 동안. */
export const HOLD = 3;
export const FADE = 0.8;
/** 도착한 순간 이미 진행 중이다 — 건너감의 5 % 에서 연다. 쇠 속 떨림이 이미 통 가운데를 지난다. */
export const START_AT = STRIKE + RECOIL + TRAVEL * 0.05;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const soundThroughMaterialsMessages = Object.freeze({
  'label.title': { ko: '물질을 통한 소리 전달', en: 'Sound through materials' },
  'label.stage': { ko: '네 통', en: 'Four tubes' },
  'label.view': { ko: '같은 떨림, 다른 물질', en: 'Same tap, different materials' },
  /** 통 이름표. 빠르기는 스테이지 상수를 `{v}` 로 그대로 끼운다. */
  'label.steel': { ko: '쇠 · {v} m/s', en: 'Steel · {v} m/s' },
  'label.water': { ko: '물 · {v} m/s', en: 'Water · {v} m/s' },
  'label.air': { ko: '공기 · {v} m/s', en: 'Air · {v} m/s' },
  'label.vacuum': { ko: '진공 (공기를 뺌)', en: 'Vacuum (air removed)' },
  'label.ear': { ko: '듣는 곳', en: 'Listener' },
  'caption.strike': {
    ko: '망치로 판을 한 번 두드린다 — 판에 붙은 네 통이 같은 떨림을 받는다',
    en: 'A mallet taps the plate once — all four tubes get the same shake',
  },
  'caption.travel': {
    ko: '떨림이 알갱이에서 알갱이로 건너간다 — 쇠가 가장 먼저, 그다음 물, 공기 순으로 끝에 닿는다',
    en: 'The shake passes from particle to particle — it reaches the end first in steel, then water, then air',
  },
  'caption.result': {
    ko: '쇠 · 물 · 공기로는 소리가 끝까지 왔지만, 알갱이가 없는 진공으로는 전해지지 않았다',
    en: 'Sound got through steel, water and air — but not through the vacuum, where there are no particles',
  },
} satisfies Record<string, LocalizedText>);

export type SoundThroughMaterialsMessageKey = keyof typeof soundThroughMaterialsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SoundThroughMaterialsMessageKey): LocalizedText => soundThroughMaterialsMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SoundThroughMaterialsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const soundThroughMaterialsSchema: BundleSchema = {
  id: SOUND_THROUGH_MATERIALS_ID,
  title: text('label.title'),
  category: 'waves',
  timeModel: 'periodic',

  // 손잡이를 두지 않는다 — 네 통이 이미 네 물질을 같은 순간 나란히 견준다.
  parameters: [],

  stages: [
    {
      id: 'four-tubes',
      label: text('label.stage'),
      constants: {
        speedSteel: SPEED_STEEL,
        speedWater: SPEED_WATER,
        speedAir: SPEED_AIR,
        laneLength: LANE_LENGTH,
        pulseWidth: PULSE_WIDTH,
        amplitude: PULSE_AMPLITUDE,
        spacingSteel: SPACING_STEEL,
        spacingWater: SPACING_WATER,
        spacingAir: SPACING_AIR,
        jitterSteel: JITTER_STEEL,
        jitterWater: JITTER_WATER,
        jitterAir: JITTER_AIR,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'tubes', label: text('label.view'), default: true }],

  /** 가로로 긴 그림이다 — 통 넷과 위의 캡션 한 줄뿐 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 300 },

  /** 겹침 순서 — 통마다 테두리 → 알갱이 → 흔들리는 알갱이 → 듣는 곳 → 이름표, 그 위에 판 · 망치. */
  drawOrder: 'scene',

  /**
   * 두드림 → 망치 물러남 → 건너감(느리게) → 결과 → 흐려짐. 결과 · 흐려짐 동안 물리 시각은 `at('travel') = 1` 에 붙잡힌다.
   */
  timeline: {
    phases: [
      { id: 'strike', duration: STRIKE, ease: 'smooth', caption: key('caption.strike') },
      { id: 'recoil', duration: RECOIL, ease: 'smooth', caption: key('caption.strike') },
      { id: 'travel', duration: TRAVEL, timeScale: SLOW_MOTION, caption: key('caption.travel') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 빠르기가 왜 다른지는 문단의 몫이다.
  caption: {
    anchor: { screen: 'top-left', offset: [4, 4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 견주는 것은 듣는 곳이 켜지는 순서다. */

  messages: soundThroughMaterialsMessages,
};
