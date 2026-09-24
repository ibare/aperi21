// ========================================================================
// keplers-first-law — 선언
// ========================================================================
// 질문: 궤도가 타원이라면, 태양은 그 타원의 어디에 있는가.
//
// 태양은 타원의 한가운데가 아니라 한쪽으로 비켜 앉은 **초점**에 있다. 가운데에서 태양만큼
// 반대로 가면 또 하나의 초점이 있는데, 그 자리는 **비어 있다.** 태양에서 행성을 거쳐 빈
// 초점까지 끈을 이으면, 행성이 궤도 어디에 있든 **끈의 길이가 같다** — 두 핀과 끈으로
// 그리는 타원이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:keplers-first-law` 와 문자 그대로 일치한다 (C4). */
export const KEPLERS_FIRST_LAW_ID = 'keplers-first-law';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 임의 길이, 시간은 초다.
// ------------------------------------------------------------------------

/** 긴반지름 a(월드). 펼친 끈의 길이는 2a — 타원의 가로 폭과 같다. */
export const SEMI_MAJOR = 3;
/** 이심률. 0.6 이면 태양이 가운데에서 a 의 0.6 배만큼 비켜 앉는다 — 한눈에 한가운데가 아니다. */
export const ECCENTRICITY = 0.6;
/** 한 주기(시간표) 동안 행성이 도는 바퀴 수. 궤도 주기 = 시간표 주기 / 이 값. */
export const ORBITS_PER_CYCLE = 4;
/** 주기가 시작할 때 행성의 평균 근점 이각(라디안). 0 이면 근일점에서 출발한다. */
export const MEAN_ANOMALY_AT_START = 0;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/** 태양 · 빈 초점 표지 · 행성의 반지름(월드). */
export const SUN_RADIUS = 0.17;
export const PLANET_RADIUS = 0.1;
/** 펼친 끈의 왼쪽 끝(월드 x) · 높이(월드 y). 타원 오른쪽에 장축과 같은 높이로 놓인다. */
export const BAR_LEFT = 4.3;
export const BAR_Y = 0;
/** 펼친 끈 끝의 태양 · 빈 초점 표지 반지름(월드). 궤도 쪽보다 작다 — 견본이다. */
export const BAR_PIN_RADIUS = 0.12;

/**
 * 프레이밍은 주장의 일부다. 왼쪽에 타원(가로 6 · 세로 4.8), 오른쪽에 펼친 끈(길이 6),
 * 아래에 캡션 띠를 남긴다(캡션 자리가 프레이밍 여백으로 잡히지 않는다 — 장부 G24).
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.4, maxX: 10.7, minY: -3.35, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// ------------------------------------------------------------------------

/** 태양과 가운데(+)만 보이며 행성이 한 바퀴 도는 동안. */
export const ORBIT = 6;
/** 빈 초점 · 장축이 나타나는 동안. */
export const MIRROR = 4;
/** 끈이 걸리는 동안. */
export const TIE = 1;
/** 끈을 건 채 행성이 두 바퀴 가까이 도는 동안. */
export const STRING = 11;
/** 다음 주기로 넘어가며 끈과 빈 초점이 거둬지는 동안. */
export const FADE = 2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const keplersFirstLawMessages = Object.freeze({
  'label.title': { ko: '케플러 제1법칙', en: "Kepler's first law" },
  'label.stage': { ko: '이심률 0.6 궤도', en: 'Orbit with eccentricity 0.6' },
  'label.view': { ko: '두 초점', en: 'Two foci' },
  'label.sun': { ko: '태양', en: 'Sun' },
  'label.emptyFocus': { ko: '빈 초점', en: 'empty focus' },
  'label.center': { ko: '가운데', en: 'centre' },
  'label.string': { ko: '같은 끈을 곧게 펴면', en: 'The same string, laid straight' },
  'caption.orbit': {
    ko: '행성은 타원을 돈다 — 태양은 타원의 한가운데(+)가 아니라 한쪽으로 비켜 앉아 있다',
    en: 'The planet goes round an ellipse — the Sun sits off to one side, not at its middle (+)',
  },
  'caption.mirror': {
    ko: '가운데에서 태양만큼 반대쪽으로 가면 또 하나의 초점이 있다 — 그 자리는 비어 있다',
    en: 'Go just as far past the middle and there is a second focus — and nothing is there',
  },
  'caption.string': {
    ko: '태양에서 행성을 거쳐 빈 초점까지 끈을 이으면 — 행성이 어디에 있든 끈의 길이는 같다',
    en: 'Run a string from the Sun through the planet to the empty focus — wherever the planet is, the string is the same length',
  },
} satisfies Record<string, LocalizedText>);

export type KeplersFirstLawMessageKey = keyof typeof keplersFirstLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: KeplersFirstLawMessageKey): LocalizedText => keplersFirstLawMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: KeplersFirstLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const keplersFirstLawSchema: BundleSchema = {
  id: KEPLERS_FIRST_LAW_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다 — 이심률을 바꿔 보는 것은 이웃 조각(elliptical-orbit)의 질문이다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        semiMajor: SEMI_MAJOR,
        eccentricity: ECCENTRICITY,
        orbitsPerCycle: ORBITS_PER_CYCLE,
        meanAnomalyAtStart: MEAN_ANOMALY_AT_START,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓은 배치(타원 + 펼친 끈)와 캡션 한두 줄. 세로를 더 주면 그림만 작아진다. */
  canvas: { height: 380, minHeight: 340 },

  /** 끈은 궤도 위에, 태양 · 행성은 끈 위에 — 먼저 쓴 것이 아래다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 태양이 비켜 앉은 궤도 → 빈 초점 → 끈을 건다 → 끈을 건 채 돈다 → 거둔다.
   * 행성은 단계와 상관없이 케플러 운동으로 계속 돈다(한 주기에 `orbitsPerCycle` 바퀴).
   */
  timeline: {
    phases: [
      { id: 'orbit', duration: ORBIT, caption: key('caption.orbit') },
      { id: 'mirror', duration: MIRROR, ease: 'smooth', caption: key('caption.mirror') },
      { id: 'tie', duration: TIE, ease: 'smooth', caption: key('caption.string') },
      { id: 'string', duration: STRING, caption: key('caption.string') },
      { id: 'fade', duration: FADE, ease: 'smooth', caption: key('caption.string') },
    ],
  },

  /** 도착한 순간 행성은 이미 돌고 있다 — 근일점을 막 지나 태양에서 멀어지는 중이다. */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 끈의 길이는 거리이지만 잴 것은 값이 아니라
   * 「변하지 않는다」 는 것이라, 눈금 대신 끝이 고정된 펼친 끈이 그 일을 한다.
   */

  messages: keplersFirstLawMessages,
};
