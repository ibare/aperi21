// ========================================================================
// refrigerator-heat-pump — 순수 계산
// ========================================================================
// 에너지 흐름의 배치와 알갱이 자리. 물리는 한 줄이다 — 부엌으로 나가는 열은 냉장고
// 안에서 뺀 열과 넣은 일의 합(qHot = qCold + work)이고, 띠 굵기가 그 양에 비례한다.
//
// 알갱이는 모든 띠에서 같은 속력 · 같은 밀도로 흐른다. 그래서 한 띠를 지나는 양이 곧
// 띠의 굵기이고, 굵은 띠에는 알갱이가 옆으로 더 많이 늘어선다. 자리는 (시드, 시각)의
// 닫힌 식이라 `step` 에 쌓지 않는다 — 같은 시각은 같은 화면이다 (S-sim).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BAND_SCALE,
  BAND_TIP,
  COLD_BAND_START_X,
  DOT_DENSITY,
  FLOW_SPEED,
  HOT_BAND_TIP_X,
  LEAK_BAND,
  LEAK_FROM_X,
  LEAK_RISE,
  LEAK_TO_X,
  LEAK_Y,
  Q_COLD,
  SEED,
  SOCKET_POS,
  SOCKET_SIZE,
  T_COLD,
  T_HOT,
  THERMO_MAX,
  WORK,
  Q_HOT,
} from './schema';
import type { RefrigeratorHeatPumpState } from './state';

/**
 * 알갱이가 띠 폭 중 차지하는 몫. 1 이면 띠 가장자리에 걸친 알갱이가 띠 밖으로 반쯤
 * 나간다 — 그림 여백이라 스테이지 상수가 아니다.
 */
const LATERAL_FILL = 0.8;
/** 띠 양 끝에서 알갱이가 나타나고 사라지는 거리(월드). 화살 끝 길이와 같게 둔다. */
const EDGE_FADE = BAND_TIP;

export interface RefrigeratorHeatPumpConstants {
  qCold: number;
  work: number;
  /** 부엌으로 나가는 열 — 화면 글자용 정박값(G143). */
  qHot: number;
  tCold: number;
  tHot: number;
  thermoMax: number;
  leakRise: number;
  bandScale: number;
  leakBand: number;
  flowSpeed: number;
  dotDensity: number;
  seed: number;
}

export function readConstants(stage: StageDef): RefrigeratorHeatPumpConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    qCold: c.qCold ?? Q_COLD,
    work: c.work ?? WORK,
    qHot: c.qHot ?? Q_HOT,
    tCold: c.tCold ?? T_COLD,
    tHot: c.tHot ?? T_HOT,
    thermoMax: c.thermoMax ?? THERMO_MAX,
    leakRise: c.leakRise ?? LEAK_RISE,
    bandScale: c.bandScale ?? BAND_SCALE,
    leakBand: c.leakBand ?? LEAK_BAND,
    flowSpeed: c.flowSpeed ?? FLOW_SPEED,
    dotDensity: c.dotDensity ?? DOT_DENSITY,
    seed: c.seed ?? SEED,
  };
}

/**
 * 부엌으로 나가는 띠의 양(J) — 뺀 열 + 넣은 일. 띠 굵기 계산에만 쓴다. 화면 글자는 정박값 `qHot` 이고,
 * 둘이 같아야 한다는 관계는 선언할 자리가 없다 (G143, NOTES (b)).
 */
export function hotHeat(c: RefrigeratorHeatPumpConstants): number {
  return c.qCold + c.work;
}

// ------------------------------------------------------------------------
// 띠 — 곧은 선분 하나와 굵기. 알갱이는 선분을 따라 흐른다.
// ------------------------------------------------------------------------

export interface Band {
  from: Vec2;
  to: Vec2;
  /** 굵기(월드). */
  width: number;
}

function length(b: Band): number {
  return Math.hypot(b.to[0] - b.from[0], b.to[1] - b.from[1]);
}

/** 선분 방향 단위 벡터와 그 왼쪽 법선. */
function frame(b: Band): { d: Vec2; n: Vec2 } {
  const len = length(b);
  const d: Vec2 = [(b.to[0] - b.from[0]) / len, (b.to[1] - b.from[1]) / len];
  return { d, n: [-d[1], d[0]] };
}

function at(b: Band, s: number, lateral: number): Vec2 {
  const { d, n } = frame(b);
  return [b.from[0] + d[0] * s + n[0] * lateral, b.from[1] + d[1] * s + n[1] * lateral];
}

export interface FlowLayout {
  /** 냉장고 안 → 기계. 끝은 기계 몸통 가운데라 몸통에 덮인다. */
  cold: Band;
  /** 콘센트 → 기계. */
  work: Band;
  /** 기계 → 부엌. 끝이 화살 끝이다. */
  hot: Band;
  /** 전기를 끊은 뒤 부엌 → 냉장고 안으로 새는 열. */
  leak: Band;
}

