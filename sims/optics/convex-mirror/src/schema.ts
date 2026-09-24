// ========================================================================
// convex-mirror — 선언
// ========================================================================
// 질문: 볼록거울은 무엇을 보여 주는가 — 상은 어떻게 서고, 무엇을 얻는가.
//
// 답: (1) 물체를 멀리서 거울 바로 앞까지 옮기는 동안 주광선 둘(축에 나란히 → F 에서 나온
// 듯 벌어짐, F 를 향해 → 나란히 돌아감)을 계속 긋는다. 비친 줄기는 늘 벌어지고, 거울 뒤로
// 거꾸로 이은 점선이 F 안쪽 한 점에서 만나 작고 바로 선 상이 선다 — 물체가 어디 있어도.
// (2) 같은 폭의 평면거울과 볼록거울 앞에 눈을 두고, 거울 양 끝에서 비쳐 눈에 드는 두 줄기와
// 그 사이(눈이 거울로 보는 곳)를 나란히 칠한다 — 볼록 쪽이 훨씬 넓다.
//
// 오목거울의 실상 · 허상 뒤바뀜은 `concave-mirror`, 렌즈 배율은 `magnification` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:convex-mirror` 와 문자 그대로 일치한다 (C4). */
export const CONVEX_MIRROR_ID = 'convex-mirror';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 볼록거울 초점 거리의 크기(월드). F 는 거울 뒤 이 거리에 있다. 곡률 반지름은 그 두 배. */
export const FOCAL_LENGTH = 1.2;
/** 물체(화살표)의 높이(월드). */
export const OBJECT_HEIGHT = 0.9;
/** 물체가 출발하는 먼 자리와 멈추는 가까운 자리 — 초점 거리의 몇 배인가. */
export const FAR_FACTOR = 3.5;
export const NEAR_FACTOR = 0.5;
/** 시야 견줌의 두 거울 반폭(월드) — 평면거울 · 볼록거울이 같다. */
export const FOV_MIRROR_HALF = 0.72;
/** 시야 견줌에서 눈이 거울 꼭짓점에서 떨어진 거리(월드). */
export const EYE_DISTANCE = 1.1;

// ------------------------------------------------------------------------
// 배치 (A) 상 — 월드 단위. 거울 꼭짓점은 (0, 0), 광축은 y = 0, 물체는 왼쪽(x < 0)에 선다.
// ------------------------------------------------------------------------

/** 거울 반높이(월드). 물체 높이보다 넉넉하다. */
export const MIRROR_HALF = 1.5;
/**
 * 거울 가장자리가 물체 반대쪽으로 휜 깊이(월드). **그림의 휨** 이다 — 참 곡률(반지름 2f)로
 * 그리면 가장자리가 크게 휘어 근축 작도(꼭짓점 면에서 비침)와 어긋난다(NOTES (b)).
 */
export const MIRROR_SAG = 0.07;
/** 거울 뒷면 띠의 두께(월드). */
export const MIRROR_BACK = 0.09;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -5.1;
export const AXIS_TO_X = 2.2;
/** 비친 줄기가 거울 앞으로 뻗는 길이(월드). */
export const DIVERGE_REACH = 1.6;
/** 초점 점의 반지름(월드). */
export const POINT_RADIUS = 0.045;

// ------------------------------------------------------------------------
// 배치 (B) 시야 — 두 판이 나란히. 거울은 위에서 아래(눈)를 향한다.
// ------------------------------------------------------------------------

/** 평면거울 판 · 볼록거울 판의 가운데 x(월드). */
export const PLANE_PANEL_X = -3.4;
export const CONVEX_PANEL_X = 1.0;
/** 두 거울 꼭짓점의 높이(월드). */
export const FOV_MIRROR_Y = 0.3;
/**
 * 들어오는 가장자리 줄기와 시야 부채꼴이 거울 끝에서 뻗는 길이(월드). 두 판이 같다 —
 * 볼록거울 쪽 부채꼴이 옆 판에 닿지 않는 만큼으로 잡는다.
 */
export const FOV_REACH = 1.55;

