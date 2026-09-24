// ========================================================================
// human-eye-accommodation — 선언
// ========================================================================
// 질문: 수정체와 망막 사이 거리가 그대로인 눈은 가까운 것에 어떻게 초점을 맞추는가.
//
// 답: 눈 단면 하나. 먼 산에서 온 나란한 줄기는 얇은 수정체를 지나 망막 위 한 점에
// 모인다. 25 cm 앞 책에서 온 벌어진 줄기는 수정체가 얇은 그대로면 망막 뒤에서 모이고
// (망막에는 번진 얼룩), 수정체가 두꺼워지면서 더 세게 꺾여 다시 망막 위 한 점에 모인다.
// 수정체에서 망막까지의 거리 표시는 처음부터 끝까지 그대로다.
//
// 근시 · 원시와 안경은 `myopia-hyperopia` 의 몫이다. 이 조각은 정상 눈의 조절만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:human-eye-accommodation` 와 문자 그대로 일치한다 (C4). */
export const HUMAN_EYE_ACCOMMODATION_ID = 'human-eye-accommodation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 = 1 mm. 수정체는 x = 0 에 선 얇은 렌즈로 계산한다(환산 눈).
// ------------------------------------------------------------------------

/** 수정체에서 망막까지 거리(mm). 화면 치수선이 이 값을 그대로 보인다. */
export const RETINA_DISTANCE = 17;
/** 먼 곳을 볼 때(수정체가 얇을 때)의 초점 거리(mm). 망막 거리와 같아 평행광이 망막에 모인다. */
export const FOCAL_FAR = 17;
/** 25 cm 앞을 볼 때(수정체가 두꺼울 때)의 초점 거리(mm). */
export const FOCAL_NEAR = 15.9;
/** 가까이 보는 책까지의 거리(cm). 이름표가 이 값을 그대로 보인다. */
export const NEAR_DISTANCE_CM = 25;
/** 먼 곳을 볼 때 수정체 가운데 두께(mm). */
export const LENS_THICKNESS_FAR = 3.6;
/** 가까이 볼 때 수정체 가운데 두께(mm). */
export const LENS_THICKNESS_NEAR = 4.0;
/**
 * 가까운 책에서 온 줄기의 벌어짐 · 굴절력 변화를 키우는 배율. 1 이면 실제 크기다 —
 * 25 cm 에서 온 줄기는 눈 크기에서 나란한 줄기와 가려지지 않고, 초점이 망막 뒤로
 * 1.2 mm 밀리는 것도 화면에서 거의 보이지 않는다. 벌어짐과 굴절력 변화를 같은
 * 배율로 키워 「두꺼워지면 다시 망막 위」 는 그대로 성립한다.
 */
export const VERGENCE_SCALE = 4;
/** 수정체 두께 변화를 그림에서 키우는 배율. 1 이면 0.4 mm 차이라 눈에 띄지 않는다. */
export const THICKNESS_SCALE = 4;
/** 줄기 수. 가운데 줄기가 축 위를 지나도록 홀수로 둔다. */
export const RAY_COUNT = 5;
/** 수정체에 닿는 이웃 줄기 사이 간격(mm). */
export const RAY_SPACING = 1.8;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(mm). 수정체 중심이 원점, 광축이 y = 0.
// ------------------------------------------------------------------------

/** 눈알 반지름(mm). 눈알 뒤 끝이 망막 거리(x = 망막 거리)에 닿도록 중심을 둔다. */
export const EYE_RADIUS = 11.5;
/** 망막이 덮는 눈알 뒤쪽 호의 반각(라디안). */
export const RETINA_HALF_ANGLE = 1.05;
/** 수정체 반높이(mm). 가장 바깥 줄기(간격 × 2)보다 넉넉하다. */
export const LENS_HALF = 4.5;
/** 수정체 가장자리 반두께(mm). 날이 서지 않게 조금 남긴다. */
export const LENS_EDGE_HALF = 0.35;

