// ========================================================================
// kinetic-friction — 선언
// ========================================================================
// 질문: 미끄러지는 상자가 빠를수록 마찰이 더 세게 잡아 끄나?
//
// 동사: **같은 만큼씩 느려진다.** 운동 마찰은 빠르기와 상관없이 같은 크기라서, 빠른
// 상자와 느린 상자가 같은 만큼씩 느려진다.
//
// 조작기를 두지 않는다. 두 빠르기를 동시에 보여 주는 것이 "빠르기를 바꿔 보기" 를
// 이미 대신한다 (원본 NOTES).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:kinetic-friction` 와 문자 그대로 일치한다 (C4). */
export const KINETIC_FRICTION_ID = 'kinetic-friction';

// ------------------------------------------------------------------------
// 물리 — 원본 상수 그대로 (SI)
// ------------------------------------------------------------------------

/** 감속도 = 운동 마찰 계수 × 중력 가속도 (m/s², 원본 DECEL). 두 상자가 같다. */
export const DECEL = 0.4;
/** 처음 빠르기 (m/s) — 빠른 줄 · 느린 줄 (원본 lanes[].v0). */
export const V0_FAST = 2.4;
export const V0_SLOW = 1.2;
/** 자리 눈금 간격 (s, 원본 TICK_EVERY). */
export const TICK_EVERY = 1;
/** 한 주기 (s, 원본 CYCLE). */
export const CYCLE = 8.5;
/** 도착한 순간 이미 미끄러지는 중이도록 앞당기는 시각 (s, 원본 OFFSET). */
export const OFFSET = 0.5;

/** 멈추는 시각 = 처음 빠르기 / 감속도. 느린 상자 3 s, 빠른 상자 6 s. */
const STOP_SLOW = V0_SLOW / DECEL;
const STOP_FAST = V0_FAST / DECEL;

// ------------------------------------------------------------------------
// 배치 — 원본의 픽셀 상수를 그대로 두고 한 배율로 월드로 옮긴다
// ------------------------------------------------------------------------

/**
 * 원본 캔버스 860 × 268 px 의 상수. 숫자는 원본 그대로다.
 * 엔진 좌표는 y 가 위로 자라므로 캔버스 아래 끝을 월드 y 의 0 으로 삼는다.
 */
export const LAYOUT = {
  widthPx: 860,
  heightPx: 268,
  /** PX_PER_M — 1 m 가 몇 px 인지. */
  pxPerM: 100,
  /** V_PX_PER_MPS — 속도 1 m/s 가 화살표 몇 px 인지. */
  vPxPerMps: 40,
  /** FRICTION_PX — 마찰 화살표 길이. 빠르기와 무관하게 고정. */
  frictionPx: 56,
  /** START_X — 상자 앞면의 출발 위치. */
  startXPx: 110,
  /** BOX_W · BOX_H. */
  boxWPx: 44,
  boxHPx: 34,
  /** 두 줄의 바닥선 높이 (원본 lanes[].floorY). */
  floorYFastPx: 100,
  floorYSlowPx: 210,
  /** 바닥선 양 끝 여백. */
  floorInsetPx: 8,
  /** 줄 이름 — 왼쪽 x, 바닥선 위로 기준선까지, 글자 크기. */
  laneNameXPx: 12,
  laneNameDyPx: 70,
  laneNameFontPx: 13,
  /** 자리 눈금 — 바닥선 아래 3 px 에서 15 px 까지. */
  tickTopDyPx: 3,
  tickBottomDyPx: 15,
  /** 속도 화살표 — 상자 윗면 위로 띄우는 거리, 글자 기준선의 추가 높이. */
  velocityDyPx: 14,
  velocityLabelDyPx: 8,
  /** 속도 글자는 화살표 꼬리보다 2 px 왼쪽에서 왼쪽 정렬. */
  velocityLabelDxPx: -2,
  /** 마찰 화살표 — 바닥선 위 높이, 글자 기준선의 추가 높이. */
  frictionDyPx: 9,
  frictionLabelDyPx: 9,
  /** 화살 글자 크기. */
  arrowLabelFontPx: 12,
  /** 화살촉 길이 (원본 head 8). */
  headPx: 8,
  /** 캡션 — 왼쪽 x, 기준선 y, 글자 크기. */
  captionXPx: 12,
  captionBaselinePx: 256,
  captionFontPx: 15,
} as const;

/** 월드 한 단위 = 원본 100 px (= 1 m). */
export const PX_PER_UNIT = LAYOUT.pxPerM;

/** 원본의 가로 px(왼쪽 기준)를 월드 x 로. */
export function worldX(px: number): number {
  return px / PX_PER_UNIT;
}

/** 원본의 캔버스 y(아래로 증가)를 월드 y(위로 증가)로. 캔버스 아래 끝이 0 이다. */
export function worldY(px: number): number {
  return (LAYOUT.heightPx - px) / PX_PER_UNIT;
}

