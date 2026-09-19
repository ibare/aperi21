// ========================================================================
// self-inductance — 선언
// ========================================================================
// 질문: 코일에 흐르던 전류를 스위치로 끊으면 무슨 일이 일어나는가.
//
// 전지 · 코일 · 스위치가 한 고리다. 스위치가 닫혀 전류가 일정하게 흐르는 동안 코일
// 양 끝의 전압은 0 이다 — 전류가 **크다** 는 것만으로는 아무 일도 없다. 스위치를 끊는
// 순간 전류가 짧은 시간에 0 으로 떨어진다. 코일은 흐르던 전류를 이어 가려고 전지
// 전압을 훌쩍 넘는 전압을 만들고, 그 전압이 벌어진 틈을 건너 불꽃을 튀긴다. 전류가
// 0 에 멈추면 전압도 0 이다 — 치솟은 것은 전류가 **바뀌던** 순간뿐이다.
//
// 스위치를 닫을 때 전류가 서서히 차오르는 곡선은 이웃 `rl-circuit` 의 몫이다 — 여기서는
// 닫힌 뒤 일정해진 전류에서 시작한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:self-inductance` 와 문자 그대로 일치한다 (C4). */
export const SELF_INDUCTANCE_ID = 'self-inductance';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전지 전압(V). 화면의 `6 V` 이름표와 기록지의 기준 점선이 이 값을 그대로 쓴다. */
export const EMF = 6;
/** 회로 저항(Ω). 닫혀 있을 때의 일정한 전류 = 전지 전압 ÷ 저항. */
export const RESISTANCE = 6;
/** 코일의 인덕턴스(H). */
export const INDUCTANCE = 10;
/**
 * 끊는 시간(초) — 끊은 뒤 전류가 처음 값의 1/e 로 줄어드는 시간. 전류는 이 시간 상수로
 * 지수로 줄고(틈의 불꽃이 전류를 잠시 이어 나른다), 코일 전압의 봉우리는
 * 인덕턴스 × 전류 ÷ 이 값이다. 실제 불꽃은 천분의 몇 초에 끝난다 — 눈으로 따라가게
 * 늘였다(NOTES (b)).
 */
export const BREAK_SECONDS = 0.2;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 저작자가 스테이지에서 바꾼다.
// ------------------------------------------------------------------------

/** 전류(A) → I 기록지 높이(월드). */
export const CURRENT_SCALE = 0.75;
/**
 * 전압(V) → ε 기록지 높이(월드). 기본값에서 봉우리(10 H × 1 A ÷ 0.2 s = 50 V)가 축 끝
 * 바로 아래(2.0 / 2.2)에 오고, 전지 전압 점선은 그 여덟 분의 일쯤 높이다.
 */
export const VOLT_SCALE = 0.04;
/** 기록지 가로 — 1 초가 차지하는 월드 길이. 두 기록지가 같은 배율이라 같은 순간이 세로로 맞선다. */
export const SECONDS_TO_WORLD = 1.3;
/** 기록지가 담는 시간(초). 일정 · 끊음 · 꺼짐이 다 들어가는 길이다. */
export const GRAPH_SECONDS = 4.75;
/** 회로 위 전류 화살표 — 전류(A) → 화살표 길이(월드). */
export const ARROW_SCALE = 1.1;
/** 불꽃 빛살의 가장 긴 길이(월드) — 코일 전압이 봉우리일 때. 전압에 비례해 짧아진다. */
export const SPARK_REACH = 0.6;
/**
 * 불꽃이 온전히 짙은 전압 몫(봉우리 대비). 이보다 낮아지면 그 비율로 옅어진다 — 불꽃의
 * 크기는 전압에 비례하고, 짙기는 이 몫 아래에서만 따라 내려간다.
 */
export const SPARK_FULL = 0.35;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 회로, 오른쪽에 두 기록지.
// ------------------------------------------------------------------------

/** 회로 고리의 네 변. 전지는 왼쪽 변, 코일은 위 변, 스위치는 아래 변. */
export const LOOP_LEFT = -6.2;
export const LOOP_RIGHT = -2.2;
export const LOOP_TOP = 1.25;
export const LOOP_BOTTOM = -1.25;

/** 전지 — 왼쪽 변 가운데 높이, 두 판 사이 간격, 긴 판(+) · 짧은 판(−)의 반 길이. */
export const BATTERY_Y = 0;
export const BATTERY_PLATE_GAP = 0.22;
export const BATTERY_LONG_HALF = 0.4;
export const BATTERY_SHORT_HALF = 0.2;

/** 코일 — 위 변 가운데, 전체 폭, 감은 혹의 수 · 혹 높이. */
export const COIL_X = -4.2;
export const COIL_WIDTH = 1.8;
export const COIL_TURNS = 5;
export const COIL_HUMP = 0.26;

/**
 * 스위치 — 아래 변. 전류는 아래 변을 오른쪽에서 왼쪽으로 흐른다. 경첩이 오른쪽,
 * 닿는 곳이 왼쪽이고, 날은 고리 바깥(아래)으로 젖혀진다.
 */
export const SWITCH_HINGE_X = -3.7;
export const SWITCH_CONTACT_X = -4.6;

/** I 기록지 원점(시간 0 · 전류 0)과 세로 높이. */
export const GRAPH_X = -0.9;
export const I_GRAPH_Y = 0.55;
export const I_GRAPH_H = 1.25;
/** ε 기록지 원점(시간 0 · 전압 0)과 세로 높이. */
export const V_GRAPH_Y = -2.0;
export const V_GRAPH_H = 2.2;

