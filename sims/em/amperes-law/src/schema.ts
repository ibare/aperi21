// ========================================================================
// amperes-law — 선언
// ========================================================================
// 질문: 전류를 감싸고 한 바퀴 돌면서 B 의 길 방향 몫을 모두 더하면 무엇이 남는가.
//
// 전선(⊙, 화면 밖으로 흐르는 전류 I) 둘레에 닫힌 길 셋을 차례로 걷는다 — 원, 찌그러진
// 고리, 전류를 감싸지 않는 고리. 걷는 점 위에서 B 의 길 방향 몫을 떼어 오른쪽 막대에
// 쌓는다. 감싼 두 길은 모양이 달라도 막대가 같은 μ₀I 선에 닿고, 감싸지 않은 길은
// 올랐던 막대가 0 으로 돌아온다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:amperes-law` 와 문자 그대로 일치한다 (C4). */
export const AMPERES_LAW_ID = 'amperes-law';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전선의 전류(임의 단위, μ₀ = 1). 막대가 닿는 기준선 μ₀I 의 높이가 이것으로 정해진다. */
export const CURRENT = 1;
/**
 * 표시 배율 — 장 B 를 화살표 월드 길이로 바꾸는 배율. 모든 자리에 같은 배율이고 상한이
 * 없다 — 길이의 비가 장의 비 그대로다. 가장 가까운 자리(찌그러진 고리, r ≈ 0.52)에서도
 * 화살표가 1.1 을 넘지 않도록 골랐다.
 */
export const FIELD_TO_LENGTH = 3.4;
/** 표시 배율 — 쌓인 합(∮B·dl, μ₀I 단위)을 막대 월드 높이로 바꾸는 배율. */
export const SUM_TO_LENGTH = 2.2;
/**
 * 한 바퀴를 나누는 토막 수. 같은 길이씩 나눈다 — 막대에 쌓이는 토막 하나가 길 위 한 토막의
 * 몫이다. 원에서는 모든 토막이 같은 높이로 쌓인다.
 */
export const SEGMENTS = 16;
/** 걷기를 시작하는 고리 위 매개 각(도). −90° 는 고리의 맨 아래다. */
export const START_ANGLE_DEG = -90;

/** 원 — 전선을 중심으로 한 반지름(월드). */
export const CIRCLE_RADIUS = 1;

/**
 * 찌그러진 고리 — 중심 · 가로 · 세로 반지름에 둘레를 굽이치게 하는 굴곡(비율)과 굽이 수.
 * 자리 = 중심 + (rx cos s, ry sin s)·(1 + dent · cos(lobes · s)). 전선을 감싸되 중심에서
 * 비켜 있어 전선까지의 거리가 0.52 ~ 1.7 로 크게 달라진다.
 */
export const SQUASH_X = -0.35;
export const SQUASH_Y = 0.1;
export const SQUASH_RX = 1.6;
export const SQUASH_RY = 0.75;
export const SQUASH_DENT = 0.18;
export const SQUASH_LOBES = 3;

/** 전류 밖 고리 — 전선 오른쪽에 선 타원. 전선을 감싸지 않는다. */
export const OUTSIDE_X = 2.25;
export const OUTSIDE_Y = 0;
export const OUTSIDE_RX = 0.42;
export const OUTSIDE_RY = 1.25;

// ------------------------------------------------------------------------
// 배치 — 월드. 전선이 원점이다.
// ------------------------------------------------------------------------

/** 막대 셋의 첫 가운데 · 사이 · 폭. 고리 순서(원 · 찌그러진 · 밖)대로 놓인다. */
export const COLUMN_FIRST_X = 3.8;
export const COLUMN_GAP = 0.78;
export const COLUMN_WIDTH = 0.4;
/** 막대 바닥(합 0)의 높이. */
export const COLUMN_BASE_Y = -1.1;
/** 막대 아래 작은 고리 그림의 가운데 높이와 축척. 어느 막대가 어느 고리인지 글자 없이 잇는다. */
export const MINI_Y = -1.56;
export const MINI_SCALE = 0.17;

/**
 * 프레이밍은 주장의 일부다. 가로는 찌그러진 고리 왼끝(−1.74)부터 셋째 막대와 기준선 끝까지,
 * 세로는 막대 아래 작은 그림 · 캡션 줄부터 μ₀I 선 위 여백까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.95, maxX: 5.75, minY: -1.95, maxY: 1.4 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 고리 하나를 한 바퀴 걷는 동안. 길이가 긴 고리일수록 조금 더 준다 — 걷는 빠르기가 비슷하게. */
