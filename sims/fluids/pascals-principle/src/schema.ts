// ========================================================================
// pascals-principle — 선언
// ========================================================================
// 질문: 좁은 피스톤을 누른 힘이 넓은 피스톤에서는 왜 커지는가 — 그리고 그 값은 무엇인가.
//
// U 자 유압관. 왼쪽은 폭 w 의 좁은 실린더, 오른쪽은 폭 N·w 의 넓은 실린더이고 아래가
// 이어져 물이 닫혀 있다. 작은 피스톤을 F 로 누르면 두 피스톤 밑면에 **같은 길이의**
// 압력 화살표가 폭 w 마다 하나씩 선다 — 왼쪽 하나, 오른쪽 N 개. 같은 압력이 N 배 넓이를
// 떠받치니 힘은 N 배다. 누르는 동안 작은 피스톤은 d 내려가고 큰 피스톤은 d/N 만 오른다.
//
// 이웃과 겹치지 않는다. 깊이에 정비례는 `hydrostatic-pressure`, 방향과 무관함은
// `pressure-isotropy`, 힘과 거리의 맞바꿈 일반은 `mechanical-advantage` 의 몫이다.
// 이 조각은 「닫힌 유체에 가한 압력은 어디에나 같게 전해져, 넓이가 N 배인 피스톤은
// N 배 힘으로 밀려 오른다 — 대신 1/N 만큼만 오른다」 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pascals-principle` 와 문자 그대로 일치한다 (C4). */
export const PASCALS_PRINCIPLE_ID = 'pascals-principle';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 넓이 비 N (큰 피스톤 폭 ÷ 작은 피스톤 폭). 정수라야 압력 화살표가 폭을 고르게 채운다. */
export const RATIO = 4;
/** 작은 피스톤이 내려가는 거리 d(월드 m). 큰 피스톤은 d/N 오른다. */
export const STROKE = 1.0;
/** 작은 피스톤의 폭 w(월드 m). 압력 화살표 하나가 떠받치는 폭이기도 하다. */
export const SMALL_WIDTH = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 두 피스톤이 쉬는 높이(처음 수면)가 y = 0 이다.
// ------------------------------------------------------------------------

/** 작은 실린더의 왼쪽 벽 x. 오른쪽 벽은 여기에 w 를 더한 자리다. */
export const SMALL_LEFT = -2.6;
/** 큰 실린더의 왼쪽 벽 x. 오른쪽 벽은 여기에 N·w 를 더한 자리다. */
export const LARGE_LEFT = -0.9;
/** 두 실린더를 잇는 아래 통로의 위 · 아래 면. */
export const CHANNEL_TOP = -1.2;
export const CHANNEL_BOTTOM = -1.6;
/** 실린더 벽의 위 끝. */
export const WALL_TOP = 0.5;

/** 피스톤 판의 두께(m). */
export const PISTON_THICK = 0.16;
/** 큰 피스톤이 들어 올리는 짐 — 폭 · 높이(m). */
export const LOAD_WIDTH = 1.4;
export const LOAD_HEIGHT = 0.46;

/** 작은 피스톤을 누르는 손의 힘 F 화살표 길이(m). 힘은 길이가 아니라 개수로 견준다. */
export const PUSH_LENGTH = 0.65;
/** 압력 화살표 길이(m). **모든 화살표가 같은 길이** — 압력이 어디에나 같다는 그림이다. */
export const PRESSURE_LENGTH = 0.5;
/** 압력 화살표 머리와 피스톤 밑면 사이의 틈(m). 머리가 판에 묻히지 않게. */
export const PRESSURE_GAP = 0.04;

/** 치수선(d · d/N)을 실린더 바깥으로 띄우는 거리(m). */
export const DIM_OFFSET = 0.28;

