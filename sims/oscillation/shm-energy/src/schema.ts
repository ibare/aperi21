// ========================================================================
// shm-energy — 선언
// ========================================================================
// 질문: 용수철에 매단 상자가 진동하는 동안 에너지는 어디에 있는가.
//
// 벽에 매인 용수철 끝의 상자가 마찰 없는 바닥에서 오간다. 옆에 **높이가 정해진
// 막대 하나**를 세우고 아래를 운동 에너지, 위를 탄성 퍼텐셜로 나눈다. 상자가 가운데를
// 지날 때 막대는 모두 운동 에너지, 양 끝에서 멈출 때는 모두 퍼텐셜이다. 경계선만
// 오르내리고 막대 꼭대기(합)는 움직이지 않는다 — 한쪽이 비운 자리를 다른 쪽이 채운다.
// 한 주기에 상자는 가운데를 두 번 지나므로 두 에너지는 두 번 주고받는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:shm-energy` 와 문자 그대로 일치한다 (C4). */
export const SHM_ENERGY_ID = 'shm-energy';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 상자 질량(kg). */
export const MASS = 1;
/** 용수철 상수(N/m). 주기 2π√(m/k) ≈ 6 초 — 막대의 경계가 오르내리는 것을 눈으로 따라갈 빠르기. */
export const STIFFNESS = 1.1;
/** 진폭(m). 상자가 평형점에서 양쪽으로 가는 거리. */
export const AMPLITUDE = 0.9;

/** 사분 주기(초) — 평형점과 끝 사이를 한 번 지나는 시간. 시간표 단계 길이의 기본값이다. */
export const QUARTER_PERIOD = (Math.PI / 2) * Math.sqrt(MASS / STIFFNESS);

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 상자의 평형점이 원점, 바닥이 y = 0.
// ------------------------------------------------------------------------

/** 용수철을 매단 벽의 x 와 높이. */
export const WALL_X = -2.3;
export const WALL_TOP = 0.78;
/** 바닥선이 끝나는 x. 상자가 가는 가장 먼 자리(+A)보다 조금 더 간다. */
export const FLOOR_END_X = 1.55;

/** 상자 한 변(m). */
export const BLOCK_SIZE = 0.44;
/** 속도 화살표가 놓이는 높이(바닥 기준 m)와 속력 → 길이 배율(m per m/s). */
export const SPEED_ARROW_Y = 0.64;
export const SPEED_ARROW_SCALE = 0.6;

/** 평형점 · 양 끝 표시선의 아래 · 위 끝과 이름표 높이. */
export const MARK_BOTTOM_Y = -0.1;
export const MARK_TOP_Y = 0.52;
export const MARK_LABEL_Y = -0.24;

/** 에너지 막대 — 왼쪽 · 오른쪽 x 와 전체 높이(= 합 E). */
export const BAR_LEFT = 2.15;
export const BAR_RIGHT = 2.6;
export const BAR_HEIGHT = 1.05;
/** 합을 긋는 선이 막대 양옆으로 삐져나오는 길이. */
export const TOTAL_OVERHANG = 0.12;
/** 막대 이름표(KE · PE)의 x, E 이름표의 x. */
export const BAR_LABEL_X = 2.82;
export const TOTAL_LABEL_X = 1.9;
/** KE · PE 이름표가 막대 아래 · 위 끝에서 들어온 거리. 각 칸은 늘 그 끝에 붙어 있다. */
export const BAR_LABEL_INSET = 0.14;

