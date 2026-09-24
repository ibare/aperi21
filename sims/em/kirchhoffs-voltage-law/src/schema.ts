// ========================================================================
// kirchhoffs-voltage-law — 선언
// ========================================================================
// 질문: 닫힌 고리를 한 바퀴 돌면 전위는 어떻게 되는가.
//
// 전지 둘 · 저항 셋이 한 줄로 이어진 고리가 왼쪽에 있다. 점 하나가 출발점에서 고리를
// 따라 돌고, 오른쪽 판에는 점이 지나는 자리의 전위가 높이로 그어진다 — 가로는 고리 위
// 자리다. 전지를 지나면 계단이 오르고 저항을 지나면 내려가, 한 바퀴를 마치면 출발한
// 높이로 돌아온다. 거꾸로 돌면 같은 계단을 오른쪽 끝부터 되짚는다 — 앞 바퀴의 계단과
// 오르내림 화살표가 옅게 남아, 소자마다 오름과 내림이 뒤바뀐 것이 나란히 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:kirchhoffs-voltage-law` 와 문자 그대로 일치한다 (C4). */
export const KIRCHHOFFS_VOLTAGE_LAW_ID = 'kirchhoffs-voltage-law';

// ------------------------------------------------------------------------
// 물리량 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 전지의 전압(V). 둘 다 같은 방향(시계 방향)으로 민다. 내부 저항 · 도선 저항은 없다고 둔다. */
export const E1 = 4;
export const E2 = 2;
/** 세 저항(Ω). */
export const R1 = 1;
export const R2 = 2;
export const R3 = 3;
/**
 * 표시 배율 — 전위 1 V 가 판에서 차지하는 높이(월드). 판의 높이(`GRAPH_HEIGHT`)는 배치라
 * 고정이므로, 두 전지의 합 × 이 값이 그 높이 안에 들어가야 한다.
 */
export const VOLT_HEIGHT = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 조각의 배치 계산이다.
// ------------------------------------------------------------------------

/** 고리 — 네 변. */
export const LOOP_LEFT = -6.6;
export const LOOP_RIGHT = -1.4;
export const LOOP_TOP = 1.8;
export const LOOP_BOTTOM = -1.8;
/** 출발점 — 왼쪽 변, 첫 전지 아래. 전위의 기준(0 V)이다. */
export const START: Vec2 = [LOOP_LEFT, -1.5];

/** 소자 자리 — 전지는 옆 변의 가운데, 저항은 위 · 아래 변. */
export const E1_POS: Vec2 = [LOOP_LEFT, 0];
export const E2_POS: Vec2 = [LOOP_RIGHT, 0];
export const R1_POS: Vec2 = [-5.3, LOOP_TOP];
export const R2_POS: Vec2 = [-2.7, LOOP_TOP];
export const R3_POS: Vec2 = [-4.0, LOOP_BOTTOM];

/**
 * 저항 기호의 반 길이(월드). plugin-circuit `circuitElement` 는 소자 로컬 ±1 을 두 단자로 쓰고
 * 가운데 ±0.5 에 지그재그를 긋는다 — 전위가 내려가는 구간이 이 지그재그다.
 */
export const RESISTOR_LEAD_HALF = 1;
export const RESISTOR_BODY_HALF = 0.5;
/** 전지 두 판 사이 간격 · 긴 판(+) · 짧은 판(−)의 반 길이(월드). */
export const BATTERY_PLATE_GAP = 0.24;
export const BATTERY_LONG_HALF = 0.42;
export const BATTERY_SHORT_HALF = 0.22;

/**
 * 전위 판 — 원점(가로 = 출발점, 세로 = 0 V), 가로 길이 · 세로 높이(월드). 가로는 **고리 위 자리**다 —
 * 출발점에서 시계 방향으로 잰 호길이를 판 가로 길이로 줄였고, 오른쪽 끝은 한 바퀴 돌아온 출발점이다.
 * 바닥은 고리 아래 변과 같은 높이.
 */
export const GRAPH_X0 = 0.9;
export const GRAPH_Y0 = LOOP_BOTTOM;
export const GRAPH_WIDTH = 5.6;
export const GRAPH_HEIGHT = 3.6;

/**
 * 프레이밍은 주장의 일부다. 가로는 첫 전지의 전압 글자부터 판 가로축 이름표까지, 세로는
 * 위 저항 이름표 위부터 판 아래 소자 이름표 · 캡션 줄 아래까지.
 */
