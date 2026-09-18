// ========================================================================
// venturi-effect — 순수 물리
// ========================================================================
// 관은 넓은 굵기로 바깥 공기에 열려 있어, 넓은 곳의 압력은 바깥 공기(대기압)와 같다.
// 마찰 없는 공기가 굵기 A(x) 인 자리를 v(x) = V · A_넓은 / A(x) 로 지나면, 베르누이에 따라
// 그 자리의 압력은 대기압보다 ½ρ_공기 (v(x)² − V²) 만큼 낮다.
//
// 통의 수면은 대기압에 눌려 있으므로, 그 자리에 꽂은 가는 관 속 액면은 압력이 모자란 만큼
// 올라간다 — h = ½ρ_공기 (v² − V²) / (ρ_액체 g). 넓은 곳에서는 v = V 라 h = 0 이다.
// 액면이 관 벽(목의 아랫벽)에 닿으면 그 뒤로는 액체가 바람 속으로 끌려 나간다 — 분무.
//
// 공기 · 물방울의 **화면 속** 움직임은 부피 좌표 하나로 계산한다. 관 입구부터 잰 부피 V(x)
// 를 쓰면 공기 알갱이의 부피 좌표는 바람 세기의 적분만큼 늘어난다. 자리는 되짚기만 하면 된다.
// 옆에서 본 그림이라 관 굵기(세로 길이)가 단면적을 대신한다.
// ========================================================================

import type { StageDef, TimelineEase, TimelineFrame, Vec2 } from '@aperi21/schema';

import {
  AIR_DENSITY,
  AIR_DOTS,
  AIR_SPEED,
  AREA_RATIO,
  DROPS,
  GRAVITY,
  JET_END_X,
  LIQUID_DENSITY,
  PIPE,
  SHOWN_SPEED,
  TANK,
  THROAT_TUBE_X,
  WIDE_HALF,
  venturiEffectSchema,
} from './schema';
import type { VenturiEffectState } from './state';

export interface VenturiConstants {
  /** 바람이 가장 셀 때 넓은 곳의 공기 속력(m/s). */
  airSpeed: number;
  /** 목 단면 ÷ 넓은 곳 단면. */
  areaRatio: number;
  /** 공기 · 액체 밀도(kg/m³). */
  airDensity: number;
  liquidDensity: number;
  /** 중력 가속도(m/s²). */
  g: number;
}

export function readConstants(stage: StageDef): VenturiConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    airSpeed: c.airSpeed ?? AIR_SPEED,
    areaRatio: c.areaRatio ?? AREA_RATIO,
    airDensity: c.airDensity ?? AIR_DENSITY,
    liquidDensity: c.liquidDensity ?? LIQUID_DENSITY,
    g: c.g ?? GRAVITY,
  };
}

// ------------------------------------------------------------------------
// 관의 모양
// ------------------------------------------------------------------------

/** 코사인으로 매끈하게 잇는 0 → 1. */
function blend(s: number): number {
  const k = Math.min(1, Math.max(0, s));
  return 0.5 - 0.5 * Math.cos(Math.PI * k);
}

/**
 * 자리 x 의 관 반 굵기(cm). 좁아지는 구간 · 넓어지는 구간은 코사인으로 잇는다.
 * 출구 너머(뿜어진 공기)는 넓은 굵기를 그대로 잇는다 — 물방울의 자리 계산에만 쓴다.
 */
export function pipeHalf(x: number, c: VenturiConstants): number {
  const wide = WIDE_HALF;
  const narrow = WIDE_HALF * c.areaRatio;
  if (x <= PIPE.convergeStart || x >= PIPE.divergeEnd) return wide;
  if (x < PIPE.throatStart) {
    return wide + (narrow - wide) * blend((x - PIPE.convergeStart) / (PIPE.throatStart - PIPE.convergeStart));
  }
  if (x <= PIPE.throatEnd) return narrow;
  return narrow + (wide - narrow) * blend((x - PIPE.throatEnd) / (PIPE.divergeEnd - PIPE.throatEnd));
}

// ------------------------------------------------------------------------
// 바람의 세기 — 시간표에서
// ------------------------------------------------------------------------

/** 엔진과 같은 이징 식. 선언된 단계의 `ease` 이름으로 고른다. */
const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/** 단계 id 의 진행도 p(0~1) 에 그 단계에 선언된 이징을 건다. */
function eased(phaseId: string, p: number): number {
  const q = Math.min(1, Math.max(0, p));
  const phase = venturiEffectSchema.timeline?.phases.find((ph) => ph.id === phaseId);
  return EASES[phase?.ease ?? 'linear'](q);
}

/**
 * 주기 안 시각 u 의 바람 세기 0~1. **단계 경계와 세지는 모양(이징)은 선언이 정한다** — `blowUp`
 * 동안 세지고 `blowDown` 동안 잦아든다 (S-piece 「시간표는 선언이다」). 다른 시각의 세기도
 * 물어야 해서(적분) `tl.at` 대신 선언의 이징 이름을 읽어 같은 식을 여기서 건다 (G59).
 */
