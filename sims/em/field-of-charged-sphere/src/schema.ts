// ========================================================================
// field-of-charged-sphere — 선언
// ========================================================================
// 질문: 대전된 속 빈 도체 구의 장은 안과 밖이 왜 다른가.
//
// 위에는 공간 — 전하가 겉면에만 퍼진 속 빈 구와, 둘레 자리마다 적힌 장 화살표. 구 안의
// 자리에는 화살표가 없고 점만 찍혀 있다. 아래에는 E–r 그래프 — **가로 r 축이 위 그림과
// 같은 자리**라 구의 가운데 바로 아래가 r = 0, 겉면 바로 아래가 r = R 이다.
//
// 작은 시험 전하가 멀리서 구로 다가오며 받는 힘을 그래프에 긋는다 — 1/r² 로 커지다가
// 겉면을 넘는 순간 0 으로 떨어지고, 안에서는 줄곧 0 이다. 이어 같은 전하를 가운데 한 점으로
// 모으면, 구 밖의 화살표와 곡선은 그대로이고 달라지는 것은 구 안뿐이다.
//
// 속 찬 절연 구(E ∝ r)는 다루지 않는다. 가우스 면으로 까닭을 푸는 것은 이웃
// `gausss-law` 의 몫이라 여기에 닫힌 면을 긋지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:field-of-charged-sphere` 와 문자 그대로 일치한다 (C4). */
export const FIELD_OF_CHARGED_SPHERE_ID = 'field-of-charged-sphere';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 임의 길이(구의 반지름 R 이 1), 장은 겉면 바로 밖의 세기 kQ/R² 가 1 인 단위다.
// ------------------------------------------------------------------------

/** 구에 준 전하의 kQ(장 단위 × 월드²). 밖의 장 E = kQ / r². 양수라 장이 바깥을 향한다. */
export const KQ = 1;
/** 구의 반지름 R(월드). */
export const SPHERE_RADIUS = 1;
/** 겉면에 찍는 전하 표식 `+` 의 개수. 겉면에 고르게 퍼진 전하를 그림으로 가리킨다. */
export const SHELL_MARKS = 12;
/**
 * 장 → 화살표 길이 배율(월드 길이 per 장 단위). 화살표 길이 = 배율 × E.
 * 시험 전하가 받는 힘 화살표도 **같은 배율**이다 — 단위 전하의 힘이 곧 장 화살표다.
 */
export const ARROW_SCALE = 0.75;
/**
 * 화살표 길이 상한(월드). 격자 간격(0.8)보다 짧아 이웃 칸을 덮지 않는다. 배율과 같게 두어
 * 구 밖(r ≥ R)의 화살표는 하나도 여기 걸리지 않는다 — 걸리는 것은 전하를 한 점으로 모은 뒤
 * 구 안 자리뿐이다(비례가 끊긴다, NOTES b).
 */
export const ARROW_MAX = 0.75;
/** 격자 간격(월드). 화살표는 반 칸 어긋난 자리(±0.4, ±1.2 …)에 놓인다. */
export const GRID_STEP = 0.8;
/** 격자 열 번호의 범위 — 자리 x = (i + ½) × 간격. 시험 전하가 오는 오른쪽을 한 칸 더 편다. */
export const GRID_MIN_COL = -4;
export const GRID_MAX_COL = 4;
/** 격자 반높이(칸 수). 세로 네 줄 — 세로가 비싸다. */
export const GRID_HALF_ROWS = 2;

/** 시험 전하가 출발하는 거리 · 안에서 멈추는 거리(월드, 구의 가운데에서). y = 0 줄 위를 간다. */
export const PROBE_START_R = 3.4;
export const PROBE_INSIDE_R = 0.5;
/** 시험 전하 그림 반지름(월드). */
export const PROBE_RADIUS = 0.12;
/** 한 점으로 모은 전하의 그림 반지름(월드). */
export const POINT_RADIUS = 0.1;

/** 그래프 가로축(E = 0)의 높이(월드 y). 공간 그림 아래에 놓인다. */
export const GRAPH_BASE_Y = -3.95;
/** 그래프 세로 배율(월드 길이 per 장 단위). 겉면 바로 밖의 세기가 이 높이다. */
export const GRAPH_SCALE = 0.95;
/** 그래프 세로축 끝의 장 세기 — 이보다 센 곳(한 점으로 모은 전하 곁)은 판 위에서 잘린다. */
export const GRAPH_TOP_E = 2.1;
/** 그래프 가로축의 끝(월드 x = r). */
export const GRAPH_END_R = 3.8;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 공간 격자(가로 -3.2 ~ 3.6, 세로 ±1.2 와 화살표 끝)와 아래 그래프,
 * 그리고 캡션 띠를 담는다 (캡션 슬롯이 프레이밍 여백으로 잡히지 않는다 — 장부 G24).
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.4, maxX: 4.2, minY: -4.8, maxY: 1.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// ------------------------------------------------------------------------

