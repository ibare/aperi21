// ========================================================================
// series-parallel-resistors — 선언
// ========================================================================
// 질문: 같은 전지에 같은 저항 둘을 어떻게 잇느냐가 전지가 내주는 전류를 바꾸는가.
//
// 같은 전지(6 V)와 같은 저항 둘(3 Ω)로 만든 배치 셋이 나란히 선다 — 하나만 이은 것,
// 한 줄로 이은 것(직렬), 나란히 이은 것(병렬). 세 회로에서 전자가 돌고, 같은 동안
// 전지에서 나온 전하가 회로마다 아래 기둥으로 쌓인다. 기둥은 두 칸 · 한 칸 · 네 칸이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:series-parallel-resistors` 와 문자 그대로 같아야 한다 (C4). 바꾸지 않는다. */
export const SERIES_PARALLEL_RESISTORS_ID = 'series-parallel-resistors';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 세 배치가 함께 쓰는 전지의 기전력(V). */
export const VOLTAGE = 6;
/** 저항 하나의 저항(Ω). 다섯 기호가 모두 같은 값이다 — 그것이 이 조각의 전제다. */
export const RESISTANCE = 3;
/** 배치마다 전지가 내주는 전류(A). 6 V · 3 Ω 에서 각각 V/R · V/2R · 2V/R 이다. */
export const CURRENT_SINGLE = 2;
export const CURRENT_SERIES = 1;
export const CURRENT_PARALLEL = 4;
/** 병렬 두 가지 하나에 흐르는 전류(A). 가지 알갱이의 빠르기를 정한다. */
export const CURRENT_BRANCH = 2;
/** 기둥 한 칸에 해당하는 전류(A) — 이만큼 흐르면 세는 동안 한 칸이 찬다. */
export const UNIT_CURRENT = 1;

// 표시 배율도 선언이다 (원칙 2) — 물리량을 화면 길이로 바꾸는 값들.

/** 기둥 한 칸의 높이(월드). */
export const COLUMN_UNIT = 0.5;
/** 도선 속 전자의 앞뒤 간격(월드). 세 회로 · 모든 도선에서 같다 — 같은 재료다. */
export const CARRIER_SPACING = 0.7;
/** 전류 → 알갱이 빠르기 배율(월드/초 per A). 간격이 같으므로 빠르기가 곧 전류다. */
export const SPEED_PER_AMP = 0.42;
/**
 * 알갱이 꼬리의 길이 = 빠르기 × 이 시간(초). 멈춘 화면에서도 빠르기가 읽힌다.
 * 가장 빠른 꼬리(병렬 본선)가 알갱이 간격을 넘지 않게 잡았다 — 넘으면 꼬리가 이어져
 * 빨간 도선처럼 보인다(2차 촬영).
 */
export const TRAIL_SECONDS = 0.18;

// ------------------------------------------------------------------------
// 배치 — 월드 좌표. 세 회로가 같은 높이의 위 · 아래 도선을 쓴다.
// ------------------------------------------------------------------------

/** 회로의 위 도선 · 아래 도선 높이. 세 배치가 같다. */
export const CELL_TOP_Y = 0.9;
export const CELL_BOTTOM_Y = -0.9;

/**
 * plugin-circuit `circuitElement` 는 소자 로컬 ±1 을 두 단자로 쓴다 — 저항 기호의
 * 길이가 월드 2 로 고정이고 선언으로 줄이지 못한다(G186).
 */
export const RESISTOR_HALF = 1;
/** 저항 몸통(지그재그)이 차지하는 반 길이. 이 구간에서는 알갱이를 그리지 않는다. */
export const RESISTOR_BODY_HALF = 0.55;

/** 하나만 · 병렬 회로에서 모서리와 저항 단자 사이 도선 길이. */
export const LEAD = 0.6;
/** 직렬 회로에서 모서리와 첫 · 끝 저항 단자 사이, 그리고 두 저항 단자 사이 도선 길이. */
export const SERIES_LEAD = 0.4;
export const SERIES_GAP = 0.5;
/** 병렬 두 가지가 위 도선 높이에서 위아래로 벌어진 거리. */
export const BRANCH_RISE = 0.5;

