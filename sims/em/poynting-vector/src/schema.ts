// ========================================================================
// poynting-vector — 선언
// ========================================================================
// 질문: 전지가 저항을 데울 때, 에너지는 어느 길로 건너가는가 — 도선 속인가?
//
// 전지와 저항을 두 도선으로 잇는다. 도선 둘레 공간 여러 자리에 전기장 E(+ 도선에서
// − 도선 쪽) · 자기장 B(도선을 감는 고리) · 포인팅 벡터 S 를 차례로 세운다. S 는 E 와
// B 모두에 수직이고, 어느 자리에서나 저항 쪽을 가리킨다. 마지막에 S 를 따라 흐르는
// 에너지 알갱이가 전지 틈에서 나와 도선 **바깥 공간**을 지나 저항 몸통으로 모여 든다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:poynting-vector` 와 문자 그대로 일치한다 (C4). */
export const POYNTING_VECTOR_ID = 'poynting-vector';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 = 1 m 로 계산한다.
// ------------------------------------------------------------------------

/** 전지 전압(V). E 가 이것을 따라간다. */
export const VOLTAGE = 6;
/** 회로 전류(A). B 가 이것을 따라간다. */
export const CURRENT = 2;

/** 도선 높이(± m). 위 도선이 + 쪽, 아래 도선이 − 쪽이다. */
export const WIRE_Y = 1;
/** 전지(왼쪽) · 저항(오른쪽)이 선 자리(± m). */
export const LOOP_HALF_WIDTH = 4;
/** 전지 두 판 사이 틈의 반(m). 계산 격자(0.1 m)의 배수로 둔다. */
export const BATTERY_GAP_HALF = 0.2;
/** 저항 몸통의 반 길이(m). 계산 격자의 배수로 둔다. */
export const RESISTOR_HALF = 0.6;

/** 관찰 기둥 수 · 간격(m). 가운데 기둥이 x = 0 이다. */
export const STATION_COUNT = 3;
export const STATION_SPACING = 2.4;
/** 관찰 자리가 도선에서 떨어진 거리(m) = B 고리의 반지름. 도선 안쪽 · 바깥쪽에 한 자리씩. */
export const PROBE_REACH = 0.45;

/**
 * 도선 사이 흐름선 수 · 바깥 흐름선 수(위 · 아래 각각). 바깥 흐름선은 기본 0 이다 — 도선 전위에
 * 바짝 붙은 등전위선(0.97 V)도 평면 풀이에서는 도선 위 2.6 m 까지 부풀어 프레임을 두 배로 키운다.
 * 바깥으로 가는 흐름은 바깥 관찰 자리의 짧은 S 화살표가 말한다 (NOTES b). 켜면 고정 경계를 넘는다.
 */
export const INNER_LINES = 5;
export const OUTER_LINES = 0;
/** 바깥 흐름선이 타는 등전위 간격(V 에 대한 비). 도선 전위에서 이만큼씩 들어간 선이다. */
export const OUTER_LEVEL_STEP = 0.03;

/** 표시 배율 — E(V/m) → 화살표 길이(m) · S(W/m²) → 화살표 길이(m). */
export const E_ARROW_SCALE = 0.12;
export const S_ARROW_SCALE = 0.3;
/** 화살표 길이 상한(m). 이 조각의 관찰 자리에서는 걸리지 않는다(NOTES b). */
export const ARROW_MAX = 1.2;

/** 에너지 알갱이가 흐름선을 따라가는 속력(m/s) · 간격(m). S 의 크기를 따르지 않는다(NOTES b). */
export const DOT_SPEED = 0.8;
export const DOT_GAP = 0.6;

// ------------------------------------------------------------------------
// 프레이밍 — 매 프레임 같은 값 (원칙 6)
// ------------------------------------------------------------------------

/**
 * 가로는 전지 판(−4.3)부터 저항 너머까지, 세로는 바깥 관찰 자리(±1.45)의 표식까지.
 * 아래에 캡션 띠를 더 둔다 (G24).
 */
