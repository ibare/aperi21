// ========================================================================
// apparent-weight — 선언
// ========================================================================
// 질문: 엘리베이터가 올라가는 동안에는 저울 눈금이 계속 크게 나올까?
//
// 엘리베이터 안 저울 눈금은 빨리 움직일 때가 아니라 **속도가 바뀌는 동안에만**
// 평소 눈금에서 벗어난다. 원본: tasks/piece-lab/apparent-weight.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:apparent-weight` 와 문자 그대로 일치한다 (C4). */
export const APPARENT_WEIGHT_ID = 'apparent-weight';

// ------------------------------------------------------------------------
// 확정값 — 원본 그대로
// ------------------------------------------------------------------------

/**
 * 몸무게 60 kg, 가속도 크기 0.2g = 1.96 m/s² → 눈금 72 / 60 / 48 kg.
 * 스테이지 상수로 둔다 — 물리가 읽는 값은 저작자가 바꿀 수 있어야 한다 (원칙 2).
 */
export const DEFAULT_CONSTANTS = { g: 9.8, mass: 60, accelRatio: 0.2 } as const;

/** 바늘 — 실제 저울처럼 감쇠 스프링으로 목표 눈금을 따라간다. */
export const NEEDLE = { omega: 14, zeta: 0.7 } as const;

/**
 * 원본 캔버스(860 × 300 px). 월드는 원본 px 를 그대로 쓰고 y 만 뒤집는다 — `[x, -y]`.
 * 기억으로 옮기지 않으려고 원본의 배치 상수를 이름까지 그대로 가져왔다.
 */
export const W = 860;
export const H = 300;
export const SHAFT = { x: 200, w: 150, top: 12, bottom: 256 } as const;
export const CAR = { w: 124, h: 104 } as const;
/** 칸이 오르내리는 거리(px) = 승강로 높이 − 칸 높이 − 여유 12 = 128. */
export const TRAVEL_PX = SHAFT.bottom - SHAFT.top - CAR.h - 12;
/** 속도 1 m/s 가 화살표 몇 px 인가. */
export const ARROW_PX_PER_MS = 34;
/**
 * 눈금판 — 중심 · 원본 눈금 바깥 반지름 108 · 범위.
 * 엔진 눈금판은 눈금 바깥 끝을 반지름의 0.94 에 긋는다. 원본 눈금 끝(108)에
 * 맞추려고 `scale.size` 를 115 로 준다 (NOTES (a)).
 */
export const DIAL = { cx: 590, cy: 138, r: 108, size: 115, min: 30, max: 90 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const apparentWeightMessages = Object.freeze({
  'label.title': { ko: '겉보기 무게', en: 'Apparent weight' },
  'label.operation': { ko: '가속하는 엘리베이터 안의 저울', en: 'A scale in an accelerating elevator' },
  'label.stage': { ko: '엘리베이터', en: 'Elevator' },
  'label.view': { ko: '저울', en: 'Scale' },
  /** 칸 옆 속도 화살표의 이름. */
  'label.velocity': { ko: '속도', en: 'velocity' },
  /** 눈금판 위 60 kg 자리의 표시 글자. */
  'label.usual': { ko: '평소', en: 'usual' },
  /** 눈금 단위. 표식 (C1 판정 3). */
  'label.unit': { ko: 'kg', en: 'kg' },
  'caption.upSpeeding': {
    ko: '올라가기 시작해 속도가 붙는 동안 — 눈금이 평소보다 크다',
    en: 'Speeding up on the way up — the scale reads more than usual',
  },
  'caption.upSteady': {
    ko: '같은 속도로 올라가는 동안 — 눈금은 평소와 같다',
    en: 'Rising at a steady speed — the scale reads the usual value',
  },
  'caption.upSlowing': {
    ko: '멈추려고 속도가 줄어드는 동안 — 눈금이 평소보다 작다',
    en: 'Slowing to a stop at the top — the scale reads less than usual',
  },
  'caption.rest': {
    ko: '멈춰 있다 — 평소 눈금',
    en: 'At rest — the usual reading',
  },
  'caption.downSpeeding': {
    ko: '내려가기 시작해 속도가 붙는 동안 — 눈금이 평소보다 작다',
    en: 'Speeding up on the way down — the scale reads less than usual',
  },
  'caption.downSteady': {
    ko: '같은 속도로 내려가는 동안 — 눈금은 평소와 같다',
    en: 'Descending at a steady speed — the scale reads the usual value',
  },
  'caption.downSlowing': {
    ko: '멈추려고 속도가 줄어드는 동안 — 눈금이 평소보다 크다',
    en: 'Slowing to a stop at the bottom — the scale reads more than usual',
  },
} satisfies Record<string, LocalizedText>);

export type ApparentWeightMessageKey = keyof typeof apparentWeightMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ApparentWeightMessageKey): LocalizedText => apparentWeightMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ApparentWeightMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const apparentWeightSchema: BundleSchema = {
  id: APPARENT_WEIGHT_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 주장은 자동 진행 한 주기로 끝난다 (원본 NOTES (c)).
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: { ...DEFAULT_CONSTANTS } }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 860 × 300 을 폭 900 에서 거의 같은 배율로 담는 높이. 세로가 비싸다. */
  canvas: { height: 320, minHeight: 280 },

  /**
   * 한 주기 10 s — 1 s 가속 → 2 s 등속 → 1 s 감속 → 1 s 정지, 같은 모양으로 내려간다.
   *
   * 단계마다의 가속도(+a · 0 · −a)는 물리가 단계 id 로 읽는다 (`physics.ts`).
   * 위치·속도는 단계 진행도에서 닫힌 식으로 나오므로 주기가 길어도 누적 오차가 없다.
   * 원본은 시계를 앞당기지 않았다(t = 0 에 바닥에서 막 출발) — `startAt` 없음.
   */
  timeline: {
    phases: [
      { id: 'up-speeding', duration: 1, caption: key('caption.upSpeeding') },
      { id: 'up-steady', duration: 2, caption: key('caption.upSteady') },
      { id: 'up-slowing', duration: 1, caption: key('caption.upSlowing') },
      { id: 'top', duration: 1, caption: key('caption.rest') },
      { id: 'down-speeding', duration: 1, caption: key('caption.downSpeeding') },
      { id: 'down-steady', duration: 2, caption: key('caption.downSteady') },
      { id: 'down-slowing', duration: 1, caption: key('caption.downSlowing') },
      { id: 'bottom', duration: 1, caption: key('caption.rest') },
    ],
  },

  /** 슬롯 하나. 원본 캡션 자리(가운데, y 284) · 15px · 먹색. */
  caption: {
    anchor: { world: [W / 2, -284] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 겹침 순서가 원본의 그리기 순서다 — 칸 채움 위에 저울과 사람, 눈금판 위에 평소 표시.
   * 그리드도 카메라 버튼도 없다 — 원본에 없다.
   */
  drawOrder: 'scene',

  messages: apparentWeightMessages,
};