/**
 * 프레이밍 — 가로는 왼쪽 판(평면거울) 부채꼴 끝부터 오른쪽 판(볼록거울) 부채꼴 끝까지 — 가장 먼 물체 자리와 거울 뒤 허상 이름표도 그 안에 든다, 세로는
 * 판 이름표부터 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.6, maxX: 3.2, minY: -2.45, maxY: 2.05 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const convexMirrorMessages = Object.freeze({
  'label.title': { ko: '볼록거울', en: 'Convex mirror' },
  'label.stage': { ko: '물체 옮기기와 시야', en: 'Moving the object, and the view' },
  'label.view': { ko: '상과 시야', en: 'Image and view' },

  /** 초점 표식 — 기호라 두 언어가 같다. */
  'label.focus': { ko: 'F', en: 'F' },
  /** 상 이름표. */
  'label.virtual': { ko: '허상', en: 'virtual image' },
  /** 시야 판 이름표. */
  'label.plane': { ko: '평면거울', en: 'plane mirror' },
  'label.convex': { ko: '볼록거울', en: 'convex mirror' },

  'caption.setup': {
    ko: '볼록거울 앞 먼 자리에 물체가 서 있다.',
    en: 'An object stands far in front of a convex mirror.',
  },
  'caption.rays': {
    ko: '물체 끝에서 나온 두 줄기가 거울에 비친다.',
    en: 'Two beams from the tip of the object bounce off the mirror.',
  },
  'caption.traceBack': {
    ko: '비친 두 줄기는 벌어져 만나지 않는다 — 거울 뒤로 거꾸로 이어 본다.',
    en: 'The reflected beams spread apart and never meet — extend them backward behind the mirror.',
  },
  'caption.far': {
    ko: '점선이 거울 뒤 F 안쪽에서 만나 작고 바로 선 상이 선다.',
    en: 'The dashed lines meet inside F behind the mirror — a small, upright image.',
  },
  'caption.approach': {
    ko: '물체를 거울 쪽으로 옮긴다 — 상은 조금씩 커지지만 F 안쪽을 벗어나지 않는다.',
    en: 'Move the object toward the mirror — the image grows a little but stays inside F.',
  },
  'caption.near': {
    ko: '거울 바로 앞에서도 상은 물체보다 작고 바로 서 있다.',
    en: 'Even right in front of the mirror, the image is smaller than the object and upright.',
  },
  'caption.twoMirrors': {
    ko: '폭이 같은 평면거울과 볼록거울 앞에 눈을 둔다.',
    en: 'Place an eye in front of a plane mirror and a convex mirror of the same width.',
  },
  'caption.edges': {
    ko: '거울 양 끝에서 비쳐 눈에 드는 두 줄기를 긋는다.',
    en: 'Draw the two beams that bounce off the ends of each mirror into the eye.',
  },
  'caption.field': {
    ko: '두 줄기 사이가 눈이 거울로 보는 곳이다 — 볼록거울 쪽이 훨씬 넓다.',
    en: 'Between the two beams is what the eye sees in the mirror — far wider for the convex mirror.',
  },
} satisfies Record<string, LocalizedText>);

export type ConvexMirrorMessageKey = keyof typeof convexMirrorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConvexMirrorMessageKey): LocalizedText => convexMirrorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConvexMirrorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const convexMirrorSchema: BundleSchema = {
  id: CONVEX_MIRROR_ID,
  title: text('label.title'),
  category: 'optics',
  timeModel: 'periodic',

  // 조작기가 없다. 물체를 옮기는 것과 두 거울의 시야 견줌을 자동 진행으로 보인다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'image-and-view',
      label: text('label.stage'),
      constants: {
        focalLength: FOCAL_LENGTH,
        objectHeight: OBJECT_HEIGHT,
        farFactor: FAR_FACTOR,
        nearFactor: NEAR_FACTOR,
        fovMirrorHalf: FOV_MIRROR_HALF,
        eyeDistance: EYE_DISTANCE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'image-and-view', label: text('label.view'), default: true }],

  /** 가로로 넓은 그림 — (A) 광축 한 줄, (B) 나란한 두 판. */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 쐐기 → 축 → 거울 → 점 → 줄기 → 점선 → 화살표 · 눈 → 글자 순. plugin 어휘(`ray`)가 층에서
   * 어디 끼는지에 기대지 않게 scene 순서로 고정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = (A) 나타남 → 줄기 → 거꾸로 이음 → 먼 자리 멈춤 → 다가옴 → 가까운 자리 멈춤 → 걷힘,
   * (B) 두 거울 나타남 → 가장자리 줄기 → 시야 쐐기 → 멈춤 → 걷힘.
   *
   * 물체의 x 는 `approach` 진행도로(`physics.ts`), 줄기 앞머리 · 꼬리는 `rays-a` · `clear-a`
   * (`sight-b` · `clear-b`) 진행도로, 점선 길이와 상 짙기는 `trace-a` 로, 쐐기 짙기는 `field-b` 로 읽는다.
   * 다가오는 동안 줄기 · 점선 · 상은 매 프레임 거울 식으로 다시 선다 — 상이 그림 밖으로 달아나지 않는다.
   */
  timeline: {
    phases: [
      { id: 'show-a', duration: 0.8, ease: 'smooth', caption: key('caption.setup') },
      { id: 'rays-a', duration: 1.6, caption: key('caption.rays') },
      { id: 'trace-a', duration: 1.6, ease: 'smooth', caption: key('caption.traceBack') },
      { id: 'hold-far', duration: 2.6, caption: key('caption.far') },
      { id: 'approach', duration: 4.0, ease: 'smooth', caption: key('caption.approach') },
      { id: 'hold-near', duration: 2.6, caption: key('caption.near') },
      { id: 'clear-a', duration: 1.0, caption: key('caption.near') },
      { id: 'show-b', duration: 0.8, ease: 'smooth', caption: key('caption.twoMirrors') },
      { id: 'sight-b', duration: 1.8, caption: key('caption.edges') },
      { id: 'field-b', duration: 1.2, ease: 'smooth', caption: key('caption.field') },
      { id: 'hold-b', duration: 3.4, caption: key('caption.field') },
      { id: 'clear-b', duration: 1.0, caption: key('caption.field') },
    ],
  },

  /** 도착한 순간 먼 자리의 두 줄기와 점선이 다 그어져 있고 작은 허상이 서 있다 — 첫 멈춤 안에서 연다 (S-piece). */
  startAt: 4.6,

  /** 슬롯 하나. 그림 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 780,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것이 거리가 아니다 — 상이 거울 뒤 F 안쪽에
  // 작고 바로 선다는 것과, 두 쐐기의 벌어짐이 주장이다.

  messages: convexMirrorMessages,
};
