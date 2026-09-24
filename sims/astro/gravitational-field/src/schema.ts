// ========================================================================
// gravitational-field — 선언
// ========================================================================
// 질문: 힘은 두 물체 사이의 것인데, 「장」 이란 무엇인가.
//
// 행성 하나가 둘레 **모든 자리**에 화살표를 미리 깔아 둔다 — 가까울수록 길고 멀수록
// 짧다. 그 위 세 자리에 작은 질량을 놓으면, 저마다 **제자리 화살표 방향으로** 끌려
// 간다. 질량이 떠난 자리에도 화살표는 그대로 남는다 — 장은 질량이 오기 전부터 있었다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gravitational-field` 와 문자 그대로 일치한다 (C4). */
export const GRAVITATIONAL_FIELD_ID = 'gravitational-field';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 임의 길이(행성 반지름의 1.25 배가 1)이고, 시간은 초다.
// ------------------------------------------------------------------------

/** 행성의 GM(월드³/초²). 가장 먼 시험 질량이 약 2.8 초에 닿는 세기다. */
export const GM = 8;
/** 행성 반지름(월드). 시험 질량은 이 표면에 닿으면 멈춘다. */
export const PLANET_RADIUS = 0.8;
/**
 * 장 화살표의 길이 배율(월드 길이 per 가속도). 화살표 길이 = 배율 × GM / r².
 * 길이 자체가 그 자리의 세기다 — 가장 먼 모서리 화살표도 머리가 보일 만큼 잡았다.
 */
export const ARROW_SCALE = 0.4;
/**
 * 화살표 길이 상한(월드). 격자 간격(1)보다 짧아 이웃 화살표와 겹치지 않는다.
 * 행성 바로 곁 한 겹(8개)만 이 상한에 걸린다 — NOTES (b).
 */
export const ARROW_MAX = 0.75;
/** 격자 간격(월드). 화살표는 반 칸 어긋난 자리(±0.5, ±1.5 …)에 놓인다. */
export const GRID_STEP = 1;
/**
 * 격자 반폭 · 반높이(칸 수). 가로 10 칸 × 세로 4 칸. 세로가 비싸다 — 줄을 더 두면 그림 전체가
 * 작아져 먼 자리 화살표와 시험 질량이 받는 화살표가 점 크기로 줄어든다.
 */
export const GRID_HALF_COLS = 5;
export const GRID_HALF_ROWS = 2;
/** 행성 표면에서 이만큼 안쪽에 드는 격자 자리는 비운다(월드). */
export const GRID_CLEARANCE = 0.3;

/**
 * 세 시험 질량이 놓이는 자리 — 모두 격자 자리 위다. 놓이는 순간 그 자리의 화살표가
 * 곧 그 질량이 받는 화살표라는 것이 이 그림의 요점이다. 멀고(오른쪽 위) · 중간(왼쪽
 * 아래) · 가까운(오른쪽 아래) 세 곳이라 끌리는 세기와 닿는 시각이 갈린다.
 */
export const PROBE_A: readonly [number, number] = [3.5, 1.5];
export const PROBE_B: readonly [number, number] = [-2.5, -1.5];
export const PROBE_C: readonly [number, number] = [1.5, -1.5];
/** 시험 질량 크기(월드 반지름). 행성과 크기로 갈린다 — 「작은 질량」. */
export const PROBE_RADIUS = 0.1;

