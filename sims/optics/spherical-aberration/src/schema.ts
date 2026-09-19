// ========================================================================
// spherical-aberration — 선언
// ========================================================================
// 질문: 구면으로 깎은 렌즈에 나란한 빛을 넣으면 줄기가 모두 한 점에 모이는가.
//
// 답: 모이지 않는다. 두 면이 구면인 두꺼운 볼록 렌즈에 축에서 높이가 다른 평행 줄기를
// 넣고 두 면에서 굴절 법칙으로 실제 추적하면, 바깥 줄기일수록 렌즈 가까이에서 축을
// 건넌다 — 줄기가 축을 건너는 자리가 한 점이 아니라 축을 따라 퍼진다. 조리개로 바깥
// 줄기를 막으면 남은 줄기가 건너는 자리가 좁아진다.
//
// plugin-optics `traceRay` 의 얇은 렌즈는 근축 근사라 수차를 만들지 않는다 — 조각이
// `refract` 로 면마다 계산한다(`physics.ts`). 색 수차는 `chromatic-aberration`, 평행광이
// 초점에 모이는 것 자체는 `converging-diverging-lens` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:spherical-aberration` 와 문자 그대로 일치한다 (C4). */
export const SPHERICAL_ABERRATION_ID = 'spherical-aberration';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 면의 곡률 반지름(월드). 앞면 · 뒷면이 같은 양볼록 렌즈. */
export const SURFACE_RADIUS = 2.6;
/** 렌즈 가운데 두께(월드). */
export const LENS_THICKNESS = 0.9;
/** 렌즈 유리의 굴절률. 바깥은 공기(1)로 둔다. */
export const REFRACTIVE_INDEX = 1.5;
/** 축 한쪽의 줄기 수. 축 위아래로 같은 높이의 줄기가 한 쌍씩 들어온다. */
export const RAY_PAIRS = 4;
/** 이웃 줄기 높이 사이 간격(월드). 가장 안쪽 줄기의 높이도 이 값이다. */
export const RAY_SPACING = 0.3;
/** 조리개를 닫았을 때 열린 구멍의 반높이(월드). 이보다 높은 줄기는 막힌다. */
export const STOP_HALF = 0.75;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 렌즈 가운데가 원점, 광축이 y = 0 이다.
// ------------------------------------------------------------------------

/** 렌즈 반높이(월드). 가장 바깥 줄기보다 조금 크고, 곡률 반지름보다 작아야 한다. */
export const LENS_HALF = 1.35;
/** 줄기가 출발하는 x(월드). */
export const RAY_START_X = -3.4;
/** 줄기가 끝나는 x(월드). 가장 먼 교차점을 지나 엇갈려 나가는 것이 보일 만큼 더 간다. */
export const RAY_END_X = 3.9;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -3.6;
export const AXIS_TO_X = 4.1;

/** 조리개 판이 서는 x(월드). 렌즈 앞면 꼭짓점 바로 앞. */
export const STOP_X = -0.75;
/** 조리개 판의 반두께(월드). */
export const STOP_PLATE_HALF_WIDTH = 0.05;
/** 조리개 판의 바깥 끝 높이(월드). 렌즈보다 위아래로 더 뻗는다. */
export const STOP_PLATE_OUTER = 1.6;
/** 조리개가 열려 있을 때 판 안쪽 끝의 높이(월드). 렌즈 가장자리보다 바깥이라 아무 줄기도 막지 않는다. */
export const STOP_OPEN_EDGE = 1.45;
/** 조리개 이름표가 판 바깥 끝에서 더 올라간 거리(월드). */
export const STOP_LABEL_GAP = 0.22;

/** 교차점 치수선이 축 아래로 내려간 거리(월드). */
export const SPREAD_DROP = 0.32;
/** 교차점 점의 반지름(월드). */
export const CROSS_DOT_RADIUS = 0.045;

