// ========================================================================
// electric-current — 선언
// ========================================================================
// 질문: 전류가 「세다」 는 것은 무엇이 많다는 것인가.
//
// 도선 한 단면에 문을 두고 같은 시간 동안 지나가는 전자 알갱이를 센다. 세 도선이
// 나란히 흐른다 — 기준, 두 배 빠르게, 두 배 촘촘히. 문이 1 초 동안 열렸다 닫히면
// 문 옆에 쌓인 네모가 4 · 8 · 8 이다. 빠르게 흘러도, 촘촘히 흘러도 같은 시간에
// 지나간 전하가 두 배이고, 그것이 전류가 두 배라는 뜻이다.
//
// 알갱이는 전자(e⁻)라 왼쪽으로 가고, 관례 전류 I 는 오른쪽을 향한다 — 방향 표식 한 번.
// 전자가 실제로 얼마나 느린가는 drift-velocity 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:electric-current` 와 문자 그대로 일치한다 (C4). */
export const ELECTRIC_CURRENT_ID = 'electric-current';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 단위는 월드 단위(도선 위 거리)와 조각 시계의 초다.
// ------------------------------------------------------------------------

/** 기준 도선의 알갱이 속력(월드/초). */
export const SPEED = 2;
/** 기준 도선의 알갱이 간격(월드). 속력/간격 = 1 초에 단면을 지나는 수 = 4. */
export const SPACING = 0.5;
/** 가운데 도선의 속력 배수 — 속력 = 기준 속력 × 이 수. 간격은 기준과 같다. */
export const FAST_MULTIPLE = 2;
/** 아래 도선의 간격 나눗수 — 간격 = 기준 간격 ÷ 이 수(촘촘해진다). 속력은 기준과 같다. */
export const DENSE_DIVISOR = 2;
/**
 * 단면 문이 열려 있는 동안(초) — 세는 시간. `count` 단계의 길이이고, 문은 그 단계가
 * 시작할 때 열려 끝날 때 닫힌다. 스테이지 상수로 두지 않는다 — 시간표가 이미 선언한다.
 */
export const COUNT_TIME = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 세 도선을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 세 도선의 높이(위 → 아래: 기준 · 두 배 빠르게 · 두 배 촘촘히). */
export const LANE_BASE_Y = 2;
export const LANE_FAST_Y = 1;
export const LANE_DENSE_Y = 0;

/** 도선이 보이는 구간. 알갱이는 오른쪽 끝에서 들어와 왼쪽 끝으로 나간다. */
export const WIRE_LEFT = -5.4;
export const WIRE_RIGHT = 2.2;
/** 도선 굵기(월드). */
export const WIRE_THICKNESS = 0.36;
/** 도선 끝에서 알갱이가 흐려지며 들고 나는 거리(월드). 잘린 도막이 아니라 긴 도선의 일부로 읽힌다. */
export const WIRE_EDGE_FADE = 0.5;

/**
 * 단면 문의 자리. 오른쪽 끝에 가깝게 둔다 — 알갱이가 왼쪽으로 가므로 문을 지난 뒤
 * 센 알갱이 무리가 도선 위에 길게 남아, 빠른 도선은 무리가 두 배 길고 촘촘한 도선은
 * 같은 길이에 두 배 많다는 것이 함께 보인다.
 */
export const GATE_X = 1.2;
/** 문 선이 도선 위아래로 삐져나온 반높이(월드). */
export const GATE_HALF = 0.34;

/** 센 수를 쌓는 네모 줄 — 첫 네모의 중심 x, 한 변, 간격(월드). */
export const TALLY_START_X = 2.75;
export const TALLY_SIZE = 0.26;
export const TALLY_PITCH = 0.34;

/** 세는 시간 막대 — 문 위에 걸린다(높이 · 너비 · 두께, 월드. 가운데는 문의 x). */
export const CLOCK_Y = 2.72;
export const CLOCK_WIDTH = 1.2;
export const CLOCK_HEIGHT = 0.16;

/** 방향 표식 — 전자 화살표와 전류 화살표의 높이 · 꼬리 자리 · 길이(월드). */
export const DIRECTION_Y = 2.72;
export const ELECTRON_ARROW_FROM = -3.5;
export const CURRENT_ARROW_FROM = -2.9;
export const DIRECTION_ARROW_LEN = 1.3;

/** 도선 기호(v, d) 이름표의 x. */
export const LANE_LABEL_X = -6.05;

