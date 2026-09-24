// ========================================================================
// uniform-circular-motion — 선언
// ========================================================================
// 질문: 빠르기가 그대로인데 왜 속도가 변한다고 하지?
// 답의 동사: 방향만 바뀐다.
//
// 왼쪽은 원을 도는 물체와 그 속도 화살표, 30° 마다 남긴 잔상. 오른쪽은 같은
// 화살표들의 꼬리를 한 점에 모은 부채 — 끝이 모두 같은 거리에 놓인다.
// 원본: tasks/piece-lab/uniform-circular-motion
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:uniform-circular-motion` 와 문자 그대로 일치한다 (C4). */
export const UNIFORM_CIRCULAR_MOTION_ID = 'uniform-circular-motion';

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 원본 논리 좌표 100 px. 궤도 중심이 원점, y 는 위.
// 원본 캔버스 840×300 에서 궤도 중심은 (230, 150).
// ------------------------------------------------------------------------

/** 궤도 반지름. 원본 112 px. */
export const RADIUS = 1.12;
/** 속도 화살표 길이 — 어느 순간에도 이 값 하나. 원본 V_LEN = 74 px. */
export const SPEED_LENGTH = 0.74;
/** 물체 반지름. 원본 9 px. */
export const BODY_RADIUS = 0.09;
/** 부채 꼬리 점 반지름. 원본 3 px. */
export const PIVOT_RADIUS = 0.03;
/** 화살촉 크기. 원본 11 px. */
export const HEAD_SIZE = 0.11;
/** 꼬리를 모은 점. 원본 (620, 150). */
export const FAN_CENTER = [3.9, 0] as const;
/** 안내글 자리. 원본 (620, H − 22 = 278). */
export const NOTE_POS = [3.9, -1.28] as const;

// ------------------------------------------------------------------------
// 운동 — 원본 index.html 상수 그대로
// ------------------------------------------------------------------------

/** 한 바퀴 4 초. 반시계 방향. */
export const PERIOD = 4;
/** 한 바퀴에 남기는 잔상 수 — 30° 마다. */
export const STAMPS_PER_TURN = 12;
/** 잔상 옅기 = STAMP_ALPHA_SPAN × (1 − 나이/주기) + STAMP_ALPHA_FLOOR. */
export const STAMP_ALPHA_SPAN = 0.5;
export const STAMP_ALPHA_FLOOR = 0.08;
/** 왼쪽(제자리) 잔상은 오른쪽 부채보다 한 번 더 흐리다. 원본 × 0.7. */
export const IN_PLACE_STAMP_FACTOR = 0.7;

/**
 * 프레이밍 — 원본 캔버스 전체(x 0~840, y 0~300). 캔버스 아래에 있던 캡션 한 줄의
 * 자리는 캡션 슬롯이 화면 여백으로 따로 잡는다.
 */
export const SCENE_BOUNDS = { minX: -2.3, maxX: 6.1, minY: -1.5, maxY: 1.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const uniformCircularMotionMessages = Object.freeze({
  'label.title': { ko: '등속 원운동', en: 'Uniform circular motion' },
  'label.operation': {
    ko: '속도 화살표는 길이가 그대로인 채 방향만 바뀐다',
    en: 'The velocity arrow keeps its length and only turns',
  },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  'label.gathered': {
    ko: '같은 화살표를 한 점에 모아 놓으면',
    en: 'The same arrows, gathered at one point',
  },
  'caption.main': {
    ko: '화살표의 길이는 그대로이고, 방향만 쉬지 않고 돌아간다.',
    en: 'The arrow keeps its length; only its direction keeps turning.',
  },
} satisfies Record<string, LocalizedText>);

export type UniformCircularMotionMessageKey = keyof typeof uniformCircularMotionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: UniformCircularMotionMessageKey): LocalizedText => uniformCircularMotionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: UniformCircularMotionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const uniformCircularMotionSchema: BundleSchema = {
  id: UNIFORM_CIRCULAR_MOTION_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 주장을 마치는 데 필요하지 않다 (원본 NOTES).
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본 300 px + 캡션 한 줄 + 여백. 카메라가 경계 가운데를 화면 가운데에 두고 캡션
   * 자리를 아래에서 빼므로, 원본과 같은 100 px/단위가 나오는 높이다.
   */
  canvas: { height: 376, minHeight: 320 },

  /**
   * 한 주기 = 한 바퀴. 화면에서 벌어지는 일이 처음부터 끝까지 같아 단계가 하나다.
   * 물체의 각 · 잔상 · 옅기는 모두 조각 시계 `t` 의 함수다.
   *
   * 도착한 순간 이미 1.4 초 돌아 잔상 5개가 남아 있다 (원본 START_OFFSET).
   */
  startAt: 1.4,
  timeline: {
    phases: [{ id: 'turn', duration: PERIOD, caption: key('caption.main') }],
  },

  // 원본이 그린 순서 그대로 겹친다 — 물체가 제 속도 화살표의 꼬리를 덮는다.
  drawOrder: 'scene',

  // 원본은 캔버스 아래 왼쪽 한 줄, 15 px 본문 먹색. 문장이 바뀌지 않아 페이드가 없다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -8] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 축·눈금·숫자는 원본 inventory 「hidden」.

  messages: uniformCircularMotionMessages,
};