export const WALK_CIRCLE = 5;
export const WALK_SQUASH = 6.5;
export const WALK_OUTSIDE = 6;
/** 한 바퀴를 다 돈 막대를 읽는 동안. */
export const CLOSE = 1.8;
/** 세 막대를 나란히 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3.2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const amperesLawMessages = Object.freeze({
  'label.title': { ko: '앙페르 법칙', en: 'Ampère’s law' },
  'label.stage': { ko: '곧은 전선 둘레의 세 길', en: 'Three paths around a straight wire' },
  'label.view': { ko: '위에서 본 전선', en: 'Wire seen end-on' },
  /** 도식 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.current': { ko: 'I', en: 'I' },
  'label.field': { ko: 'B', en: 'B' },
  'label.enclosed': { ko: 'μ₀I', en: 'μ₀I' },
  'label.zero': { ko: '0', en: '0' },
  'caption.walkCircle': {
    ko: '전류를 감싼 원을 따라 걸으며, B 의 길 방향 몫을 막대에 쌓는다',
    en: 'Walking the circle around the current, we stack up the part of B along the path',
  },
  'caption.closeCircle': {
    ko: '한 바퀴를 돌자 막대가 μ₀I 선에 닿는다',
    en: 'After one full lap the stack reaches the μ₀I line',
  },
  'caption.walkSquash': {
    ko: '찌그러진 고리 — 전선 가까이에선 빨리, 멀리선 천천히 쌓인다',
    en: 'A squashed loop — the stack grows fast near the wire and slowly far from it',
  },
  'caption.closeSquash': {
    ko: '모양이 달라도 한 바퀴의 합은 같은 μ₀I 다',
    en: 'A different shape, yet one lap adds up to the same μ₀I',
  },
  'caption.walkOutside': {
    ko: '전류를 감싸지 않은 고리 — B 를 따라갈 땐 쌓이고, 거슬러 갈 땐 덜어진다',
    en: 'A loop that misses the current — going with B adds, going against it takes away',
  },
  'caption.closeOutside': {
    ko: '한 바퀴를 돌면 합은 0 으로 돌아온다',
    en: 'After one lap the sum is back to zero',
  },
  'caption.hold': {
    ko: '한 바퀴의 합을 정하는 것은 길의 모양이 아니라 감싼 전류다',
    en: 'What sets the sum over a lap is the current enclosed, not the shape of the path',
  },
} satisfies Record<string, LocalizedText>);

export type AmperesLawMessageKey = keyof typeof amperesLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AmperesLawMessageKey): LocalizedText => amperesLawMessages[key];

/** 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AmperesLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const amperesLawSchema: BundleSchema = {
  id: AMPERES_LAW_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 세 길을 차례로 걸으며 막대가 쌓이고, 나란히 읽고, 다시 시작한다.
  parameters: [],

  stages: [
    {
      id: 'around-wire',
      label: text('label.stage'),
      constants: {
        current: CURRENT,
        fieldToLength: FIELD_TO_LENGTH,
        sumToLength: SUM_TO_LENGTH,
        segments: SEGMENTS,
        startAngleDeg: START_ANGLE_DEG,
        circleRadius: CIRCLE_RADIUS,
        squashX: SQUASH_X,
        squashY: SQUASH_Y,
        squashRx: SQUASH_RX,
        squashRy: SQUASH_RY,
        squashDent: SQUASH_DENT,
        squashLobes: SQUASH_LOBES,
        outsideX: OUTSIDE_X,
        outsideY: OUTSIDE_Y,
        outsideRx: OUTSIDE_RX,
        outsideRy: OUTSIDE_RY,
      },
    },
  ],

  environments: [],

  views: [{ id: 'end-on', label: text('label.view'), default: true }],

  /** 가로로 놓인 고리 셋과 막대 셋. 360 에서는 세로에 묶여 화살표가 짧아 조금 키웠다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 끝난 고리는 옅게 먼저, 걷는 고리는 그 위, 걷는 점의 화살표는
   * 맨 위에 와야 새로 쌓이는 몫이 가려지지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 원 걷기 → 읽기 → 찌그러진 고리 걷기 → 읽기 → 밖 고리 걷기 → 읽기 →
   * 세 막대 나란히 → 흐려짐. 걷는 단계는 `linear` — 걷는 빠르기가 고르다.
   */
  timeline: {
    phases: [
      { id: 'walk-circle', duration: WALK_CIRCLE, caption: key('caption.walkCircle') },
      { id: 'close-circle', duration: CLOSE, caption: key('caption.closeCircle') },
      { id: 'walk-squash', duration: WALK_SQUASH, caption: key('caption.walkSquash') },
      { id: 'close-squash', duration: CLOSE, caption: key('caption.closeSquash') },
      { id: 'walk-outside', duration: WALK_OUTSIDE, caption: key('caption.walkOutside') },
      { id: 'close-outside', duration: CLOSE, caption: key('caption.closeOutside') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 원을 반쯤 걸어 막대가 반쯤 쌓인 자리에서 연다. */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **막대의 높이가 기준선에
   * 닿는가**다 — μ₀I 점선과 0 선 둘이 그 기준이다.
   */

  messages: amperesLawMessages,
};
