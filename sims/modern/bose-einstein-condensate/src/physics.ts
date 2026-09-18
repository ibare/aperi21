// ========================================================================
// bose-einstein-condensate — 순수 물리
// ========================================================================
// 조화 덫 속 이상 보스 기체.
//
// - 열운동 원자: 자리 · 속도가 가우스 분포이고 폭은 √T 에 비례한다. 조화 덫에서는
//   자리와 속도가 같은 꼴로 도므로(위상 공간의 회전) 원자 하나의 자리는
//   x(t) = σ·(a·cos ωt + b·sin ωt) 이고, a · b 가 표준 정규면 어느 시각에도 구름은
//   폭 σ 의 가우스다 — 구름은 늘 같은 모양인데 원자들은 계속 움직인다.
// - 바닥 상태 원자: 몫이 N₀/N = 1 − (T/Tc)^n (T < Tc), 폭은 온도와 무관한 바닥 상태의 폭.
//
// 원자마다 시드 결정적 문턱 u 가 있어, 바닥 상태 몫이 u 를 넘으면 그 원자가 바닥 상태
// 폭으로 옮겨 간다 — 한가운데로 모여든다. 모든 것이 (시드, 시간표 시각)의 함수다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ATOM_COUNT,
  CONDENSATE_EXPONENT,
  GROUND_WIDTH,
  JOIN_SPREAD,
  SEED,
  THERMAL_WIDTH_AT_TC,
  TRAP_OMEGA_X,
  TRAP_OMEGA_Y,
  T_HIGH,
  T_LOW,
  T_MID,
} from './schema';
import type { BoseEinsteinCondensateState } from './state';

