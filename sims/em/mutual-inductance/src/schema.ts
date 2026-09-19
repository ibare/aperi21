// ========================================================================
// mutual-inductance — 선언
// ========================================================================
// 질문: 한 코일의 전류가 이웃 코일에 무슨 일을 하는가.
//
// 같은 축 위에 두 코일이 떨어져 놓여 있다. 두 코일은 도선으로 이어져 있지 않다.
// 1차 코일에 흐르는 전류가 자기력선을 만들고, 그 가운데 축 가까운 몫이 2차 코일의
// 고리를 꿴다. 1차 전류를 **올리는** 동안 2차 코일에 + 전압이 생기고, 전류가
// **일정한** 동안 전압은 0, 전류를 **내리는** 동안 전압은 − 로 뒤집힌다. 전류가
// 크다는 것만으로는 이웃에 아무 일도 없다 — 전압은 전류가 바뀌는 동안에만 있다.
//
// 감은 수 비로 전압을 바꾸는 것은 이웃 `transformer` 의 몫이다. 자석을 밀어 넣는
// 빠르기는 `faradays-law`, 자기 코일의 전압은 `self-inductance` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:mutual-inductance` 와 문자 그대로 일치한다 (C4). */
export const MUTUAL_INDUCTANCE_ID = 'mutual-inductance';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 상호 인덕턴스(H). 2차 전압 = 이 값 × 1차 전류가 바뀌는 빠르기. */
export const MUTUAL = 0.4;
/** 1차 전류를 다 올렸을 때의 값(A). 올리는 · 내리는 빠르기 = 이 값 ÷ 그 단계의 길이. */
export const CURRENT_MAX = 4;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 저작자가 스테이지에서 바꾼다.
// ------------------------------------------------------------------------

/** 전류(A) → I₁ 기록지 높이(월드). */
export const CURRENT_SCALE = 0.3;
/**
 * 전압(V) → V₂ 기록지 높이(월드). 기본값에서 올리기 · 내리기 동안의 2차 전압
 * (0.4 H × 4 A ÷ 1.6 s = 1 V)이 0 선 위아래 0.8 에 온다.
 */
export const VOLT_SCALE = 0.8;
/** 기록지 가로 — 1 초가 차지하는 월드 길이. 두 기록지가 같은 배율이라 같은 순간이 세로로 맞선다. */
export const SECONDS_TO_WORLD = 0.85;
/** 기록지가 담는 시간(초). 기록 단계 길이의 합(0.8 + 1.6 × 3 + 1.4 = 7 s)과 같다. */
export const GRAPH_SECONDS = 7;
/** 1차 전류 화살표 — 전류(A) → 화살표 길이(월드). */
export const ARROW_SCALE = 0.2;
/** 전류를 다 올렸을 때 위 · 아래 반쪽에 각각 그리는 자기력선 수. 선의 수가 전류에 비례한다. */
export const FIELD_LINES = 4;
/** 2차 계기 바늘 — 전압(V) → 바늘이 가운데에서 기우는 각(도). */
export const NEEDLE_DEG_PER_VOLT = 45;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 두 코일, 오른쪽에 두 기록지.
// ------------------------------------------------------------------------

/** 두 코일이 함께 놓인 축의 높이. */
export const AXIS_Y = 0.3;
/** 1차 · 2차 코일의 가운데 x. */
export const PRIMARY_X = -5.4;
export const SECONDARY_X = -3.2;
/** 코일 하나의 길이(첫 고리 ~ 끝 고리)와 고리 수. */
export const COIL_LENGTH = 0.5;
export const COIL_RINGS = 4;
/** 옆에서 비스듬히 본 고리 — 가로 반지름(깊이) · 세로 반지름. */
export const RING_RX = 0.13;
export const RING_RY = 0.8;

/**
 * 자기력선 — 1차 코일 한가운데를 지나는 높이(축에서, 고리 반지름 대비 몫)와 코일 바깥으로
 * 돌아오는 높이, 축을 따라 뻗는 거리. 축 가까운 선일수록 멀리 뻗어 2차 고리를 꿴다.
 * 안쪽 선과 바깥쪽 선의 값을 주고 그 사이는 고르게 나눈다.
 */
export const LINE_INNER_FRAC = 0.12;
export const LINE_OUTER_FRAC = 0.75;
export const LINE_INNER_RETURN = 1.75;
export const LINE_OUTER_RETURN = 1.1;
export const LINE_INNER_REACH = 3.4;
export const LINE_OUTER_REACH = 0.9;

/** 코일 이음선이 내려가는 높이 — 1차는 단자 둘, 2차는 계기로 간다. */
export const LEAD_Y = -1.55;
/** 2차 계기 — 판의 가운데(바늘 축) · 반지름. 판은 위로 반원이다. */
export const METER_X = -1.95;
export const METER_Y = -1.85;
export const METER_R = 0.42;

/** I₁ 기록지 원점(시간 0 · 전류 0)과 세로 높이. */
export const GRAPH_X = -0.8;
export const I_GRAPH_Y = 0.75;
export const I_GRAPH_H = 1.45;
/** V₂ 기록지 0 선의 높이와 위 · 아래로 뻗는 높이. */
export const V_GRAPH_Y = -1.25;
export const V_GRAPH_H = 1.05;