/**
 * 띠 배치. 부엌으로 나가는 띠는 기계 높이 가운데에 놓이고, 들어오는 열 띠는 그 **아래
 * 몫**과 같은 높이로 들어온다 — 나가는 띠 = 들어온 열 띠 위에 일 몫을 얹은 것으로 읽힌다.
 */
export function flowLayout(c: RefrigeratorHeatPumpConstants): FlowLayout {
  const wCold = c.qCold * c.bandScale;
  const wWork = c.work * c.bandScale;
  const wHot = hotHeat(c) * c.bandScale;
  const bottom = -wHot / 2;
  const coldY = bottom + wCold / 2;
  return {
    cold: { from: [COLD_BAND_START_X, coldY], to: [0, coldY], width: wCold },
    work: { from: [SOCKET_POS[0], SOCKET_POS[1] - SOCKET_SIZE[1] / 2], to: [0, 0], width: wWork },
    hot: { from: [0, 0], to: [HOT_BAND_TIP_X, 0], width: wHot },
    leak: { from: [LEAK_FROM_X, LEAK_Y], to: [LEAK_TO_X, LEAK_Y], width: c.leakBand },
  };
}

/**
 * 띠의 윤곽 다각형. `tip` 이면 끝을 화살 끝으로, `notch` 이면 시작을 제비꼬리 홈으로 판다 —
 * 정지 화면에서도 흐르는 방향이 읽히게 한다. `head` 는 화살촉 반폭(월드) — 띠보다 넓게
 * 주면 가는 띠에도 촉이 드러난다. 생략하면 띠 폭 그대로 뾰족해진다.
 */
export function bandOutline(b: Band, opts: { tip?: boolean; notch?: boolean; head?: number }): Vec2[] {
  const len = length(b);
  const h = b.width / 2;
  const head = Math.max(h, opts.head ?? h);
  const end = opts.tip ? len - BAND_TIP : len;
  const pts: Vec2[] = [at(b, 0, h), at(b, end, h)];
  if (opts.tip) pts.push(at(b, end, head), at(b, len, 0), at(b, end, -head));
  pts.push(at(b, end, -h), at(b, 0, -h));
  if (opts.notch) pts.push(at(b, BAND_TIP, 0));
  return pts;
}

// ------------------------------------------------------------------------
// 알갱이 — 시드 결정적
// ------------------------------------------------------------------------

/** mulberry32. 시드를 받는 결정적 난수 (S-sim — `Math.random` 금지). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Dots {
  positions: Vec2[];
  opacities: number[];
}

/**
 * 띠 하나의 알갱이. 개수 = 밀도 × 띠 넓이라 굵은 띠에 더 많고, 모두 같은 속력으로
 * `flowTime` 초만큼 흘러간 자리에 있다. 끝에 닿은 알갱이는 시작으로 돌아간다 — 띠는
 * 늘 차 있다 (S-piece 프리롤).
 */
export function bandDots(b: Band, salt: number, flowTime: number, c: RefrigeratorHeatPumpConstants): Dots {
  const len = length(b);
  const count = Math.round(c.dotDensity * b.width * len);
  const next = rng(c.seed * 1009 + salt);
  const positions: Vec2[] = [];
  const opacities: number[] = [];
  for (let k = 0; k < count; k++) {
    const phase = next();
    const lateral = (next() - 0.5) * b.width * LATERAL_FILL;
    const s = (((phase * len + c.flowSpeed * flowTime) % len) + len) % len;
    positions.push(at(b, s, lateral));
    opacities.push(Math.max(0, Math.min(1, s / EDGE_FADE, (len - s) / EDGE_FADE)));
  }
  return { positions, opacities };
}

// ------------------------------------------------------------------------
// 시간표 읽기
// ------------------------------------------------------------------------

/**
 * 기계가 돌아간 시간(초). 전기를 끊는 단계가 시작하는 순간 멈춘다 — 멈춘 시각은 선언이
 * 안다(`start('cut')`).
 */
export function machineTime(tl: TimelineFrame): number {
  return Math.min(tl.u, tl.start('cut'));
}

/** 새는 열이 흐른 시간(초). `seep` 단계부터 센다. */
export function leakTime(tl: TimelineFrame): number {
  return Math.max(0, tl.u - tl.start('seep'));
}

/** 지금 냉장고 안 온도(℃). 새어 드는 동안 `leakRise` 만큼 오른다. 화면에는 기둥 높이로만 보인다. */
export function fridgeTemperature(tl: TimelineFrame, c: RefrigeratorHeatPumpConstants): number {
  return c.tCold + c.leakRise * tl.at('leak');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: RefrigeratorHeatPumpState }): RefrigeratorHeatPumpState {
  return params.state;
}
