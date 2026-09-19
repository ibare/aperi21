// ========================================================================
// myopia-hyperopia — 선언
// ========================================================================
// 질문: 근시 · 원시 눈에서는 상이 어디에 맺히고, 안경은 그것을 어떻게 고치는가.
//
// 답: 눈 단면 하나를 두 번 보인다. 먼저 눈알이 긴 근시 눈 — 먼 곳에서 온 나란한 줄기가
// 망막 앞에서 모였다가 퍼져 망막에 번진 얼룩을 남긴다. 앞에 오목 렌즈를 대면 줄기가 조금
// 벌어져 들어가 모이는 점이 뒤로 물러나 망막 위에 온다. 이어 눈알이 짧은 원시 눈 — 가까운
// 책에서 온 줄기가 망막에 닿을 때까지 다 모이지 못하고, 이어 그은 점선은 망막 뒤에서
// 모인다. 볼록 렌즈를 대면 모이는 점이 앞으로 와 망막 위에 온다.
//
// 정상 눈의 조절은 `human-eye-accommodation` 의 몫이다. 이 조각의 수정체는 두께가 그대로다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:myopia-hyperopia` 와 문자 그대로 일치한다 (C4). */
export const MYOPIA_HYPEROPIA_ID = 'myopia-hyperopia';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 = 1 mm. 수정체는 x = 0 에 선 얇은 렌즈로 계산한다(환산 눈).
// ------------------------------------------------------------------------

/** 수정체 초점 거리(mm). 근시 눈 · 원시 눈이 같은 수정체를 쓴다 — 다른 것은 눈알 길이다. */
export const EYE_FOCAL = 17;
/** 근시 눈의 수정체–망막 거리(mm). 초점 거리보다 길어 나란한 줄기가 망막 앞에서 모인다. */
export const MYOPIC_RETINA = 21;
/** 원시 눈의 수정체–망막 거리(mm). 짧아서 가까운 곳의 줄기가 망막 뒤에서 모인다. */
export const HYPEROPIC_RETINA = 15;
/** 안경알이 수정체 앞에 서는 거리(mm). */
export const GLASSES_GAP = 8;
/**
 * 오목 안경알의 초점 거리 크기(mm). 안경 거리와 함께, 나란한 줄기를 근시 망막(21 mm)
 * 위에 모으는 값이다(수정체 앞 88 mm 에서 오는 것처럼 벌림 → 21.07 mm).
 */
export const CONCAVE_FOCAL = 80;
/**
 * 볼록 안경알의 초점 거리(mm). 안경 거리 · 책 거리 · 과장 배율과 함께, 책 줄기를 원시
 * 망막(15 mm) 위에 모으는 값이다(→ 15.02 mm).
 */
export const CONVEX_FOCAL = 39;
/** 원시 눈이 보는 책까지의 거리(cm). 이름표가 이 값을 그대로 보인다. */
export const NEAR_DISTANCE_CM = 25;
/**
 * 책에서 온 줄기의 벌어짐을 키우는 배율. 1 이면 실제 크기다 — 25 cm 에서 온 줄기는 눈
 * 크기에서 나란한 줄기와 가려지지 않는다. 책 점을 이 배율만큼 가까이 당겨 줄기를 푼다.
 */
export const VERGENCE_SCALE = 4;
/** 줄기 수. 가운데 줄기가 축 위를 지나도록 홀수로 둔다. */
export const RAY_COUNT = 5;
/** 수정체에 닿는 이웃 줄기 사이 간격(mm) — 안경이 없을 때. */
export const RAY_SPACING = 1.8;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(mm). 수정체 중심이 원점, 광축이 y = 0.
// ------------------------------------------------------------------------

/** 눈알 앞 끝(각막)이 수정체 앞에 있는 거리(mm). 눈알 뒤 끝은 망막 거리에 닿는다. */
export const EYE_FRONT = 6;
/** 눈알 세로 반지름(mm). 눈알 길이만 바뀌고 높이는 같다. */
export const EYE_HALF_HEIGHT = 11.5;
/** 망막이 덮는 눈알 뒤쪽 호의 반각(타원 매개변수, 라디안). */
export const RETINA_HALF_ANGLE = 1.05;
/** 수정체 반높이(mm). */
export const LENS_HALF = 4.5;
/** 수정체 가운데 반두께(mm). 두께는 그대로다. */
export const LENS_CENTER_HALF = 1.8;
/** 수정체 가장자리 반두께(mm). */
export const LENS_EDGE_HALF = 0.35;
/** 안경알 반높이(mm). 안경을 지난 줄기가 모두 들어온다. */
export const GLASSES_HALF = 5;
/** 안경알의 얇은 쪽 반두께(mm) — 오목은 가운데, 볼록은 가장자리. */
export const GLASSES_THIN_HALF = 0.3;
/** 안경알의 두꺼운 쪽 반두께(mm) — 오목은 가장자리, 볼록은 가운데. */
export const GLASSES_THICK_HALF = 1.1;