/**
 * 프레이밍은 주장의 일부다. 가로는 왼쪽 치수선부터 오른쪽 치수선 · 힘 이름표까지,
 * 세로는 손의 힘 화살표 위 끝부터 통로 바닥 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.1, maxX: 1.75, minY: -2.0, maxY: 0.95 } as const;

// ------------------------------------------------------------------------
// 시간표 — 길이의 기본값 (단계 경계는 scene · physics 가 timeline 에게 묻는다)
// ------------------------------------------------------------------------

/** 손이 누르기 시작해 압력 화살표가 두 피스톤 밑에 서는 동안(초). 피스톤은 아직 그대로다. */
export const PRESS = 1.2;
/** 두 피스톤이 움직이는 동안. 작은 쪽 d, 큰 쪽 d/N. */
export const STROKE_TIME = 3.0;
/** 다 누른 채 멈춰 N 배 힘과 1/N 거리를 읽는 동안. 주장이 마무리되는 자리라 길게 둔다. */
export const HOLD = 3.4;
/** 손을 떼어 두 피스톤이 제자리로 돌아가는 동안. */
export const RELEASE = 1.3;
/** 다음 주기 전의 쉼. */
export const REST = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const pascalsPrincipleMessages = Object.freeze({
  'label.title': { ko: '파스칼 원리', en: "Pascal's principle" },
  'label.operation': { ko: '압력의 전달과 유압 장치', en: 'Transmitted pressure and the hydraulic press' },
  'label.stage': { ko: '유압 장치', en: 'Hydraulic press' },
  'label.view': { ko: '옆에서 본 유압관', en: 'Hydraulic press from the side' },
  /**
   * 이름표. 힘 F · 거리 d 는 수식 기호라 번역 대상이 아니다 (C1 판정 3).
   * `{n}` 은 넓이 비 — 스테이지 상수 `ratio` 에서 끼운다.
   */
  'label.forceSmall': { ko: 'F', en: 'F' },
  'label.forceLarge': { ko: '{n}F', en: '{n}F' },
  'label.strokeSmall': { ko: 'd', en: 'd' },
  'label.strokeLarge': { ko: 'd/{n}', en: 'd/{n}' },
  'caption.press': {
    ko: '작은 피스톤을 F 로 누르면, 그 압력이 물을 따라 큰 피스톤 밑까지 똑같이 전해진다',
    en: 'Push the small piston with F, and the same pressure reaches all the way under the big piston',
  },
  'caption.stroke': {
    ko: '작은 피스톤이 깊이 내려가는 동안 큰 피스톤은 조금만 올라간다',
    en: 'The small piston sinks a long way while the big one rises only a little',
  },
  'caption.hold': {
    ko: '넓이가 {n}배라 같은 압력이 {n}배 힘({n}F)으로 밀어 올린다 — 대신 오른 거리는 d/{n}',
    en: 'With {n}× the area, the same pressure pushes up with {n}× the force ({n}F) — but it rises only d/{n}',
  },
  'caption.release': {
    ko: '손을 떼면 두 피스톤이 제자리로 돌아간다',
    en: 'Let go, and both pistons settle back',
  },
} satisfies Record<string, LocalizedText>);

export type PascalsPrincipleMessageKey = keyof typeof pascalsPrincipleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PascalsPrincipleMessageKey): LocalizedText => pascalsPrincipleMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PascalsPrincipleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pascalsPrincipleSchema: BundleSchema = {
  id: PASCALS_PRINCIPLE_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 손이 누르고, 두 피스톤이 움직이고, 멈추고, 돌아간다.
  parameters: [],

  stages: [
    {
      id: 'press',
      label: text('label.stage'),
      constants: { ratio: RATIO, stroke: STROKE, smallWidth: SMALL_WIDTH },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 세로가 비싸다 — 유압관은 가로로 눕히고 세로는 행정 d 가 들어갈 만큼만 쓴다. */
  canvas: { height: 400, minHeight: 360 },

  /**
   * 겹침이 판정 장치다. 옮겨 간 물(강조)은 물 **위**, 피스톤 · 화살표 **아래** 에 깔려야
   * 한다. 층 순서로는 `region` 이 물체와 화살표 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 누름(압력이 선다) → 행정(작은 쪽 d, 큰 쪽 d/N) → 멈춤 → 돌아감 → 쉼.
   * 압력이 서는 단계를 피스톤이 움직이기 **전에** 따로 둔다 — 전달은 움직임의 결과가
   * 아니라 누르는 순간의 일이다.
   */
  timeline: {
    phases: [
      { id: 'press', duration: PRESS, ease: 'smooth', caption: key('caption.press') },
      { id: 'stroke', duration: STROKE_TIME, ease: 'smooth', caption: key('caption.stroke') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'release', duration: RELEASE, ease: 'smooth', caption: key('caption.release') },
      { id: 'rest', duration: REST, caption: key('caption.release') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 압력 화살표가 거의 다 선 자리에서 연다.
   * 0 이면 아무 화살표 없는 두 피스톤이 먼저 보인다.
   */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 넓이 비는 스테이지 상수에서 온다. 자릿수는 initialState 가 정해 문자열로 둔다.
    vars: { n: 'ratioText' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 미터가 아니라 **d 와 d/N 두
   * 거리**라 치수선 둘만 긋는다.
   */

  messages: pascalsPrincipleMessages,
};
