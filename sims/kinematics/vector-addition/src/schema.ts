// ========================================================================
// vector-addition — 선언
// ========================================================================
// 질문: 화살표 둘을 더한다는 건 뭘 어떻게 하는 걸까.
//
// 나를 가의 머리로 옮겨 붙이고 이어 걸으면, 처음 꼬리에서 마지막 머리까지가
// 두 벡터의 합이다. 숫자는 한 개도 띄우지 않는다 — 이 조각의 주장은
// "어디에서 어디까지" 가 합인가이지 "얼마인가" 가 아니다.
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:vector-addition` 와 문자 그대로 일치한다 (C4). */
export const VECTOR_ADDITION_ID = 'vector-addition';

// ------------------------------------------------------------------------
// 좌표 — 원본의 화면 픽셀을 월드로 옮긴 것
// ------------------------------------------------------------------------
//
// 원본(`tasks/piece-lab/vector-addition/index.html`)은 880 x 336 캔버스의 픽셀로
// 그린다. **1 월드 단위 = 원본 100 px** 이고, 원본의 출발 꼬리(52.8, 300)가
// 월드 원점이다. y 는 위가 +.
//
// 좌표계를 화면에 두지는 않는다 — 축도 격자도 없다. 머리-꼬리 잇기는 좌표계
// 없이 성립하는 기하이고, 격자를 깔면 "칸을 세어 더한다" 는 다른 방법이 함께
// 보여 조각이 두 주장을 갖는다 (NOTES.md 「두지 않은 것」).

/** 출발 꼬리. 합을 재는 기준점이다. */
export const ORIGIN: Vec2 = [0, 0];

/** 벡터 가의 처음 값. 원본 `a = { x: W * 0.440, y: -64 }` (W = 880). */
export const A0: Vec2 = [3.872, 0.64];
/** 벡터 나의 처음 값. 원본 `b = { x: W * 0.300, y: -182 }`. */
export const B0: Vec2 = [2.64, 1.82];

/**
 * 고정 프레이밍. 원본 캔버스(880 x 336) + 캡션 줄(32 px) 만큼이다.
 *
 * 매 프레임 같은 값이라야 끄는 동안 카메라가 따라 흔들리지 않는다 (S-piece).
 * 끌린 머리가 이 밖으로 나가지 않게 막는 것은 `physics.ts` 의 몫이다.
 */
export const SCENE_BOUNDS = { minX: -0.528, maxX: 8.272, minY: -0.68, maxY: 3.0 } as const;

/** 화살표의 가장 짧은 길이. 원본 `L < 34` 픽셀. */
export const MIN_LENGTH = 0.34;
/** 끌린 머리가 머무는 범위. 원본 `clamp(24, W - 24)` · `clamp(26, H - 26)`. */
export const TIP_X: readonly [number, number] = [-0.288, 8.032];
export const TIP_Y: readonly [number, number] = [-0.1, 2.74];

// ------------------------------------------------------------------------
// 치수 — 이 그림 고유의 것
// ------------------------------------------------------------------------

/** 가 · 나의 선 굵기(화면 px). 둘은 같은 종류라 굵기도 같다. */
export const VECTOR_WIDTH_PX = 3.4;
/** 가 · 나의 화살촉(월드). 원본 16 px. */
export const VECTOR_HEAD = 0.16;
/** 합의 선 굵기(화면 px) — 가 · 나보다 굵다. */
export const SUM_WIDTH_PX = 4.4;
/** 합의 화살촉(월드). 원본 19 px. */
export const SUM_HEAD = 0.19;
/** 나의 원래 자리(점선)의 선 굵기(화면 px)와 화살촉(월드). 원본 2 px · 12 px. */
export const GHOST_WIDTH_PX = 2;
export const GHOST_HEAD = 0.12;
/** 점선 잔상이 가장 짙을 때의 불투명도. */
export const GHOST_ALPHA = 0.55;

/** 걸어온 자국의 굵기(화면 px)와 불투명도. */
export const TRAIL_WIDTH_PX = 11;
export const TRAIL_ALPHA = 0.2;

/** 걷는 점의 반지름(월드). 원본 잉크 원 5.5 px. */
export const WALKER_RADIUS = 0.055;
/** 출발 꼬리 동그라미의 반지름(월드). 원본 6 px. */
export const TAIL_RADIUS = 0.06;

/** 잡히는 반경(화면 px). 원본 `near()` 의 24. */
export const GRAB_RADIUS_PX = 24;
/** '끌기' 글자의 크기(화면 px)와 손잡이에서 오른쪽으로 나오는 거리(화면 px). */
export const HINT_FONT_PX = 13;
export const HINT_OFFSET: Vec2 = [18, 0];
/** '끌기' 글자가 떠오르고 사라지는 시간(초). 원본 0.5 · 0.4. */
export const HINT_IN = 0.5;
export const HINT_OUT = 0.4;
/** 합의 이름이 나타나기 시작하는 자람 정도. 원본 `sumT > 0.55`. */
export const SUM_LABEL_AT = 0.55;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const vectorAdditionMessages = Object.freeze({
  'label.title': { ko: '벡터의 합성', en: 'Vector addition' },
  'label.operation': {
    ko: '나를 가의 머리에 옮겨 붙이고 이어 걸으면 그 끝이 합이다',
    en: 'Slide b onto the head of a, walk both, and the far end is the sum',
  },
  'label.stage': { ko: '두 화살표', en: 'Two arrows' },
  'label.view': { ko: '벡터의 합성', en: 'Vector addition' },

  /** 화살표에 붙는 이름. 가 · 나는 순서를 가리키는 말이라 언어마다 다르다. */
  'label.a': { ko: '가', en: 'a' },
  'label.b': { ko: '나', en: 'b' },
  'label.sum': { ko: '가 + 나', en: 'a + b' },
  /** 손잡이 옆 조작 안내. 캡션 슬롯을 나눠 쓰지 않으려고 그림에 붙였다. */
  'label.drag': { ko: '끌기', en: 'drag' },

  'caption.slide': {
    ko: '나를 가의 머리로 옮겨 붙인다',
    en: 'Slide b over to the head of a',
  },
  'caption.walkA': {
    ko: '꼬리에서 출발해 가를 따라 걷는다',
    en: 'Start at the tail and walk along a',
  },
  'caption.walkB': {
    ko: '가의 머리에서 이어 나를 따라 걷는다',
    en: 'Carry on from the head of a and walk along b',
  },
  'caption.grow': {
    ko: '출발한 꼬리에서 도착한 머리까지 곧게 잇는다',
    en: 'Draw straight from the tail you left to the head you reached',
  },
  'caption.hold': {
    ko: '처음 꼬리에서 마지막 머리까지, 이것이 가 + 나 다',
    en: 'First tail to last head — this is a + b',
  },
  'caption.back': { ko: '나를 제자리로 되돌린다', en: 'Send b back where it was' },
  'caption.rest': {
    ko: '가와 나, 같은 꼬리에서 나간 두 화살표',
    en: 'a and b — two arrows leaving the same tail',
  },
  'caption.drag': {
    ko: '끄는 대로 합도 따라 바뀐다',
    en: 'Drag, and the sum follows',
  },
} satisfies Record<string, LocalizedText>);

export type VectorAdditionMessageKey = keyof typeof vectorAdditionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(k: VectorAdditionMessageKey): LocalizedText {
  return vectorAdditionMessages[k];
}

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: VectorAdditionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const vectorAdditionSchema: BundleSchema = {
  id: VECTOR_ADDITION_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  parameters: [],
  stages: [{ id: 'main', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 원본 캔버스 336 px + 캡션 줄 32 px. 세로가 비싸 삼각형이 폭을 다 쓴다. */
  canvas: { height: 368, minHeight: 320 },

  /**
   * 겹침이 판정 장치다 — **걷는 점과 출발 꼬리는 화살표 위**에 온다. 점이 화살표
   * 아래로 깔리면 "지금 어디를 걷는가" 가 선에 먹힌다. 기본 층은 물체(40)가
   * 벡터(50) 아래라 원본과 뒤집히므로 scene 순서로 그린다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 8.00 초. 원본의 `SLIDE / WALKA / WALKB / GROW / HOLD / BACK` 상수와
   * `if (p < …)` 사슬을 그대로 옮긴 것이다.
   *
   * 이징은 전부 `smooth` — 원본의 `seg()` 가 smoothstep 이다. 마지막 `rest` 만
   * 이징이 없다(아무것도 움직이지 않는 구간).
   */
  timeline: {
    phases: [
      { id: 'slide', duration: 1.1, ease: 'smooth', caption: key('caption.slide') },
      { id: 'walkA', duration: 1.1, ease: 'smooth', caption: key('caption.walkA') },
      { id: 'walkB', duration: 1.1, ease: 'smooth', caption: key('caption.walkB') },
      { id: 'grow', duration: 1.0, ease: 'smooth', caption: key('caption.grow') },
      { id: 'hold', duration: 2.3, caption: key('caption.hold') },
      { id: 'back', duration: 1.0, ease: 'smooth', caption: key('caption.back') },
      { id: 'rest', duration: 0.4, caption: key('caption.rest') },
    ],
  },

  /**
   * 슬롯 하나. 끌고 있는 동안은 단계가 무엇이든 끌기에 대해 말한다 — 문장이
   * 갈리는 시점이 시각이 아니라 상태에 달렸다.
   */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [{ when: 'dragging', text: key('caption.drag') }],
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 격자를 깔면 "칸을 세어 더한다" 는
  // 다른 방법이 함께 보이고 조각이 두 주장을 갖는다.

  messages: vectorAdditionMessages,
};
