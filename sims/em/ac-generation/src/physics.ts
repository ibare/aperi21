// ========================================================================
// ac-generation — 순수 물리
// ========================================================================
// 코일 면의 법선이 자기장(N → S, 월드 +x)과 이루는 각을 θ 라 하면 코일을 지나는
// 선속은 Φ = NBA cos θ 다. 각속도 ω 로 돌면(θ = ωt) 기전력은
//
//   ε = −dΦ/dt = NBAω sin θ
//
// — 코일 면이 장에 **수직**(θ = 0 · π, 선속이 가장 큼)일 때 선속이 잠깐 멈춰 기전력 0,
// 장과 **나란할** 때(θ = π/2 · 3π/2, 선속 0) 선속이 가장 빨리 바뀌어 기전력이 마루다.
// 빨리 돌리면 ω 가 커져 마루가 ω 에 비례해 높아지고 주기가 짧아져 촘촘해진다.
//
// 모든 것이 시각의 함수라 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { COIL_AREA, EMF_TO_WORLD, FIELD_B, SPEED_RATIO, TURNS, TURNS_PER_SECOND } from './schema';
import type { AcGenerationState } from './state';

export interface AcGenerationConstants {
  turns: number;
  fieldB: number;
  coilArea: number;
  turnsPerSecond: number;
  speedRatio: number;
  emfToWorld: number;
}

export function readConstants(stage: StageDef): AcGenerationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    turns: c.turns ?? TURNS,
    fieldB: c.fieldB ?? FIELD_B,
    coilArea: c.coilArea ?? COIL_AREA,
    turnsPerSecond: c.turnsPerSecond ?? TURNS_PER_SECOND,
    speedRatio: c.speedRatio ?? SPEED_RATIO,
    emfToWorld: c.emfToWorld ?? EMF_TO_WORLD,
  };
}

/** 한 번의 돌림 — 기록지 한 벌. 느린 돌림(`slow`)과 빠른 돌림(`fast`). */
export type Run = 'slow' | 'fast';

/** 그 돌림의 각속도(rad/s). */
export function omegaOf(run: Run, c: AcGenerationConstants): number {
  const base = 2 * Math.PI * c.turnsPerSecond;
  return run === 'slow' ? base : base * c.speedRatio;
}

/** 기전력의 마루 NBAω(V). */
export function peakEmf(run: Run, c: AcGenerationConstants): number {
  return c.turns * c.fieldB * c.coilArea * omegaOf(run, c);
}

/**
 * 주기 안 시각 u 까지 코일이 돈 각. 느린 돌림 동안은 ω₁, 그 뒤(빠른 돌림 · 견줌 · 비움)는
 * 내내 ω₂ 로 돈다 — 각은 이어 붙인다.
 */
function angleInCycle(u: number, tl: TimelineFrame, c: AcGenerationConstants): number {
  const slowEnd = tl.end('slow');
  const w1 = omegaOf('slow', c);
  const w2 = omegaOf('fast', c);
  return u <= slowEnd ? w1 * u : w1 * slowEnd + w2 * (u - slowEnd);
}

/**
 * 조각 시계에서 코일 법선의 각 θ(라디안). 주기마다 한 주기 동안 돈 각을 더해 이어진다 —
 * 주기가 넘어가도 코일이 튀지 않는다.
 */
export function coilAngle(tl: TimelineFrame, c: AcGenerationConstants): number {
  return tl.cycle * angleInCycle(tl.period, tl, c) + angleInCycle(tl.u, tl, c);
}

/** 그 돌림이 시작할 때의 코일 각. 자취는 이 각에서 출발한다. */
export function runStartAngle(run: Run, tl: TimelineFrame, c: AcGenerationConstants): number {
  return tl.cycle * angleInCycle(tl.period, tl, c) + angleInCycle(tl.start(run), tl, c);
}

/** 각 θ 에서의 기전력(V). */
export function emfAt(theta: number, run: Run, c: AcGenerationConstants): number {
  return peakEmf(run, c) * Math.sin(theta);
}

/**
 * 코일 면(옆에서 보면 선 하나)의 방향 — 법선 (cos θ, sin θ) 에 수직. θ = 0 이면 세로로
 * 서서 장에 수직, θ = π/2 이면 가로로 누워 장과 나란하다. 표지 끝이 이 방향 쪽이다.
 */
export function coilDirection(theta: number): Vec2 {
  return [-Math.sin(theta), Math.cos(theta)];
}

/**
 * 그 돌림에서 기전력이 0 이거나 마루인 시각들(돌림 시작에서 잰 초) — 법선 각이 π/2 의
 * 배수가 되는 순간. 돌림 길이 안의 것만.
 */
export function quarterTimes(run: Run, theta0: number, duration: number, c: AcGenerationConstants): number[] {
  const w = omegaOf(run, c);
  if (!(w > 0)) return [];
  const q = Math.PI / 2;
  const first = Math.ceil(theta0 / q - EPS) * q;
  const out: number[] = [];
  for (let a = first; (a - theta0) / w <= duration + EPS; a += q) out.push((a - theta0) / w);
  return out;
}

/** 사분 주기 경계를 셀 때 부동소수 오차를 흡수하는 여유(라디안 · 초). */
const EPS = 1e-9;

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: AcGenerationState }): AcGenerationState {
  return params.state;
}
