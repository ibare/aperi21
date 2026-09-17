// ========================================================================
// acceleration-time-graph — 선언
// ========================================================================
// 질문: 가속도-시간 그래프 아래 넓이가 왜 속도 변화인가.
//
// 1초 칸의 넓이를 떼어 오른쪽 막대에 모양 그대로 얹으면, 쌓인 높이가 곧 속도 변화다.
// 축 아래 넓이는 쌓인 것을 깎아 낸다.
//
// 값은 모두 원본(tasks/piece-lab/acceleration-time-graph/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:acceleration-time-graph` 와 문자 그대로 일치한다 (C4). */
export const ACCELERATION_TIME_GRAPH_ID = 'acceleration-time-graph';

// ------------------------------------------------------------------------
// 물리 — 1초 칸마다 일정한 가속도 (m/s²)
// ------------------------------------------------------------------------

/**
 * 0~2 s 2 · 2~4 s 1 · 4~5 s 0 · 5~7 s −1.5. 구간마다 일정해서 1초 칸 넓이가 근사가
 * 아니라 정확한 값이다. 속도 변화는 2 → 4 → 5 → 6 → 6 → 4.5 → 3.
 */
export const ACCEL: readonly number[] = [2, 2, 1, 1, 0, -1.5, -1.5];

/** 가속도 값을 적는 구간 `[시작 s, 끝 s]`. 같은 값이 이어지는 칸을 한 번만 적는다. */
export const SEGMENTS: readonly (readonly [number, number])[] = [
  [0, 2],
  [2, 4],
  [4, 5],
  [5, 7],
];

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스(860 × 300, px, y 아래로) 그대로
// ------------------------------------------------------------------------

/**
 * 두 좌표계가 맞물리는 조건 — 칸 폭(1 s = 80 px)이 막대 폭과 같고, 1 m/s² 의 높이(40 px)가
 * 1 m/s 의 높이와 같다. 그래서 칸의 높이가 그대로 쌓인 높이가 된다.
 */
export const LAYOUT = {
  width: 860,
  height: 300,
  /** 시간 0 의 x. */
  graphX0: 60,
  /** 1 초의 폭. */
  pxPerS: 80,
  /** 가속도 0 의 y. */
  axisY: 150,
  /** 1 m/s² 의 높이. */
  pxPerA: 40,
  /** 속도 변화 막대 왼쪽. */
  barX: 700,
  /** 속도 변화 0 의 y. */
  barBase: 280,
  /** 캡션이 캔버스 안으로 들어오며 그림 아래 더 잡는 자리. 원본은 캔버스 밖 한 줄. */
  captionRoom: 34,
} as const;

/** 글자 크기(화면 px). 원본 값 그대로. */
export const FONT = { label: 13, value: 15, caption: 15 } as const;

/**
 * 칸 하나의 연출 길이(초) — 떼어 옮기는 비행, 축 아래 칸이 막대를 깎는 시간.
 * 칸마다 시차를 두고 되풀이되는 일이라 단계로 나누지 못하고 스테이지 상수로 둔다
 * (NOTES 「어휘 부족」). 아래 시간표의 단계 길이는 이 둘에서 나왔다.
 */