/**
 * 프레이밍 — 전지 이름표 왼끝부터 기록지 축 이름 너머, 세로는 캡션 줄부터 I 축 이름
 * 위까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -7.3, maxX: 5.9, minY: -2.55, maxY: 2.15 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 스위치가 닫혀 전류가 일정한 동안. */
export const STEADY = 2;
/** 스위치 날이 젖혀지는 동안 — 끊는 순간. */
export const OPEN = 0.15;
/**
 * 불꽃이 튀고 전류가 0 으로 떨어지는 동안. 감쇠는 `open` 이 시작할 때부터이므로 `open` + 이 단계 =
 * 끊는 시간의 3.5 배(0.15 + 0.55 = 0.7 s) — 이때 전압이 봉우리의 3 % 로 내려와 불꽃이 사라진다
 * (scene 의 `SPARK_MIN`). 더 길면 불꽃 없는 화면에 「불꽃이 튄다」 캡션이 남는다.
 */
export const SPARK = 0.55;
/** 전류가 0 에 멈춘 채 기록이 이어지는 동안. 기록 전체(2 + 0.15 + 0.55 + 2.05 = 4.75 s)가 `graphSeconds` 와 같다. */
export const OFF = 2.05;
/** 스위치를 다시 닫고 기록을 지우는 동안. */
export const CLOSE = 0.9;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const selfInductanceMessages = Object.freeze({
  'label.title': { ko: '자체 인덕턴스', en: 'Self-inductance' },
  'label.operation': {
    ko: '자기 자신의 자속 변화',
    en: 'A coil opposing changes in its own flux',
  },
  'label.stage': { ko: '코일 · 전지 · 스위치', en: 'Coil, battery and switch' },
  'label.view': { ko: '회로와 기록', en: 'Circuit and record' },
  /** 전지 전압 · 기준선 이름표. 값은 스테이지 상수를 그대로 끼운다. */
  'label.volts': { ko: '{v} V', en: '{v} V' },
  /** 전지 극 · 코일 · 전류 · 기록지 축 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'label.coil': { ko: 'L', en: 'L' },
  'label.current': { ko: 'I', en: 'I' },
  'label.axisI': { ko: 'I', en: 'I' },
  'label.axisV': { ko: 'ε', en: 'ε' },
  'label.axisT': { ko: 't', en: 't' },
  'caption.steady': {
    ko: '스위치가 닫혀 전류가 일정하게 흐른다 — 코일 양 끝의 전압은 0 이다',
    en: 'The switch is closed and a steady current flows — the voltage across the coil is zero',
  },
  'caption.break': {
    ko: '스위치를 끊는 순간 — 전류가 급히 줄고, 코일 전압이 전지 전압을 훌쩍 넘게 치솟아 틈에 불꽃이 튄다',
    en: 'The instant the switch opens, the current drops fast — the coil voltage shoots far past the battery’s and sparks across the gap',
  },
  'caption.off': {
    ko: '전류가 0 에 멈추자 코일 전압도 0 — 치솟은 것은 전류가 바뀌던 순간뿐이다',
    en: 'With the current settled at zero the coil voltage is zero too — it shot up only while the current was changing',
  },
  'caption.close': {
    ko: '스위치를 다시 닫고 기록을 지운다',
    en: 'The switch closes again and the record is cleared',
  },
} satisfies Record<string, LocalizedText>);

export type SelfInductanceMessageKey = keyof typeof selfInductanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SelfInductanceMessageKey): LocalizedText => selfInductanceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SelfInductanceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const selfInductanceSchema: BundleSchema = {
  id: SELF_INDUCTANCE_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 전류가 흐르고 있고, 스위치를 끊고, 다시 닫는다.
  parameters: [],

  stages: [
    {
      id: 'circuit',
      label: text('label.stage'),
      constants: {
        emf: EMF,
        resistance: RESISTANCE,
        inductance: INDUCTANCE,
        breakSeconds: BREAK_SECONDS,
        currentScale: CURRENT_SCALE,
        voltScale: VOLT_SCALE,
        secondsToWorld: SECONDS_TO_WORLD,
        graphSeconds: GRAPH_SECONDS,
        arrowScale: ARROW_SCALE,
        sparkReach: SPARK_REACH,
        sparkFull: SPARK_FULL,
      },
    },
  ],

  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 회로 한 고리와 기록지 두 장이 나란하다. */
  canvas: { height: 340, minHeight: 300 },

  /** 불꽃은 스위치 날 위, 전류 화살표는 도선 위, 자취는 축 위에 와야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 일정 → 끊음(날이 젖혀짐) → 불꽃 → 꺼짐 → 다시 닫음.
   *
   * 전류는 `open` 이 **시작하는 순간**부터 끊는 시간 상수로 줄어든다(physics). `spark` 의
   * 길이는 그 줄어듦이 거의 끝나는 몫으로 잡은 기본값이다 — 저작자가 `breakSeconds` 를
   * 크게 바꾸면 `off` 캡션이 아직 줄어드는 전류 위에 뜰 수 있다(NOTES (c) G13).
   */
  timeline: {
    phases: [
      { id: 'steady', duration: STEADY, caption: key('caption.steady') },
      { id: 'open', duration: OPEN, ease: 'smooth', caption: key('caption.break') },
      { id: 'spark', duration: SPARK, caption: key('caption.break') },
      { id: 'off', duration: OFF, caption: key('caption.off') },
      { id: 'close', duration: CLOSE, ease: 'smooth', caption: key('caption.close') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 전류가 흐르고 기록지에 일정한 자취가 이미 그어져 있다. */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.2,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 기록지에 눈금 수를 달지 않는다 — 잴 것은 몇 볼트인가가
   * 아니라 전지 전압 점선보다 **얼마나 높이 치솟는가** 다.
   */

  messages: selfInductanceMessages,
};