export interface BoseEinsteinCondensateConstants {
  /** 온도 단계(Tc 배) — 시작 · 첫 멈춤 · 마지막 멈춤. */
  tHigh: number;
  tMid: number;
  tLow: number;
  /** 바닥 상태 몫의 거듭제곱. */
  condensateExponent: number;
  /** 그리는 원자 수. */
  atomCount: number;
  /** Tc 에서 열 구름의 폭 · 바닥 상태의 폭(월드, 표준편차). */
  thermalWidthAtTc: number;
  groundWidth: number;
  /** 원자 하나가 건너가는 몫의 너비. */
  joinSpread: number;
  /** 덫 진동의 각진동수(rad/s). */
  trapOmegaX: number;
  trapOmegaY: number;
  /** 흩뿌림 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): BoseEinsteinCondensateConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tHigh: c.tHigh ?? T_HIGH,
    tMid: c.tMid ?? T_MID,
    tLow: c.tLow ?? T_LOW,
    condensateExponent: c.condensateExponent ?? CONDENSATE_EXPONENT,
    atomCount: Math.max(0, Math.round(c.atomCount ?? ATOM_COUNT)),
    thermalWidthAtTc: c.thermalWidthAtTc ?? THERMAL_WIDTH_AT_TC,
    groundWidth: c.groundWidth ?? GROUND_WIDTH,
    joinSpread: c.joinSpread ?? JOIN_SPREAD,
    trapOmegaX: c.trapOmegaX ?? TRAP_OMEGA_X,
    trapOmegaY: c.trapOmegaY ?? TRAP_OMEGA_Y,
    seed: c.seed ?? SEED,
  };
}

// ------------------------------------------------------------------------
// 시드 결정적 난수 — 이 조각 안에만 둔다 (S-sim · C3)
// ------------------------------------------------------------------------

/** mulberry32. 같은 시드는 언제나 같은 수열이다. */
function makeRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 표준 정규 하나 (Box–Muller). */
function gaussian(rand: () => number): number {
  const u = Math.max(rand(), Number.MIN_VALUE);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** 원자 하나의 고정된 뽑기 — 두 축의 진동 성분과 바닥 상태로 건너가는 문턱. */
export interface AtomDraw {
  ax: number;
  bx: number;
  ay: number;
  by: number;
  /** 0~1. 바닥 상태 몫이 이 값을 넘으면 건너가기 시작한다. */
  threshold: number;
}

/** 원자들의 뽑기. (시드, 원자 수)의 함수라 프레임마다 떨지 않는다. */
export function drawAtoms(c: BoseEinsteinCondensateConstants): AtomDraw[] {
  const rand = makeRandom(c.seed);
  const out: AtomDraw[] = [];
  for (let i = 0; i < c.atomCount; i++) {
    out.push({
      ax: gaussian(rand),
      bx: gaussian(rand),
      ay: gaussian(rand),
      by: gaussian(rand),
      threshold: rand(),
    });
  }
  return out;
}

// ------------------------------------------------------------------------
// 온도와 바닥 상태 몫
// ------------------------------------------------------------------------

/** 바닥 상태에 있는 원자의 몫 N₀/N. Tc(=1) 위에서는 0. */
export function condensateFraction(T: number, c: BoseEinsteinCondensateConstants): number {
  if (T >= 1) return 0;
  return 1 - Math.pow(Math.max(0, T), c.condensateExponent);
}

/** 열운동 구름의 폭(월드). √T 에 비례한다. */
export function thermalWidth(T: number, c: BoseEinsteinCondensateConstants): number {
  return c.thermalWidthAtTc * Math.sqrt(Math.max(0, T));
}

export interface CoolingReading {
  /** 지금 온도(Tc 배). 멈춤 단계에서는 저절로 멈춘다. */
  T: number;
  /** 지금 바닥 상태 몫. */
  f0: number;
  /** Tc 아래로 내려간 정도 0~1 — 봉우리 이름표가 따라 나타난다. */
  below: number;
  /** 그림 전체의 불투명도. 처음에 나타나고 마지막에 흐려진다. */
  alpha: number;
}

/**
 * 지금 시각의 온도를 읽는다. **단계 경계는 선언이 정한다** — 경계 시각을 모듈 상수와
 * 견주지 않고 `at()` 으로 묻는다 (S-piece 「시간표는 선언이다」). 온도는 세 식힘 단계
 * 진행도의 합이라 분기가 없다.
 */
export function readCooling(tl: TimelineFrame, c: BoseEinsteinCondensateConstants): CoolingReading {
  const below = tl.at('cool-below');
  const T =
    c.tHigh -
    (c.tHigh - 1) * tl.at('cool-to-tc') -
    (1 - c.tMid) * below -
    (c.tMid - c.tLow) * tl.at('cool-deep');
  return {
    T,
    f0: condensateFraction(T, c),
    below,
    alpha: tl.at('appear') * (1 - tl.at('fade')),
  };
}

// ------------------------------------------------------------------------
// 덫 속 원자의 자리
// ------------------------------------------------------------------------

/**
 * 원자들의 지금 자리(구름 가운데 기준, 월드). 원자마다 폭은 열 구름 폭에서 바닥 상태 폭으로
 * 건너가는 정도 s 로 섞는다 — s 는 바닥 상태 몫이 그 원자의 문턱을 넘은 만큼이다.
 */
export function atomPositions(
  atoms: readonly AtomDraw[],
  T: number,
  f0: number,
  t: number,
  c: BoseEinsteinCondensateConstants,
): Vec2[] {
  const wide = thermalWidth(T, c);
  const cx = Math.cos(c.trapOmegaX * t);
  const sx = Math.sin(c.trapOmegaX * t);
  const cy = Math.cos(c.trapOmegaY * t);
  const sy = Math.sin(c.trapOmegaY * t);
  return atoms.map((a): Vec2 => {
    const s = c.joinSpread > 0 ? clamp01((f0 - a.threshold) / c.joinSpread) : f0 > a.threshold ? 1 : 0;
    const w = wide + (c.groundWidth - wide) * s;
    return [w * (a.ax * cx + a.bx * sx), w * (a.ay * cy + a.by * sy)];
  });
}

// ------------------------------------------------------------------------
// 1차원 속도 분포
// ------------------------------------------------------------------------

/** 표준편차 σ 인 가우스의 모양(√2π 는 뺀다 — 세로 배율에 흡수된다). */
function gauss(v: number, sigma: number): number {
  return Math.exp(-(v * v) / (2 * sigma * sigma)) / sigma;
}

/**
 * 속도 v 에서의 분포 높이(상대 단위) = 열 몫 · 넓은 가우스 + 바닥 상태 몫 · 좁은 가우스.
 * 가로 배율은 구름과 같다 — 조화 덫에서 속도 폭과 자리 폭은 같은 비율로 줄어든다.
 */
export function velocityDensity(v: number, T: number, f0: number, c: BoseEinsteinCondensateConstants): number {
  const wide = thermalWidth(T, c);
  const thermal = wide > 0 ? (1 - f0) * gauss(v, wide) : 0;
  return thermal + f0 * gauss(v, c.groundWidth);
}

/**
 * 판의 세로 배율 기준 — 가장 차가운 멈춤(T_LOW)의 봉우리 꼭대기 높이. 상수에서 한 번 정해지므로
 * 매 프레임 같다. 뜨거운 언덕은 이 봉우리에 견줘 낮게 나온다 — 그 대비가 주장이다.
 */
export function peakDensity(c: BoseEinsteinCondensateConstants): number {
  return velocityDensity(0, c.tLow, condensateFraction(c.tLow, c), c);
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** 쌓는 상태가 없다 — 모든 것이 (시드, 시각)의 함수다. */
export function step(params: { state: BoseEinsteinCondensateState }): BoseEinsteinCondensateState {
  return params.state;
}
