// ========================================================================
// vector-decomposition — 선언
// ========================================================================
// 질문: 비스듬한 화살표 하나를 가로·세로 둘로 나눈다는데, 나눠진 두 화살표의
// 길이는 어디서 정해지고, 왜 그 둘이 원래 하나를 대신할 수 있는가.
//
// 동사는 **갈라진다.** 한 끝점이 축으로 곧게 내린 두 점선을 따라 두 갈래로
// 내려가는 모습 자체가 주장이다. 숫자·각도·공식은 한 개도 띄우지 않는다 —
// 그것은 문단의 몫이다 (원본 NOTES (c)).
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:vector-decomposition` 와 문자 그대로 일치한다 (C4). */
export const VECTOR_DECOMPOSITION_ID = 'vector-decomposition';

// ------------------------------------------------------------------------
// 좌표 — 원본의 화면 픽셀을 월드로 옮긴 것
// ------------------------------------------------------------------------
//
// 원본(`tasks/piece-lab/vector-decomposition/index.html`)은 폭 W · 높이 340 px
// 캔버스에 원점을 (W/2, H−46) 에 두고 그린다. **1 월드 단위 = 원본 100 px** 이고
// 그 원점이 월드 원점이다. y 는 위가 +.

/** 원래 화살표의 꼬리이자 두 축이 만나는 자리. */
export const ORIGIN: Vec2 = [0, 0];

/**
 * 화살표가 닿을 수 있는 가장 먼 거리. 원본 `maxR() = min(H − 96, W/2 − 40)` 은
 * 폭이 568 px 를 넘으면 `340 − 96 = 244` px 다.
 */
export const MAX_R = 2.44;

/**
 * 주기마다 바뀌는 원래 화살표 — 각도(도)와 길이(`MAX_R` 대비 비율). 원본 `VECTORS`.
 * 세 번째(138°)에서 가로 성분이 왼쪽으로 갈라져, 성분에 방향이 있다는 것을 따로
 * 말하지 않고 보인다.
 */
export const VECTORS: readonly { deg: number; len: number }[] = [
  { deg: 35, len: 0.92 },
  { deg: 64, len: 0.8 },
  { deg: 138, len: 0.9 },
  { deg: 16, len: 0.96 },
];

/** 두 축의 반 길이. 원본 `maxR() + 20` px. */
export const AXIS_R = 2.64;
/** 세로축이 원점 아래로 내려오는 길이. 원본 14 px. */
export const AXIS_BELOW = 0.14;

/** 끌린 끝점이 원점 아래로 내려갈 수 있는 한계. 원본 `if (y < −20) y = −20`. */
export const MIN_TIP_Y = -0.2;

/**
 * 고정 프레이밍. 원본 캔버스 340 px 중 원점 아래 46 px, 위 294 px 를 담는다.
 *
 * 러너는 경계 밖에 변마다 36 px(여백 24 + 패딩 12)를 비운다. 원본의 배율
 * (100 px / 단위)과 원점 높이를 지키려고 그만큼 **안쪽**을 선언한다 — 아래
 * (46 − 36) px, 위 (294 − 36) px. 가로는 축 끝(±2.64)에 여유를 둔 폭이고 세로가
 * 배율을 정한다 (NOTES (a)-5).
 */
export const SCENE_BOUNDS = { minX: -2.9, maxX: 2.9, minY: -0.1, maxY: 2.58 } as const;

// ------------------------------------------------------------------------
// 치수 — 이 그림 고유의 것
// ------------------------------------------------------------------------

/** 원래 화살표의 굵기(화면 px). 원본 3.5. */
export const VECTOR_WIDTH_PX = 3.5;
/** 성분 화살표의 굵기(화면 px). 원본 3. */
export const PART_WIDTH_PX = 3;
/** 화살촉(월드). 원본 `min(14, L × 0.45)` px 의 14. */
export const HEAD = 0.14;
/** 축 굵기(화면 px). 원본 1.5. */
export const AXIS_WIDTH_PX = 1.5;
/** 수선(점선) 굵기(화면 px). 원본 1.2. */
export const GUIDE_WIDTH_PX = 1.2;
/** 성분이 나타나는 문턱. 원본 `s.split <= 0.001` 은 그리지 않았다. */
export const SPLIT_ON = 0.001;
/** 수선이 짙어지는 빠르기. 원본 `clamp01(split × 1.6)`. */
export const GUIDE_RISE = 1.6;
/** 이어 붙인 뒤 수선이 옅어지는 정도. 원본 `1 − chain × 0.6`. */
export const GUIDE_FADE = 0.6;

/** 끝점 손잡이가 잡히는 반경(화면 px). 원본 24. */
export const GRAB_RADIUS_PX = 24;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const vectorDecompositionMessages = Object.freeze({
  'label.title': { ko: '벡터의 성분 분해', en: 'Vector components' },
  'label.operation': {
    ko: '끝점에서 두 축으로 곧게 내린 자리까지가 두 성분이다',
    en: 'Drop straight from the tip to each axis — that is where each component ends',
  },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },

  'caption.rest': { ko: '비스듬한 화살표 하나', en: 'One slanted arrow' },
  'caption.split': {
    ko: '끝점에서 두 축으로 곧게 내려가며, 화살표가 가로·세로 둘로 갈라진다',
    en: 'Dropping straight to both axes, the arrow splits into across and up',
  },
  'caption.chain': {
    ko: '갈라진 둘을 이어 붙이면 원래 화살표의 끝점에 정확히 닿는다',
    en: 'Put the two end to end and they land exactly on the original tip',
  },
  'caption.merge': { ko: '둘이 다시 하나로 합쳐진다', en: 'The two merge back into one' },
} satisfies Record<string, LocalizedText>);

export type VectorDecompositionMessageKey = keyof typeof vectorDecompositionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: VectorDecompositionMessageKey): LocalizedText =>
  vectorDecompositionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: VectorDecompositionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const vectorDecompositionSchema: BundleSchema = {
  id: VECTOR_DECOMPOSITION_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 340 px. 캡션도 그 안(왼쪽 위)에 얹힌다. */
  canvas: { height: 340, minHeight: 320 },

  /**
   * 겹침 순서가 원본과 같아야 한다 — 축 · 수선 아래에 원래 화살표, 그 위에 성분 둘.
   * 성분이 원래 화살표와 **완전히 겹쳐** 있다가 갈라져 나오는 것이 동사라 성분이
   * 위에 와야 한다. 기본 층은 궤적과 벡터의 선후만 알아 그 순서를 못 정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 8.00 초. 원본 `stateAt()` 의 `seg(u, a, b)` 경계를 단계로 옮긴 것이다.
   * 이징 `smooth` 는 원본 `ease()` 의 smoothstep 이다.
   *
   * 원본은 두 되돌림이 겹친다 — 이어 붙임은 6.0–6.6, 갈라짐은 6.0–6.9 에 되돌아간다.
   * 앞의 것을 `unchain`, 나머지 0.3 초를 `unsplit` 으로 두고 갈라짐의 되돌림은
   * scene 이 `span(start('unchain'), end('unsplit'))` 로 읽는다.
   *
   * 원본은 `t = 0` 에서 연다(비스듬한 화살표 하나가 0.4 초 머문 뒤 갈라진다) —
   * `startAt` 을 두지 않는다.
   */
  timeline: {
    phases: [
      { id: 'rest', duration: 0.4, caption: key('caption.rest') },
      { id: 'split', duration: 2.0, ease: 'smooth', caption: key('caption.split') },
      { id: 'settle', duration: 1.0, caption: key('caption.split') },
      { id: 'chain', duration: 1.5, ease: 'smooth', caption: key('caption.chain') },
      { id: 'hold', duration: 1.1, caption: key('caption.chain') },
      { id: 'unchain', duration: 0.6, ease: 'smooth', caption: key('caption.merge') },
      { id: 'unsplit', duration: 0.3, caption: key('caption.merge') },
      { id: 'merged', duration: 0.1, caption: key('caption.merge') },
      { id: 'turn', duration: 1.0, ease: 'smooth', caption: key('caption.rest') },
    ],
  },

  /**
   * 왼쪽 위 한 줄. 원본은 (16, 14) px 에 15 px 로 쓴다 — 화면 앵커의 여백이 24 px
   * 이므로 그만큼 당긴다. 페이드는 없다(원본이 바로 바꾼다).
   */
  caption: {
    anchor: { screen: 'top-left', offset: [-8, -10] },
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 축에 눈금·숫자를 붙이면 길이를 재라는
  // 그림이 된다 (원본 NOTES (c)).

  messages: vectorDecompositionMessages,
};