/** 줄기가 출발하는 x(mm). 화면 왼쪽 끝. */
export const RAY_START_X = -17;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(mm). 오른쪽은 원시 눈 망막 뒤에 모이는 점을 넉넉히 지난다. */
export const AXIS_FROM_X = -17.5;
export const AXIS_TO_X = 25.5;

/** 보는 대상 이름표 자리(mm) — 줄기 출발점 위. */
export const OBJECT_LABEL_POS = [-13.2, 6.2] as const;
/** 수정체 이름표가 수정체 위 끝에서 더 올라간 거리(mm). */
export const LENS_LABEL_GAP = 1.1;
/** 안경알 이름표가 안경알 아래 끝에서 더 내려간 거리(mm). */
export const GLASSES_LABEL_GAP = 1.4;
/** 눈 이름표(근시 눈 · 원시 눈)가 눈알 위 끝에서 더 올라간 거리(mm). */
export const EYE_LABEL_GAP = 1.4;
/** 망막 이름표가 눈알 뒤 끝에서 오른쪽으로 떨어진 거리(mm). */
export const RETINA_LABEL_DX = 0.8;
/** 망막 이름표 높이(mm). */
export const RETINA_LABEL_Y = 7.2;
/** 모이는 점의 반지름(mm). */
export const FOCUS_DOT_RADIUS = 0.32;

/**
 * 프레이밍 — 가로는 줄기 출발점과 대상 이름표부터 원시 눈 망막 뒤에 모이는 점까지, 세로는
 * 눈 이름표부터 안경 이름표와 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -18.5, maxX: 26.5, minY: -15.2, maxY: 14.6 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const myopiaHyperopiaMessages = Object.freeze({
  'label.title': { ko: '근시와 원시', en: 'Nearsightedness and farsightedness' },
  'label.operation': { ko: '상이 맺히는 위치와 교정', en: 'Where the image forms, and how glasses correct it' },
  'label.stage': { ko: '근시 눈과 원시 눈', en: 'Nearsighted and farsighted eyes' },
  'label.view': { ko: '눈 단면', en: 'Eye cross-section' },

  /** 도식 이름표. */
  'label.myopicEye': { ko: '근시 눈', en: 'nearsighted eye' },
  'label.hyperopicEye': { ko: '원시 눈', en: 'farsighted eye' },
  'label.far': { ko: '먼 곳', en: 'far away' },
  'label.near': { ko: '{d} cm 앞 책', en: 'book {d} cm away' },
  'label.lens': { ko: '수정체', en: 'lens' },
  'label.retina': { ko: '망막', en: 'retina' },
  'label.concave': { ko: '오목 렌즈', en: 'concave lens' },
  'label.convex': { ko: '볼록 렌즈', en: 'convex lens' },

  'caption.myopicEye': {
    ko: '근시 눈 — 눈알이 길어 망막이 수정체에서 멀다.',
    en: 'A nearsighted eye — the eyeball is long, so the retina sits far behind the lens.',
  },
  'caption.farEnter': {
    ko: '먼 곳에서 온 빛 줄기가 나란하게 들어온다.',
    en: 'Light from far away enters in parallel beams.',
  },
  'caption.myopicBlur': {
    ko: '줄기가 망막 앞에서 모였다가 다시 퍼져, 망막에는 번진 얼룩이 맺힌다.',
    en: 'The beams meet in front of the retina and spread out again, leaving a blurred patch on it.',
  },
  'caption.concaveWear': {
    ko: '오목 렌즈를 대면 줄기가 조금 벌어져 들어가고, 모이는 점이 망막 쪽으로 물러난다.',
    en: 'With a concave lens in front, the beams enter slightly spread, and the meeting point moves back toward the retina.',
  },
  'caption.concaveFixed': {
    ko: '줄기가 망막 위 한 점에 모인다.',
    en: 'The beams meet at one point on the retina.',
  },
  'caption.hyperopicEye': {
    ko: '원시 눈 — 눈알이 짧아 망막이 수정체에 가깝다.',
    en: 'A farsighted eye — the eyeball is short, so the retina sits close behind the lens.',
  },
  'caption.nearEnter': {
    ko: '가까운 책에서 온 빛 줄기는 벌어지며 들어온다.',
    en: 'Light from a nearby book enters as spreading beams.',
  },
  'caption.hyperopicBlur': {
    ko: '줄기가 다 모이기 전에 망막에 닿아 번진 얼룩이 맺히고, 이어 그은 점선은 망막 뒤에서 모인다.',
    en: 'The beams reach the retina before they meet, leaving a blurred patch — extended, they meet behind it.',
  },
  'caption.convexWear': {
    ko: '볼록 렌즈를 대면 줄기가 조금 모여 들어가고, 모이는 점이 망막 쪽으로 다가온다.',
    en: 'With a convex lens in front, the beams enter slightly converging, and the meeting point moves forward toward the retina.',
  },
  'caption.convexFixed': {
    ko: '줄기가 망막 위 한 점에 모인다.',
    en: 'The beams meet at one point on the retina.',
  },
} satisfies Record<string, LocalizedText>);

