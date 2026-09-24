// ========================================================================
// coulombs-law — 선언
// ========================================================================
// 질문: 두 전하 사이를 벌리면 힘은 얼마나 약해지는가.
//
// 답: 거리를 두 배로 하면 네 배, 세 배로 하면 아홉 배 약해진다 — 거리가 늘어난
// 배수의 **제곱**만큼. 같은 +전하 쌍 셋을 같은 거리 r 에 나란히 두고, 가운데 쌍을
// 2r 로, 아래 쌍을 3r 로 벌린다. 밀어내는 힘 화살표가 벌어지는 동안 줄어들어
// 처음 길이(점선)의 1/4 · 1/9 에 멈춘다.
//
// 이 조각은 크기에만 머문다. 밀고 당기는 방향(electric-charge), 여러 전하의
// 합(superposition-of-forces), 전기력선(field-lines)은 하지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:coulombs-law` 와 문자 그대로 일치한다 (C4). */
export const COULOMBS_LAW_ID = 'coulombs-law';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 쿨롱 상수(N·m²/C²). */
export const COULOMB_K = 8.99e9;
/** 두 전하의 크기(μC). 세 쌍이 모두 같다 — 바뀌는 것은 거리뿐이다. */
export const Q1_MICRO_C = 1;
export const Q2_MICRO_C = 1;
/** 기준 거리 r(m). 세 쌍이 모두 여기서 출발한다. */
export const BASE_DISTANCE = 0.3;
/** 세 쌍이 멈추는 거리의 배수 — 위 · 가운데 · 아래. 이 조각이 바꾸는 유일한 수다. */
export const RATIO_NEAR = 1;
export const RATIO_MID = 2;
export const RATIO_FAR = 3;
/**
 * 표시 배율 — 힘 1 N 을 화살표 몇 m 로 그리는가(m/N). 기준 거리 r 의 힘(약 0.1 N)이
 * 0.75 m 로 그려진다. 모든 화살표가 같은 배율이라 길이 비가 곧 힘의 비다.
 * 상한을 두지 않는다 — 가장 긴 화살표가 r 의 힘이고 그보다 가까워지는 일이 없다.
 */
export const ARROW_SCALE = 7.5;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 첫 전하 q₁ 은 세 줄 모두 x = 0 에 고정.
// ------------------------------------------------------------------------

/** 세 줄의 높이(월드 y). 위부터 거리 배수 RATIO_NEAR · MID · FAR 인 쌍. */
export const LANE_Y = [0.24, 0, -0.24] as const;
/** 전하 공의 반지름(m). 그림의 크기이지 물리량이 아니다 — 점전하로 푼다. */
export const CHARGE_RADIUS = 0.035;
/** 거리를 재는 치수선이 줄에서 내려앉는 거리(m). */
export const MEASURE_DROP = 0.075;
/** 등분 눈금의 반 높이(m). 화살표 이름표에 닿지 않도록 짧다. */
export const TICK_HALF = 0.02;

/**
 * 프레이밍 — 왼쪽 q₁ 부터 가장 먼 쌍(3r)의 점선 기준 화살표 끝까지, 위 줄 이름표부터
 * 아래 줄 치수선 · 캡션 띠까지. 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부).
 */
