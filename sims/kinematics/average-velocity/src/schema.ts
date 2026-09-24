// ========================================================================
// average-velocity — 선언
// ========================================================================
// 질문: 같은 운동인데 평균 속도는 왜 하나로 정해지지 않나.
//
// 평균 속도는 구간의 두 끝만 잇는 직선의 기울기라서, 구간 끝을 옮기면 그 직선이
// **기운다.** 운동(곡선)은 그대로이고 움직이는 것은 구간뿐이다.
//
// 원본: tasks/piece-lab/average-velocity (손으로 짠 캔버스). 상수는 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:average-velocity` 와 문자 그대로 일치한다 (C4). */
export const AVERAGE_VELOCITY_ID = 'average-velocity';

// ------------------------------------------------------------------------
// 운동 — 앞으로 달리다 멈추고, 되돌아온다
// ------------------------------------------------------------------------

/** 앞으로 달리는 빠르기(m/s)와 그 구간 끝(초). 0~4 초에 8 m/s. */
export const RUN_SPEED = 8;
export const RUN_END = 4;
/** 멈춰 있는 구간 끝(초). 4~6 초. */
export const STOP_END = 6;
/** 되돌아오는 빠르기(m/s). 6 초부터 −5 m/s. */
export const BACK_SPEED = 5;
/** 모서리 둥글리기 — 폭 1 초 상자 평균, 표본 64 개. 직선 구간 값은 그대로다. */
export const SMOOTH_WIDTH = 1;
export const SMOOTH_SAMPLES = 64;

/** 그래프가 담는 범위. 시간 0~10 초, 위치 −2~36 m. */
export const T_MIN = 0;
export const T_MAX = 10;
export const X_MIN = -2;
export const X_MAX = 36;

/** 곡선 표본 수. 원본 240 구간. */
export const CURVE_SAMPLES = 240;
/** 두 끝을 잇는 직선을 구간 밖으로 옅게 연장하는 길이(초). */
export const LINE_EXTEND = 0.6;

/** 구간이 움직이는 범위(초). 끝 시각은 1.5 → 10, 시작 시각은 0 → 6. */
export const END_FROM = 1.5;
export const START_TO = 6;

/** 도착한 순간 이미 끝 시각이 움직이고 있도록 시계를 앞당긴다(초). 원본 OFFSET. */
export const START_AT = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const averageVelocityMessages = Object.freeze({
  'label.title': { ko: '평균 속도', en: 'Average velocity' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 축 이름. 단위 표기는 표식이지만 낱말이 붙어 문안이다 (C1). */
  'label.timeAxis': { ko: '시간 (s)', en: 'time (s)' },
  'label.positionAxis': { ko: '위치 (m)', en: 'position (m)' },
  'label.road': { ko: '도로', en: 'road' },
  /** 눈금 숫자. 수는 표식이라 틀만 둔다 (C1 판정 3). */
  'label.tick': { ko: '{v}', en: '{v}' },
  'caption.end': {
    ko: '끝 시각이 늦어진다 — {from}~{to}초: {dx} m ÷ {dt} s = {v} m/s',
    en: 'The end time moves later — {from}–{to} s: {dx} m ÷ {dt} s = {v} m/s',
  },
  'caption.whole': {
    ko: '구간이 운동 전체를 덮었다 — {from}~{to}초: {dx} m ÷ {dt} s = {v} m/s',
    en: 'The interval covers the whole motion — {from}–{to} s: {dx} m ÷ {dt} s = {v} m/s',
  },
  'caption.start': {
    ko: '시작 시각이 늦어진다 — {from}~{to}초: {dx} m ÷ {dt} s = {v} m/s',
    en: 'The start time moves later — {from}–{to} s: {dx} m ÷ {dt} s = {v} m/s',
  },
  'caption.back': {
    ko: '구간이 처음으로 돌아간다 — {from}~{to}초: {dx} m ÷ {dt} s = {v} m/s',
    en: 'The interval returns to the start — {from}–{to} s: {dx} m ÷ {dt} s = {v} m/s',
  },
} satisfies Record<string, LocalizedText>);

export type AverageVelocityMessageKey = keyof typeof averageVelocityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AverageVelocityMessageKey): LocalizedText => averageVelocityMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AverageVelocityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const averageVelocitySchema: BundleSchema = {
  id: AVERAGE_VELOCITY_ID,
  title: text('label.title'),
  category: 'kinematics',
  timeModel: 'periodic',

  // 조작기가 없다. 구간이 알아서 움직이고 직선이 알아서 기운다.
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본 캔버스는 900 × 330 이고 캡션까지 그 안에 있다. 그래프(축 이름 아래 끝까지
   * 304 px)는 카메라가 담고, 캡션 슬롯은 그 아래 화면 모서리에 붙는다. 러너가 사방에
   * 여백을 두므로 그만큼 더 잡는다.
   */
  canvas: { height: 350, minHeight: 320 },

  /**
   * 원본의 그리기 순서가 곧 겹침이다 — 옅은 띠가 맨 아래, 그 위에 축 · 도로 · 안내선 ·
   * 곡선 · 삼각형 · 직선 · 끝 점 · 화살표. 층 순서를 따르면 띠(`region`)가 곡선 위를 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 도착한 순간 이미 끝 시각이 움직이고 있다 (원본 OFFSET 0.8 초).
   *
   * 시계(`startAt`)와 상태(`preroll`)를 **둘 다** 앞당긴다. 캡션의 수는 state 에 있고
   * `step` 이 자기 시계 `t` 로 계산하므로, 시계만 옮기면 그림과 캡션의 수가 0.8 초
   * 어긋난다.
   */
  startAt: START_AT,
  preroll: START_AT,

  /**
   * 한 주기 16 초. 구간 [시작, 끝] 이 이 순서로 움직인다.
   *
   * - `end` 7 초 — 끝 시각 1.5 → 10. 직선이 가파름에서 눕는다.
   * - `whole` 1.5 초 — 구간이 0~10 초를 덮은 채 머문다.
   * - `start` 5.5 초 — 시작 시각 0 → 6. 직선이 수평을 지나 아래로 기운다.
   * - `back` 2 초 — 구간이 처음(0~1.5 초)으로 돌아간다.
   */
  timeline: {
    phases: [
      { id: 'end', duration: 7, ease: 'smooth', caption: key('caption.end') },
      { id: 'whole', duration: 1.5, caption: key('caption.whole') },
      { id: 'start', duration: 5.5, ease: 'smooth', caption: key('caption.start') },
      { id: 'back', duration: 2, ease: 'smooth', caption: key('caption.back') },
    ],
  },

  /**
   * 슬롯 하나 — 지금 구간이 어떻게 바뀌는 중인지 + 위치 변화 ÷ 시간 = 평균 속도.
   * 원본은 왼쪽 24 px, 바닥에서 14 px 위 기준선에 15 px 먹색 한 줄이다.
   *
   * 수는 `step` 이 화면에 쓸 자릿수(소수 한 자리)로 정해 state 에 둔다. 단위와 낱말은
   * 문안 틀에 있다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, 10] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      from: 'readout.from',
      to: 'readout.to',
      dx: 'readout.dx',
      dt: 'readout.dt',
      v: 'readout.v',
    },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 기울기 삼각형 하나가 그리드의 몫을 한다.

  messages: averageVelocityMessages,
};