/** 전지 — 두 판 사이 간격과 긴 판(+) · 짧은 판(−)의 반 길이. */
export const BATTERY_GAP = 0.3;
export const BATTERY_LONG_HALF = 0.26;
export const BATTERY_SHORT_HALF = 0.15;

/**
 * 세는 문이 서는 자리 — 아래 도선에서 왼쪽 모서리로부터의 거리와 문의 반 길이.
 * 왼쪽 기둥(전지가 선 변)에 가로 막대로 두면 전지 판이 하나 더 있는 것으로 읽혔다(1차 촬영).
 */
export const GATE_OFFSET = 0.62;
export const GATE_HALF = 0.18;

/**
 * 세 회로의 왼쪽 기둥 x 와 가로 폭. 직렬만 저항 둘이 한 줄이라 넓다 —
 * 폭이 배치에서 곧바로 나온다(G105: 목록을 스테이지 상수로 흩을 자리가 없다).
 */
export const CELL_X: readonly number[] = [0, 4.7, 11.5];
export const CELL_W: readonly number[] = [
  LEAD + 2 * RESISTOR_HALF + LEAD,
  SERIES_LEAD + 2 * RESISTOR_HALF + SERIES_GAP + 2 * RESISTOR_HALF + SERIES_LEAD,
  LEAD + 2 * RESISTOR_HALF + LEAD,
];

/** 기둥이 서는 바닥 높이 · 기둥 폭 · 칸 사이 틈. */
export const COLUMN_BASE_Y = -3.55;
export const COLUMN_WIDTH = 0.9;
export const COLUMN_CELL_GAP = 0.05;
/** 배치 이름이 놓이는 높이(바닥 아래). */
export const COLUMN_LABEL_Y = COLUMN_BASE_Y - 0.32;

/**
 * 프레이밍은 주장의 일부다. 가로는 전지 이름표 왼쪽부터 셋째 회로 오른쪽까지,
 * 세로는 병렬의 위 가지부터 배치 이름 아래 · 캡션 띠까지. 매 프레임 같은 값이다
 * (원칙 6). 캡션 띠는 프레이밍 여백으로 잡히지 않아 손으로 더했다(G24).
 */
export const SCENE_BOUNDS = { minX: -1.1, maxX: 15.1, minY: -4.65, maxY: 1.85 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 전자가 돌기만 하는 동안 — 기둥은 비어 있다. */
export const FLOW = 2.6;
/** 세는 동안. 이 길이가 「한 칸」 의 잣대다 — 1 A 가 이 동안 흐르면 한 칸이다. */
export const COUNT = 2.4;
/** 다 센 기둥을 견주는 동안 · 기둥이 흐려지는 동안. */
export const HOLD = 3.4;
export const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const seriesParallelResistorsMessages = Object.freeze({
  'label.title': { ko: '저항의 직렬과 병렬', en: 'Resistors in series and parallel' },
  'label.operation': {
    ko: '연결을 바꾸면 같은 전지가 내주는 전류가 달라지는 것',
    en: 'How the connection changes the current one battery delivers',
  },
  'label.stage': { ko: '같은 전지 · 같은 저항 둘', en: 'One battery, two identical resistors' },
  'label.view': { ko: '나란한 배치 셋', en: 'Three arrangements side by side' },

  /** 배치 이름. 기둥 아래에 붙어 어느 회로의 기둥인지 말한다. */
  'label.single': { ko: '하나만', en: 'One only' },
  'label.series': { ko: '직렬', en: 'Series' },
  'label.parallel': { ko: '병렬', en: 'Parallel' },

  /** 값이 끼는 조립문이라 문안이다 (C1 판정 경계). */
  'label.volts': { ko: '{v} V', en: '{v} V' },
  'label.amps': { ko: '{i} A', en: '{i} A' },
  /** 도선 속을 흐르는 것이 무엇인지 밝히는 표식. 번역 대상이 아니다 (C1 판정 3). */
  'label.electron': { ko: 'e⁻', en: 'e⁻' },

  'caption.flow': {
    ko: '같은 전지와 같은 저항 둘 — 하나만 잇고, 직렬로 잇고, 병렬로 이었다',
    en: 'The same battery and the same two resistors — one alone, in series, in parallel',
  },
  'caption.count': {
    ko: '같은 동안 전지를 지난 전하를 회로마다 아래 기둥으로 쌓는다',
    en: 'Over the same stretch of time, the charge that passes each battery stacks into a column below',
  },
  'caption.compare': {
    ko: '직렬 기둥은 하나만 일 때의 높이에 못 미치고, 병렬 기둥은 그 높이를 넘었다',
    en: 'The series column falls short of the one-resistor height; the parallel column rises past it',
  },
} satisfies Record<string, LocalizedText>);

export type SeriesParallelResistorsMessageKey = keyof typeof seriesParallelResistorsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: SeriesParallelResistorsMessageKey): LocalizedText =>
  seriesParallelResistorsMessages[key];

