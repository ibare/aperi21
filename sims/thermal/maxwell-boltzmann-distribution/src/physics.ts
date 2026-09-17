// ========================================================================
// maxwell-boltzmann-distribution — 순수 물리
// ========================================================================
// DOM · 캔버스 · 실시간을 모른다. 난수는 선언의 시드에서만 나온다.
// ========================================================================

import type { StageDef, TimelineEase, TimelinePhase } from '@aperi21/schema';
import { maxwellBoltzmannDistributionSchema, TEMP_RANGE } from './schema';
import type { MaxwellBoltzmannDistributionState } from './state';

const K_B = 1.380649e-23;
const ATOMIC_MASS = 1.66054e-27;

export interface GasConstants {
  /** 기준 온도(K) — 점선과 표본의 온도. */
  t0: number;
  /** 자동 진행의 높은 온도(K). */
  tHot: number;
  /** 분자 질량(u). */
  massU: number;
  /** 분자 수. */
  count: number;
  /** 속력 축 끝(m/s). 넘는 분자는 끝에 붙인다. */
  vMax: number;
  /** 층별 추출 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): GasConstants {
  const c = stage.constants ?? {};
  return {
    t0: c.t0 ?? 300,
    tHot: c.tHot ?? 1200,
    massU: c.massU ?? 28,
    count: Math.max(1, Math.round(c.count ?? 500)),
    vMax: c.vMax ?? 2500,
    seed: c.seed ?? 1,
  };
}

/** 최빈 속력 vp = √(2kT/m) (m/s). */
export function mostProbableSpeed(temp: number, massU: number): number {
  return Math.sqrt((2 * K_B * temp) / (massU * ATOMIC_MASS));
}

// ---- 수학 (원본 그대로) ----

function erf(x0: number): number {
  const s = x0 < 0 ? -1 : 1;
  const x = Math.abs(x0);
  const p = 0.3275911, a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const tt = 1 / (1 + p * x);
  const y = 1 - ((((a5 * tt + a4) * tt + a3) * tt + a2) * tt + a1) * tt * Math.exp(-x * x);
  return s * y;
}

/** x = v / vp 에 대한 누적 분포. */
function cdf(x: number): number {
  return erf(x) - (2 / Math.sqrt(Math.PI)) * x * Math.exp(-x * x);
}

function invCdf(q: number): number {
  let lo = 0;
  let hi = 6;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    if (cdf(m) < q) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

/**
 * 봉우리 높이에 대한 곡선 높이 비. 온도 T0 의 봉우리가 1 이다.
 *
 * f(v; vp) / f(vp0; vp0) = x² · e^(1 − x²) · vp0 / vp, x = v / vp.
 * 분자 수가 같으니 넓어진 만큼 낮아진다 — 이 식이 곧 주장이다.
 */
export function relativeDensity(v: number, vp: number, vp0: number): number {
  const x = v / vp;
  return x * x * Math.exp(1 - x * x) * (vp0 / vp);
}

/** mulberry32 — 원본 하네스(`PieceKit.random`)와 같은 수열. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GOLD = 0.6180339887;

/**
 * 분자 표본. 300 K 속력은 분위 칸마다 난수 하나로 층별 추출(오름차순), 높이 비율은
 * 황금비 수열 + 작은 흔들림. 난수를 뽑는 순서까지 원본과 같다 — 같은 시드면 같은 더미다.
 */
export function sampleMolecules(c: GasConstants): { baseSpeeds: number[]; heightFracs: number[] } {
  const random = mulberry32(c.seed);
  const vp0 = mostProbableSpeed(c.t0, c.massU);
  const baseSpeeds: number[] = [];
  for (let i = 0; i < c.count; i++) {
    const q = Math.min(1 - 1e-6, Math.max(1e-6, (i + random()) / c.count));
    baseSpeeds.push(invCdf(q) * vp0);
  }
  const heightFracs: number[] = [];
  for (let i = 0; i < c.count; i++) {
    const g = (i * GOLD + 0.31) % 1;
    heightFracs.push(Math.min(0.97, Math.max(0.03, g + (random() - 0.5) * 0.04)));
  }
  return { baseSpeeds, heightFracs };
}

/** 따라가는 분자의 번호. */
export function trackedIndices(count: number, quantiles: readonly number[]): number[] {
  return quantiles.map((q) => Math.floor(count * q));
}

/** 온도를 올린 배율 √(T/T0) — 모든 분자의 속력에 같이 곱해진다. */
export function speedFactor(temp: number, t0: number): number {
  return Math.sqrt(temp / t0);
}

// ---- 자동 진행 ----

const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/**
 * 시간표 선언의 한 단계 진행도를 조각 시계에서 다시 센다.
 *
 * `step` 이 엔진의 `TimelineFrame` 을 받지 못해서다 (G01). 단계 길이·이징은 **선언을
 * 읽는다** — 상수를 옮겨 오지 않아 저작자가 시간표를 바꾸면 여기도 따라간다.
 */
function phaseProgress(phases: readonly TimelinePhase[], id: string, clock: number): number {
  const period = phases.reduce((sum, p) => sum + p.duration, 0);
  const u = ((clock % period) + period) % period;
  let start = 0;
  for (const p of phases) {
    if (p.id === id) {
      const x = Math.min(1, Math.max(0, (u - start) / p.duration));
      return EASES[p.ease ?? 'linear'](x);
    }
    start += p.duration;
  }
  throw new Error(`maxwell-boltzmann-distribution: 시간표에 단계 ${id} 가 없다`);
}

/** 두 진행도(데우기 · 식히기)로 자동 온도를 낸다. scene 도 같은 식을 `TimelineFrame` 으로 쓴다. */
export function autoTemp(heat: number, cool: number, c: GasConstants): number {
  return c.t0 + (c.tHot - c.t0) * (heat - cool);
}

/** 수동일 때 목표로 따라가는 빠르기(1/초). 원본 그대로. */
const FOLLOW_RATE = 5;
/** 목표에 이만큼 가까우면 붙인다(K). */
const SNAP_K = 0.5;
/** 방향 판정의 문턱(K). */
const DIR_EPS = 1e-6;

export function step(params: {
  state: MaxwellBoltzmannDistributionState;
  dt: number;
  stage: StageDef;
}): MaxwellBoltzmannDistributionState {
  const { state, dt, stage } = params;
  const c = readConstants(stage);
  const clock = state.clock + dt;
  const prev = state.temp;

  // 한 번 잡으면 수동이다. 원본은 손을 떼도 자동으로 돌아가지 않는다.
  const manual = state.manual || state.held;
  let temp: number;
  if (manual) {
    const target = Math.min(TEMP_RANGE[1], Math.max(TEMP_RANGE[0], state.sliderT));
    temp = prev + (target - prev) * (1 - Math.exp(-dt * FOLLOW_RATE));
    if (Math.abs(target - temp) < SNAP_K) temp = target;
  } else {
    const phases = maxwellBoltzmannDistributionSchema.timeline?.phases ?? [];
    temp = autoTemp(phaseProgress(phases, 'heat', clock), phaseProgress(phases, 'cool', clock), c);
  }

  const dT = temp - prev;
  const dir = Math.abs(dT) > DIR_EPS ? Math.sign(dT) : 0;
  const rounded = Math.round(temp);

  return {
    ...state,
    clock,
    temp,
    dir,
    manual,
    sliderT: manual ? state.sliderT : rounded,
    manualHeating: manual && dir > 0,
    manualCooling: manual && dir < 0,
    manualCold: manual && dir === 0 && rounded <= c.t0,
    manualWarm: manual && dir === 0 && rounded > c.t0,
    // 자동 진행이라도 온도가 멈춰 있고 기준 온도면 "300 K" 문장이다 — 도착한 첫 프레임과
    // 쉬기 단계. 원본은 단계가 아니라 변화 방향으로 캡션을 골랐다 (NOTES 「어휘 부족」).
    restingCold: dir === 0 && rounded <= c.t0,
    tempText: String(rounded),
    countText: String(c.count),
  };
}
