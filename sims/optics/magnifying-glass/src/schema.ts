// ========================================================================
// magnifying-glass — 선언
// ========================================================================
// 질문: 돋보기로 보면 왜 크게 보이는가 — 눈에는 무엇이 들어오는가.
//
// 답: 개미를 볼록 렌즈의 초점 F 안에 두면 개미 머리에서 나온 줄기는 렌즈를 지나도
// 모이지 않고 벌어진 채 렌즈 너머의 눈으로 들어간다. 눈에 든 줄기를 거꾸로 이으면 개미
// 뒤쪽 먼 곳, 개미와 같은 쪽에 크고 바로 선 상(허상)이 선다. 개미를 F 가까이 옮기면
// 상이 더 커지고 더 멀어진다. 아래 줄에는 같은 개미를 맨눈으로 25 cm 에서 본 모습이
// 늘 놓여 있어, 눈에 드는 각(시야각)을 두 줄에서 나란히 견준다.
//
// 실상 · 허상의 구분은 `real-vs-virtual-image`, 초점 밖 물체의 상 크기는 `magnification`
// 의 몫이다. 이 조각은 **렌즈 너머의 눈이 보는 것** — 크고 바로 선 허상과 맨눈보다 넓은
// 각 — 만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnifying-glass` 와 문자 그대로 일치한다 (C4). */
export const MAGNIFYING_GLASS_ID = 'magnifying-glass';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 cm 다. 렌즈는 x = 0, 위 줄 광축은 y = 0 이다.
// ------------------------------------------------------------------------

/** 돋보기(볼록 렌즈)의 초점 거리(cm). */
export const FOCAL_LENGTH = 5;
/** 개미의 키(cm) — 발끝에서 머리 꼭대기까지. 줄기는 머리 꼭대기에서 나온다. */
export const ANT_HEIGHT = 0.8;
/** 첫 멈춤의 개미 거리(cm) — 초점 거리의 0.6 배. */
export const NEAR_DISTANCE = 3;
/** 둘째 멈춤의 개미 거리(cm) — 초점 거리의 0.8 배, F 에 더 가깝다. */
export const FAR_DISTANCE = 4;
/**
 * 두 멈춤의 배율 정박값 — 화면 글자 `×{m}` 과 캡션이 이 값을 그대로 쓴다.
 * 그림의 상 크기는 `findImage` 가 계산하고, 이 값과 같아야 한다는 관계는 NOTES (c) G143.
 */
export const NEAR_MAG = 2.5;
export const FAR_MAG = 5;
/** 맨눈으로 볼 때 개미를 눈에서 떨어뜨린 거리(cm). 화면 글자 `{d} cm` 도 이 값이다. */
export const NAKED_DISTANCE = 25;
/** 렌즈에서 동공까지(cm). 돋보기를 눈 가까이 든다. */
export const EYE_GAP = 1.5;
/** 동공의 반높이(cm). 줄기 셋이 동공 위 · 가운데 · 아래로 들어간다. */
export const PUPIL_HALF = 0.3;
/** 눈에 드는 줄기 수. */
export const RAY_COUNT = 3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(cm).
// ------------------------------------------------------------------------

/** 렌즈 높이(cm). 가장 높은 줄기가 렌즈를 지나는 높이보다 넉넉하다. */
export const LENS_SIZE = 2.2;
/** 눈알 반지름(cm). */
export const EYE_RADIUS = 1.0;
/** 동공 표시(세로 막대)의 너비(cm). */
export const PUPIL_BAR_WIDTH = 0.16;
/** 아래 줄(맨눈) 광축의 y(cm). 두 줄의 눈알이 겹치지 않게 떨어뜨린다. */
export const NAKED_ROW_Y = -2.8;
/** 맨눈 줄의 거리 치수선이 광축 아래로 내려간 거리(cm). */
export const NAKED_DIM_DROP = 0.7;
/** 시야각 부채꼴의 반지름(cm). 두 줄이 같은 반지름이라 각을 나란히 견준다. */
export const ANGLE_ARC_RADIUS = 6;
/** 위 줄 광축 보조선의 왼쪽 끝(cm). 가장 먼 상보다 조금 더 간다. */
export const AXIS_FROM_X = -22;
/** 초점 점의 반지름(cm). */
export const FOCUS_DOT_RADIUS = 0.12;

