// ========================================================================
// uniformly-accelerated-motion — 선언
// ========================================================================
// 질문: 점점 빨라진다는 건 알겠는데, 같은 시간 동안 간 거리는 어떻게 늘어나나.
//
// 동사: 같은 만큼씩 더 벌어진다.
//
// 물체가 0.5초마다 자리를 찍는다. 벌어지는 간격을 선로 아래 막대로 자라게 하고,
// 다 벌어지면 왼쪽 사다리로 내려 왼쪽 끝을 맞춰 쌓는다. 앞 간격보다 늘어난 몫만
// 강조색이라 사다리 오른쪽 끝에 같은 폭의 계단이 선다.
//
// 값은 모두 원본(tasks/piece-lab/uniformly-accelerated-motion/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:uniformly-accelerated-motion` 와 문자 그대로 일치한다 (C4). */
export const UNIFORMLY_ACCELERATED_MOTION_ID = 'uniformly-accelerated-motion';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const uniformlyAcceleratedMotionMessages = Object.freeze({
  'label.title': { ko: '등가속도 운동', en: 'Uniformly accelerated motion' },
  'label.operation': {
    ko: '같은 시간 동안 간 거리가 같은 만큼씩 늘어난다',
    en: 'Distance in equal times grows by equal amounts',
  },
  'label.stage': { ko: '선로', en: 'Track' },
  'label.view': { ko: '간격', en: 'Gaps' },
  /** 첫 1초 — 지금 벌어지는 일. */
  'caption.stamp': {
    ko: '같은 시간마다 물체가 있던 자리를 찍는다',
    en: 'Marking where the object is at equal time steps',
  },
  /** 그 뒤 — 주장 문장 하나. */
  'caption.main': {
    ko: '같은 시간 동안 간 거리가 매번 같은 만큼씩 늘어난다',
    en: 'Each equal time step covers the same extra distance',
  },
} satisfies Record<string, LocalizedText>);

export type UniformlyAcceleratedMotionMessageKey = keyof typeof uniformlyAcceleratedMotionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: UniformlyAcceleratedMotionMessageKey): LocalizedText =>
  uniformlyAcceleratedMotionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: UniformlyAcceleratedMotionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const uniformlyAcceleratedMotionSchema: BundleSchema = {
  id: UNIFORMLY_ACCELERATED_MOTION_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행만으로 주장이 끝난다 (원본 NOTES (c)).
  parameters: [],

  /**
   * 운동 값 — 원본 그대로(단위: 원본 논리 px, 초).
   *
   * 처음 속도를 0 이 아니게 둔 것은 원본의 결정이다. 정지 출발이면 간격이 1:3:5:7 이
   * 되어 첫 간격이 너무 짧고 "홀수 비" 라는 다른 이야기로 새기 쉽다.
   *
   * `count × interval` 은 시간표 `stamp` + `run` 의 길이(3.0 초)와 같아야 한다.
   * 물체가 달리기를 마치는 순간이 곧 `run` 이 끝나는 순간이다.
   */
  stages: [
    {
      id: 'track',
      label: text('label.stage'),
      constants: { v0: 70, a: 110, interval: 0.5, count: 6, drop: 0.35 },
    },
  ],

  environments: [],
  views: [{ id: 'gaps', label: text('label.view'), default: true }],

  /** 원본 캔버스 840 × 262. 사다리 여섯 줄과 캡션 한 줄이 들어가는 최소 높이다. */
  canvas: { height: 262, minHeight: 262 },

  /** 도착한 순간 이미 달리고 있다 — 원본의 `t + 0.3`. */
  startAt: 0.3,

  /**
   * 한 바퀴 6.2 초.
   *
   * - stamp 1.0 — 물체가 달리며 자리를 찍기 시작한다. 캡션은 지금 벌어지는 일.
   * - run 2.0 — 남은 네 간격을 마저 달린다. 캡션이 주장 문장으로 바뀐다.
   * - rest 2.7 — 사다리 여섯 줄이 모두 쌓인 채 멈춰 있다.
   * - fade 0.5 — 흐려졌다가 처음부터 다시.
   *
   * 원본은 캡션을 페이드 없이 바로 바꿨다 (슬롯 `fade` 기본 0).
   */
  timeline: {
    phases: [
      { id: 'stamp', duration: 1.0, caption: key('caption.stamp') },
      { id: 'run', duration: 2.0, caption: key('caption.main') },
      { id: 'rest', duration: 2.7, caption: key('caption.main') },
      { id: 'fade', duration: 0.5, caption: key('caption.main') },
    ],
  },

  /**
   * 겹침 순서가 원본과 같아야 한다 — 선로 → 간격 막대 → 늘어난 몫 → 찍힌 자리 → 물체.
   * 층 기본값은 `trace`(19)를 `body`(40) 아래에 두어 막대가 눈금을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 슬롯 하나. 원본은 왼쪽 24px, 아래에서 14px 위 기준선에 16px 글자로 썼다.
   * 캡션은 바퀴 끝의 흐려짐을 받지 않는다 (원본도 흐려짐 밖에서 그렸다).
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, 14] },
    align: 'left',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'medium' },
  },

  /** 그리드도 카메라 버튼도 없다 (기본값). 길이 비교는 왼쪽 끝 정렬만으로 충분하다. */

  messages: uniformlyAcceleratedMotionMessages,
};
