// ========================================================================
// average-acceleration — 선언
// ========================================================================
// 질문: 도중에 속도가 줄었다 늘었다 해도, 처음과 끝 속도만 같으면 평균 가속도가
// 정말 같은가.
//
// 두 차가 같은 10 m/s 로 출발해 5 초 뒤 같은 20 m/s 가 된다. 가는 고르게, 나는
// 늦췄다가 몰아서 올린다. 속도-시간 그래프에서 처음과 지금을 잇는 두 기울기선이
// 끝 시각에 하나로 겹친다.
//
// 값은 모두 원본(tasks/piece-lab/average-acceleration/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:average-acceleration` 와 문자 그대로 일치한다 (C4). */
export const AVERAGE_ACCELERATION_ID = 'average-acceleration';

// ------------------------------------------------------------------------
// 운동 — 원본 상수
// ------------------------------------------------------------------------

/** 달리는 시간(s). 시간표의 `run` 단계 길이와 같다. */
export const RUN = 5;
/** 처음 속도(m/s). 두 차 공통. */
export const V0 = 10;
/** 끝 속도(m/s). 두 차 공통. */
export const V1 = 20;
/** 차 나가 처음에 속도를 늦추는 정도(m/s). 끝에서는 0 이 되어 가와 다시 만난다. */
export const DIP = -8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const averageAccelerationMessages = Object.freeze({
  'label.title': { ko: '평균 가속도', en: 'Average acceleration' },
  'label.stage': { ko: '두 차로', en: 'Two lanes' },
  'label.view': { ko: '도로와 그래프', en: 'Road and graph' },
  /** 차 이름표. 색으로만 가르지 않기 위해 둔다. */
  'label.carA': { ko: '가', en: 'A' },
  'label.carB': { ko: '나', en: 'B' },
  /** 화살표 옆 속력. 수와 단위는 표식이다 (C1 판정 3). */
  'label.speed': { ko: '{v} m/s', en: '{v} m/s' },
  /** 그래프 축 이름. */
  'label.axisV': { ko: '속도', en: 'velocity' },
  'label.axisT': { ko: '시간', en: 'time' },
  /** 축 눈금 — 주장에 쓰이는 값만. */
  'label.tickV': { ko: '{v}', en: '{v}' },
  'label.tickT0': { ko: '0', en: '0' },
  'label.tickT': { ko: '{t} s', en: '{t} s' },
  /** 겹친 기울기선의 값. */
  'label.slope': { ko: '기울기 {a} m/s²', en: 'slope {a} m/s²' },
  /** 걸린 시간과 속도 변화. */
  'label.dt': { ko: '{t} s 동안', en: 'over {t} s' },
  'label.dv': { ko: '+{v} m/s', en: '+{v} m/s' },
  'caption.run': {
    ko: '둘 다 10 m/s 로 출발한다. 가는 고르게, 나는 늦췄다가 몰아서 속도를 올린다.',
    en: 'Both start at 10 m/s. A speeds up steadily; B slows down first, then catches up.',
  },
  'caption.done': {
    ko: '5초 뒤 둘 다 20 m/s — 가는 동안은 달랐어도, 처음과 끝을 잇는 기울기는 하나로 겹친다.',
    en: 'After 5 s both are at 20 m/s — however they got there, the slopes joining start and end become one.',
  },
} satisfies Record<string, LocalizedText>);

export type AverageAccelerationMessageKey = keyof typeof averageAccelerationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AverageAccelerationMessageKey): LocalizedText =>
  averageAccelerationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AverageAccelerationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const averageAccelerationSchema: BundleSchema = {
  id: AVERAGE_ACCELERATION_ID,
  title: text('label.title'),
  category: 'kinematics',
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행으로 두 선이 겹치면 할 말이 끝난다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 그림 880 × 270 + 캔버스 밖 캡션 한 줄이었다. 캡션이 캔버스 안(화면 고정
   * 줄)으로 들어오고 러너가 사방에 여백을 두므로 그만큼 더 잡는다.
   */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 한 주기 8.5 s — 달림 5 → 기울기선이 하나로 합쳐짐 0.3 → 걸린 시간·속도 변화가
   * 나타남 0.4 → 머묾 2.8. 끝나면 되감기 전환 없이 처음으로 돌아간다(원본과 같다).
   *
   * 원본은 차가 출발선에서 이미 10 m/s 로 움직이는 순간부터 연다 — 시계를 앞당기지
   * 않는다(`startAt` 0).
   */
  timeline: {
    phases: [
      { id: 'run', duration: RUN, caption: key('caption.run') },
      { id: 'join', duration: 0.3, caption: key('caption.done') },
      { id: 'measure', duration: 0.4, caption: key('caption.done') },
      { id: 'hold', duration: 2.8, caption: key('caption.done') },
    ],
  },

  // 원본이 그린 순서대로 겹친다 — 단, 처음-지금 기울기선은 곡선 **아래**에 깐다
  // (NOTES.md 「원본과 달라진 점」). 겹침이 판정 장치라 층에 맡기지 않는다.
  drawOrder: 'scene',

  // 슬롯 하나. 원본의 figcaption 자리 — 그림 아래 왼쪽 한 줄.
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 눈금은 주장에 쓰이는 값(10 · 20 m/s,
   * 0 · 5 s)만 둔다 — 격자를 깔면 "숫자로 확인하라" 는 신호가 되어 동사가 선이
   * 겹치는 일에서 숫자가 같아지는 일로 옮겨 간다.
   */

  messages: averageAccelerationMessages,
};
