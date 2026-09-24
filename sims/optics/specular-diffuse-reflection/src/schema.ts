// ========================================================================
// specular-diffuse-reflection — 선언
// ========================================================================
// 질문: 매끈한 면과 거친 면은 왜 빛을 다르게 돌려보내는가.
//
// 답: 나란히 들어온 빛줄기가 매끈한 면에서는 나란히 되튀고, 확대한 거친 면에서는
// 사방으로 흩어진다. 거친 면에서도 줄기 하나하나는 닿은 자리의 작은 면에서 반사될
// 뿐인데, 그 작은 면의 기울기(법선)가 자리마다 제각각이다.
//
// 반사각 = 입사각 자체(`law-of-reflection`)는 다시 말하지 않는다 — 여기서는 법선이
// 자리마다 기울어 있다는 것 하나를 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:specular-diffuse-reflection` 와 문자 그대로 일치한다 (C4). */
export const SPECULAR_DIFFUSE_REFLECTION_ID = 'specular-diffuse-reflection';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 한 판에 내려오는 평행 빛줄기 수. */
export const RAY_COUNT = 6;
/** 들어오는 빛의 입사각(°, 면 전체의 법선 — 연직 — 에서 잰다). 두 판이 같다. */
export const INCIDENCE_DEG = 35;
/** 거칠기 — 작은 면 하나의 높낮이 폭을 그 가로 폭에 견준 비. 0 이면 매끈한 면과 같다. */
export const ROUGHNESS = 0.9;
/** 확대한 거친 면에서 작은 면 하나의 가로 폭(월드). */
export const FACET_WIDTH = 0.4;
/** 톱니 꼭짓점 높이의 최소 몫(0~1) — 뽑은 높이가 이 몫 아래로 내려가지 않아 톱니가 평평해지지 않는다. */
export const MIN_TOOTH = 0.15;
/** 꼭짓점을 가로로 흔드는 폭 — 작은 면 폭에 견준 몫. 0 이면 톱니 폭이 모두 같다. */
export const JITTER = 0.7;
/**
 * 거친 면 모양을 뽑는 시드. 같은 시드는 언제나 같은 면이다. 위 값들과 함께 여섯 줄기가 모두
 * 다른 작은 면에 닿고 한 번만 되튀도록 골랐다 — 캡션 「사방으로 흩어졌다」 가 늘 참이다.
 */
export const SEED = 13;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 면의 기준 높이가 y = 0 이다.
// ------------------------------------------------------------------------

/** 두 판의 가운데 x. 왼쪽이 매끈한 면, 오른쪽이 거친 면. */
export const SMOOTH_CENTER_X = -3.3;
export const ROUGH_CENTER_X = 3.3;
/** 면 길이의 절반(월드). */
export const PANEL_HALF = 2.2;
/** 빛줄기 묶음의 폭(월드) — 첫 줄기에서 끝 줄기까지. 줄기 수와 무관하게 같다. */
export const BEAM_SPREAD = 2.3;
/** 들어오는 빛의 길이(월드) — 출발점에서 면 기준선까지. */
export const IN_LENGTH = 2.6;
/** 나가는 빛의 길이(월드). 되튄 뒤 한 번 더 부딪혀도 전체 길이가 이만큼이다. */
export const OUT_LENGTH = 2.3;
/** 닿은 자리에 세우는 작은 법선의 길이(월드). */
export const NORMAL_LENGTH = 0.85;
/** 면 아래 몸의 두께(월드). */
export const SURFACE_DEPTH = 0.32;
/** 면 이름표 높이(월드). 면 몸 아래. */
export const NAME_LABEL_Y = -0.62;

