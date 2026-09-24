// ========================================================================
// relativistic-velocity-addition — 선언
// ========================================================================
// 질문: 달리는 배에서 앞으로 쏜 것의 빠르기는 배의 빠르기와 그냥 더해지는가?
//
// 땅의 틀 하나에서 본다. 위 레인으로 0.5c 로 가는 배가 오고, 아래 레인에는 땅에 선
// 등이 있다. 배의 앞머리가 등 옆을 지나는 순간 배는 앞으로 탄환(배에서 재어 0.5c)과
// 빛을 쏘고, 등도 빛을 쏜다. 같은 시간이 흐른 뒤 멈춰 보면 간 거리가 곧 빠르기다 —
// 탄환은 0.8c 자리에서 빛에 뒤처져 있고, 배가 쏜 빛은 등이 쏜 빛과 나란히 c 에 있다.
// 그냥 더했을 때의 자리(0.5c + 0.5c, 0.5c + c)는 점선 유령으로 겹쳐 둔다 —
// 어느 것도 빛을 넘지 못한다.
//
// 시간 지연(time-dilation) · 길이 수축(length-contraction) · 시공간 도표는 이 조각의
// 몫이 아니다. 여기서 일어나는 것은 「더해도 광속을 넘지 못한다」 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:relativistic-velocity-addition` 와 문자 그대로 일치한다 (C4). */
export const RELATIVISTIC_VELOCITY_ADDITION_ID = 'relativistic-velocity-addition';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 배의 땅에 대한 빠르기 v/c. */
export const SHIP_BETA = 0.5;
/** 탄환의 배에 대한 빠르기 u′/c (배에서 잰 값). */
export const BULLET_BETA = 0.5;
/**
 * 땅에서 잰 탄환의 빠르기 (u′+v)/(1+u′v/c²) = 0.8. 화면 글자로 쓰는 선언값이다 —
 * 계산해 줄이지 않는다(S-piece 유효숫자). 두 빠르기와 짝으로 바꾼다(G143).
 */
export const RESULT_BETA = 0.8;
/**
 * 빛이 한 번의 달리기 동안 가는 화면 거리(월드). c 를 화면 거리로 옮기는 연출 배율이다 —
 * 같은 시간에 간 거리가 빠르기라 이 한 값이 눈금자 한 칸(0 → c)의 길이가 된다.
 */
export const LIGHT_REACH = 5;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초).
// 배는 `fire` 가 시작하는 순간 앞머리가 등 옆에 선다. 모든 자리는 `fire` 시작에서 잰 시각의
// 함수이고, 빠르기는 `fire` + `run` 동안 빛이 LIGHT_REACH 를 가도록 맞춘다 — 단계 길이를 바꿔도
// 멈춘 자리는 같다.
// ------------------------------------------------------------------------

/** 배가 왼쪽에서 나타나는 동안. */
export const APPEAR = 0.4;
/** 등 옆으로 다가오는 동안. */
export const APPROACH = 1.4;
/** 쏘는 순간 — 배 앞머리와 등에서 섬광이 퍼지고, 탄환과 빛이 막 나온다. 달리기의 앞머리다. */
export const FIRE = 0.5;
/** 쏜 뒤 달리는 동안. 끝나는 순간 모두 멈춘다 — 같은 시간(`fire` + `run`) 동안 간 거리를 읽는다. */
export const RUN = 2.1;
/** 멈춘 자리 아래 눈금자와 빠르기 글자가 붙는 동안. */
export const MARK = 0.7;
/** 그냥 더했을 때의 자리(유령)가 나타나는 동안. */
export const COMPARE = 0.8;
/** 읽는 동안. */
export const HOLD = 3.2;
/** 모두 흐려지며 다음 주기로 넘어가는 동안. */
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 배치 — 월드. 위 레인(배 · 탄환 · 배가 쏜 빛) · 아래 레인(등 · 등이 쏜 빛) · 눈금자.
// ------------------------------------------------------------------------

/** 쏘는 자리(등이 선 자리) — 눈금자의 0. */
export const ORIGIN_X = -4;
/** 위 레인 높이. */
export const SHIP_LANE_Y = 0.55;
/** 아래 레인 높이. */
export const GROUND_LANE_Y = -0.45;
/** 유령 줄 높이(위 레인 위). 실제 것과 겹치지 않게 한 줄 띄운다. */
export const GHOST_ROW_Y = 1.3;
/** 눈금자 높이(아래 레인 아래). */
export const RULER_Y = -1.25;
/** 배 몸의 길이 · 높이(월드). 앞머리가 쏘는 자리다. */
export const SHIP_LENGTH = 0.9;
export const SHIP_HEIGHT = 0.34;

