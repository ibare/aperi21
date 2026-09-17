// ========================================================================
// huygens-principle — 선언
// ========================================================================
// 질문: 파면의 점마다 동그란 파가 나간다는데, 그럼 왜 파면은 동그라미 묶음이
// 아니라 곧게 나아가나.
//
// 파면 위 점마다 나간 동그란 파가 촘촘히 겹치면 곧은 파면이 되어 나아간다.
//
// 원본: tasks/piece-lab/huygens-principle/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:huygens-principle` 와 문자 그대로 일치한다 (C4). */
export const HUYGENS_PRINCIPLE_ID = 'huygens-principle';

// ------------------------------------------------------------------------
// 월드 — 원본 논리 픽셀을 그대로 월드 단위로 쓴다 (y 는 위)
// ------------------------------------------------------------------------

/** 장 가로(월드). 원본 캔버스 폭. */
export const FIELD_W = 840;
/** 장 세로(월드). 원본 캔버스 높이. */
export const FIELD_H = 320;
/** 점파원이 놓인 파면 자리(월드 x). */
export const WAVEFRONT_X = 230;
/** 파장(월드). */
export const WAVELENGTH = 36;
/** 파의 속력(월드/초). */
export const WAVE_SPEED = 90;
/** 장을 계산하는 격자 한 칸(월드). 원본 3 칸 그대로. */
export const CELL = 3;
/** 가장 촘촘할 때 구간 수 — 점 33개. */
export const SEGMENTS = 32;
/** 점파원 점의 반지름(화면 px). 원본 4 px. */
export const SOURCE_RADIUS = 4;
/**
 * 원본의 누르는 곡선이 자르는 크기. |변위| 를 이 값으로 자르고 나눈 뒤 제곱근을 씌운다 —
 * 약한 점파 하나도 보이도록.
 */
export const PRESS_CLIP = 1.2;

/**
 * 점 수가 늘어나는 순서와 각 단계가 머무는 시간(초). 원본 `STAGES` 의 시각 차이다
 * (0 · 8 · 11 · 14 · 17 · 21, 주기 29).
 *
 * 캡션 문구(울퉁불퉁 / 곧게 펴짐)는 점 간격 `FIELD_H / (n − 1)` 이 파장보다 좁은지로
 * 갈렸다 — 9개는 40 > 36 이라 울퉁불퉁, 17개는 20 < 36 이라 곧게. 그 판정을 단계마다
 * 캡션 키로 적었다.
 */
export const STAGE_COUNTS = [1, 3, 5, 9, 17, 33] as const;
export type StageCount = (typeof STAGE_COUNTS)[number];

/** 단계 id. 점 i 가 태어나는 시각은 `timeline.start(stagePhaseId(n))` 이다. */
export const stagePhaseId = (n: StageCount): string => `n${n}`;

/** 가장 먼 화면 지점까지 거리 — 곧은 파면의 꼬리가 화면을 벗어나는 데 걸리는 길이. */
export const FARTHEST = Math.hypot(FIELD_W - WAVEFRONT_X, FIELD_H);