/** 줄기가 출발하는 x(mm). 화면 왼쪽 끝. */
export const RAY_START_X = -17;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(mm). 오른쪽은 망막 뒤에 모이는 점을 넉넉히 지난다. */
export const AXIS_FROM_X = -17.5;
export const AXIS_TO_X = 25.5;

/** 보는 대상 이름표 자리(mm) — 줄기 출발점 위. */
export const OBJECT_LABEL_POS = [-13.2, 5.0] as const;
/** 수정체 이름표가 수정체 위 끝에서 더 올라간 거리(mm). */
export const LENS_LABEL_GAP = 1.1;
/** 망막 이름표 자리(mm) — 망막 호 바깥, 위쪽 비탈 옆. */
export const RETINA_LABEL_POS = [17.8, 7.2] as const;
/** 거리 치수선의 높이(mm) — 눈알 아래. */
export const DIMENSION_Y = -13.2;
/** 치수 안내선이 망막 뒤 끝에서 떨어져 시작하는 거리(mm) — 초점 점과 겹치지 않게. */
export const GUIDE_GAP = 1.2;
/** 초점 점의 반지름(mm). */
export const FOCUS_DOT_RADIUS = 0.32;

/**
 * 프레이밍 — 가로는 줄기 출발점과 대상 이름표부터 망막 뒤에 모이는 점까지, 세로는
 * 눈알 위 끝부터 치수선과 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -18.5, maxX: 26.5, minY: -16.2, maxY: 12.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const humanEyeAccommodationMessages = Object.freeze({
  'label.title': { ko: '눈의 조절', en: 'Accommodation of the eye' },
  'label.operation': { ko: '수정체가 초점을 맞추는 방식', en: 'How the lens of the eye brings things into focus' },
  'label.stage': { ko: '먼 곳과 가까운 곳', en: 'Far and near' },
  'label.view': { ko: '눈 단면', en: 'Eye cross-section' },

  /** 도식 이름표. */
  'label.far': { ko: '먼 산', en: 'distant mountain' },
  'label.near': { ko: '{d} cm 앞 책', en: 'book {d} cm away' },
  'label.lens': { ko: '수정체', en: 'lens' },
  'label.retina': { ko: '망막', en: 'retina' },
  /** 수정체–망막 거리 치수. 단위가 붙는 값이라 문안 키로 끼운다. */
  'label.distance': { ko: '{d} mm', en: '{d} mm' },

  'caption.farEnter': {
    ko: '먼 산에서 온 빛 줄기가 나란하게 눈으로 들어온다.',
    en: 'Light from a distant mountain enters the eye in parallel beams.',
  },
  'caption.farFocus': {
    ko: '얇은 수정체를 지난 줄기가 망막 위 한 점에 모인다.',
    en: 'Through the thin lens, the beams meet at one point on the retina.',
  },
  'caption.nearEnter': {
    ko: '가까운 책에서 온 빛 줄기는 벌어지며 들어온다.',
    en: 'Light from a nearby book enters as spreading beams.',
  },
  'caption.nearBlur': {
    ko: '수정체는 얇은 그대로 — 줄기는 망막 뒤에서 모이고, 망막에는 번진 얼룩이 맺힌다.',
    en: 'The lens is still thin — the beams meet behind the retina, leaving a blurred patch on it.',
  },
  'caption.thicken': {
    ko: '수정체가 두꺼워지며 줄기가 더 세게 꺾인다 — 망막은 제자리 그대로다.',
    en: 'The lens thickens and bends the beams more sharply — the retina stays where it is.',
  },
  'caption.nearFocus': {
    ko: '두꺼워진 수정체를 지난 줄기가 다시 망막 위 한 점에 모인다.',
    en: 'Through the thicker lens, the beams meet at one point on the retina again.',
  },
  'caption.relax': {
    ko: '수정체가 다시 얇아진다.',
    en: 'The lens thins out again.',
  },
} satisfies Record<string, LocalizedText>);

