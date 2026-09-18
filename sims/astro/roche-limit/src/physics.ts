// ========================================================================
// roche-limit — 순수 물리
// ========================================================================
// 행성(반지름 R, 밀도 ρM)이 원점에 있고, 제 중력으로 뭉친 알갱이 덩어리(반지름 a,
// 밀도 ρm)가 그 둘레를 돌며 다가온다. 덩어리 가까운 쪽 겉 알갱이 하나에 걸리는 두 힘 —
//
//   붙잡는 힘(제 중력)   Gm / a²         = (4/3)πGρm · a        ← 거리 d 와 상관없다
//   떼어 내는 힘(조석력) 2GM·a / d³      = (8/3)πGρM · R³a / d³ ← 1/d³ 로 자란다
//
// 둘이 같아지는 거리가 d_R = 2^(1/3) · R · (ρM/ρm)^(1/3) 이다(단단한 덩어리의 로슈 한계).
// 그래서 조석력 / 제 중력 = (d_R / d)³ — 화살표 길이의 비가 이것 하나로 정해진다.
//
// 궤도의 빠르기는 케플러 제3법칙 ω ∝ r^(-3/2). 한계 거리에서 한 바퀴가 `periodAtLimit` 초다.
// 풀리기 전에는 덩어리 전체가 중심의 ω 로 함께 돌고(한쪽 면을 행성에 향한 채), 풀린 뒤에는
// 알갱이마다 제 거리의 ω 로 돈다 — 안쪽 것이 더 빨라 궤도를 따라 번진다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다. 각은 지난 시각의 거리를 적분해야 해서
// 선언된 단계 길이 · 이징 이름을 읽어 같은 식을 여기서 건다 (G59).
// ========================================================================

import type { StageDef, TimelineEase, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CLUMP_RADIUS,
  DEBRIS_DISTANCE,
  DENSITY_RATIO,
  GRAIN_COUNT,
  PERIOD_AT_LIMIT,
  PLANET_RADIUS,
  ROCHE_COEFFICIENT,
  SEED,
  START_ANGLE_DEG,
  START_DISTANCE,
  rocheLimitSchema,
} from './schema';
import type { RocheLimitState } from './state';

export interface RocheLimitConstants {
  planetRadius: number;
  densityRatio: number;
  rocheCoefficient: number;
  startDistance: number;
  debrisDistance: number;
  clumpRadius: number;
  grainCount: number;
  seed: number;
  periodAtLimit: number;
  /** 주기 첫 순간 덩어리의 자리(도). */
  startAngle: number;
}

export function readConstants(stage: StageDef): RocheLimitConstants {
  const c = stage.constants ?? {};
  return {
    planetRadius: c.planetRadius ?? PLANET_RADIUS,
    densityRatio: c.densityRatio ?? DENSITY_RATIO,
    rocheCoefficient: c.rocheCoefficient ?? ROCHE_COEFFICIENT,
    startDistance: c.startDistance ?? START_DISTANCE,
    debrisDistance: c.debrisDistance ?? DEBRIS_DISTANCE,
    clumpRadius: c.clumpRadius ?? CLUMP_RADIUS,
    grainCount: c.grainCount ?? GRAIN_COUNT,
    seed: c.seed ?? SEED,
    periodAtLimit: c.periodAtLimit ?? PERIOD_AT_LIMIT,
    startAngle: c.startAngle ?? START_ANGLE_DEG,
  };
}

/** 로슈 한계 거리 d_R = 계수 · R · (ρM/ρm)^(1/3). */
export function rocheDistance(c: RocheLimitConstants): number {
  return c.rocheCoefficient * c.planetRadius * Math.cbrt(c.densityRatio);
}

/** 거리 r 에서의 원 궤도 각속도(rad / 조각 시계 초). 케플러 제3법칙. */
export function angularSpeed(c: RocheLimitConstants, r: number): number {
  return ((2 * Math.PI) / c.periodAtLimit) * Math.pow(rocheDistance(c) / r, 1.5);
}

/** 조석력 / 제 중력 — 덩어리 중심이 d 에 있을 때 가까운 쪽 겉 알갱이에서. */
export function tidalRatio(c: RocheLimitConstants, d: number): number {
  return Math.pow(rocheDistance(c) / d, 3);
}

// ------------------------------------------------------------------------
// 시간표 — 지난 시각의 거리를 묻기 위해 선언을 읽는다
// ------------------------------------------------------------------------

/** 엔진과 같은 이징 식. 선언된 단계의 `ease` 이름으로 고른다. */
const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/** 단계 id 의 주기 안 시각 u 에서의 진행도 — 전에는 0, 동안 0~1(선언의 이징), 뒤에는 1. */
function progressAt(tl: TimelineFrame, id: string, u: number): number {
  const p = (u - tl.start(id)) / tl.duration(id);
  const q = Math.min(1, Math.max(0, p));
  const phase = rocheLimitSchema.timeline?.phases.find((ph) => ph.id === id);
  return EASES[phase?.ease ?? 'linear'](q);
}

/**
 * 주기 안 시각 u 에서 덩어리(풀린 뒤에는 무리) 중심의 거리.
 * 다가오는 동안 출발 거리 → 한계, 한계 위에서 머물고, 풀리는 동안 무리 거리까지 조금 더 들어온다.
 */
export function centerDistanceAt(tl: TimelineFrame, c: RocheLimitConstants, u: number): number {
  const dR = rocheDistance(c);
  return (
    c.startDistance +
    (dR - c.startDistance) * progressAt(tl, 'approach', u) +
    (c.debrisDistance - dR) * progressAt(tl, 'breakup', u)
  );
}

