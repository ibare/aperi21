// ========================================================================
// static-friction — 선언
// ========================================================================
// 질문: 당기는 힘을 점점 키우는데, 상자는 왜 한동안 꿈쩍도 안 하다가 어느 순간
// 갑자기 움직이나?
//
// 동사: **따라 커지다가 놓친다.** 마찰력은 당기는 힘을 그대로 따라 커지며 맞서고,
// 따라갈 수 있는 끝(최대 정지 마찰력)을 넘는 순간 놓친다.
//
// 조작기를 두지 않는다. 당기는 힘이 자동으로 커져야 "버티다 놓친다" 가 끊김 없이
// 보이고, 독자가 직접 끌면 문턱의 순간을 놓치기 쉽다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:static-friction` 와 문자 그대로 일치한다 (C4). */
export const STATIC_FRICTION_ID = 'static-friction';

// ------------------------------------------------------------------------
// 배치 — 원본의 픽셀 상수를 그대로 두고 한 배율로 월드로 옮긴다
// ------------------------------------------------------------------------

/**
 * 원본 캔버스 820 × 190 px(+ 캡션 28 px)의 상수. 숫자는 원본 그대로다.
 * 엔진 좌표는 y 가 위로 자라므로 바닥선(FLOOR_Y)을 월드 y 의 0 으로 삼는다.
 */
export const LAYOUT = {
  /** 원본 캔버스 폭·높이. */
  widthPx: 820,
  heightPx: 190,
  /** 캡션 한 줄의 높이. */
  captionPx: 28,
  /** FLOOR_Y — 바닥선. */
  floorYPx: 130,
  /** 바닥선의 양 끝 여백. */
  floorInsetPx: 20,
  /** 바닥 결 — 첫 빗금의 x, 간격, 빗금 한 변의 길이. */
  grainStartPx: 28,
  grainStepPx: 14,
  grainRunPx: 7,
  /** BOX_W · BOX_H · BOX_X0 — 상자 치수와 처음 왼쪽 모서리. */
  boxWPx: 90,
  boxHPx: 64,
  boxX0Px: 190,
  /** PX_PER_FS — 최대 정지 마찰력 하나가 화살표 몇 px 인지. 두 힘이 같은 축척을 쓴다. */
  pxPerFs: 180,
  /** 마찰 화살표가 붙는 높이 — 바닥선 아래로 이만큼(바닥 결 아래). */
  frictionDyPx: 22,
  /** 한계 눈금의 반 높이. */
  limitTickHalfPx: 11,
  /** 한계 글자 — 눈금 기준선 아래로 띄우는 거리와 글자 크기(글 윗변 기준). */
  limitLabelDyPx: 15,
  limitLabelFontPx: 12,
  /** 한계 글자의 가장 왼쪽 자리(글 가운데). */
  limitLabelMinXPx: 60,
  /** SLIDE_DIST — 미끄러지는 3초 동안 가는 거리. */
  slideDistPx: 250,
  /** 화살촉 길이. 삼각 머리의 반폭은 그 절반(6 px)이다. */
  headPx: 12,
  /** 캡션 글자 크기. */
  captionFontPx: 15,
} as const;

/** 월드 한 단위 = 원본 100 px. */
export const PX_PER_UNIT = 100;

/** 원본의 가로 px(왼쪽 기준)를 월드 x 로. */
export function worldX(px: number): number {
  return px / PX_PER_UNIT;
}

/** 원본의 캔버스 y(아래로 증가)를 월드 y(위로 증가)로. 바닥선이 0 이다. */
export function worldY(px: number): number {
  return (LAYOUT.floorYPx - px) / PX_PER_UNIT;
}

/** 원본의 길이 px 를 월드 길이로. */
export function toUnit(px: number): number {
  return px / PX_PER_UNIT;
}

/**
 * 운동 마찰력 / 최대 정지 마찰력(원본 KINETIC_RATIO). 수치는 화면에 두지 않는다 —
 * 줄어든다는 사실만 화살표 길이로 보인다 (NOTES).
 */
export const KINETIC_RATIO = 0.7;

