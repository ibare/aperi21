// ========================================================================
// surface-tension — 선언
// ========================================================================
// 질문: 물보다 무거운 바늘이 어떻게 물 위에 떠 있는가.
//
// 바늘 단면 하나를 물 위에 살며시 놓는다. 수면이 오목하게 휘고, 막이 양쪽에서
// 수면을 따라 바늘을 당긴다. 당기는 힘 T 의 크기는 늘 같다 — 휘어진 만큼 방향이
// 위로 돌아설 뿐이다. 위에서 눌러 더 휘게 하면 T 가 더 위를 향해 더 받치고, 막이
// 곧추선 뒤로는 더 돌아설 방향이 없어 뚫린다.
//
// 곡률이 만드는 압력차(`laplace-pressure`) · 표면에 따른 접촉각(`wetting-and-contact-angle`)
// 은 뒤 조각의 몫이라 여기서 말하지 않는다. 이 조각은 「표면이 막처럼 당긴다」 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:surface-tension` 와 문자 그대로 일치한다 (C4). */
export const SURFACE_TENSION_ID = 'surface-tension';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이는 모세관 길이 lc 를 1 로 잰 단위, 힘은 단위 길이당 표면 장력 γ 를 1 로 잰 단위다.
// ------------------------------------------------------------------------

/** 표면 장력 γ — 막이 한쪽에서 당기는 힘(바늘 단위 길이당). 화살표 T 의 크기다. */
export const TENSION = 1;
/** 바늘의 무게(단위 길이당). γ 의 1.1 배 — 막 두 쪽이 33.4° 기울어 받친다(sin φ = mg/2γ). */
export const WEIGHT = 1.1;
/** 모세관 길이 lc = √(γ/ρg). 파인 수면이 얼마나 멀리까지 번지는지를 정한다. */
export const CAP_LENGTH = 1;
/** 바늘 단면 반지름(lc 단위). 실제 바늘보다 크게 그려 둘레가 읽히게 한다. */
export const NEEDLE_RADIUS = 0.4;
/** 내려놓기 시작할 때 바늘 밑면의 높이(수면 위, lc 단위). */
export const DROP_HEIGHT = 0.5;
/** 뚫린 뒤 바늘이 가라앉는 깊이(바늘 중심, 수면 아래). */
export const SINK_DEPTH = 2.1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(lc)
// ------------------------------------------------------------------------

/** T 화살표 길이 = γ × 이 배율. F 화살표도 같은 배율이라 길이끼리 견줄 수 있다. */
export const FORCE_SCALE = 1.1;
/** 물의 가로 끝 · 바닥. 프레이밍보다 넓게 깔아 끝이 비치지 않게 한다. */
export const WATER_HALF_WIDTH = 6;
export const WATER_BOTTOM = -3.4;