/** 원본의 길이 px 를 월드 길이로. */
export function toUnit(px: number): number {
  return px / PX_PER_UNIT;
}

/** 원본 캔버스 전체(캡션 줄 포함). 매 프레임 같은 값이다 (S-piece). */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: worldX(LAYOUT.widthPx),
  minY: worldY(LAYOUT.heightPx),
  maxY: worldY(0),
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const kineticFrictionMessages = Object.freeze({
  'label.title': { ko: '운동 마찰력', en: 'Kinetic friction' },
  'label.stage': { ko: '같은 바닥', en: 'Same floor' },
  'label.view': { ko: '두 줄', en: 'Two lanes' },
  'label.laneFast': { ko: '빠르게 출발', en: 'Starts fast' },
  'label.laneSlow': { ko: '느리게 출발', en: 'Starts slow' },
  'label.velocity': { ko: '속도', en: 'velocity' },
  'label.friction': { ko: '마찰', en: 'friction' },
  'caption.bothSliding': {
    ko: '빠르기가 달라도 두 상자에 걸린 마찰은 같고, 두 상자는 같은 만큼씩 느려진다',
    en: 'Different speeds, same friction on both boxes — both slow down by the same amount each second',
  },
  'caption.slowStopped': {
    ko: '느린 상자가 먼저 멈췄다. 빠른 상자는 여전히 같은 마찰을 받으며 같은 만큼씩 느려진다',
    en: 'The slow box stopped first. The fast box still feels the same friction and keeps slowing by the same amount',
  },
  'caption.bothStopped': {
    ko: '둘 다 멈췄다. 1초마다 남긴 눈금 간격이 두 줄 모두 똑같은 폭씩 줄었다',
    en: 'Both have stopped. In both lanes the gaps between the one-second marks shrank by the same step',
  },
} satisfies Record<string, LocalizedText>);

export type KineticFrictionMessageKey = keyof typeof kineticFrictionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: KineticFrictionMessageKey): LocalizedText => kineticFrictionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: KineticFrictionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const kineticFrictionSchema: BundleSchema = {
  id: KINETIC_FRICTION_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',

  // 조작기가 없다 — 두 빠르기를 나란히 두는 것이 이미 비교다.
  parameters: [],

  stages: [
    {
      id: 'same-floor',
      label: text('label.stage'),
      constants: { decel: DECEL, v0Fast: V0_FAST, v0Slow: V0_SLOW, tickEvery: TICK_EVERY },
    },
  ],

  environments: [],

  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /**
   * 원본 캔버스 268 px(캡션 줄 포함)에 러너의 프레이밍 여백을 더하고, 가로 860 px 이
   * 배율을 정하도록 조금 더 둔다. 300 px 에서는 세로가 배율을 묶어 장면이 작아졌다.
   * 움직임은 가로로만 일어난다.
   */
  canvas: { height: 316, minHeight: 316 },

  /** 도착한 순간 이미 미끄러지는 중이도록 주기 0.5 초 지점에서 연다 (원본 OFFSET). */
  startAt: OFFSET,

  /**
   * 한 주기 8.5 초 (원본 CYCLE). 단계 경계는 **멈추는 시각**이다 — 원본 캡션이
   * 그리기와 같은 `stopped` 상태를 보고 문장을 골랐으므로, 경계를 물리 상수에서
   * 계산해 캡션이 화면과 어긋나는 순간이 없게 한다.
   *
   * - `sliding` 0 → 3 s: 둘 다 미끄러진다.
   * - `fastOnly` 3 → 6 s: 느린 상자가 멈추고 빠른 상자만 미끄러진다.
   * - `stopped` 6 → 8.5 s: 둘 다 멈춰 눈금 간격을 견준다.
   *
   * 원본 캡션은 페이드 없이 바로 바뀐다 — `fade` 를 두지 않는다.
   */
  timeline: {
    phases: [
      { id: 'sliding', duration: STOP_SLOW, caption: key('caption.bothSliding') },
      { id: 'fastOnly', duration: STOP_FAST - STOP_SLOW, caption: key('caption.slowStopped') },
      { id: 'stopped', duration: CYCLE - STOP_FAST, caption: key('caption.bothStopped') },
    ],
  },

  /**
   * 슬롯 하나. 원본처럼 캔버스 왼쪽 아래 한 줄(왼쪽 x 12 px, 기준선 256 px).
   * 월드 앵커는 글 가운데로 놓으므로 기준선에서 글자 크기 1/3 만큼 올린다.
   */
  caption: {
    anchor: {
      world: [worldX(LAYOUT.captionXPx), worldY(LAYOUT.captionBaselinePx)],
      offset: [0, -LAYOUT.captionFontPx / 3],
    },
    align: 'left',
    fontSize: LAYOUT.captionFontPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /** 그리드도 카메라 버튼도 없다 (기본값). 재는 것은 눈금 간격의 줄어듦이다. */

  messages: kineticFrictionMessages,
};
