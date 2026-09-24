// ========================================================================
// direction-of-acceleration — 선언
// ========================================================================
// 질문: 가속도를 받는데 왜 느려질 수 있는가.
//
// 같은 빠르기로 출발해 같은 크기의 가속도를 받아도, 가속도가 속도와 같은 쪽이면
// 빨라지고 반대쪽이면 느려진다.
//
// 값은 모두 원본(tasks/piece-lab/direction-of-acceleration/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:direction-of-acceleration` 와 문자 그대로 일치한다 (C4). */
export const DIRECTION_OF_ACCELERATION_ID = 'direction-of-acceleration';

// ------------------------------------------------------------------------
// 물리 설정 — 두 공은 초속도·가속도 크기가 같고, 가속도 방향만 다르다
// ------------------------------------------------------------------------

/** 초속도(m/s), 오른쪽. */
export const V0 = 4;
/** 가속도 크기(m/s²). 반대쪽 공은 V0 / A = 4 초 만에 멈춘다. */
export const ACCEL = 1;
/** 지나간 자리를 찍는 간격(초). 같은 시간 간격이라 점 사이가 곧 빠르기다. */
export const STROBE = 0.5;

/** 레인마다 다른 것은 가속도의 부호 하나뿐이다. 위: 같은 쪽, 아래: 반대쪽. */
export const LANE_SIGNS: readonly (1 | -1)[] = [1, -1];

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const directionOfAccelerationMessages = Object.freeze({
  'label.title': { ko: '가속도의 방향', en: 'Direction of acceleration' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 화살표 끝 이름. 색으로만 두 화살표를 가르지 않기 위해 둔다. */
  'label.velocity': { ko: '속도', en: 'velocity' },
  'label.acceleration': { ko: '가속도', en: 'acceleration' },
  'caption.start': {
    ko: '두 공은 같은 빠르기로 출발하고, 같은 크기의 가속도를 받는다',
    en: 'Both balls start at the same speed and get the same size of acceleration',
  },
  'caption.run': {
    ko: '속도와 같은 쪽으로 밀리는 공은 빨라지고, 반대쪽으로 밀리는 공은 느려진다',
    en: 'Pushed along its velocity, a ball speeds up; pushed against it, a ball slows down',
  },
  'caption.stop': {
    ko: '반대쪽으로 밀린 공은 결국 멈춰 섰다',
    en: 'The ball pushed the other way finally came to a stop',
  },
} satisfies Record<string, LocalizedText>);

export type DirectionOfAccelerationMessageKey = keyof typeof directionOfAccelerationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: DirectionOfAccelerationMessageKey): LocalizedText =>
  directionOfAccelerationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DirectionOfAccelerationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const directionOfAccelerationSchema: BundleSchema = {
  id: DIRECTION_OF_ACCELERATION_ID,
  title: text('label.title'),
  category: 'kinematics',
  timeModel: 'periodic',

  // 조작기가 없다. 가속도 방향을 뒤집게 하면 같은 대조를 독자에게 한 번 더 시키는 것뿐이다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { v0: V0, a: ACCEL, strobe: STROBE },
    },
  ],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 220px 캔버스 아래에 캡션 한 줄을 따로 두었다. 엔진은 캡션을 캔버스 위에
   * 얹으므로 그 한 줄만큼(30px) 세로를 더 잡는다.
   */
  canvas: { height: 250, minHeight: 230 },

  /**
   * 한 주기 5.5 초 — 아래 공이 멈출 때까지 4 초, 멈춘 모습 1.5 초.
   *
   * 원본은 주기의 처음과 끝 0.35 초 동안 흐려졌다 돌아온다. 그 두 구간을 단계로
   * 세운다(`appear` · `vanish`) — scene 은 `at()` 으로 알파를 읽는다.
   *
   * `run` 이 끝나는 시각(4 초)은 반대쪽 공이 멈추는 물리 시각 V0 / A 와 같아야 한다.
   * 공이 멈추는 것은 물리가 정하고, 캡션이 바뀌는 것은 시간표가 정한다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.35, caption: key('caption.start') },
      { id: 'start', duration: 0.65, caption: key('caption.start') },
      { id: 'run', duration: 3.0, caption: key('caption.run') },
      { id: 'stop', duration: 1.15, caption: key('caption.stop') },
      { id: 'vanish', duration: 0.35, caption: key('caption.stop') },
    ],
  },

  /** 도착한 순간 이미 1.5 초 진행 중 — 점이 몇 개 찍혀 간격 차이가 보이기 시작한 상태. */
  startAt: 1.5,

  /**
   * 원본의 겹침 순서 — 바닥선 → 출발선 → 자취 → 공 → 화살표. 층 기본값은 바닥선
   * (`trajectory`)을 자취(`trace`) 위에 올려 점을 가로지른다.
   */
  drawOrder: 'scene',

  /** 슬롯 하나. 원본은 캔버스 바로 아래 가운데의 한 줄(15px)이었다. 페이드 없이 바뀐다. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, 14] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /** 그리드도 카메라 버튼도 없다 (기본값). 숫자·축·범례도 두지 않는다 — NOTES.md. */

  messages: directionOfAccelerationMessages,
};