/**
 * 프레이밍은 주장의 일부다. 세로는 누르는 힘 F 꼬리의 가장 높은 자리(약 1.5, 캡션 줄
 * 포함)부터 가라앉은 바늘 밑까지이고, 이것이 배율을 정한다. 가로는 파인 수면이 잦아드는
 * 곳까지 — 넓은 임베드에서는 그 너머 평평한 수면이 더 보일 뿐이다. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.6, maxX: 3.6, minY: -2.6, maxY: 2.05 } as const;

// ------------------------------------------------------------------------
// 시간표 길이 (초)
// ------------------------------------------------------------------------

export const DROP = 0.9;
export const SETTLE = 1.3;
export const HOLD = 3.2;
export const PRESS = 3.4;
export const LIMIT = 1.4;
export const SINK = 1.6;
export const FADE = 0.7;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const surfaceTensionMessages = Object.freeze({
  'label.title': { ko: '표면 장력', en: 'Surface tension' },
  'label.operation': { ko: '표면을 줄이려는 힘', en: 'The pull that shrinks a surface' },
  'label.stage': { ko: '물 위의 바늘', en: 'Needle on water' },
  'label.view': { ko: '단면', en: 'Cross-section' },
  /** 화살표 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.tension': { ko: 'T', en: 'T' },
  'label.load': { ko: 'F', en: 'F' },
  'caption.drop': {
    ko: '바늘 하나를 물 위에 살며시 내려놓는다',
    en: 'A needle is laid gently on the water',
  },
  'caption.settle': {
    ko: '수면이 오목하게 휘며 막처럼 바늘을 받쳐 든다',
    en: 'The surface dips and holds the needle up like a stretched sheet',
  },
  'caption.hold': {
    ko: '막이 양쪽에서 수면을 따라 당긴다 — 위쪽 몫(점선) 둘을 합치면 누르는 힘 F 와 같다',
    en: 'The film pulls along the surface on both sides — its two upward parts (dashed) add up to the load F',
  },
  'caption.press': {
    ko: '위에서 누를수록 더 휜다 — T 의 크기는 그대로, 방향만 위로 돌아선다',
    en: 'Press harder and it dips deeper — T keeps its size and only turns upward',
  },
  'caption.limit': {
    ko: '막이 곧추섰다 — T 가 모두 위를 향해 이보다 더 받칠 수 없다',
    en: 'The film stands upright — T points straight up and cannot hold any more',
  },
  'caption.sink': {
    ko: '더 돌아설 방향이 없다 — 막이 뚫리고 바늘이 가라앉는다',
    en: 'There is no further to turn — the film gives way and the needle sinks',
  },
} satisfies Record<string, LocalizedText>);

export type SurfaceTensionMessageKey = keyof typeof surfaceTensionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SurfaceTensionMessageKey): LocalizedText => surfaceTensionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SurfaceTensionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const surfaceTensionSchema: BundleSchema = {
  id: SURFACE_TENSION_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 놓이고, 받쳐지고, 눌리고, 뚫린다. 아무것도 누르지 않아도 끝난다.
  parameters: [],

  stages: [
    {
      id: 'needle-on-water',
      label: text('label.stage'),
      constants: {
        tension: TENSION,
        weight: WEIGHT,
        capLength: CAP_LENGTH,
        needleRadius: NEEDLE_RADIUS,
        dropHeight: DROP_HEIGHT,
        sinkDepth: SINK_DEPTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 세로 4.65 를 담는다. 세로가 배율을 정하는 그림이라 기본(360)보다 조금 높인다. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 가라앉은 바늘은 **물 아래** 로 비쳐야 「잠겼다」 로 읽히고,
   * 수면 막 선은 물 면 **위** 로 그어져야 막으로 읽힌다. 층 순서로는 궤적(20)이 물(45)
   * 아래로 깔려 막 선이 반쯤 묻힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 내려놓음 → 받쳐짐 → 읽기 → 누름 → 곧추섬 → 뚫림 → 흐려짐.
   *
   * 누름은 `smooth` 로 끝을 늦춘다 — 곧추서기 직전 각이 가장 빨리 변하는데(asin),
   * 그 순간이 이 조각이 보여야 하는 자리다.
   */
  timeline: {
    phases: [
      { id: 'drop', duration: DROP, ease: 'smooth', caption: key('caption.drop') },
      { id: 'settle', duration: SETTLE, ease: 'smooth', caption: key('caption.settle') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'press', duration: PRESS, ease: 'smooth', caption: key('caption.press') },
      { id: 'limit', duration: LIMIT, caption: key('caption.limit') },
      { id: 'sink', duration: SINK, ease: 'smooth', caption: key('caption.sink') },
      { id: 'fade', duration: FADE, caption: key('caption.sink') },
    ],
  },

  /** 도착한 순간 바늘이 이미 수면을 향해 내려오는 중이다. 0 이면 멈춘 바늘이 먼저 보인다. */
  startAt: 0.35,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 아래는 물이 덮고 가운데 위로는 누르는 힘 F 가 서므로 왼쪽 위에 둔다.
  caption: {
    anchor: { screen: 'top-left', offset: [12, 10] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 300,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **방향**(T 가 얼마나 위로
   * 돌았나)과 길이 비(점선 둘 = F)라 거리 격자는 다른 질문을 부른다.
   */

  messages: surfaceTensionMessages,
};