/**
 * 프레이밍 — 1차 자기력선 왼끝부터 기록지 축 이름 너머, 세로는 캡션 줄부터 자기력선 위까지.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -8.95, maxX: 5.6, minY: -2.75, maxY: 2.5 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 1차 전류가 0 인 채로 시작하는 동안. */
export const REST = 0.8;
/** 1차 전류를 0 에서 다 올리는 동안. 곧게 올린다(빠르기 일정). */
export const RISE = 1.6;
/** 1차 전류가 일정한 동안. */
export const HOLD = 1.6;
/** 1차 전류를 0 으로 내리는 동안. 곧게 내린다. */
export const FALL = 1.6;
/** 1차 전류가 다시 0 인 채로 기록이 이어지는 동안. */
export const AFTER = 1.4;
/** 기록을 지우는 동안. */
export const CLEAR = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const mutualInductanceMessages = Object.freeze({
  'label.title': { ko: '상호 인덕턴스', en: 'Mutual inductance' },
  'label.operation': {
    ko: '이웃 회로에 유도되는 기전력',
    en: 'An EMF induced in a neighbouring circuit',
  },
  'label.stage': { ko: '나란한 두 코일', en: 'Two coils on one axis' },
  'label.view': { ko: '코일과 기록', en: 'Coils and record' },
  'label.primary': { ko: '1차 코일', en: 'primary' },
  'label.secondary': { ko: '2차 코일', en: 'secondary' },
  /** 전류 · 전압 · 부호 · 축 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.current': { ko: 'I₁', en: 'I₁' },
  'label.voltage': { ko: 'V₂', en: 'V₂' },
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'label.zero': { ko: '0', en: '0' },
  'label.axisT': { ko: 't', en: 't' },
  'caption.rest': {
    ko: '1차 코일에 전류가 없다 — 2차 코일의 전압도 0 이다',
    en: 'No current in the primary coil — no voltage across the secondary either',
  },
  'caption.rise': {
    ko: '1차 전류를 올린다 — 2차 고리를 꿰는 자기력선이 늘고, 2차에 + 전압이 생긴다',
    en: 'The primary current is ramped up — more field lines thread the secondary, and a + voltage appears across it',
  },
  'caption.hold': {
    ko: '1차 전류가 크지만 일정하다 — 자기력선이 그대로라 2차 전압은 0 이다',
    en: 'The primary current is large but steady — the field lines stay put, so the secondary voltage is zero',
  },
  'caption.fall': {
    ko: '1차 전류를 내린다 — 2차를 꿰는 자기력선이 줄고, 2차 전압이 − 로 뒤집힌다',
    en: 'The primary current is ramped down — fewer field lines thread the secondary, and its voltage flips to −',
  },
  'caption.after': {
    ko: '1차 전류가 0 에 멈추자 2차 전압도 0 — 전압은 전류가 바뀌는 동안에만 있었다',
    en: 'With the primary current back at zero, the secondary voltage is zero — it was there only while the current changed',
  },
  'caption.clear': {
    ko: '기록을 지운다',
    en: 'The record is cleared',
  },
} satisfies Record<string, LocalizedText>);

export type MutualInductanceMessageKey = keyof typeof mutualInductanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MutualInductanceMessageKey): LocalizedText => mutualInductanceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MutualInductanceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const mutualInductanceSchema: BundleSchema = {
  id: MUTUAL_INDUCTANCE_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 1차 전류가 오르고 있고, 일정해지고, 내려간다.
  parameters: [],

  stages: [
    {
      id: 'coils',
      label: text('label.stage'),
      constants: {
        mutual: MUTUAL,
        currentMax: CURRENT_MAX,
        currentScale: CURRENT_SCALE,
        voltScale: VOLT_SCALE,
        secondsToWorld: SECONDS_TO_WORLD,
        graphSeconds: GRAPH_SECONDS,
        arrowScale: ARROW_SCALE,
        fieldLines: FIELD_LINES,
        needleDegPerVolt: NEEDLE_DEG_PER_VOLT,
      },
    },
  ],

  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 두 코일과 기록지 두 장이 나란하다. */
  canvas: { height: 340, minHeight: 300 },

  /** 자기력선은 고리 뒤 반쪽 위 · 앞 반쪽 아래, 바늘은 계기판 위에 와야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 0 → 올리기 → 일정 → 내리기 → 다시 0 → 기록 지우기.
   *
   * 1차 전류는 `rise` 동안 곧게 오르고 `fall` 동안 곧게 내린다(이징 없음) — 빠르기가
   * 일정해야 2차 전압이 한 높이로 선다. 올리기 · 내리기의 빠르기는 단계 길이에서 온다.
   */
  timeline: {
    phases: [
      { id: 'rest', duration: REST, caption: key('caption.rest') },
      { id: 'rise', duration: RISE, caption: key('caption.rise') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fall', duration: FALL, caption: key('caption.fall') },
      { id: 'after', duration: AFTER, caption: key('caption.after') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.clear') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 1차 전류가 오르는 한가운데, 2차 전압이 이미 서 있다. */
  startAt: 1.6,

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
   * 아니라 2차 전압이 **언제 서고 어느 쪽으로 서는가** 다.
   */

  messages: mutualInductanceMessages,
};
