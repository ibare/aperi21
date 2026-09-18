// ========================================================================
// gravitational-time-dilation — 순수 물리
// ========================================================================
// 땅(A 의 자리)의 시각 t 로 잰다. t 는 기록이 시작한 순간(`lift` 시작)부터 흐른
// 시각이고, 그 순간 두 시계가 모두 12시를 가리킨다.
//
//   B 의 높이 비          f(t) = h(t) / H         lift 동안 0 → 1, up 동안 1, lower 동안 1 → 0
//   B 의 빠르기           dτ_B/dt = 1 + k · f(t)   k = boost · g · H / c²
//   A 의 판독             τ_A = t
//   B 의 판독             τ_B = t + k · ∫ f dt
//
// 높이가 단계 안에서 고르게(선형) 바뀌므로 ∫ f dt 가 닫힌 꼴이다. 모든 것이 시각의
// 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { BOOST, C_MS, G_MS2, HEIGHT_M, REAL_NS_PER_DAY, TICK_PERIOD } from './schema';
import type { GravitationalTimeDilationState } from './state';

export interface GravitationalTimeDilationConstants {
  /** 중력 가속도(m/s²). */
  gMs2: number;
  /** 탑 높이(m). */
  heightM: number;
  /** 빛의 속력(m/s). */
  cMs: number;
  /** 빠르기 차이를 부풀리는 배율. */
  boost: number;
  /** 한 째깍의 제 시간(초). */
  tickPeriod: number;
  /** 화면에 띄울 실제 크기 — 하루에 앞서는 몫(ns, 선언값). */
  realNsPerDay: number;
}

export function readConstants(stage: StageDef): GravitationalTimeDilationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gMs2: c.gMs2 ?? G_MS2,
    heightM: c.heightM ?? HEIGHT_M,
    cMs: c.cMs ?? C_MS,
    boost: c.boost ?? BOOST,
    tickPeriod: c.tickPeriod ?? TICK_PERIOD,
    realNsPerDay: c.realNsPerDay ?? REAL_NS_PER_DAY,
  };
}

/** 탑 꼭대기 시계가 땅의 시계보다 빨리 가는 몫(부풀린 값) k = boost · gH / c². */
export function topRateExcess(c: GravitationalTimeDilationConstants): number {
  return (c.boost * c.gMs2 * c.heightM) / (c.cMs * c.cMs);
}

/** 기록 구간의 세 단계 길이(초) — 시간표 선언에서 읽는다. */
export interface TripDurations {
  lift: number;
  up: number;
  lower: number;
}

export function tripDurations(tl: TimelineFrame): TripDurations {
  return { lift: tl.duration('lift'), up: tl.duration('up'), lower: tl.duration('lower') };
}