/** 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SeriesParallelResistorsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const seriesParallelResistorsSchema: BundleSchema = {
  id: SERIES_PARALLEL_RESISTORS_ID,
  label: text('label.title'),
  category: 'electronics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 세 배치가 한 화면에 함께 있어 누를 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'three-arrangements',
      label: text('label.stage'),
      constants: {
        voltage: VOLTAGE,
        resistance: RESISTANCE,
        currentSingle: CURRENT_SINGLE,
        currentSeries: CURRENT_SERIES,
        currentParallel: CURRENT_PARALLEL,
        currentBranch: CURRENT_BRANCH,
        unitCurrent: UNIT_CURRENT,
        columnUnit: COLUMN_UNIT,
        carrierSpacing: CARRIER_SPACING,
        speedPerAmp: SPEED_PER_AMP,
        trailSeconds: TRAIL_SECONDS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side-by-side', label: text('label.view'), default: true }],

  /**
   * 가로 16.2 · 세로 6.5 월드. 1차 촬영에서 **세로가 먼저 찼다** — 356 px 에서는
   * 가로가 800 px 중 685 px 만 쓰여 그림이 작았다. 세로를 48 px 늘려 가로를 다 쓰게 했다
   * (S-piece — 세로가 비싸지만, 남은 가로를 못 쓰는 세로는 더 비싸다).
   */
  canvas: { height: 404, minHeight: 364 },

  /**
   * 겹침이 판정 장치다. 도선은 저항 기호 **아래**, 알갱이는 도선 **위**, 기둥의
   * 칸은 바닥선 위에 놓여야 한다. 층 순서로는 `particleSystem` 이 `lineSet` 아래로
   * 밀린다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 돈다 → 센다 → 견준다 → 기둥이 흐려진다.
   *
   * `count` 의 길이가 곧 「한 칸」 의 잣대다 — scene 은 칸 높이를 이 길이에서
   * 읽는다(`duration('count')`). 여기를 늘이면 세 기둥이 함께 더 오래 자랄 뿐
   * 끝 높이의 비는 그대로다.
   */
  timeline: {
    phases: [
      { id: 'flow', duration: FLOW, caption: key('caption.flow') },
      { id: 'count', duration: COUNT, caption: key('caption.count') },
      { id: 'hold', duration: HOLD, caption: key('caption.compare') },
      { id: 'fade', duration: FADE, caption: key('caption.compare') },
    ],
  },

  /**
   * 도착한 순간 이미 세는 중이다 — 전자가 돌고 세 기둥이 서로 다른 빠르기로
   * 자라는 자리에서 연다. 0 이면 빈 기둥 자리가 먼저 보인다.
   */
  startAt: 3.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 합성 저항과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 780,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **기둥의 칸 수**라,
   * 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다.
   */

  messages: seriesParallelResistorsMessages,
};