/** 적분 걸음(조각 시계 초). 화면에서 각이 떨리지 않을 만큼 잘다. */
const QUAD_STEP = 1 / 240;

/**
 * 덩어리 중심의 각 — 주기 첫 순간의 각에서 ∫ω(d(u′))du′ 를 더한다. 사다리꼴 적분.
 * `samples` 를 주면 그 시각들의 각도 함께 돌려준다(지나온 자취용, 오름차순).
 */
export function centerAngleAt(
  tl: TimelineFrame,
  c: RocheLimitConstants,
  u: number,
  samples: readonly number[] = [],
): { angle: number; at: number[] } {
  const theta0 = (c.startAngle * Math.PI) / 180;
  const at: number[] = [];
  let k = 0;
  while (k < samples.length && samples[k]! <= 0) {
    at.push(theta0);
    k++;
  }
  let theta = theta0;
  let prevU = 0;
  let prevW = angularSpeed(c, centerDistanceAt(tl, c, 0));
  const n = Math.max(1, Math.ceil(u / QUAD_STEP));
  const h = u / n;
  for (let i = 1; i <= n; i++) {
    const uu = i * h;
    const w = angularSpeed(c, centerDistanceAt(tl, c, uu));
    const next = theta + 0.5 * (prevW + w) * h;
    while (k < samples.length && samples[k]! <= uu) {
      const f = (samples[k]! - prevU) / h;
      at.push(theta + (next - theta) * f);
      k++;
    }
    theta = next;
    prevU = uu;
    prevW = w;
  }
  while (k < samples.length) {
    at.push(theta);
    k++;
  }
  return { angle: theta, at };
}

// ------------------------------------------------------------------------
// 알갱이
// ------------------------------------------------------------------------

/** 시드 난수 (mulberry32). `Math.random` 을 쓰지 않는다 — 같은 시각은 같은 화면이다. */
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

/**
 * 덩어리 안 알갱이의 자리 — [행성에서 먼 쪽 +, 도는 쪽 +] 의 덩어리 좌표.
 * 0 번은 가까운 쪽 겉 알갱이다 — 두 화살표가 이 알갱이에 걸린다.
 */
export function grainOffsets(c: RocheLimitConstants): Vec2[] {
  const random = mulberry32(c.seed);
  const a = c.clumpRadius;
  const out: Vec2[] = [[-a, 0]];
  for (let i = 1; i < c.grainCount; i++) {
    const r = a * Math.sqrt(random());
    const t = random() * Math.PI * 2;
    out.push([r * Math.cos(t), r * Math.sin(t)]);
  }
  return out;
}

/** 덩어리 좌표 → 월드. 중심이 거리 d · 각 θ 에 있고 가까운 쪽이 늘 행성을 향한다. */
export function clumpToWorld(d: number, theta: number, o: Vec2): Vec2 {
  const ux = Math.cos(theta);
  const uy = Math.sin(theta);
  const r = d + o[0];
  return [r * ux - o[1] * uy, r * uy + o[1] * ux];
}

/** 풀린 알갱이 적분의 걸음 수(풀리는 단계 한 번). 무리 거리가 바뀌는 동안만 적분한다. */
const RELEASE_STEPS = 96;

/**
 * 주기 안 시각 u 의 알갱이 자리.
 *
 * 풀리기 전(`breakup` 시작 전)은 덩어리째 돈다. 풀린 뒤에는 알갱이마다 풀린 순간의 거리 r₀ 에서
 * 무리가 더 들어온 만큼(d_R − d(u)) 빼 준 거리로, 제 거리의 ω 로 돈다.
 */
export function grainPositions(
  tl: TimelineFrame,
  c: RocheLimitConstants,
  offsets: readonly Vec2[],
  u: number,
  centerAngle: number,
): Vec2[] {
  const uRelease = tl.start('breakup');
  if (u <= uRelease) {
    const d = centerDistanceAt(tl, c, u);
    return offsets.map((o) => clumpToWorld(d, centerAngle, o));
  }

  const dR = rocheDistance(c);
  const releaseAngle = centerAngleAt(tl, c, uRelease).angle;
  const uSettle = tl.end('breakup');
  const drift = (uu: number): number => dR - centerDistanceAt(tl, c, uu);

  // 풀리는 단계 안의 적분 구간 — 끝이 u 를 넘지 않는다.
  const uEnd = Math.min(u, uSettle);
  const h = (uEnd - uRelease) / RELEASE_STEPS;
  const drifts: number[] = [];
  for (let i = 0; i <= RELEASE_STEPS; i++) drifts.push(drift(uRelease + i * h));
  const settled = drift(uSettle);

  return offsets.map((o) => {
    const [x0, y0] = clumpToWorld(dR, releaseAngle, o);
    const r0 = Math.hypot(x0, y0);
    let phi = Math.atan2(y0, x0);
    let prevW = angularSpeed(c, r0 - drifts[0]!);
    for (let i = 1; i <= RELEASE_STEPS; i++) {
      const w = angularSpeed(c, r0 - drifts[i]!);
      phi += 0.5 * (prevW + w) * h;
      prevW = w;
    }
    let r = r0 - drifts[RELEASE_STEPS]!;
    if (u > uSettle) {
      r = r0 - settled;
      phi += angularSpeed(c, r) * (u - uSettle);
    }
    return [r * Math.cos(phi), r * Math.sin(phi)] as Vec2;
  });
}

/** 쌓는 상태가 없다 — 모든 것이 시간표 진행도의 함수다. */
export function step(params: { state: RocheLimitState }): RocheLimitState {
  return params.state;
}