/**
 * 프레이밍 — 원본 캔버스 820 × 190 px 그대로. 매 프레임 같은 값이다 (S-piece).
 *
 * 캡션 한 줄(원본 28 px)은 경계에 넣지 않는다. 러너가 경계 둘레에 여백(36 px)을
 * 두므로 캡션은 그 아래 여백에 선다. 넣으면 세로가 배율을 묶어 장면이 작아진다.
 */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: worldX(LAYOUT.widthPx),
  minY: worldY(LAYOUT.heightPx),
  maxY: worldY(0),
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const staticFrictionMessages = Object.freeze({
  'label.title': { ko: '정지 마찰력', en: 'Static friction' },
  'label.stage': { ko: '거친 바닥', en: 'Rough floor' },
  'label.view': { ko: '두 힘', en: 'Two forces' },
  /** 주황 눈금이 무엇인지 — 모르면 "문턱" 이라는 주장의 절반이 사라진다. */
  'label.limit': { ko: '버틸 수 있는 한계', en: 'Limit it can hold' },
  'caption.hold': {
    ko: '당기는 만큼 마찰도 똑같이 커지며 버틴다',
    en: 'Friction grows just as much as the pull and holds',
  },
  'caption.slip': {
    ko: '한계를 넘는 순간 버티지 못하고 미끄러진다',
    en: 'The moment it passes the limit, it lets go and slides',
  },
} satisfies Record<string, LocalizedText>);

export type StaticFrictionMessageKey = keyof typeof staticFrictionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StaticFrictionMessageKey): LocalizedText => staticFrictionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StaticFrictionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const staticFrictionSchema: BundleSchema = {
  id: STATIC_FRICTION_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',

  // 조작기가 없다 — 당기는 힘이 스스로 커져야 문턱의 순간이 끊기지 않는다.
  parameters: [],

  stages: [
    {
      id: 'rough-floor',
      label: text('label.stage'),
      constants: { kineticRatio: KINETIC_RATIO },
    },
  ],

  environments: [],

  views: [{ id: 'forces', label: text('label.view'), default: true }],

  /**
   * 세로가 낮다 — 원본 190 px 에 러너의 프레이밍 여백(위아래 36 px)을 더하고, 가로
   * 820 px 이 배율을 정하도록 조금 더 둔다. 캡션은 아래 여백에 선다.
   * 움직임은 가로로만 일어난다.
   */
  canvas: { height: 254, minHeight: 254 },

  /** 도착한 순간 이미 당기는 중이도록 주기 1.5 초 지점에서 연다 (원본 OFFSET). */
  startAt: 1.5,

  /**
   * 한 주기 10 초 (원본 CYCLE).
   *
   * - `appear` + `pull` = 6 초(원본 RAMP) 동안 당기는 힘이 0 에서 문턱까지 곧게 자란다.
   *   `appear` 는 그 첫 0.4 초 — 장면이 나타나는 동안이다.
   * - `slide` 3 초(원본 RAMP → SLIDE_END) 동안 상자가 등가속으로 250 px 미끄러진다.
   * - `vanish` 0.6 초 동안 흐려지고 `rest` 0.4 초는 비어 있다가 처음 자리에서 되풀이한다.
   *
   * 원본 NOTES: "문턱 전의 버팀이 충분히 길어야 주장이 산다" — 당기는 6 초, 미끄러짐 3 초.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.hold') },
      { id: 'pull', duration: 5.6, caption: key('caption.hold') },
      { id: 'slide', duration: 3, caption: key('caption.slip') },
      { id: 'vanish', duration: 0.6, caption: key('caption.slip') },
      // 캡션 없음 — 장면이 비어 있는 동안 캡션도 비운다(원본은 알파 0).
      { id: 'rest', duration: 0.4 },
    ],
  },

  /** 슬롯 하나. 원본처럼 캔버스 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, 10] },
    align: 'center',
    fontSize: LAYOUT.captionFontPx,
    style: { colorRole: 'ink', emphasis: 'medium' },
    // 원본은 주기 첫 0.4 초에 장면과 함께 캡션이 나타난다.
    fade: 0.4,
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 재야 할 것은 거리가 아니라 두 화살표
   * 길이의 비교다.
   */

  messages: staticFrictionMessages,
};