export function flowAt(u: number, tl: TimelineFrame): number {
  const up = (u - tl.start('blowUp')) / tl.duration('blowUp');
  const down = (u - tl.start('blowDown')) / tl.duration('blowDown');
  return eased('blowUp', up) * (1 - eased('blowDown', down));
}

/** 바람 세기 적분 표의 시간 간격(초). */
const FLOW_DT = 0.02;

/** 주기 안 [0, u] 동안의 바람 세기 적분 표. `at(s)` 로 임의 시각의 적분을 읽는다. */
export interface FlowIntegral {
  /** 주기 첫머리부터 s 까지의 적분(초). */
  at(s: number): number;
  /** 한 주기 전체의 적분(초). */
  period: number;
}

export function flowIntegral(tl: TimelineFrame): FlowIntegral {
  const n = Math.ceil(tl.period / FLOW_DT);
  const cum: number[] = [0];
  let acc = 0;
  let prev = flowAt(0, tl);
  for (let i = 1; i <= n; i++) {
    const s = Math.min(i * FLOW_DT, tl.period);
    const f = flowAt(s, tl);
    acc += ((prev + f) / 2) * (s - (i - 1) * FLOW_DT);
    cum.push(acc);
    prev = f;
  }
  return {
    at(s: number): number {
      const k = Math.min(Math.max(s, 0), tl.period) / FLOW_DT;
      const i = Math.min(Math.floor(k), n - 1);
      const f = k - i;
      return cum[i]! + (cum[i + 1]! - cum[i]!) * f;
    },
    period: acc,
  };
}

// ------------------------------------------------------------------------
// 가는 관 속 액면
// ------------------------------------------------------------------------

/**
 * 자리 x 에 꽂은 가는 관 속 액면이 통 수면보다 올라가는 높이(cm) — 막힘이 없을 때.
 * h = ½ρ_공기 V² f² ((A_넓은/A(x))² − 1) / (ρ_액체 g). 넓은 곳에서는 0 이다.
 */
export function suctionRise(x: number, f: number, c: VenturiConstants): number {
  const k = WIDE_HALF / pipeHalf(x, c);
  const v = c.airSpeed * f;
  const deficit = 0.5 * c.airDensity * v * v * (k * k - 1); // Pa
  return (deficit / (c.liquidDensity * c.g)) * 100; // m → cm
}

export interface ColumnReading {
  /** 액면 높이(y, cm). 관 벽 입구에 닿으면 거기서 멈춘다. */
  top: number;
  /** 액체가 관 벽 입구까지 닿아 바람 속으로 끌려 나가는가. */
  spraying: boolean;
}

/** 자리 x 에 꽂은 가는 관 속 액주. 입구는 관의 아랫벽(y = −반 굵기)이다. */
export function columnAt(x: number, f: number, c: VenturiConstants): ColumnReading {
  const mouth = -pipeHalf(x, c);
  const rise = suctionRise(x, f, c);
  const top = TANK.surface + rise;
  return top >= mouth ? { top: mouth, spraying: true } : { top, spraying: false };
}

// ------------------------------------------------------------------------
// 부피 좌표 — 공기 점과 물방울의 자리
// ------------------------------------------------------------------------

/** 부피 좌표 표의 x 간격(cm). */
const TABLE_DX = 0.02;

export interface VolumeTable {
  xs: number[];
  vs: number[];
  /** 관 출구까지의 부피. 공기 점은 이 안에서만 돈다. */
  pipeTotal: number;
}

/** 관 입구부터 잰 부피 V(x) — 출구 너머 뿜어진 공기까지 잇는다. 사다리꼴 적분. */
export function volumeTable(c: VenturiConstants): VolumeTable {
  const n = Math.ceil((JET_END_X - PIPE.xIn) / TABLE_DX);
  const xs: number[] = [PIPE.xIn];
  const vs: number[] = [0];
  let v = 0;
  let prevA = 2 * pipeHalf(PIPE.xIn, c);
  let pipeTotal = 0;
  for (let i = 1; i <= n; i++) {
    const x = Math.min(PIPE.xIn + i * TABLE_DX, JET_END_X);
    const a = 2 * pipeHalf(x, c);
    v += ((prevA + a) / 2) * (x - xs[i - 1]!);
    xs.push(x);
    vs.push(v);
    if (x <= PIPE.xOut) pipeTotal = v;
    prevA = a;
  }
  return { xs, vs, pipeTotal };
}

export function volumeAt(x: number, t: VolumeTable): number {
  return interp(x, t.xs, t.vs);
}

export function xAtVolume(v: number, t: VolumeTable): number {
  return interp(v, t.vs, t.xs);
}

/** 오름차순 표 `keys` 에서 `k` 를 찾아 `vals` 를 선형 보간한다. */
function interp(k: number, keys: readonly number[], vals: readonly number[]): number {
  const n = keys.length;
  if (k <= keys[0]!) return vals[0]!;
  if (k >= keys[n - 1]!) return vals[n - 1]!;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (keys[mid]! <= k) lo = mid;
    else hi = mid;
  }
  const f = (k - keys[lo]!) / (keys[hi]! - keys[lo]!);
  return vals[lo]! + (vals[hi]! - vals[lo]!) * f;
}

