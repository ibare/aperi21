// ========================================================================
// gravitational-acceleration — 선언
// ========================================================================
// 질문: 위로 던진 공이 꼭대기에서 잠깐 멈추는 순간, 중력 가속도도 0 이 되는가.
//
// 답: 아니다. 속도는 0 이 되지만 같은 시간마다 바뀌는 몫은 그대로다.
// 동사는 **속도가 같은 몫씩 줄어 0 을 멈추지 않고 지나친다**.
// 원본: tasks/piece-lab/gravitational-acceleration (엔진 없이 손으로 짠 것).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gravitational-acceleration` 와 문자 그대로 일치한다 (C4). */
export const GRAVITATIONAL_ACCELERATION_ID = 'gravitational-acceleration';

/** 중력 가속도(m/s²). */
export const G = 9.8;
/** 던지는 속력(m/s) — 1 초에 꼭대기, 2 초에 착지. */
export const V0 = 9.8;
/** 속도 화살표를 찍는 간격(조각 시계 초). 0.1 초로는 강조색 조각이 화살촉만 남는다. */
export const SAMPLE_DT = 0.2;

// ------------------------------------------------------------------------
// 배치 — 월드 한 단위 = 원본 캔버스(860×360) 화면 px 하나, y 는 위
// ------------------------------------------------------------------------
// 원본의 px 좌표를 그대로 옮기되 세로만 뒤집어 땅(원본 y 222)을 0 에 둔다.
// 프레이밍이 고정(`boundsHint`)이고 넓은 화면에서 배율이 1 이라 월드 길이가 곧
// 원본의 화면 길이다.

const GROUND_PX = 222;
const y = (px: number): number => GROUND_PX - px;

/** 속도 → 화살표 길이(월드 per m/s) — 원본 9 px per m/s. 두 곳이 같은 척도다. */
export const ARROW_PER_MS = 9;
/** 최고 높이 4.9 m 를 170 px 로. */
export const HEIGHT_PER_M = 170 / ((V0 * V0) / (2 * G));

/** 땅 선 — 공 좌우로 70 px. */
export const GROUND = { y: y(222), from: 60, to: 200 } as const;
/** 공 — 가로 130, 반지름 10. 착지하면 중심이 땅 선 위 10 에 놓인다. */
export const BALL = { x: 130, r: 10 } as const;
/** 공 옆 속도 화살표의 가로 — 공 중심에서 24. 변화량 화살표는 거기서 11 더. */
export const BALL_ARROW_X = BALL.x + 24;
export const BALL_DELTA_X = BALL_ARROW_X + 11;

/** 오른쪽 화살표 줄 — 기준선 높이와 첫 칸 · 끝 칸의 가로. */
export const ROW = { y: y(130), x0: 330, x1: 820, overhang: 16 } as const;
/** 줄의 변화량 화살표는 속도 화살표 오른쪽 10. */
export const ROW_DELTA_DX = 10;

/** 화살표 굵기 · 화살촉 길이(원본 3 px · 6 px). 속도 0 칸은 반지름 3 의 점. */
export const ARROW_WIDTH = 3;
export const ARROW_HEAD = 6;
export const DOT_R = 3;

/** 안내선(땅 · 기준선)의 옅기 — 원본의 옅은 회색에 가깝게. */
export const FAINT_OPACITY = 0.35;

/**
 * 고정 경계. 러너가 사방 36px(12 + 24)을 더 비우므로, 원본 캔버스에서 그만큼 안쪽
 * 사각형을 준다. 세로 288(= 360 − 72)이 캔버스 높이 360 에서 배율 1 이 된다.
 * 가로는 850px 폭 임베드(가운데 425)에서 배율 1 이 되도록 778 로 둔다.
 */
export const SCENE_BOUNDS = {
  minX: 41,
  maxX: 819,
  minY: y(324),
  maxY: y(36),
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gravitationalAccelerationMessages = Object.freeze({
  'label.title': { ko: '중력 가속도', en: 'Gravitational acceleration' },
  'label.operation': {
    ko: '속도가 0인 순간에도 멈추지 않는 가속',
    en: 'Acceleration that does not stop even when the velocity is zero',
  },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  'caption.rise': {
    ko: '올라가는 동안 — 같은 시간마다 같은 만큼 느려진다',
    en: 'Going up — it slows by the same amount every equal interval',
  },
  'caption.top': {
    ko: '꼭대기 — 속도는 0이 되지만, 아래로 더해지는 몫은 그대로다',
    en: 'At the top — the speed is zero, but the downward change stays the same',
  },
  'caption.fall': {
    ko: '내려오는 동안 — 같은 시간마다 같은 만큼 빨라진다',
    en: 'Coming down — it speeds up by the same amount every equal interval',
  },
  'caption.landed': {
    ko: '속도는 0에서 멈추지 않았다 — 처음부터 끝까지 같은 몫씩 아래로 바뀌었다',
    en: 'The velocity never stopped at zero — it changed downward by the same amount throughout',
  },
} satisfies Record<string, LocalizedText>);

export type GravitationalAccelerationMessageKey = keyof typeof gravitationalAccelerationMessages;

export const text = (key: GravitationalAccelerationMessageKey): LocalizedText =>
  gravitationalAccelerationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GravitationalAccelerationMessageKey): string {
  return k;
}

/** 느린 재생 — 실제 2 초 비행을 화면에서 4 초로. 꼭대기를 읽을 시간이 필요하다. */
const SLOW = 0.5;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gravitationalAccelerationSchema: BundleSchema = {
  id: GRAVITATIONAL_ACCELERATION_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  // 조작기 없음 — 던지는 속력을 바꾸면 꼭대기 자리만 옮겨지고 주장(조각 길이 불변)은 같다.
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: { g: G, v0: V0 } }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 860×360. 캡션은 원본처럼 캔버스 안 아래에 놓인다. */
  canvas: { height: 360, minHeight: 320 },

  /** 원본이 그린 순서 — 땅 · 공 · 공의 화살표 · 기준선 · 줄 화살표 · 줄 변화량. */
  drawOrder: 'scene',

  /** 도착한 순간 공이 이미 올라가는 중이다 — 비행 0.45 초, 줄에 화살표 셋. */
  startAt: 0.45,

  /**
   * 한 주기 — 올라가고(rise) · 꼭대기 근처(top) · 내려오고(fall) · 착지 뒤 머문다(hold).
   * 길이는 조각 시계(물리 초)로 센다. 비행 세 단계는 0.5 배로 느리게 흘러 화면에서
   * 4 초, 머무름은 2 초다. 단계 경계는 원본의 캡션 경계(0.85 s · 1.15 s)다.
   */
  timeline: {
    phases: [
      { id: 'rise', duration: 0.85, timeScale: SLOW, caption: key('caption.rise') },
      { id: 'top', duration: 0.3, timeScale: SLOW, caption: key('caption.top') },
      { id: 'fall', duration: 0.85, timeScale: SLOW, caption: key('caption.fall') },
      { id: 'hold', duration: 2.0, caption: key('caption.landed') },
    ],
  },

  // 슬롯 하나 — 원본은 캔버스 아래 가운데 17px 한 줄(중심 y 342).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, 13] },
    fontSize: 17,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  messages: gravitationalAccelerationMessages,
};
