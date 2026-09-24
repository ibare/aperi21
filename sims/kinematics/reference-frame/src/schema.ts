// ========================================================================
// reference-frame — 선언
// ========================================================================
// 질문: 달리는 기차 안에서 공을 놓으면 곧장 발밑으로 떨어지는데, 밖에 선 사람
// 눈에도 공이 곧게 떨어질까?
//
// 같은 순간의 같은 공을 두 판에 나란히 그린다. 땅에서 보면 휘어진 길, 기차에서
// 보면 곧은 길이다.
//
// 값은 모두 원본(tasks/piece-lab/reference-frame/index.html)에서 그대로 옮겼다.
// 원본은 화면 단위(px, 초)였고 여기서도 원본 1px = 월드 1 이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:reference-frame` 와 문자 그대로 일치한다 (C4). */
export const REFERENCE_FRAME_ID = 'reference-frame';

// ------------------------------------------------------------------------
// 배치 — 원본 논리 좌표 860 × 270
// ------------------------------------------------------------------------

/** 전체 논리 폭·높이. */
export const W = 860;
export const H = 270;
/** 판 하나의 폭·높이. 왼쪽 판(땅 기준) 0~420, 오른쪽 판(기차 기준) 440~860. */
export const PANEL_W = 420;
export const PANEL_H = 240;
/** 두 판 사이 틈. */
export const GAP = 20;

// ------------------------------------------------------------------------
// 운동 상수 (화면 단위: px, 초)
// ------------------------------------------------------------------------

/** 기차 속력. */
export const V = 110;
/** 손(놓는 높이). */
export const HAND_Y = 88;
/** 기차 바닥. */
export const FLOOR_Y = 200;
/** 공 반지름. */
export const BALL_R = 6;
/** 낙하 시간 — 시간표 `fall` 단계의 길이와 같다. */
export const FALL = 1.2;
/** 낙하 높이. */
export const DROP = FLOOR_Y - BALL_R - HAND_Y;
/** 화면 단위 중력 가속도. 낙하 시간에 맞춘다. */
export const G = (2 * DROP) / (FALL * FALL);

/**
 * 한 주기의 길이. 칸 간격 = 한 주기에 기차가 가는 거리(V × 3.6 = 396)라 왼쪽 판에서
 * 다음 칸이 자연스럽게 이어받는다. 시간표 단계 길이의 합과 같아야 한다.
 */
export const PERIOD = 3.6;

/** 기차 칸. */
export const CAR_LEN = 340;
export const CAR_TOP = 40;
export const CAR_SPACING = V * PERIOD;
/** 칸 왼쪽 끝에서 손까지 / 사람 몸통까지. */
export const HAND_IN_CAR = 80;
export const RIDER_IN_CAR = 58;
/** 땅 판에서 공을 놓는 순간 손의 x. */
export const GROUND_HAND_AT_RELEASE = 120;
/** 기차 판에서 칸 왼쪽 끝 (고정). */
export const TRAIN_CAR_X = 40;
/** 땅선 y · 전봇대 간격. */
export const GROUND_Y = 216;
export const POLE_SPACING = 90;
/** 땅 판 전봇대의 위상. 기차 판에서는 여기서 −V·t 만큼 흘러간다. */
export const POLE_SHIFT = 30;
/** 자취 점 간격(초). */
export const TRACE_DT = 0.1;

/**
 * 도착한 순간 이미 낙하 중이다 — 원본이 주기 위상을 1.1초 밀었다(`OFFSET`).
 * 두 자취가 반쯤 쌓인 채로 열린다.
 */
export const START_AT = 1.1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const referenceFrameMessages = Object.freeze({
  'label.title': { ko: '기준틀', en: 'Reference frame' },
  'label.operation': { ko: '관찰자에 따라 달라지는 운동 기술', en: 'How the description of motion depends on the observer' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 판 이름표 — 두 판이 누구의 눈인지가 주장에 필요하다 (원본 NOTES (c)). */
  'label.ground': { ko: '땅에 서서 보면', en: 'Standing on the ground' },
  'label.train': { ko: '기차에 타고 보면', en: 'Riding the train' },
  'caption.main': {
    ko: '같은 공 하나가 땅에서 보면 휘어지며, 기차에서 보면 곧게 떨어진다',
    en: 'The same ball curves as seen from the ground, and falls straight as seen from the train',
  },
} satisfies Record<string, LocalizedText>);

export type ReferenceFrameMessageKey = keyof typeof referenceFrameMessages;

export const text = (key: ReferenceFrameMessageKey): LocalizedText => referenceFrameMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ReferenceFrameMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const referenceFrameSchema: BundleSchema = {
  id: REFERENCE_FRAME_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 속력을 바꾸게 하면 "곡률이 속력에 따른다" 는 두 번째 주장이 생긴다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 폭 900 에서 논리 860 × 270 을 꽉 채웠다. 러너의 맞춤 여백(12px)을 더해
   * 같은 배율이 나오는 세로다.
   */
  canvas: { height: 300, minHeight: 240 },

  /** 원본 `OFFSET`. 모든 것이 시각의 함수라 시계만 앞당기면 된다. */
  startAt: START_AT,

  /**
   * 한 주기 3.6 s. 원본 `phase(t)` 의 경계를 단계로 옮겼다.
   *
   * - appear — 다음 칸의 사람이 공을 쥐고 나타난다 (알파 0→1)
   * - hold — 쥐고 있다
   * - fall — 놓은 뒤 흐른 시간. 이 단계의 진행도 × 길이가 곧 낙하 시간이라 이징은 선형이다
   * - rest — 바닥의 공과 자취가 남아 있다
   * - fade — 바닥의 공과 자취가 옅어진다 (알파 1→0)
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.3 },
      { id: 'hold', duration: 0.1 },
      { id: 'fall', duration: FALL },
      { id: 'rest', duration: 1.6 },
      { id: 'fade', duration: 0.4 },
    ],
  },

  /**
   * 겹침이 원본의 순서여야 한다 — 전봇대 → 땅선 → 칸 → 사람 → 자취 → 공. 층 기본값은
   * `body`(칸)를 `trajectory`(사람·전봇대) 위에 올려 사람이 칸 채움에 가려진다.
   */
  drawOrder: 'scene',

  /** 슬롯 하나. 원본은 판 아래 가운데(논리 y 256)에 한 줄이었다. */
  caption: {
    anchor: { world: [W / 2, -(PANEL_H + 16)] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  /** 그리드도 카메라 버튼도 없다 — 두 판의 멈춰 있는 것(땅/기차)이 이미 기준이다. */

  messages: referenceFrameMessages,
};