export type MyopiaHyperopiaMessageKey = keyof typeof myopiaHyperopiaMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MyopiaHyperopiaMessageKey): LocalizedText => myopiaHyperopiaMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MyopiaHyperopiaMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const myopiaHyperopiaSchema: BundleSchema = {
  id: MYOPIA_HYPEROPIA_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 근시 눈 → 오목 렌즈 → 원시 눈 → 볼록 렌즈를 자동 진행으로 보인다 —
  // 독자가 직접 해 봐야 하는 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'myopia-and-hyperopia',
      label: text('label.stage'),
      constants: {
        eyeFocal: EYE_FOCAL,
        myopicRetina: MYOPIC_RETINA,
        hyperopicRetina: HYPEROPIC_RETINA,
        glassesGap: GLASSES_GAP,
        concaveFocal: CONCAVE_FOCAL,
        convexFocal: CONVEX_FOCAL,
        nearDistanceCm: NEAR_DISTANCE_CM,
        vergenceScale: VERGENCE_SCALE,
        rayCount: RAY_COUNT,
        raySpacing: RAY_SPACING,
      },
    },
  ],

  environments: [],

  views: [{ id: 'eye', label: text('label.view'), default: true }],

  /** 눈알이 둥글어 세로가 든다. 망막 앞뒤 몇 mm 차이가 보이는 배율을 지킨다. */
  canvas: { height: 480, minHeight: 400 },

  /**
   * 눈알 → 축 → 안경 · 수정체 → 망막 → 줄기 → 점선 · 얼룩 → 모이는 점 → 글자 순. plugin 어휘
   * (`ray`)가 층에서 region 보다 앞설 수 있어 scene 순서로 고정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 근시 눈(나타남 → 먼 곳 줄기 들어옴 → 망막 앞 초점 · 얼룩 → 멈춤 → 오목 렌즈 →
   * 망막 위 초점 멈춤 → 빠져나감 → 사라짐) → 원시 눈(같은 순서, 책 줄기 · 볼록 렌즈).
   *
   * 눈 · 안경의 짙기는 `*-in` · `*-out` 진행도로, 줄기 앞머리 · 꼬리는 `*-enter` · `*-drain`
   * 진행도로, 안경의 굴절력은 `*-wear` 진행도로 읽는다(`physics.ts`).
   */
  timeline: {
    phases: [
      { id: 'm-in', duration: 0.8, ease: 'smooth', caption: key('caption.myopicEye') },
      { id: 'm-enter', duration: 1.4, caption: key('caption.farEnter') },
      { id: 'm-mark', duration: 0.4, ease: 'smooth', caption: key('caption.myopicBlur') },
      { id: 'm-hold', duration: 2.6, caption: key('caption.myopicBlur') },
      { id: 'm-wear', duration: 2.6, ease: 'smooth', caption: key('caption.concaveWear') },
      { id: 'm-fixed', duration: 2.6, caption: key('caption.concaveFixed') },
      { id: 'm-drain', duration: 1.0, caption: key('caption.concaveFixed') },
      { id: 'm-out', duration: 0.8, ease: 'smooth', caption: key('caption.concaveFixed') },
      { id: 'h-in', duration: 0.8, ease: 'smooth', caption: key('caption.hyperopicEye') },
      { id: 'h-enter', duration: 1.4, caption: key('caption.nearEnter') },
      { id: 'h-mark', duration: 0.4, ease: 'smooth', caption: key('caption.hyperopicBlur') },
      { id: 'h-hold', duration: 2.6, caption: key('caption.hyperopicBlur') },
      { id: 'h-wear', duration: 2.6, ease: 'smooth', caption: key('caption.convexWear') },
      { id: 'h-fixed', duration: 2.6, caption: key('caption.convexFixed') },
      { id: 'h-drain', duration: 1.0, caption: key('caption.convexFixed') },
      { id: 'h-out', duration: 0.8, ease: 'smooth', caption: key('caption.convexFixed') },
    ],
  },

  /** 도착한 순간 근시 눈에서 먼 곳 줄기가 이미 망막 앞에서 모여 있다 — 근시 멈춤 안에서 연다 (S-piece). */
  startAt: 2.9,

  /** 슬롯 하나. 그림 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것이 없다 — 주장은 모이는 점이
  // 망막 앞 · 뒤 · 위 중 어디냐이고 그것은 점과 망막 호의 자리로 보인다.

  messages: myopiaHyperopiaMessages,
};