export const SCENE_BOUNDS = { minX: -7.9, maxX: 7.9, minY: -3.2, maxY: 2.5 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 한 바퀴 도는 동안 · 출발점에서 견주는 동안 · 방향을 바꾸는 동안. */
export const WALK = 7;
export const HOME = 3;
export const TURN = 1.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const kirchhoffsVoltageLawMessages = Object.freeze({
  'label.title': { ko: '키르히호프 전압 법칙', en: "Kirchhoff's voltage law" },
  'label.stage': { ko: '전지 둘 · 저항 셋', en: 'Two cells, three resistors' },
  'label.view': { ko: '고리', en: 'Loop' },
  'label.volt': { ko: '{v} V', en: '{v} V' },
  'label.start': { ko: '출발', en: 'start' },
  'label.potential': { ko: '전위', en: 'potential' },
  'label.lap': { ko: '한 바퀴', en: 'one lap' },
  /** 소자 이름 · 전지 극 · 전류 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.e1': { ko: 'E₁', en: 'E₁' },
  'label.e2': { ko: 'E₂', en: 'E₂' },
  'label.r1': { ko: 'R₁', en: 'R₁' },
  'label.r2': { ko: 'R₂', en: 'R₂' },
  'label.r3': { ko: 'R₃', en: 'R₃' },
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'label.current': { ko: 'I', en: 'I' },
  'caption.walk': {
    ko: '점이 고리를 따라 돌며 지나는 자리의 전위를 높이로 긋는다 — 전지를 지나면 오르고, 저항을 지나면 내려간다',
    en: 'A point travels round the loop, plotting the potential as height — it climbs across each cell and drops across each resistor',
  },
  'caption.home': {
    ko: '한 바퀴 돌아 출발점에 왔다 — 높이도 출발할 때와 같다. 오른 만큼 내려왔다',
    en: 'One lap brings it back to the start at the very height it began — every climb has been matched by a drop',
  },
  'caption.turn': {
    ko: '출발점에서 방향을 거꾸로 바꾼다',
    en: 'At the start, the direction is reversed',
  },
  'caption.walkBack': {
    ko: '거꾸로 돌면 같은 계단을 반대로 밟는다 — 소자마다 오름과 내림이 뒤바뀌어 저항에서 오르고 전지에서 내려간다',
    en: 'In reverse it treads the same staircase backwards — every element flips, climbing across the resistors and dropping across the cells',
  },
  'caption.homeBack': {
    ko: '거꾸로 돌아도 한 바퀴를 마치면 출발한 높이로 돌아온다',
    en: 'Going the other way, one full lap still ends at the height it started from',
  },
  'caption.turnBack': {
    ko: '출발점에서 방향을 처음대로 되돌린다',
    en: 'At the start, the direction is switched back',
  },
} satisfies Record<string, LocalizedText>);

export type KirchhoffsVoltageLawMessageKey = keyof typeof kirchhoffsVoltageLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: KirchhoffsVoltageLawMessageKey): LocalizedText => kirchhoffsVoltageLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: KirchhoffsVoltageLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const kirchhoffsVoltageLawSchema: BundleSchema = {
  id: KIRCHHOFFS_VOLTAGE_LAW_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 점이 돌고, 한 바퀴를 마치고, 거꾸로 다시 돈다.
  parameters: [],

  stages: [
    {
      id: 'two-cells',
      label: text('label.stage'),
      constants: {
        e1: E1,
        e2: E2,
        r1: R1,
        r2: R2,
        r3: R3,
        voltHeight: VOLT_HEIGHT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'loop', label: text('label.view'), default: true }],

  /** 고리 하나와 전위 판, 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 걷는 점은 전선 · 저항 기호 **위**, 이름표는 맨 위. 층 순서로는 plugin 기호가 점 위로 올 수 있다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 시계 방향 한 바퀴 → 출발점에서 견줌 → 방향 바꿈 → 반시계 방향 한 바퀴 → 견줌 → 방향 바꿈.
   *
   * 반시계 방향 구간은 `turn-ccw` 부터 `home-ccw` 까지 붙어 있다 — physics 가 그 구간의
   * 시작 · 끝으로 지금 방향을 가른다(단계 목록이 프레임에 없다, G193).
   */
  timeline: {
    phases: [
      { id: 'walk-cw', duration: WALK, caption: key('caption.walk') },
      { id: 'home-cw', duration: HOME, caption: key('caption.home') },
      { id: 'turn-ccw', duration: TURN, caption: key('caption.turn') },
      { id: 'walk-ccw', duration: WALK, caption: key('caption.walkBack') },
      { id: 'home-ccw', duration: HOME, caption: key('caption.homeBack') },
      { id: 'turn-cw', duration: TURN, caption: key('caption.turnBack') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 점이 첫 전지와 두 저항을 지나 계단이 반쯤 그어져 있다. */
  startAt: 3,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식 · 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 거리가 아니라 높이의 오르내림을 본다. */

  messages: kirchhoffsVoltageLawMessages,
};