/**
 * 프레이밍 — 가로는 맨눈 개미 왼쪽 이름표부터 눈알 오른쪽까지, 세로는 가장 큰 상의 배율
 * 글자부터 아래 줄 눈알 · 치수선과 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -27, maxX: 4.2, minY: -5.2, maxY: 4.8 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magnifyingGlassMessages = Object.freeze({
  'label.title': { ko: '돋보기', en: 'Magnifying glass' },
  'label.stage': { ko: '돋보기와 맨눈', en: 'Magnifying glass and naked eye' },
  'label.view': { ko: '개미 · 렌즈 · 눈', en: 'Ant, lens, eye' },

  /** 도식 이름표. */
  'label.virtual': { ko: '허상', en: 'virtual image' },
  'label.naked': { ko: '맨눈', en: 'naked eye' },
  /** 초점 표식 — 기호라 두 언어가 같다. */
  'label.focus': { ko: 'F', en: 'F' },
  /** 배율 글자. 값은 선언한 정박값이다. */
  'label.magnification': { ko: '×{m}', en: '×{m}' },
  /** 맨눈 거리 치수. 값은 선언한 거리다. */
  'label.distance': { ko: '{d} cm', en: '{d} cm' },

  'caption.emit': {
    ko: '개미를 초점 F 안에 두었다 — 렌즈를 지난 빛이 벌어진 채 눈으로 들어온다.',
    en: 'The ant sits inside the focal point F — light leaves the lens still spreading and enters the eye.',
  },
  'caption.traceBack': {
    ko: '눈에 들어온 줄기를 렌즈 앞쪽으로 거꾸로 이어 본다.',
    en: 'Extend the beams that entered the eye backward, in front of the lens.',
  },
  'caption.near': {
    ko: '점선이 개미 뒤쪽에서 만나 {m1}배 큰 바로 선 상이 선다 — 눈에 드는 각이 맨눈({d} cm)보다 넓다.',
    en: 'The dashed lines meet behind the ant, where an upright image {m1}× larger stands — it fills a wider angle at the eye than the ant at {d} cm.',
  },
  'caption.move': {
    ko: '개미를 F 쪽으로 조금 옮긴다.',
    en: 'The ant moves a little closer to F.',
  },
  'caption.emitAgain': {
    ko: '렌즈를 지난 빛이 이번에도 벌어진 채 눈으로 들어온다.',
    en: 'Again the light leaves the lens spreading and enters the eye.',
  },
  'caption.far': {
    ko: '상이 {m2}배로 더 크고 더 멀리 선다 — 여전히 맨눈({d} cm)보다 넓은 각으로 눈에 든다.',
    en: 'The image is now {m2}× larger and farther away — it still fills a wider angle at the eye than the ant at {d} cm.',
  },
  'caption.return': {
    ko: '개미가 처음 자리로 돌아간다.',
    en: 'The ant goes back to where it started.',
  },
} satisfies Record<string, LocalizedText>);

export type MagnifyingGlassMessageKey = keyof typeof magnifyingGlassMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagnifyingGlassMessageKey): LocalizedText => magnifyingGlassMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagnifyingGlassMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magnifyingGlassSchema: BundleSchema = {
  id: MAGNIFYING_GLASS_ID,
  title: text('label.title'),
  category: 'optics',
  timeModel: 'periodic',

  // 조작기가 없다. 개미를 F 안 두 자리에 두는 것을 자동 진행으로 보인다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'glass-and-naked-eye',
      label: text('label.stage'),
      constants: {
        focalLength: FOCAL_LENGTH,
        antHeight: ANT_HEIGHT,
        nearDistance: NEAR_DISTANCE,
        farDistance: FAR_DISTANCE,
        nearMag: NEAR_MAG,
        farMag: FAR_MAG,
        nakedDistance: NAKED_DISTANCE,
        eyeGap: EYE_GAP,
        pupilHalf: PUPIL_HALF,
        rayCount: RAY_COUNT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'ant-lens-eye', label: text('label.view'), default: true }],

  /** 가로로 넓은 두 줄 그림 — 위는 돋보기, 아래는 맨눈. */
  canvas: { height: 320, minHeight: 280 },

  /**
   * 축 → 시야각 → 렌즈 → 줄기 → 점선 → 개미 · 상 · 눈 → 글자 순. plugin 어휘(`ray` ·
   * `opticalElement`)가 층에서 어디 끼는지에 기대지 않게 scene 순서로 고정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = [가까운 자리 0.6f] 줄기가 눈으로 → 거꾸로 잇기 → 허상 · 시야각 → 멈춤 → 걷힘,
   * 개미를 F 쪽으로, [먼 자리 0.8f] 같은 순서, 처음 자리로 돌아감.
   *
   * 줄기 앞머리 · 꼬리의 x 는 `emit-*` · `clear-*` 진행도로, 개미 자리는 `move` · `return`
   * 진행도로, 점선 · 허상 · 시야각의 짙기는 `trace-*` · `mark-*` · `clear-*` 진행도로 읽는다
   * (`physics.ts`). 맨눈 줄은 늘 그대로다.
   */
  timeline: {
    phases: [
      { id: 'emit-near', duration: 1.4, caption: key('caption.emit') },
      { id: 'trace-near', duration: 1.4, ease: 'smooth', caption: key('caption.traceBack') },
      { id: 'mark-near', duration: 0.5, ease: 'smooth', caption: key('caption.near') },
      { id: 'hold-near', duration: 3.4, caption: key('caption.near') },
      { id: 'clear-near', duration: 0.7, ease: 'smooth', caption: key('caption.near') },
      { id: 'move', duration: 1.4, ease: 'smooth', caption: key('caption.move') },
      { id: 'emit-far', duration: 1.4, caption: key('caption.emitAgain') },
      { id: 'trace-far', duration: 1.4, ease: 'smooth', caption: key('caption.traceBack') },
      { id: 'mark-far', duration: 0.5, ease: 'smooth', caption: key('caption.far') },
      { id: 'hold-far', duration: 3.4, caption: key('caption.far') },
      { id: 'clear-far', duration: 0.7, ease: 'smooth', caption: key('caption.far') },
      { id: 'return', duration: 1.4, ease: 'smooth', caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 줄기가 눈에 들어와 있고 허상 · 두 시야각이 서 있다 — 가까운 자리 멈춤 안에서 연다 (S-piece). */
  startAt: 3.6,

  /**
   * 슬롯 하나. 그림 아래 가운데. `{m1}` · `{m2}` · `{d}` 는 state 의 글자를 가리킨다(G133 우회,
   * `state.ts`). `vars` 는 state 경로만 가리키므로 멈춤마다 이름을 따로 두어 캡션 틀이 고른다.
   */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: { m1: 'nearMag', m2: 'farMag', d: 'nakedDistance' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 두 시야각의 견줌이지 눈금이 아니다.

  messages: magnifyingGlassMessages,
};
