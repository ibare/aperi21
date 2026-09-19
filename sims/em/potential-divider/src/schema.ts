// ========================================================================
// potential-divider — 선언
// ========================================================================
// 질문: 저항 둘을 이어 전지에 걸면, 그 사이 접점에서 꺼내는 전압은 무엇이 정하는가.
//
// 가운데 왼쪽에 긴 저항선 하나가 전지에 걸려 있다. 왼쪽 끝(B)이 0 V, 오른쪽 끝(A)이
// 전지 전압이다. 접점(탐침)이 선 위를 밀려 가며 선을 R₂(B ~ 접점) · R₁(접점 ~ A)로 나누고,
// 위의 전압계 바늘은 B 와 접점 사이 전압 V₂ 를 읽는다. 오른쪽 판에는 선을 따라 고르게
// 오르는 전위가 경사로 그어져 있고, 접점 자리에서 그 높이가 V₂ · 나머지가 V₁ 로 갈린다 —
// 접점을 옮기면 바늘과 높이가 R₂ 의 길이에 비례해 함께 움직인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:potential-divider` 와 문자 그대로 일치한다 (C4). */
export const POTENTIAL_DIVIDER_ID = 'potential-divider';

// ------------------------------------------------------------------------
// 물리량 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전지 전압(V). 내부 저항 · 도선 저항은 없다고 둔다. 저항선은 굵기가 고르다. */
export const VOLTS = 12;
/**
 * 접점이 멈추는 세 자리 — **그 자리에서 전압계가 읽는 V₂(V)** 로 선언한다. 멈춘 바늘이 쓰는 글자가
 * 계산값을 줄인 것이 아니라 이 값 그대로이게 하려는 것이다(S-piece 유효숫자). 접점의 자리는
 * 여기서 나온다 — B 에서 잰 길이 = 저항선 길이 × V₂ / V. 셋 다 0 ~ `VOLTS` 안이어야 한다(G143).
 */
export const STOP_1 = 3;
export const STOP_2 = 6;
export const STOP_3 = 9;
/** 표시 배율 — 전위 1 V 가 판에서 차지하는 높이(월드). 전지 전압 × 이 값이 판 높이다. */
export const VOLT_HEIGHT = 0.25;
/** 전압계 — 눈금 간격(V)과 지금 값 글자의 소수 자릿수. 정박값이 정수라 0 자리. */
export const METER_TICK = 1;
export const METER_DIGITS = 0;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 조각의 배치 계산이다.
// ------------------------------------------------------------------------

/** 저항선 — 왼쪽 끝 B(전지 − 쪽, 0 V) · 오른쪽 끝 A(전지 + 쪽) · 높이. */
export const WIRE_X0 = -7;
export const WIRE_X1 = -1;
export const WIRE_Y = -0.6;
/** 전지 고리의 아래 변 높이 · 전지 가운데 x. */
export const LOOP_BOTTOM = -2.2;
export const BATTERY_X = -4;
/** 전지 두 판 사이 간격 · 긴 판(+) · 짧은 판(−)의 반 길이(월드). */
export const BATTERY_PLATE_GAP = 0.24;
export const BATTERY_LONG_HALF = 0.42;
export const BATTERY_SHORT_HALF = 0.22;

/** 전압계 — 눈금판 가운데 · 반지름(월드). 저항선 위, B 쪽으로 치우쳐 놓는다. */
export const METER_X = -4.6;
export const METER_Y = 1.5;
export const METER_R = 1.15;

/** 접점(탐침) — 선 위에서 화살촉까지 띄운 높이 · 화살표 길이(월드). */
export const PROBE_LIFT = 0.08;
export const PROBE_LEN = 0.5;

/**
 * 전위 판 — 원점(가로 = B, 세로 = 0 V), 가로 길이(월드). 가로는 **저항선 위 자리**다 —
 * 저항선과 같은 길이로 옮겨 놓아 접점 자리가 판에서도 같은 비율에 선다. 바닥은 저항선과 같은 높이.
 */
export const GRAPH_X0 = 1;
export const GRAPH_WIDTH = WIRE_X1 - WIRE_X0;
export const GRAPH_Y0 = WIRE_Y;

/**
 * 프레이밍은 주장의 일부다. 가로는 B 이름표부터 판 오른쪽 이름표까지, 세로는 전압계 이름표 ·
 * 판 세로축 이름 위부터 전지 전압 글자 · 캡션 줄 아래까지.
 */