export const SLAB_TIMING = { flight: 0.9, erase: 0.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const accelerationTimeGraphMessages = Object.freeze({
  'label.title': { ko: '가속도-시간 그래프', en: 'Acceleration-time graph' },
  'label.operation': {
    ko: '넓이가 속도 변화인 표현',
    en: 'The area under the graph is the change in velocity',
  },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 그래프 세로축 이름. */
  'label.axisA': { ko: '가속도', en: 'acceleration' },
  /** 그래프 가로축 이름. */
  'label.axisT': { ko: '시간', en: 'time' },
  /** 막대 이름. */
  'label.bar': { ko: '속도 변화', en: 'change in velocity' },
  /** 한 칸의 폭. 수와 단위는 표식이다 (C1 판정 3). */
  'label.second': { ko: '1 s', en: '1 s' },
  /** 구간 가속도 값. */
  'label.accel': { ko: '{a} m/s²', en: '{a} m/s²' },
  /** 날아가는 칸의 넓이 · 막대의 속도 변화 값. */
  'label.velocity': { ko: '{v} m/s', en: '{v} m/s' },
  'caption.fill': {
    ko: '가속도 아래 넓이가 1초씩 채워진다',
    en: 'The area under the acceleration fills one second at a time',
  },
  'caption.stack': {
    ko: '1초 동안의 넓이가 모양 그대로 속도 변화에 얹힌다',
    en: "Each second's area lands on the change in velocity, shape unchanged",
  },
  'caption.zero': {
    ko: '가속도가 0인 동안은 얹을 넓이가 없다',
    en: 'While the acceleration is zero there is no area to add',
  },
  'caption.cut': {
    ko: '축 아래 넓이는 쌓인 속도 변화를 깎아 낸다',
    en: 'Area below the axis cuts away the stacked change in velocity',
  },
  'caption.total': {
    ko: '넓이를 모두 얹고 깎은 높이 {total} m/s 가 속도 변화다',
    en: 'The height left after adding and cutting all the area, {total} m/s, is the change in velocity',
  },
} satisfies Record<string, LocalizedText>);

export type AccelerationTimeGraphMessageKey = keyof typeof accelerationTimeGraphMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AccelerationTimeGraphMessageKey): LocalizedText =>
  accelerationTimeGraphMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AccelerationTimeGraphMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const accelerationTimeGraphSchema: BundleSchema = {
  id: ACCELERATION_TIME_GRAPH_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 한 바퀴(11 초)에 주장이 끝난다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { flight: SLAB_TIMING.flight, erase: SLAB_TIMING.erase },
    },
  ],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본은 그림 300px + 캔버스 밖 캡션 한 줄. 캡션이 안으로 들어오고 러너가 사방에 여백을 둔다. */
  canvas: { height: 380, minHeight: 340 },

  // 원본이 그린 순서 그대로 겹친다 — 깎이는 칸은 막대 **위**, 날아가는 칸은 그 위.
  drawOrder: 'scene',

  /** 도착한 순간 첫 칸이 이미 막대로 날아가는 중이다 (원본 START_OFFSET = 1.6 s). */
  startAt: 1.6,

  /**
   * 한 바퀴 11 s. 단계는 **캡션이 말하는 구간**이다. 칸 k 는 k 초에 채워지기 시작해
   * k+1 초에 떠나고 `flight` 뒤 내려앉는다(축 아래 칸은 `erase` 동안 더 깎는다).
   *
   * - fill   0 ~ 1      첫 칸이 채워진다 (앞당긴 시계로는 지나간 뒤에 도착한다)
   * - stack  1 ~ 4.9    양의 칸 넷이 날아가 얹힌다 (마지막 비행이 4 + 0.9 에 끝)
   * - zero   4.9 ~ 5.2  가속도 0 구간 — 얹을 넓이가 없다
   * - fill2  5.2 ~ 6    축 아래 첫 칸이 채워진다
   * - cut    6 ~ 8.4    축 아래 칸 둘이 날아가 깎는다 (7 + 0.9 + 0.5 에 끝)
   * - total  8.4 ~ 10.4 합이 속도 변화다
   * - fade   10.4 ~ 11  막대와 자리가 흐려진다
   */
  timeline: {
    phases: [
      { id: 'fill', duration: 1, caption: key('caption.fill') },
      { id: 'stack', duration: 3.9, caption: key('caption.stack') },
      { id: 'zero', duration: 0.3, caption: key('caption.zero') },
      { id: 'fill2', duration: 0.8, caption: key('caption.fill') },
      { id: 'cut', duration: 2.4, caption: key('caption.cut') },
      { id: 'total', duration: 2, caption: key('caption.total') },
      { id: 'fade', duration: 0.6, caption: key('caption.total') },
    ],
  },

  // 슬롯 하나. 원본은 그림 아래 가운데 한 줄, 바로 바뀐다.
  caption: {
    anchor: { screen: 'bottom-center' },
    align: 'center',
    fontSize: FONT.caption,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { total: 'totalText' },
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 가속도 축 눈금 숫자도 두지 않는다 — 구간마다
   * 값을 선 옆에 직접 적었다. 격자는 "칸 넓이를 세라" 는 지시가 되어 동사를 가로챈다.
   */

  messages: accelerationTimeGraphMessages,
};