/**
 * 프레이밍은 주장의 일부다. 가로는 벽부터 막대 이름표까지, 세로는 끝 표시 이름표와
 * 캡션 줄 아래에서 막대 꼭대기 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.55, maxX: 3.05, minY: -0.62, maxY: 1.22 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const shmEnergyMessages = Object.freeze({
  'label.title': { ko: '조화 운동의 에너지', en: 'Energy in simple harmonic motion' },
  'label.stage': { ko: '마찰 없는 바닥', en: 'Frictionless floor' },
  'label.view': { ko: '용수철과 에너지 막대', en: 'Spring and energy bar' },
  /** 도식 표식 — 분야에서 원어로 통용되는 약어 · 기호라 번역하지 않는다 (C1 판정 2 · 3). */
  'label.ke': { ko: 'KE', en: 'KE' },
  'label.pe': { ko: 'PE', en: 'PE' },
  'label.total': { ko: 'E', en: 'E' },
  'label.speed': { ko: 'v', en: 'v' },
  'label.minusA': { ko: '−A', en: '−A' },
  'label.zero': { ko: '0', en: '0' },
  'label.plusA': { ko: '+A', en: '+A' },
  'caption.first': {
    ko: '용수철의 퍼텐셜이 운동 에너지로 갔다가 다시 용수철로 돌아간다 — 막대 전체 높이는 그대로다',
    en: 'The spring’s potential energy becomes kinetic, then flows back into the spring — the bar’s full height never changes',
  },
  'caption.second': {
    ko: '반대쪽에서 한 번 더 — 한 주기에 두 번 주고받는다',
    en: 'Once more from the other side — they trade twice in every period',
  },
} satisfies Record<string, LocalizedText>);

export type ShmEnergyMessageKey = keyof typeof shmEnergyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ShmEnergyMessageKey): LocalizedText => shmEnergyMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ShmEnergyMessageKey): string {
  return k;
}

/**
 * 사분 주기 단계의 id — 한 주기를 이 순서로 돈다. scene 은 이 넷의 진행도를 더해
 * 위상각을 얻는다. 단계 **길이**는 선언(`timeline`)이 정한다.
 */
export const QUARTER_PHASES = ['release', 'compress', 'rebound', 'stretch'] as const;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const shmEnergySchema: BundleSchema = {
  id: SHM_ENERGY_ID,
  title: text('label.title'),
  category: 'oscillation',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 오가고, 막대의 경계가 오르내린다.
  parameters: [],

  stages: [
    {
      id: 'frictionless',
      label: text('label.stage'),
      constants: { mass: MASS, stiffness: STIFFNESS, amplitude: AMPLITUDE },
    },
  ],

  environments: [],

  views: [{ id: 'spring-bar', label: text('label.view'), default: true }],

  /**
   * 가로 5.6 m 를 담아야 하고 세로는 상자 · 막대 높이와 캡션 줄뿐이다. 세로를 더 주면
   * 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 330, minHeight: 300 },

  /**
   * 한 주기 = 오른쪽 끝(+A)에서 놓임 → 가운데 → 왼쪽 끝(−A) → 가운데 → 오른쪽 끝.
   *
   * 네 단계 모두 사분 주기다. 진행도가 **선형**이어야 단계 진행도를 더한 값이 위상각이
   * 된다 — 이징을 걸면 운동이 조화 운동이 아니게 된다. 캡션은 반 주기마다 하나라서
   * 한 문장을 3 초 동안 읽는다.
   */
  timeline: {
    phases: [
      { id: 'release', duration: QUARTER_PERIOD, caption: key('caption.first') },
      { id: 'compress', duration: QUARTER_PERIOD, caption: key('caption.first') },
      { id: 'rebound', duration: QUARTER_PERIOD, caption: key('caption.second') },
      { id: 'stretch', duration: QUARTER_PERIOD, caption: key('caption.second') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 상자가 오른쪽 끝을 막 떠나 막대 아래에 운동 에너지가
   * 차오르기 시작한 자리에서 연다. 0 이면 멈춘 상자와 퍼텐셜뿐인 막대가 먼저 보인다.
   */
  startAt: 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — ½kx² 같은 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 합을 긋는 선은 막대 **위** 에 놓여야 막대 꼭대기가 그 선에 닿아 있는 것으로 읽힌다.
   * 층 순서로는 `region`(막대)이 선 위로 올라온다 (매질이 잠긴 것을 덮는 관계).
   */
  drawOrder: 'scene',

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **막대 안의 몫**이다.
   */

  messages: shmEnergyMessages,
};