/**
 * 프레이밍 — 가로는 줄기 출발점부터 줄기 끝까지, 세로는 조리개 이름표부터 엇갈려
 * 내려간 바깥 줄기 끝과 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -3.6, maxX: 4.1, minY: -2.05, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const sphericalAberrationMessages = Object.freeze({
  'label.title': { ko: '구면 수차', en: 'Spherical aberration' },
  'label.operation': { ko: '가장자리 광선이 다른 곳에 모임', en: 'Edge rays come to focus at a different place' },
  'label.stage': { ko: '두꺼운 구면 렌즈', en: 'Thick spherical lens' },
  'label.view': { ko: '렌즈와 광축', en: 'Lens and axis' },

  /** 도식 이름표. */
  'label.stop': { ko: '조리개', en: 'aperture stop' },

  'caption.enter': {
    ko: '나란한 빛 줄기가 두 면이 둥근 볼록 렌즈로 들어간다.',
    en: 'Parallel beams of light head into a convex lens with two rounded faces.',
  },
  'caption.pass': {
    ko: '렌즈를 지난 줄기가 축 쪽으로 꺾여 축을 건너간다.',
    en: 'Past the lens, the beams bend toward the axis and cross it.',
  },
  'caption.spread': {
    ko: '가장 바깥 줄기는 렌즈 가까이에서, 가장 안쪽 줄기는 멀리서 축을 건넌다 — 줄기들이 한 점에 모이지 않는다.',
    en: 'The outermost beams cross the axis close to the lens, the innermost ones far from it — the beams do not meet at one point.',
  },
  'caption.stopIn': {
    ko: '조리개가 들어와 바깥 줄기를 막는다.',
    en: 'An aperture stop closes in and blocks the outer beams.',
  },
  'caption.narrow': {
    ko: '안쪽 줄기만 남자 축을 건너는 자리가 좁게 모였다.',
    en: 'With only the inner beams left, the places where they cross the axis are packed close together.',
  },
} satisfies Record<string, LocalizedText>);

export type SphericalAberrationMessageKey = keyof typeof sphericalAberrationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SphericalAberrationMessageKey): LocalizedText => sphericalAberrationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SphericalAberrationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const sphericalAberrationSchema: BundleSchema = {
  id: SPHERICAL_ABERRATION_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 조리개를 닫는 것까지 자동 진행으로 보인다 — 조리개 크기를 끌게 해도
  // 교차점이 하나씩 사라질 뿐 주장이 늘지 않는다.
  parameters: [],

  stages: [
    {
      id: 'thick-lens',
      label: text('label.stage'),
      constants: {
        surfaceRadius: SURFACE_RADIUS,
        thickness: LENS_THICKNESS,
        refractiveIndex: REFRACTIVE_INDEX,
        rayPairs: RAY_PAIRS,
        raySpacing: RAY_SPACING,
        stopHalf: STOP_HALF,
      },
    },
  ],

  environments: [],

  views: [{ id: 'lens', label: text('label.view'), default: true }],

  /**
   * 축 → 렌즈 → 줄기 → 조리개 → 치수선 → 교차점 → 글자 순. plugin 어휘(`ray`)가 층에서
   * region 보다 앞설 수 있어 scene 순서로 고정한다 — 줄기가 렌즈 유리 위로 지나가고,
   * 조리개 판은 막힌 줄기 끝을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 들어옴 → 렌즈 지남 → 교차점 표시 → 멈춤 → 조리개 닫힘 → 멈춤 → 빠져나감.
   *
   * 줄기 앞머리 · 꼬리의 x 는 `enter` · `pass` · `drain` 진행도로, 교차점 · 치수선의 짙기는
   * `mark` · `drain` 진행도로, 조리개 판의 자리 · 짙기는 `stop-in` · `drain` 진행도로 읽는다
   * (`physics.ts`).
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 1.4, caption: key('caption.enter') },
      { id: 'pass', duration: 1.6, caption: key('caption.pass') },
      { id: 'mark', duration: 0.6, ease: 'smooth', caption: key('caption.spread') },
      { id: 'hold-open', duration: 3.0, caption: key('caption.spread') },
      { id: 'stop-in', duration: 1.4, ease: 'smooth', caption: key('caption.stopIn') },
      { id: 'hold-stop', duration: 3.0, caption: key('caption.narrow') },
      { id: 'drain', duration: 1.3, caption: key('caption.narrow') },
    ],
  },

  /** 도착한 순간 줄기가 다 지나가 있고 교차점이 축 위에 퍼져 서 있다 — 열린 멈춤 안에서 연다 (S-piece). */
  startAt: 4.2,

  /** 슬롯 하나. 그림 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 교차점이 퍼진 폭인데, 그것은
  // 치수선 하나가 수 없이 가리킨다.

  messages: sphericalAberrationMessages,
};