/** 화면 속 1 초에 한 단면을 지나는 공기(넓이, cm²/s) — 바람이 가장 셀 때. */
function shownFlowRate(): number {
  return SHOWN_SPEED * 2 * WIDE_HALF;
}

/** 자리 x 의 화면 속 공기 빠르기(cm/s). */
function shownSpeedAt(x: number, f: number, c: VenturiConstants): number {
  return (SHOWN_SPEED * f * WIDE_HALF) / pipeHalf(x, c);
}

export interface DotCloud {
  positions: Vec2[];
  velocities: Vec2[];
}

/**
 * 관 속 공기 점. 부피 좌표로 같은 간격에 놓인 기둥들이 바람 세기의 적분만큼 함께 밀려 간다.
 * 바람이 없으면 멈춰 있고, 불면 목에서 기둥 간격이 벌어지고 꼬리가 길어진다.
 */
export function airDots(
  tl: TimelineFrame,
  f: number,
  integral: FlowIntegral,
  c: VenturiConstants,
  table: VolumeTable,
): DotCloud {
  const dv = 2 * WIDE_HALF * AIR_DOTS.spacingWide;
  const columns = Math.floor(table.pipeTotal / dv);
  const period = columns * dv;
  const travelled = shownFlowRate() * (tl.cycle * integral.period + integral.at(tl.u));
  const shift = ((travelled % period) + period) % period;
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  for (let k = 0; k < columns; k++) {
    const v = (k * dv + shift) % period;
    const x = xAtVolume(v, table);
    const half = pipeHalf(x, c) * AIR_DOTS.wallMargin;
    const vx = shownSpeedAt(x, f, c);
    const slope = (pipeHalf(x + TABLE_DX, c) - pipeHalf(x - TABLE_DX, c)) / (2 * TABLE_DX);
    const stagger = k % 2 === 0 ? -0.25 : 0.25;
    for (let j = 0; j < AIR_DOTS.rows; j++) {
      const eta = ((j + 0.5 + stagger) / AIR_DOTS.rows) * 2 - 1;
      positions.push([x, eta * half]);
      velocities.push([vx, eta * slope * AIR_DOTS.wallMargin * vx]);
    }
  }
  return { positions, velocities };
}

/** 출생 번호 → 0~1. 같은 번호는 언제나 같은 값이라 물방울이 프레임마다 떨지 않는다. */
function stableRandom(k: number, salt: number): number {
  const s = Math.sin(k * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * 목에서 뜯겨 나간 물방울. 이번 주기에서 액면이 목에 닿아 있던 시각마다 `DROPS.interval`
 * 간격으로 하나씩 태어나, 공기와 함께 부피 좌표로 떠내려간다. 태어날 때는 목의 아랫벽에
 * 있다가 흐름에 섞여 관 속으로 퍼지고, 출구를 나서면 조금씩 처진다.
 */
export function droplets(
  tl: TimelineFrame,
  f: number,
  integral: FlowIntegral,
  c: VenturiConstants,
  table: VolumeTable,
): DotCloud {
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  const q = shownFlowRate();
  const v0 = volumeAt(THROAT_TUBE_X, table);
  const nowIntegral = integral.at(tl.u);
  const births = Math.floor(tl.u / DROPS.interval);
  for (let k = 0; k <= births; k++) {
    const s = k * DROPS.interval;
    if (!columnAt(THROAT_TUBE_X, flowAt(s, tl), c).spraying) continue;
    const x = xAtVolume(v0 + q * (nowIntegral - integral.at(s)), table);
    if (x >= JET_END_X - 1e-3) continue;
    const age = tl.u - s;
    // 아랫벽(η = −1)에서 태어나 흐름에 섞여 제 자리(η*)로 퍼진다.
    const target = -0.8 + 1.3 * stableRandom(k, 1);
    const eta = -1 + (target + 1) * (1 - Math.exp(-age / DROPS.mixTau));
    const beyond = Math.max(0, x - PIPE.xOut);
    const sag = DROPS.sagPerCm * beyond * beyond;
    const half = pipeHalf(x, c) * 0.9;
    const vx = shownSpeedAt(x, f, c);
    positions.push([x, eta * half - sag]);
    velocities.push([vx, -2 * DROPS.sagPerCm * beyond * vx]);
  }
  return { positions, velocities };
}

/** 물방울 불투명도 0~1. 바람이 잦아드는 단계 앞쪽 절반에 걸쳐 사라진다. */
export function dropletOpacity(tl: TimelineFrame): number {
  const down = (tl.u - tl.start('blowDown')) / tl.duration('blowDown');
  return 1 - Math.min(1, Math.max(0, 2 * down));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: VenturiEffectState }): VenturiEffectState {
  return params.state;
}