/**
 * 프레이밍 — 가로는 왼쪽 빛의 출발점에서 거친 면의 누운 반사 빛 끝까지, 세로는 선 반사 빛
 * 끝에서 이름표 · 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -6.2, maxX: 6.8, minY: -1.35, maxY: 2.55 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const specularDiffuseReflectionMessages = Object.freeze({
  'label.title': { ko: '정반사와 난반사', en: 'Specular and diffuse reflection' },
  'label.stage': { ko: '매끈한 면과 거친 면', en: 'Smooth and rough surfaces' },
  'label.view': { ko: '두 면 나란히', en: 'Side by side' },

  /** 도식 이름표. */
  'label.smooth': { ko: '매끈한 면', en: 'smooth surface' },
  'label.rough': { ko: '거친 면 (확대)', en: 'rough surface (magnified)' },

  'caption.enter': {
    ko: '평행한 빛줄기 {n}개가 매끈한 면과 거친 면에 같은 방향으로 내려온다.',
    en: '{n} parallel rays come down onto a smooth surface and a rough one in the same direction.',
  },
  'caption.bounce': {
    ko: '매끈한 면에서 되튄 줄기는 나란히 나가고, 거친 면에서 되튄 줄기는 저마다 다른 쪽으로 나간다.',
    en: 'Off the smooth surface the rays leave side by side; off the rough one each ray leaves in its own direction.',
  },
  'caption.spread': {
    ko: '나란히 들어온 빛이 매끈한 면에서는 나란히 나갔고, 거친 면에서는 사방으로 흩어졌다.',
    en: 'Light that came in parallel left the smooth surface still parallel, and scattered every which way off the rough one.',
  },
  'caption.normalsIn': {
    ko: '줄기가 닿은 자리마다 그 자리 면에 수직인 법선을 세운다.',
    en: 'At each spot a ray hits, a normal is raised square to the surface there.',
  },
  'caption.normals': {
    ko: '매끈한 면의 법선은 모두 나란하고, 거친 면의 법선은 자리마다 다르게 기울었다 — 줄기는 저마다 제 법선 반대쪽으로 되튀었다.',
    en: 'The normals on the smooth surface are all parallel; on the rough one each tilts its own way — every ray has bounced off to the far side of its own normal.',
  },
} satisfies Record<string, LocalizedText>);

export type SpecularDiffuseReflectionMessageKey = keyof typeof specularDiffuseReflectionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SpecularDiffuseReflectionMessageKey): LocalizedText => specularDiffuseReflectionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SpecularDiffuseReflectionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const specularDiffuseReflectionSchema: BundleSchema = {
  id: SPECULAR_DIFFUSE_REFLECTION_ID,
  title: text('label.title'),
  category: 'optics',
  timeModel: 'periodic',

  // 조작기가 없다. 한 주기로 「나란히 → 흩어짐 → 법선이 제각각」 이 끝난다.
  parameters: [],

  stages: [
    {
      id: 'two-surfaces',
      label: text('label.stage'),
      constants: {
        rayCount: RAY_COUNT,
        incidenceDeg: INCIDENCE_DEG,
        roughness: ROUGHNESS,
        facetWidth: FACET_WIDTH,
        minTooth: MIN_TOOTH,
        jitter: JITTER,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side-by-side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 두 판이 나란히 선다. 세로는 빛줄기 높이와 캡션 한 줄이면 된다. */
  canvas: { height: 360, minHeight: 320 },

  /** 면 몸 → 면 선 → 법선 → 빛 → 이름표 순. 법선 점선이 면 위에, 빛이 그 위에 온다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 빛이 내려옴 → 되튀어 나감 → 흩어진 채 멈춤 → 법선이 나타남 → 법선과 함께 멈춤.
   *
   * 빛의 앞머리는 `enter` · `bounce` 진행도로 줄기마다의 경로를 따라 자란다(`physics.ts rayReach`).
   * 법선의 짙기는 `normals-in` 진행도다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 1.8, caption: key('caption.enter') },
      { id: 'bounce', duration: 1.8, caption: key('caption.bounce') },
      { id: 'spread', duration: 2.8, caption: key('caption.spread') },
      { id: 'normals-in', duration: 0.9, ease: 'smooth', caption: key('caption.normalsIn') },
      { id: 'normals', duration: 4.2, caption: key('caption.normals') },
    ],
  },

  /** 도착한 순간 빛이 이미 두 면에서 되튀어 흩어져 있다 — 멈춤 단계 앞머리에서 연다 (S-piece). */
  startAt: 4.0,

  /** 슬롯 하나. 두 판 아래 가운데 한 줄. 줄기 수는 state 가 스테이지 상수에서 옮긴 글자다(G133). */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 860,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: { n: 'rayCount' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것이 없다 — 보이는 것은 방향이 나란한가 흩어졌는가다.

  messages: specularDiffuseReflectionMessages,
};
