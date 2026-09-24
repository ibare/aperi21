// ========================================================================
// elliptical-orbit — 선언
// ========================================================================
// 질문: 긴반지름은 그대로 두고 두 초점 사이만 벌리면 궤도는 어떻게 되는가.
//
// 두 초점이 중심 천체 한 점에 겹쳐 있으면 궤도는 원이다. 빈 초점을 벌리면(이심률이 커지면)
// 원이 길쭉해진다 — 중심 천체 쪽 근점은 원 안쪽으로 다가오고, 반대쪽 원점은 원 바깥으로
// 같은 만큼 멀어진다. 긴반지름이 그대로라 한 바퀴 도는 시간도 원과 같다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:elliptical-orbit` 와 문자 그대로 일치한다 (C4). */
export const ELLIPTICAL_ORBIT_ID = 'elliptical-orbit';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 임의 길이, 시간은 초다.
// ------------------------------------------------------------------------

/** 긴반지름 a(월드). 모든 궤도가 같은 값이다 — 원의 반지름이기도 하다. */
export const SEMI_MAJOR = 2.5;
/** 첫째 · 둘째 · 셋째 정박 이심률. 원(0)에서 차례로 벌어진다. 화면의 `e =` 글자는 이 값을 그대로 쓴다. */
export const ECCENTRICITY_1 = 0.3;
export const ECCENTRICITY_2 = 0.6;
export const ECCENTRICITY_3 = 0.8;
/** 한 주기(시간표) 동안 행성이 도는 바퀴 수. 한 바퀴 시간 = 시간표 주기 / 이 값. */
export const ORBITS_PER_CYCLE = 6;
/** 주기가 시작할 때 행성의 평균 근점 이각(라디안). 0 이면 근점에서 출발한다. */
export const MEAN_ANOMALY_AT_START = 0;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/** 중심 천체 · 빈 초점 표지 · 행성의 반지름(월드). */
export const SUN_RADIUS = 0.17;
export const PLANET_RADIUS = 0.1;

/**
 * 프레이밍은 주장의 일부다. 왼쪽 끝은 원(반지름 a)의 왼쪽 꼭짓점과 「근점」 이름표, 오른쪽 끝은
 * 가장 길쭉한 타원(e = 0.8)의 원점 a(1 + e) = 4.5 와 「원점」 이름표, 아래에는 캡션 띠를 남긴다
 * (캡션 자리가 프레이밍 여백으로 잡히지 않는다 — 장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.5, maxX: 5.5, minY: -3.35, maxY: 2.9 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// 한 주기 = 4 + 3 × (2 + 4) + 2 = 24 초 = 한 바퀴(4 초) × 6. 단계를 바꾸면 바퀴 수도 맞춘다 (장부 G129).
// ------------------------------------------------------------------------

/** 두 초점이 겹친 원 궤도를 한 바퀴 도는 동안. */
export const CIRCLE = 4;
/** 빈 초점이 다음 정박 이심률까지 벌어지는 동안. */
export const SPREAD = 2;
/** 그 이심률에서 한 바퀴 도는 동안. */
export const HOLD = 4;
/** 빈 초점이 되돌아와 원으로 닫히는 동안. */
export const CLOSE = 2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const ellipticalOrbitMessages = Object.freeze({
  'label.title': { ko: '타원 궤도', en: 'Elliptical orbit' },
  'label.stage': { ko: '긴반지름이 같은 궤도', en: 'Orbits with the same semi-major axis' },
  'label.view': { ko: '초점 벌리기', en: 'Pulling the foci apart' },
  'label.sun': { ko: '중심 천체', en: 'central body' },
  'label.emptyFocus': { ko: '빈 초점', en: 'empty focus' },
  'label.periapsis': { ko: '근점', en: 'closest' },
  'label.apoapsis': { ko: '원점', en: 'farthest' },
  'label.circle': { ko: '원 궤도', en: 'circular orbit' },
  'label.eccentricity': { ko: 'e = {e}', en: 'e = {e}' },
  'caption.circle': {
    ko: '두 초점이 중심 천체 한 점에 겹쳐 있다 — 궤도는 원이다',
    en: 'Both foci sit together on the central body — the orbit is a circle',
  },
  'caption.spread': {
    ko: '빈 초점을 벌리면 궤도가 길쭉해진다 — 근점은 다가오고 원점은 멀어진다',
    en: 'Pull the empty focus away and the orbit stretches — the closest point moves in, the farthest moves out',
  },
  'caption.hold': {
    ko: '근점은 원 안쪽으로, 원점은 원 바깥으로 같은 만큼 — 긴지름이 그대로라 한 바퀴도 원 위의 점과 함께 돈다',
    en: 'The closest point dips inside the circle as far as the farthest bulges out — the long axis is unchanged, so each lap keeps pace with the point on the circle',
  },
  'caption.close': {
    ko: '빈 초점을 다시 모으면 궤도는 원으로 돌아간다',
    en: 'Bring the foci back together and the orbit returns to a circle',
  },
} satisfies Record<string, LocalizedText>);

export type EllipticalOrbitMessageKey = keyof typeof ellipticalOrbitMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EllipticalOrbitMessageKey): LocalizedText => ellipticalOrbitMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EllipticalOrbitMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const ellipticalOrbitSchema: BundleSchema = {
  id: ELLIPTICAL_ORBIT_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다 — 시간표가 원에서 가장 길쭉한 타원까지 정박 이심률을 차례로 훑는다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        semiMajor: SEMI_MAJOR,
        eccentricity1: ECCENTRICITY_1,
        eccentricity2: ECCENTRICITY_2,
        eccentricity3: ECCENTRICITY_3,
        orbitsPerCycle: ORBITS_PER_CYCLE,
        meanAnomalyAtStart: MEAN_ANOMALY_AT_START,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 길쭉해지는 궤도와 캡션 한두 줄. 세로를 더 주면 그림만 작아진다. */
  canvas: { height: 380, minHeight: 340 },

  /** 원 궤도 유령 → 궤도 → 초점 사이 → 천체 순으로 — 먼저 쓴 것이 아래다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 원 → (벌리기 → 한 바퀴) × 3 → 닫기. 단계 `spreadN` 이 이심률을 N 번째 정박값으로 벌리고,
   * `holdN` 은 그 궤도를 한 바퀴 돈다. 행성은 단계와 상관없이 같은 주기로 계속 돈다.
   */
  timeline: {
    phases: [
      { id: 'circle', duration: CIRCLE, caption: key('caption.circle') },
      { id: 'spread1', duration: SPREAD, ease: 'smooth', caption: key('caption.spread') },
      { id: 'hold1', duration: HOLD, caption: key('caption.hold') },
      { id: 'spread2', duration: SPREAD, ease: 'smooth', caption: key('caption.spread') },
      { id: 'hold2', duration: HOLD, caption: key('caption.hold') },
      { id: 'spread3', duration: SPREAD, ease: 'smooth', caption: key('caption.spread') },
      { id: 'hold3', duration: HOLD, caption: key('caption.hold') },
      { id: 'close', duration: CLOSE, ease: 'smooth', caption: key('caption.close') },
    ],
  },

  /** 도착한 순간 행성은 이미 원을 돌고 있다 — 근점을 막 지났다. */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 값이 아니라 원과 견준 「안쪽 · 바깥쪽」 이다. */

  messages: ellipticalOrbitMessages,
};