/** 구와 장만 있는 그림을 읽는 동안 · 시험 전하가 나타나는 동안. */
export const FIELD_HOLD = 1.6;
export const APPEAR = 0.5;
/** 시험 전하가 멀리서 겉면까지 다가오는 동안. */
export const APPROACH = 3.2;
/** 겉면을 넘어 안쪽 자리까지 들어가는 동안 · 그 자리에 머무는 동안. */
export const ENTER = 1.4;
export const INSIDE_HOLD = 1.6;
/** 겉면의 전하를 가운데 한 점으로 모으는 동안. */
export const GATHER = 1.8;
/** 한 점 전하의 곡선이 그래프에 나타나는 동안 · 그 그림을 읽는 동안. */
export const REVEAL = 0.7;
export const POINT_HOLD = 2.6;
/** 다음 주기로 넘어가며 구가 돌아오는 동안. */
export const CLEAR = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const fieldOfChargedSphereMessages = Object.freeze({
  'label.title': { ko: '대전된 구의 전기장', en: 'Field of a charged sphere' },
  'label.operation': { ko: '안과 밖이 다른 이유', en: 'Why inside and outside differ' },
  'label.stage': { ko: '속 빈 도체 구', en: 'Hollow conducting sphere' },
  'label.view': { ko: '공간과 E–r', en: 'Space and E–r' },
  /** 전하 부호 · 기호 · 축 이름. 표식이라 번역하지 않는다 (C1 판정 3). */
  'mark.plus': { ko: '+', en: '+' },
  'mark.q': { ko: '+q', en: '+q' },
  'mark.e': { ko: 'E', en: 'E' },
  'mark.r': { ko: 'r', en: 'r' },
  'mark.radius': { ko: 'R', en: 'R' },
  'mark.origin': { ko: '0', en: '0' },
  'caption.field': {
    ko: '전하 + 가 구의 겉면에 퍼져 있다 — 장 화살표는 구 밖에만 있다',
    en: 'The + charge sits spread over the sphere’s surface — the field arrows are only outside',
  },
  'caption.approach': {
    ko: '시험 전하가 구에 다가갈수록 받는 힘이 커진다',
    en: 'As the test charge approaches the sphere, the force on it grows',
  },
  'caption.enter': {
    ko: '겉면을 넘어 안으로 들어가면 힘이 사라진다',
    en: 'Cross the surface into the inside, and the force vanishes',
  },
  'caption.gather': {
    ko: '같은 전하를 가운데 한 점으로 모은다',
    en: 'Now gather the same charge into one point at the center',
  },
  'caption.point': {
    ko: '구 밖의 화살표와 곡선은 그대로다 — 달라진 것은 구 안뿐이다',
    en: 'Outside the sphere the arrows and the curve are unchanged — only the inside differs',
  },
} satisfies Record<string, LocalizedText>);

export type FieldOfChargedSphereMessageKey = keyof typeof fieldOfChargedSphereMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FieldOfChargedSphereMessageKey): LocalizedText => fieldOfChargedSphereMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FieldOfChargedSphereMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const fieldOfChargedSphereSchema: BundleSchema = {
  id: FIELD_OF_CHARGED_SPHERE_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 장이 적혀 있고, 시험 전하가 들어오고, 전하가 한 점으로 모인다.
  parameters: [],

  stages: [
    {
      id: 'hollow-sphere',
      label: text('label.stage'),
      constants: {
        kQ: KQ,
        sphereRadius: SPHERE_RADIUS,
        shellMarks: SHELL_MARKS,
        arrowScale: ARROW_SCALE,
        arrowMax: ARROW_MAX,
        gridStep: GRID_STEP,
        gridMinCol: GRID_MIN_COL,
        gridMaxCol: GRID_MAX_COL,
        gridHalfRows: GRID_HALF_ROWS,
        probeStartR: PROBE_START_R,
        probeInsideR: PROBE_INSIDE_R,
        probeRadius: PROBE_RADIUS,
        pointRadius: POINT_RADIUS,
        graphBaseY: GRAPH_BASE_Y,
        graphScale: GRAPH_SCALE,
        graphTopE: GRAPH_TOP_E,
        graphEndR: GRAPH_END_R,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 공간 그림과 그 아래 그래프를 세로로 쌓는다. 가로 r 을 둘이 나눠 쓰므로 나란히 둘 수 없다. */
  canvas: { height: 460, minHeight: 400 },

  /**
   * 겹침 순서가 판정 장치다 — 그래프의 한 점 전하 점선이 시험 전하가 그은 곡선 **위에**
   * 얹혀야 「밖에서는 꼭 겹친다」 가 읽히고, 받는 힘 화살표는 구 껍질 위에 와야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 구와 장 → 시험 전하가 다가옴 → 겉면을 넘어 안으로 → 전하를 한 점으로 모음 →
   * 한 점 전하의 곡선 → 구가 돌아옴.
   */
  timeline: {
    phases: [
      { id: 'field', duration: FIELD_HOLD, caption: key('caption.field') },
      { id: 'appear', duration: APPEAR, ease: 'smooth', caption: key('caption.field') },
      { id: 'approach', duration: APPROACH, ease: 'smooth', caption: key('caption.approach') },
      { id: 'enter', duration: ENTER, ease: 'smooth', caption: key('caption.enter') },
      { id: 'inside', duration: INSIDE_HOLD, caption: key('caption.enter') },
      { id: 'gather', duration: GATHER, ease: 'smooth', caption: key('caption.gather') },
      { id: 'reveal', duration: REVEAL, ease: 'smooth', caption: key('caption.point') },
      { id: 'point', duration: POINT_HOLD, caption: key('caption.point') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.point') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 구와 장은 첫 프레임부터 온전히 적혀 있고, 0.4 초 뒤
   * 시험 전하가 나타나기 시작한다.
   */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **곡선의 모양**(안 0 · 겉면에서
   * 뛰어오름 · 1/r² 로 떨어짐)이라 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다.
   */

  messages: fieldOfChargedSphereMessages,
};