/** 기록 구간의 길이(초). 이 뒤로는 기록이 쌓이지 않는다. */
export function recordSpan(d: TripDurations): number {
  return d.lift + d.up + d.lower;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** 기록 시각 t 에서 B 의 높이 비 f(t) (0 = 땅, 1 = 꼭대기). */
export function heightFraction(t: number, d: TripDurations): number {
  if (t <= 0) return 0;
  if (t < d.lift) return t / d.lift;
  if (t < d.lift + d.up) return 1;
  return 1 - clamp01((t - d.lift - d.up) / d.lower);
}

/** ∫₀ᵗ f dt — B 가 위에 있던 「높이 × 시간」. 기록 구간 뒤로는 늘지 않는다. */
export function heightIntegral(t: number, d: TripDurations): number {
  const lift = d.lift * clamp01(t / d.lift) ** 2 / 2;
  const up = d.up * clamp01((t - d.lift) / d.up);
  const q = clamp01((t - d.lift - d.up) / d.lower);
  const lower = d.lower * (q - (q * q) / 2);
  return lift + up + lower;
}

/** 기록 시각 t 에서 B 가 A 보다 앞선 몫(째깍 단위, 바퀴 수). */
export function leadTurns(t: number, d: TripDurations, k: number, tickPeriod: number): number {
  return (k * heightIntegral(t, d)) / tickPeriod;
}

/** 째깍을 세는 경계의 허용치(초). 정수 경계가 부동소수로 조금 넘쳐도 센다. */
const COUNT_EPS = 1e-6;
/** B 의 째깍 시각을 찾는 이분법 반복 횟수. 2⁻⁴⁰ 배 폭이면 화면에서 구분되지 않는다. */
const BISECT_STEPS = 40;

/** B 의 판독 τ_B(t) / 째깍 주기 — 바늘이 돈 바퀴 수. */
function bTurnsAt(t: number, d: TripDurations, k: number, tickPeriod: number): number {
  return t / tickPeriod + leadTurns(t, d, k, tickPeriod);
}

/** B 가 n 번째로 째깍인 기록 시각. τ_B 가 늘기만 하므로 이분법으로 푼다. */
function bTickTime(n: number, d: TripDurations, k: number, tickPeriod: number): number {
  let lo = 0;
  let hi = n * tickPeriod; // τ_B ≥ t 이므로 이 시각에는 이미 n 을 넘었다
  for (let i = 0; i < BISECT_STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (bTurnsAt(mid, d, k, tickPeriod) < n) lo = mid;
    else hi = mid;
  }
  return hi;
}

/** 한 시각의 두 시계 판독 · B 의 높이 · 쌓인 째깍 기록. */
export interface ClockFrame {
  /** 기록이 시작한 순간부터 흐른 시각(초). 그 전(`sync`)은 음수. */
  t: number;
  /** 기록 커서가 멈춘 시각(초) — 0 ~ 기록 구간 길이. */
  tRecord: number;
  /** 기록 구간 길이(초). */
  span: number;
  /** B 의 높이 비 (0 = 땅, 1 = 꼭대기). */
  bHeight: number;
  /** A 바늘이 돈 바퀴 수. */
  aTurns: number;
  /** B 바늘이 돈 바퀴 수 — `reset` 동안 A 에 맞춰 되돌아간다. */
  bTurns: number;
  /** 지금 B 가 A 보다 앞선 몫(바퀴 수). */
  lead: number;
  /** 쌓인 A 의 째깍 시각(기록 시각, 0 부터). 기록 전이면 빈 배열. */
  aTicks: number[];
  /** 쌓인 B 의 째깍 시각. */
  bTicks: number[];
}

export function clockFrame(tl: TimelineFrame, c: GravitationalTimeDilationConstants): ClockFrame {
  const d = tripDurations(tl);
  const span = recordSpan(d);
  const k = topRateExcess(c);
  const t = tl.u - tl.start('lift');
  const tRecord = Math.min(span, Math.max(0, t));

  // 한 주기 안의 A 판독 — 주기 합이 째깍 주기의 정수배라 주기 끝에서 튀지 않는다.
  const aTurns = tl.u / c.tickPeriod;
  const lead = leadTurns(tRecord, d, k, c.tickPeriod) * (1 - tl.at('reset'));

  const aTicks: number[] = [];
  const bTicks: number[] = [];
  if (t >= -COUNT_EPS) {
    const aCount = Math.floor(tRecord / c.tickPeriod + COUNT_EPS);
    for (let n = 0; n <= aCount; n++) aTicks.push(n * c.tickPeriod);
    const bCount = Math.floor(bTurnsAt(tRecord, d, k, c.tickPeriod) + COUNT_EPS);
    for (let n = 0; n <= bCount; n++) bTicks.push(n === 0 ? 0 : bTickTime(n, d, k, c.tickPeriod));
  }

  return {
    t,
    tRecord,
    span,
    bHeight: tl.at('lift') * (1 - tl.at('lower')),
    aTurns,
    bTurns: aTurns + lead,
    lead,
    aTicks,
    bTicks,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: GravitationalTimeDilationState }): GravitationalTimeDilationState {
  return params.state;
}
