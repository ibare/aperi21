// ========================================================================
// centripetal-acceleration — 선언
// ========================================================================
// 질문: 빠르기가 한 번도 변하지 않는데 왜 "가속도가 있다" 고 하고, 그 가속도는
// 어디를 향하는가.
//
// 같은 빠르기로 원을 돌아도 속도는 매 순간 방향이 바뀌고, 그 바뀐 만큼(Δv)은
// 어디서 재도 중심을 향한다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:centripetal-acceleration` 와 문자 그대로 일치한다 (C4). */
export const CENTRIPETAL_ACCELERATION_ID = 'centripetal-acceleration';

const DEG = Math.PI / 180;

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 원본 논리 좌표 100 px. 원의 중심이 원점, y 는 위.
// ------------------------------------------------------------------------

/** 궤도 반지름. 원본 R = 100 px. */
export const RADIUS = 1;
/** 속도 화살표 길이. 속력이 일정하므로 언제나 이 길이다. 원본 LV = 80 px. */
export const SPEED_LENGTH = 0.8;
/** 공의 반지름. 원본 7 px. */
export const BALL_RADIUS = 0.07;
/** 화살촉 크기. 원본 11 px. */
export const HEAD_SIZE = 0.11;

// ------------------------------------------------------------------------
// 시간표 — 원본 index.html 의 상수를 그대로 옮긴다.
// ------------------------------------------------------------------------

/** 각속도 50°/s — 한 바퀴 7.2 초. */
export const OMEGA = 50 * DEG;
/** 비교하는 두 순간의 각 간격 50°. 삼각형이 눈에 보일 만큼 크게 고른 값이다. */
export const GAP = 50 * DEG;
/** 첫 속도를 남긴 뒤 둘째 속도까지(1.0 s). */
export const TAU = GAP / OMEGA;
/** 꼬리 맞대기 · Δv 자라남 · 멈춤 · 호의 가운데로 옮김 · 쉼 (초). */
export const SLIDE = 0.7;
export const GROW = 0.5;
export const HOLD = 0.5;
export const MOVE = 0.8;
export const REST = 0.95;
/** 한 주기 4.45 s — 공은 222.5° 전진한다 (한 바퀴에서 황금각만큼 모자란 각). */
export const PERIOD = TAU + SLIDE + GROW + HOLD + MOVE + REST;
/** 0번 주기의 첫 순간 공의 각 100°. */
export const THETA0 = 100 * DEG;
/** 도착했을 때 이미 0.6 초 진행된 상태로 보인다 — 운동 시계를 이만큼 앞당겨 연다. */
export const START_TIME = 0.6;
/** 지난 Δv 가 흐려지는 시간 척도 11 s. */
export const FADE = 11;
/** 이보다 옅어진 지난 Δv 는 그리지 않는다. */
export const MIN_ALPHA = 0.12;
/** 거슬러 올라가 볼 지난 주기 수. */
export const PAST_CYCLES = 8;
/** 남겨 둔 속도 사본의 불투명도. */
export const KEPT_ALPHA = 0.42;
/** 캡션이 단계가 바뀔 때 페이드 인 하는 시간(초). */
export const CAPTION_FADE = 0.3;

/** 단계 경계 — 주기 안 시각 u. */
export const B0 = TAU;
export const B1 = B0 + SLIDE;
export const C1 = B1 + GROW;
export const D1 = C1 + HOLD;
export const E1 = D1 + MOVE;

/**
 * 프레이밍 — 원본 840×280 캔버스의 세로 전체(±1.4)와, 가로는 궤도 왼쪽 끝의 속도
 * 화살표(−1.28)에서 캡션 끝(≈5.1)까지.
 */
export const SCENE_BOUNDS = { minX: -1.4, maxX: 5.2, minY: -1.4, maxY: 1.4 } as const;
/** 캡션의 왼쪽 끝. 원본 x = 470 px. 원 옆에 둬 세로를 아낀다. */
export const CAPTION_X = 2.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const centripetalAccelerationMessages = Object.freeze({
  'label.title': { ko: '구심 가속도', en: 'Centripetal acceleration' },
  'label.operation': {
    ko: '속도의 변화는 늘 중심 쪽으로 꺾인다',
    en: 'The change in velocity always turns toward the center',
  },
  'label.stage': { ko: '등속 원운동', en: 'Uniform circular motion' },
  'label.view': { ko: '속도의 변화', en: 'Change in velocity' },
  /** 속도 변화 화살표의 이름표. 기호라 번역하지 않는다 (C1 판정 3). */
  'label.dv': { ko: 'Δv', en: 'Δv' },
  'caption.keep': {
    ko: '공의 속도를 한 순간 남겨 둔다',
    en: "Keep the ball's velocity at one instant",
  },
  'caption.align': {
    ko: '조금 뒤의 속도와 꼬리를 맞댄다',
    en: 'Put it tail to tail with the velocity a moment later',
  },
  'caption.differ': {
    ko: '길이는 그대로, 방향만 달라졌다\n그 차이가 Δv',
    en: 'Same length, only the direction changed\nThat difference is Δv',
  },
  'caption.center': {
    ko: 'Δv 를 호의 가운데로 옮기면\n중심을 향한다',
    en: 'Move Δv to the middle of the arc\nand it points to the center',
  },
} satisfies Record<string, LocalizedText>);

export type CentripetalAccelerationMessageKey = keyof typeof centripetalAccelerationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: CentripetalAccelerationMessageKey): LocalizedText {
  return centripetalAccelerationMessages[key];
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const centripetalAccelerationSchema: BundleSchema = {
  id: CENTRIPETAL_ACCELERATION_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 조작기가 없다. 비교 간격이 결과를 바꾸지 않는다는 것은 이어지는 여러 Δv 가
  // 이미 보여 준다.
  parameters: [],

  // 운동 시계를 앞당겨 여는 시각도 선언이다 — 저작자가 바꿀 수 있어야 한다 (원칙 2).
  stages: [{ id: 'main', label: text('label.stage'), constants: { startAt: START_TIME } }],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],
  autoViews: { energy: false },

  /**
   * 원본은 840×280. 원을 왼쪽에, 캡션을 오른쪽에 둬 세로를 막았다. 여백(72 px)을
   * 더해 원본과 같은 배율(100 px/단위)이 되는 높이다.
   */
  canvas: { height: 352, minHeight: 320 },

  // 그리드도 카메라 버튼도 없다 (기본값). 각도 표시·축·격자는 특정 각이 중요한
  // 것처럼 읽히게 한다 (원본 inventory 「hidden」).

  messages: centripetalAccelerationMessages,
};