export const SCENE_BOUNDS = { minX: -7.9, maxX: 8.1, minY: -3.5, maxY: 3.1 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 한 자리에 멈춰 읽는 동안 · 접점을 다음 자리로 미는 동안 · 처음 자리로 되돌리는 동안. */
export const HOLD = 2.6;
export const MOVE = 2;
export const BACK = 2.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const potentialDividerMessages = Object.freeze({
  'label.title': { ko: '분압기', en: 'Potential divider' },
  'label.operation': { ko: '저항으로 전압을 나누어 쓰는 것', en: 'Splitting a voltage with resistors' },
  'label.stage': { ko: '저항선 하나 · 접점 셋', en: 'One resistance wire, three contact points' },
  'label.view': { ko: '저항선', en: 'Slide wire' },
  'label.volt': { ko: '{v} V', en: '{v} V' },
  'label.potential': { ko: '전위', en: 'potential' },
  'label.position': { ko: '저항선 위 자리', en: 'position along the wire' },
  /** 끝 · 소자 · 전압 이름과 극 · 단위. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.endA': { ko: 'A', en: 'A' },
  'label.endB': { ko: 'B', en: 'B' },
  'label.r1': { ko: 'R₁', en: 'R₁' },
  'label.r2': { ko: 'R₂', en: 'R₂' },
  'label.v1': { ko: 'V₁', en: 'V₁' },
  'label.v2': { ko: 'V₂', en: 'V₂' },
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'label.unit': { ko: 'V', en: 'V' },
  'caption.hold': {
    ko: '접점이 저항선을 R₂ 와 R₁ 로 가르고, 바늘은 R₂ 쪽 몫 V₂ 를 읽는다',
    en: 'The contact splits the wire into R₂ and R₁, and the needle reads the R₂ share, V₂',
  },
  'caption.move': {
    ko: '접점을 밀어 R₂ 가 길어진다 — 바늘과 V₂ 의 높이가 같은 비율로 따라 오른다',
    en: 'Sliding the contact lengthens R₂ — the needle and the height of V₂ rise in the same proportion',
  },
  'caption.back': {
    ko: '접점을 되돌려 R₂ 가 짧아진다 — 꺼내는 전압도 그만큼 내려간다',
    en: 'Sliding the contact back shortens R₂ — the voltage taken off falls with it',
  },
} satisfies Record<string, LocalizedText>);

export type PotentialDividerMessageKey = keyof typeof potentialDividerMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PotentialDividerMessageKey): LocalizedText => potentialDividerMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PotentialDividerMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const potentialDividerSchema: BundleSchema = {
  id: POTENTIAL_DIVIDER_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 접점이 세 자리를 차례로 옮겨 다니고 처음 자리로 돌아온다.
  parameters: [],

  stages: [
    {
      id: 'slide-wire',
      label: text('label.stage'),
      constants: {
        volts: VOLTS,
        stop1: STOP_1,
        stop2: STOP_2,
        stop3: STOP_3,
        voltHeight: VOLT_HEIGHT,
        meterTick: METER_TICK,
        meterDigits: METER_DIGITS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'wire', label: text('label.view'), default: true }],

  /** 회로 하나와 전위 판, 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 접점 · 탐침 도선은 저항선 위, 이름표는 맨 위. 겹침을 scene 순서로 정한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 첫 자리에서 읽음 → 둘째 자리로 밈 → 읽음 → 셋째 자리로 밈 → 읽음 → 첫 자리로 되돌림.
   * 접점 자리는 physics 가 세 이동 단계의 진행도(`at`)를 더해 얻는다 — 단계 경계를 코드로 가르지 않는다.
   */
  timeline: {
    phases: [
      { id: 'hold-1', duration: HOLD, caption: key('caption.hold') },
      { id: 'move-12', duration: MOVE, ease: 'smooth', caption: key('caption.move') },
      { id: 'hold-2', duration: HOLD, caption: key('caption.hold') },
      { id: 'move-23', duration: MOVE, ease: 'smooth', caption: key('caption.move') },
      { id: 'hold-3', duration: HOLD, caption: key('caption.hold') },
      { id: 'back', duration: BACK, ease: 'smooth', caption: key('caption.back') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 접점이 첫 자리를 떠나 밀려 가는 중이다. */
  startAt: 3.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식 · 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 길이의 비와 높이의 비다. */

  messages: potentialDividerMessages,
};