/**
 * 프레이밍은 주장의 일부다. 가로는 도선 기호부터 가장 긴 네모 줄(8 개) 끝까지,
 * 세로는 캡션 줄부터 방향 표식 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6.7, maxX: 5.7, minY: -0.95, maxY: 3.15 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초). 모든 단계를 같은 배율로 느리게 흘린다
// ------------------------------------------------------------------------

/** 문이 닫힌 채 흐르는 동안. */
export const FLOW = 0.5;
/** 센 뒤 쌓인 네모를 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 0.75;
export const FADE = 0.25;
/**
 * 모든 단계의 재생 배율. 빠른 도선은 1 초에 8 개가 지나가 실시간으로는 셀 수 없다.
 * 모든 단계에 같은 배율을 걸어야 흐름이 단계 경계에서 갑자기 빨라지지 않는다.
 */
export const SLOW_MOTION = 0.25;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const electricCurrentMessages = Object.freeze({
  'label.title': { ko: '전류', en: 'Electric current' },
  'label.operation': { ko: '전하의 흐름과 방향 규약', en: 'The flow of charge and its sign convention' },
  'label.stage': { ko: '세 도선', en: 'Three wires' },
  'label.view': { ko: '단면 문', en: 'Cross-section gate' },
  /** 도선 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.laneBase': { ko: 'v, d', en: 'v, d' },
  'label.laneFast': { ko: '{n}v, d', en: '{n}v, d' },
  'label.laneDense': { ko: 'v, d/{n}', en: 'v, d/{n}' },
  /** 방향 표식 — 전자 · 관례 전류 기호 (C1 판정 3). */
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  'label.current': { ko: 'I', en: 'I' },
  /** 세는 시간. 값은 스테이지 상수를 그대로 끼운다. */
  'label.countTime': { ko: '{t} s', en: '{t} s' },
  'caption.flow': {
    ko: '전자는 왼쪽으로 흐르고, 전류 I 는 그 반대인 오른쪽을 향한다',
    en: 'Electrons drift to the left; the current I points the opposite way, to the right',
  },
  'caption.count': {
    ko: '세 도선의 단면 문이 함께 열렸다 — 지나가는 전자를 하나씩 센다',
    en: 'The three cross-section gates open together — each electron that passes is counted',
  },
  'caption.result': {
    ko: '같은 시간에 두 배 빠른 흐름도, 두 배 촘촘한 흐름도 두 배를 실어 날랐다',
    en: 'In the same time, twice the speed and twice the crowding each carried twice the charge',
  },
} satisfies Record<string, LocalizedText>);

export type ElectricCurrentMessageKey = keyof typeof electricCurrentMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElectricCurrentMessageKey): LocalizedText => electricCurrentMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElectricCurrentMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const electricCurrentSchema: BundleSchema = {
  id: ELECTRIC_CURRENT_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 세고, 쌓인 것을 보이고, 다시 센다.
  parameters: [],

  stages: [
    {
      id: 'three-wires',
      label: text('label.stage'),
      constants: {
        speed: SPEED,
        spacing: SPACING,
        fastMultiple: FAST_MULTIPLE,
        denseDivisor: DENSE_DIVISOR,
      },
    },
  ],

  environments: [],

  views: [{ id: 'gate', label: text('label.view'), default: true }],

  /** 세 도선과 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 알갱이는 도선 띠 **위**에, 문 선은 알갱이 위에 와야 「문을
   * 지난다」 로 읽힌다. 층 순서로는 `region`(도선)이 알갱이 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 흐름 → 셈(문 열림) → 쌓인 것 읽기 → 흐려짐.
   *
   * `count` 단계가 곧 세는 시간이다 — 문은 그 단계가 시작할 때 열려 끝날 때 닫히고,
   * 시간 막대 이름표도 그 단계 길이를 쓴다. 단계 길이만 바꾸면 셋이 함께 따라간다.
   *
   * 주기 길이(2.5 초)에 속력/간격(4 · 8 · 8 개/초)을 곱하면 정수라, 주기가 돌아올 때
   * 알갱이가 한 칸 간격만큼 정확히 밀려 제자리로 이어진다 — 흐름이 튀지 않는다.
   */
  timeline: {
    phases: [
      { id: 'flow', duration: FLOW, timeScale: SLOW_MOTION, caption: key('caption.flow') },
      { id: 'count', duration: COUNT_TIME, timeScale: SLOW_MOTION, caption: key('caption.count') },
      { id: 'hold', duration: HOLD, timeScale: SLOW_MOTION, caption: key('caption.result') },
      { id: 'fade', duration: FADE, timeScale: SLOW_MOTION, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 알갱이는 모든 시각에 도선을 채우고 흐른다.
   * 흐름 단계를 조금 지난 자리에서 열어 문이 곧 열린다.
   */
  startAt: 0.1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **개수**라, 거리 격자를
   * 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다.
   */

  messages: electricCurrentMessages,
};