/**
 * 프레이밍 — 장 아래에 캡션 한 줄 자리를 둔다. 원본은 캔버스 밖 DOM 캡션이었다.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: FIELD_W, minY: -44, maxY: FIELD_H } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const huygensPrincipleMessages = Object.freeze({
  'label.title': { ko: '하위헌스 원리', en: "Huygens' principle" },
  'label.operation': {
    ko: '파면 위 점마다 나간 동그란 파가 겹쳐 곧게 펴진다',
    en: 'Circular wavelets from points on a wavefront overlap into a straight front',
  },
  'label.stage': { ko: '물결', en: 'Waves' },
  'label.view': { ko: '위에서 본 물결', en: 'Waves from above' },
  'caption.single': {
    ko: '파면 위 점 1개가 동그란 파를 낸다',
    en: 'One point on the wavefront sends out a circular wave',
  },
  'caption.shrink': {
    ko: '점을 1개로 줄였다 — 곧은 파면이 빠져나가고 동그란 파만 남는다',
    en: 'Back to one point — the straight front moves away and only a circular wave remains',
  },
  'caption.n3': {
    ko: '점 3개 — 동그란 파들이 겹치지만 파면이 아직 울퉁불퉁하다',
    en: '3 points — the circular waves overlap, but the front is still bumpy',
  },
  'caption.n5': {
    ko: '점 5개 — 동그란 파들이 겹치지만 파면이 아직 울퉁불퉁하다',
    en: '5 points — the circular waves overlap, but the front is still bumpy',
  },
  'caption.n9': {
    ko: '점 9개 — 동그란 파들이 겹치지만 파면이 아직 울퉁불퉁하다',
    en: '9 points — the circular waves overlap, but the front is still bumpy',
  },
  'caption.n17': {
    ko: '점 17개 — 동그란 파들이 겹쳐 곧은 파면으로 펴진다',
    en: '17 points — the circular waves overlap and straighten into a flat front',
  },
  'caption.n33': {
    ko: '점 33개 — 동그란 파들이 겹쳐 곧은 파면으로 펴진다',
    en: '33 points — the circular waves overlap and straighten into a flat front',
  },
} satisfies Record<string, LocalizedText>);

export type HuygensPrincipleMessageKey = keyof typeof huygensPrincipleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: HuygensPrincipleMessageKey): LocalizedText => huygensPrincipleMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: HuygensPrincipleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const huygensPrincipleSchema: BundleSchema = {
  id: HUYGENS_PRINCIPLE_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 자동 진행으로 점 수가 늘며 주장이 끝난다.
  parameters: [],
  stages: [{ id: 'waves', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'surface', label: text('label.view'), default: true }],

  /** 원본은 840 × 320 캔버스 + 아래 캡션 한 줄이었다. */
  canvas: { height: 400, minHeight: 340 },

  /** 장(`scalarField`) 위에 파면 자리 선, 그 위에 점파원이 와야 한다. 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  /**
   * 원본은 시계 0 에서 열린다 — 그 순간 이미 가운데 점의 파가 화면을 덮고 있다(그 점은
   * 늘 켜져 있다). 앞당길 것이 없어 `startAt` 은 기본값 0 이다.
   */

  /** 한 주기 29 초. 단계 경계는 점 수가 늘어나는 시각이다. */
  timeline: {
    phases: [
      { id: stagePhaseId(1), duration: 8, caption: key('caption.single') },
      { id: stagePhaseId(3), duration: 3, caption: key('caption.n3') },
      { id: stagePhaseId(5), duration: 3, caption: key('caption.n5') },
      { id: stagePhaseId(9), duration: 3, caption: key('caption.n9') },
      { id: stagePhaseId(17), duration: 4, caption: key('caption.n17') },
      { id: stagePhaseId(33), duration: 8, caption: key('caption.n33') },
    ],
  },

  /**
   * 원본 캡션은 캔버스 아래 왼쪽 정렬 한 줄, 바로 바뀐다(페이드 없음).
   *
   * 점을 1개로 되돌린 뒤 곧은 파면의 꼬리가 화면에 남아 있는 동안은 다른 문장을 쓴다.
   * 그 조건은 **주기 번호**에 달려 있어(첫 주기에는 꼬리가 없다) 단계로 나눌 수 없다 —
   * `step` 이 시계를 세어 `returning` 을 만든다 (NOTES 「어휘 부족」 G01).
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [2, 0] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'medium' },
    fade: 0,
    cases: [{ when: 'returning', text: key('caption.shrink') }],
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 축 · 범례 · 파장 · 간격 숫자 · 포락선 선 ·
   * 뒤쪽으로 가는 점파도 두지 않는다 — 곧아지는지는 합이 결정한다.
   */

  messages: huygensPrincipleMessages,
};