export const SCENE_BOUNDS = { minX: -0.12, maxX: 1.78, minY: -0.47, maxY: 0.38 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const coulombsLawMessages = Object.freeze({
  'label.title': { ko: '쿨롱 법칙', en: "Coulomb's law" },
  'label.stage': { ko: '벌어지는 세 쌍', en: 'Three pairs pulled apart' },
  'label.view': { ko: '세 줄', en: 'Three rows' },

  /** 전하 부호 표식. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'mark.plus': { ko: '+', en: '+' },
  /** 힘 · 거리 표식. 수식 표기라 번역 대상이 아니다. 배수는 스테이지 상수에서 끼운다. */
  'mark.force': { ko: 'F', en: 'F' },
  'mark.forceOver': { ko: 'F/{n}', en: 'F/{n}' },
  'mark.distance': { ko: 'r', en: 'r' },
  'mark.distanceTimes': { ko: '{n}r', en: '{n}r' },

  'caption.same': {
    ko: '세 쌍 모두 같은 전하, 같은 거리 r — 밀어내는 힘도 같다',
    en: 'Three identical pairs, all a distance r apart — each pushed equally hard',
  },
  'caption.moveMid': {
    ko: '가운데 쌍을 {mid}배 거리로 벌린다 — 힘 화살표가 빠르게 짧아진다',
    en: 'The middle pair is pulled out to {mid}× the distance — its force arrow shrinks fast',
  },
  'caption.holdMid': {
    ko: '거리 {mid}배 — 힘은 점선 길이를 {midParts}칸으로 나눈 한 칸이다',
    en: '{mid}× the distance — the force is one of {midParts} equal parts of the dashed length',
  },
  'caption.moveFar': {
    ko: '아래 쌍을 {far}배 거리로 벌린다',
    en: 'The lower pair is pulled out to {far}× the distance',
  },
  'caption.hold': {
    ko: '거리 {mid}배에 힘은 {midParts}칸 중 한 칸, {far}배에 {farParts}칸 중 한 칸에 멈췄다',
    en: 'At {mid}× the distance the force stops at one of {midParts} parts; at {far}×, at one of {farParts}',
  },
} satisfies Record<string, LocalizedText>);

export type CoulombsLawMessageKey = keyof typeof coulombsLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: CoulombsLawMessageKey): LocalizedText => coulombsLawMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CoulombsLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const coulombsLawSchema: BundleSchema = {
  id: COULOMBS_LAW_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 두 쌍이 차례로 벌어지고, 멈춘 그림을 보인 뒤 다시 모인다.
  parameters: [],

  stages: [
    {
      id: 'three-pairs',
      label: text('label.stage'),
      constants: {
        k: COULOMB_K,
        q1MicroC: Q1_MICRO_C,
        q2MicroC: Q2_MICRO_C,
        r: BASE_DISTANCE,
        ratioNear: RATIO_NEAR,
        ratioMid: RATIO_MID,
        ratioFar: RATIO_FAR,
        arrowScale: ARROW_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rows', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 가장 먼 쌍의 기준 화살표까지 1.9 m. 세로는 세 줄과 캡션이면 된다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 한 주기.
   *
   * - `appear` — 세 쌍이 떠오른다. 앞 주기의 흐려짐에서 잇는다.
   * - `same` — 세 쌍이 모두 r. 화살표 셋의 길이가 같다.
   * - `move-mid` — 가운데 쌍의 q₂ 가 r → 2r 로 미끄러진다. 화살표가 연속해서 준다.
   * - `hold-mid` — 네 칸 중 한 칸에 멈춘 모습을 읽는다.
   * - `move-far` — 아래 쌍이 r → 3r. 아홉 칸 중 한 칸까지 준다.
   * - `hold` · `fade` — 세 줄을 나란히 견준다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.5, caption: key('caption.same') },
      { id: 'same', duration: 1.8, caption: key('caption.same') },
      { id: 'move-mid', duration: 2.2, ease: 'inOutCubic', caption: key('caption.moveMid') },
      { id: 'hold-mid', duration: 1.6, caption: key('caption.holdMid') },
      { id: 'move-far', duration: 2.4, ease: 'inOutCubic', caption: key('caption.moveFar') },
      { id: 'hold', duration: 3.8, caption: key('caption.hold') },
      { id: 'fade', duration: 0.6, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 가운데 쌍이 곧 벌어지기 시작하는 자리에서 연다. */
  startAt: 1.8,

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    /** 배수 · 칸 수는 스테이지 상수에서 온다 — 문안에 박지 않는다 (원칙 2). */
    vars: { mid: 'midRatio', far: 'farRatio', midParts: 'midParts', farParts: 'farParts' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 것은 미터가 아니라 기준 길이의
  // 몇 칸인가라서, 거리 격자는 다른 질문을 끼워 넣는다 (S-piece).

  messages: coulombsLawMessages,
};