export const SCENE_BOUNDS = { minX: -4.6, maxX: 4.6, minY: -2.45, maxY: 1.8 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 장이 나타나는 짧은 단계 · 나타난 장을 읽는 단계. */
const APPEAR = 0.5;
const READ_E = 2;
const READ_B = 2.2;
const READ_S = 2.6;
/** 흐름이 켜지는 동안 · 흐르는 동안 · 다음 주기로 흐려지는 동안. */
const FLOW_IN = 0.6;
const FLOW = 5.5;
const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const poyntingVectorMessages = Object.freeze({
  'label.title': { ko: '포인팅 벡터', en: 'Poynting vector' },
  'label.stage': { ko: '전지와 저항', en: 'Battery and resistor' },
  'label.view': { ko: '회로 평면', en: 'Circuit plane' },
  /** 장 · 전류 기호와 전지 극 표식. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.e': { ko: 'E', en: 'E' },
  'label.b': { ko: 'B', en: 'B' },
  'label.s': { ko: 'S', en: 'S' },
  'label.i': { ko: 'I', en: 'I' },
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'caption.e': {
    ko: '두 도선 사이에는 + 도선에서 − 도선 쪽으로 전기장 E 가 선다',
    en: 'Between the wires an electric field E points from the + wire toward the − wire',
  },
  'caption.b': {
    ko: '전류가 흐르는 도선마다 둘레를 감는 자기장 B 의 고리가 생긴다',
    en: 'Around each current-carrying wire the magnetic field B wraps in loops',
  },
  'caption.s': {
    ko: 'S 는 E 와 B 모두에 수직이다 — 도선 사이 어느 자리에서나 저항 쪽을 가리킨다',
    en: 'S is perpendicular to both E and B — everywhere between the wires it points toward the resistor',
  },
  'caption.flow': {
    ko: '에너지는 도선 속이 아니라 둘레 공간을 지나 전지에서 저항으로 들어간다',
    en: 'Energy leaves the battery and enters the resistor through the space around the wires, not inside them',
  },
} satisfies Record<string, LocalizedText>);

export type PoyntingVectorMessageKey = keyof typeof poyntingVectorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PoyntingVectorMessageKey): LocalizedText => poyntingVectorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PoyntingVectorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const poyntingVectorSchema: BundleSchema = {
  id: POYNTING_VECTOR_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 장이 서고, S 가 서고, 에너지가 흐른다.
  parameters: [],

  stages: [
    {
      id: 'battery-resistor',
      label: text('label.stage'),
      constants: {
        voltage: VOLTAGE,
        current: CURRENT,
        wireY: WIRE_Y,
        loopHalfWidth: LOOP_HALF_WIDTH,
        batteryGapHalf: BATTERY_GAP_HALF,
        resistorHalf: RESISTOR_HALF,
        stationCount: STATION_COUNT,
        stationSpacing: STATION_SPACING,
        probeReach: PROBE_REACH,
        innerLines: INNER_LINES,
        outerLines: OUTER_LINES,
        outerLevelStep: OUTER_LEVEL_STEP,
        eArrowScale: E_ARROW_SCALE,
        sArrowScale: S_ARROW_SCALE,
        arrowMax: ARROW_MAX,
        dotSpeed: DOT_SPEED,
        dotGap: DOT_GAP,
      },
    },
  ],

  environments: [],

  views: [{ id: 'circuit-plane', label: text('label.view'), default: true }],

  /** 가로 9.2 m · 세로 4.25 m. 세로가 비싸다 — 두 도선과 바깥 관찰 자리까지만 담는다. */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. B 고리의 뒤 반쪽은 도선 **아래**, 앞 반쪽은 도선 **위**로 지나야
   * 고리가 도선을 감는 것으로 읽힌다. 층 순서로는 둘을 도선 사이에 끼울 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = E 가 선다 → B 고리가 선다 → S 가 선다 → 에너지가 S 를 따라 흐른다 → 흐려짐.
   * 나타나는 단계를 따로 두어 페이드를 코드로 가르지 않는다 (S-piece).
   */
  timeline: {
    phases: [
      { id: 'eIn', duration: APPEAR, ease: 'smooth', caption: key('caption.e') },
      { id: 'eHold', duration: READ_E, caption: key('caption.e') },
      { id: 'bIn', duration: APPEAR, ease: 'smooth', caption: key('caption.b') },
      { id: 'bHold', duration: READ_B, caption: key('caption.b') },
      { id: 'sIn', duration: APPEAR, ease: 'smooth', caption: key('caption.s') },
      { id: 'sHold', duration: READ_S, caption: key('caption.s') },
      { id: 'flowIn', duration: FLOW_IN, ease: 'smooth', caption: key('caption.flow') },
      { id: 'flow', duration: FLOW, caption: key('caption.flow') },
      { id: 'fade', duration: FADE, ease: 'smooth', caption: key('caption.flow') },
    ],
  },

  /** 도착한 순간 이미 흐르는 중이다 — 세 장과 에너지 흐름이 모두 서 있는 자리에서 연다. */
  startAt: APPEAR * 3 + READ_E + READ_B + READ_S + FLOW_IN + 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 640,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **방향**이다.
   */

  messages: poyntingVectorMessages,
};