/**
 * 프레이밍은 주장의 일부다. 가로는 배가 나타나는 자리부터 「0.5c + c」 유령 글자까지,
 * 세로는 유령 글자 위부터 눈금자 글자 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6.3, maxX: 4.3, minY: -2.35, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const relativisticVelocityAdditionMessages = Object.freeze({
  'label.title': { ko: '속도의 상대론적 덧셈', en: 'Relativistic velocity addition' },
  'label.stage': { ko: '0.5c 배에서 0.5c 탄환', en: 'A 0.5c bullet from a 0.5c ship' },
  'label.view': { ko: '땅의 틀', en: 'Ground frame' },
  'label.ship': { ko: '배 {v}c →', en: 'Ship {v}c →' },
  'label.bullet': { ko: '탄환 (배에서 {u}c)', en: 'Bullet ({u}c from the ship)' },
  'label.lamp': { ko: '땅의 등', en: 'Ground lamp' },
  /** 빛. 두 빛 모두 같은 낱말이다. */
  'label.light': { ko: '빛', en: 'light' },
  'label.naive': { ko: '그냥 더하면', en: 'Simply added' },
  /** 빠르기 눈금 — 선언값을 끼운다 (S-piece 유효숫자). */
  'label.speed': { ko: '{b}c', en: '{b}c' },
  /** 광속. 기호라 두 언어가 같다. */
  'label.c': { ko: 'c', en: 'c' },
  'label.zero': { ko: '0', en: '0' },
  /** 그냥 더한 합 — 두 선언값을 나란히 끼운다. 계산한 합을 띄우지 않는다. */
  'label.naiveSum': { ko: '{v}c + {u}c', en: '{v}c + {u}c' },
  'label.naiveLight': { ko: '{v}c + c', en: '{v}c + c' },
  'caption.approach': {
    ko: '달리는 배가 땅에 선 등 쪽으로 다가온다',
    en: 'A moving ship approaches a lamp standing on the ground',
  },
  'caption.fire': {
    ko: '배가 등 옆을 지나는 순간 — 배는 앞으로 탄환과 빛을, 등은 빛을 쏜다',
    en: 'As the ship passes the lamp, the ship fires a bullet and light forward, and the lamp fires light',
  },
  'caption.run': {
    ko: '땅에서 보면 탄환은 빛에 뒤처지고, 배가 쏜 빛은 등의 빛과 나란히 간다',
    en: 'Seen from the ground, the bullet falls behind the light, and the ship’s light runs level with the lamp’s',
  },
  'caption.mark': {
    ko: '같은 시간 동안 간 거리가 곧 빠르기다',
    en: 'The distance covered in the same time is the speed',
  },
  'caption.compare': {
    ko: '그냥 더한 자리까지 가지 못한다 — 탄환도, 배가 쏜 빛도 빛을 넘지 않는다',
    en: 'Neither reaches the simply-added spot — neither the bullet nor the ship’s light gets past light',
  },
} satisfies Record<string, LocalizedText>);

export type RelativisticVelocityAdditionMessageKey = keyof typeof relativisticVelocityAdditionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RelativisticVelocityAdditionMessageKey): LocalizedText =>
  relativisticVelocityAdditionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RelativisticVelocityAdditionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const relativisticVelocityAdditionSchema: BundleSchema = {
  id: RELATIVISTIC_VELOCITY_ADDITION_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 배가 오고, 쏘고, 멈춘 자리를 읽고, 다시 온다.
  parameters: [],

  stages: [
    {
      id: 'half-and-half',
      label: text('label.stage'),
      constants: {
        shipBeta: SHIP_BETA,
        bulletBeta: BULLET_BETA,
        resultBeta: RESULT_BETA,
        lightReach: LIGHT_REACH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'ground-frame', label: text('label.view'), default: true }],

  /** 가로 10.6 칸 · 세로 4.3 칸. 세로가 비싸다 — 레인 둘과 유령 줄 · 눈금자만 담는다. */
  canvas: { height: 360, minHeight: 320 },

  /** 안내 점선 · 레인이 물체 아래로 깔려야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 다가옴 → 쏨 → 달림 → 멈춰 눈금 → 유령 → 읽음 → 흐려짐.
   * 모든 자리는 `fire` 시작에서 잰 시각의 함수다 — 그 순간 배의 앞머리가 등 옆에 선다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.approach') },
      { id: 'approach', duration: APPROACH, caption: key('caption.approach') },
      { id: 'fire', duration: FIRE, caption: key('caption.fire') },
      { id: 'run', duration: RUN, caption: key('caption.run') },
      { id: 'mark', duration: MARK, ease: 'smooth', caption: key('caption.mark') },
      { id: 'compare', duration: COMPARE, ease: 'smooth', caption: key('caption.compare') },
      { id: 'hold', duration: HOLD, caption: key('caption.compare') },
      { id: 'fade', duration: FADE, caption: key('caption.compare') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 배가 등 쪽으로 다가오는 중이다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 덧셈 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 재는 것은 한 줄 눈금자(0 → c) 위의 자리뿐이다 —
   * 격자를 깔면 세로 거리까지 재라는 뜻이 된다.
   */

  messages: relativisticVelocityAdditionMessages,
};