export type HumanEyeAccommodationMessageKey = keyof typeof humanEyeAccommodationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: HumanEyeAccommodationMessageKey): LocalizedText => humanEyeAccommodationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: HumanEyeAccommodationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const humanEyeAccommodationSchema: BundleSchema = {
  id: HUMAN_EYE_ACCOMMODATION_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 먼 곳 → 가까운 곳 → 수정체가 두꺼워짐을 자동 진행으로 보인다 —
  // 독자가 직접 해 봐야 하는 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'far-and-near',
      label: text('label.stage'),
      constants: {
        retinaDistance: RETINA_DISTANCE,
        focalFar: FOCAL_FAR,
        focalNear: FOCAL_NEAR,
        nearDistanceCm: NEAR_DISTANCE_CM,
        lensThicknessFar: LENS_THICKNESS_FAR,
        lensThicknessNear: LENS_THICKNESS_NEAR,
        vergenceScale: VERGENCE_SCALE,
        thicknessScale: THICKNESS_SCALE,
        rayCount: RAY_COUNT,
        raySpacing: RAY_SPACING,
      },
    },
  ],

  environments: [],

  views: [{ id: 'eye', label: text('label.view'), default: true }],

  /** 눈알이 둥글어 세로가 든다. 망막 뒤 몇 mm 차이가 보이는 배율을 지킨다. */
  canvas: { height: 480, minHeight: 400 },

  /**
   * 눈알 → 축 → 수정체 → 망막 → 줄기 → 점선 · 얼룩 → 초점 → 글자 순. plugin 어휘(`ray`)가
   * 층에서 region 보다 앞설 수 있어 scene 순서로 고정한다 — 줄기가 수정체 위로 지나가야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 먼 산(들어옴 → 초점 → 멈춤 → 빠져나감) → 책(들어옴 → 망막 뒤 드러남 → 멈춤 →
   * 두꺼워짐 → 초점 → 멈춤 → 빠져나감) → 수정체 풀림.
   *
   * 줄기 앞머리 · 꼬리는 `*-enter` · `*-drain` 진행도로, 망막 뒤 점선 · 얼룩은 `near-extend`
   * 진행도로, 수정체 두께 · 초점 거리는 `thicken` · `relax` 진행도로 읽는다(`physics.ts`).
   */
  timeline: {
    phases: [
      { id: 'far-enter', duration: 1.4, caption: key('caption.farEnter') },
      { id: 'far-mark', duration: 0.4, ease: 'smooth', caption: key('caption.farFocus') },
      { id: 'far-hold', duration: 2.2, caption: key('caption.farFocus') },
      { id: 'far-drain', duration: 1.0, caption: key('caption.farFocus') },
      { id: 'near-enter', duration: 1.4, caption: key('caption.nearEnter') },
      { id: 'near-extend', duration: 0.6, ease: 'smooth', caption: key('caption.nearBlur') },
      { id: 'near-blur', duration: 2.6, caption: key('caption.nearBlur') },
      { id: 'thicken', duration: 2.4, ease: 'smooth', caption: key('caption.thicken') },
      { id: 'near-mark', duration: 0.4, ease: 'smooth', caption: key('caption.nearFocus') },
      { id: 'near-hold', duration: 2.6, caption: key('caption.nearFocus') },
      { id: 'near-drain', duration: 1.0, caption: key('caption.nearFocus') },
      { id: 'relax', duration: 1.2, ease: 'smooth', caption: key('caption.relax') },
    ],
  },

  /** 도착한 순간 먼 산의 줄기가 이미 망막 위 한 점에 모여 있다 — 먼 곳 멈춤 안에서 연다 (S-piece). */
  startAt: 2.4,

  /** 슬롯 하나. 그림 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 수정체–망막 거리 하나이고
  // 그것은 치수선이 보인다.

  messages: humanEyeAccommodationMessages,
};