/** 낙하 적분 걸음(초). 고정 걸음이라 같은 시각은 언제나 같은 자리다. */
export const FALL_DT = 1 / 240;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 격자 10 × 4 칸을 담고, 아래에 캡션 띠를 남긴다
 * (캡션 슬롯이 프레이밍 여백으로 잡히지 않는다 — 장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.1, maxX: 5.1, minY: -2.55, maxY: 1.8 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// ------------------------------------------------------------------------

/** 장만 깔린 그림을 읽는 동안. */
export const FIELD_HOLD = 2.5;
/** 세 질량이 제자리에 나타나는 동안. */
export const PLACE = 1.6;
/** 끌려가는 동안 — 가장 먼 질량(A)이 닿는 약 2.8 초보다 조금 길다. */
export const FALL = 3.4;
/** 다 닿은 뒤, 질량이 떠난 자리를 읽는 동안. */
export const HOLD = 2.6;
/** 다음 주기로 넘어가며 질량이 사라지는 동안. */
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gravitationalFieldMessages = Object.freeze({
  'label.title': { ko: '중력장', en: 'Gravitational field' },
  'label.stage': { ko: '행성 하나', en: 'One planet' },
  'label.view': { ko: '장', en: 'Field' },
  'caption.field': {
    ko: '행성 둘레 모든 자리에 화살표가 깔려 있다 — 가까울수록 길고, 멀수록 짧다',
    en: 'Every spot around the planet already holds an arrow — longer up close, shorter far away',
  },
  'caption.place': {
    ko: '세 자리에 작은 질량을 놓는다 — 저마다 제자리 화살표를 받는다',
    en: 'Put a small mass at three spots — each one takes the arrow already there',
  },
  'caption.fall': {
    ko: '셋은 각자 제자리 화살표 방향으로 끌려가고, 가까워질수록 받는 화살표가 길어진다',
    en: 'Each is pulled along the arrow where it sits, and its arrow grows as it closes in',
  },
  'caption.hold': {
    ko: '질량이 떠난 자리에도 화살표는 그대로다 — 장은 질량이 오기 전부터 있었다',
    en: 'The arrows stay where the masses left — the field was there before they came',
  },
} satisfies Record<string, LocalizedText>);

export type GravitationalFieldMessageKey = keyof typeof gravitationalFieldMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GravitationalFieldMessageKey): LocalizedText => gravitationalFieldMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GravitationalFieldMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gravitationalFieldSchema: BundleSchema = {
  id: GRAVITATIONAL_FIELD_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 장이 깔려 있고, 질량이 놓이고, 끌려간다.
  parameters: [],

  stages: [
    {
      id: 'one-planet',
      label: text('label.stage'),
      constants: {
        gm: GM,
        planetRadius: PLANET_RADIUS,
        arrowScale: ARROW_SCALE,
        arrowMax: ARROW_MAX,
        gridStep: GRID_STEP,
        gridHalfCols: GRID_HALF_COLS,
        gridHalfRows: GRID_HALF_ROWS,
        gridClearance: GRID_CLEARANCE,
        probeAX: PROBE_A[0],
        probeAY: PROBE_A[1],
        probeBX: PROBE_B[0],
        probeBY: PROBE_B[1],
        probeCX: PROBE_C[0],
        probeCY: PROBE_C[1],
        probeRadius: PROBE_RADIUS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'field', label: text('label.view'), default: true }],

  /** 가로로 넓은 격자(10 × 4 칸)와 캡션 한두 줄. 세로를 더 주면 그림만 작아진다. */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 지나온 길(점선)은 격자 화살표 **아래**, 시험 질량이 받는
   * 강조 화살표는 격자 화살표 **위**에 놓여야 「이 자리 화살표를 받는다」 가 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 장만 → 질량을 놓음 → 끌려감 → 떠난 자리 → 흐려짐.
   * 닿는 순간은 단계 경계가 아니라 물리(낙하 적분)가 정한다.
   */
  timeline: {
    phases: [
      { id: 'field', duration: FIELD_HOLD, caption: key('caption.field') },
      { id: 'place', duration: PLACE, ease: 'smooth', caption: key('caption.place') },
      { id: 'fall', duration: FALL, caption: key('caption.fall') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 장은 첫 프레임부터 온전히 깔려 있고, 1.5 초 뒤
   * 질량이 놓이기 시작한다. 0 이면 움직임 없는 그림을 2.5 초 기다린다.
   */
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
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **화살표 길이의 견줌**이라
   * 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다. 화살표가 놓인 반 칸
   * 어긋난 자리 자체가 이 그림의 격자다.
   */

  messages: gravitationalFieldMessages,
};
