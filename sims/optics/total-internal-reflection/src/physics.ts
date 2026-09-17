// ========================================================================
// total-internal-reflection — 순수 계산
// ========================================================================
// 빛이 밀한 매질(n1)에서 공기(n2 = 1)로 나갈 때 경계면에서 스넬 · 프레넬로 나뉜다. 원본 `split` 그대로.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import {
  AUTO,
  GUIDE,
  LAYOUT,
  MANUAL,
  NEAR_DEG,
  N_AIR,
  totalInternalReflectionSchema,
} from './schema';
import type { TotalInternalReflectionState } from './state';

export const DEG = Math.PI / 180;

export interface Split {
  /** 되돌아오는 몫(편광되지 않은 빛의 프레넬 반사율). */
  R: number;
  /** 나가는 몫. */
  T: number;
  /** 굴절각(라디안). 임계각 이상이면 null. */
  thetaT: number | null;
}

/** 편광되지 않은 빛의 프레넬 반사 비율. 임계각 이상이면 1. */
export function split(n1: number, thetaI: number): Split {
  const ci = Math.cos(thetaI);
  const st = (n1 / N_AIR) * Math.sin(thetaI);
  if (st >= 1) return { R: 1, T: 0, thetaT: null };
  const ct = Math.sqrt(1 - st * st);
  const rs = (n1 * ci - N_AIR * ct) / (n1 * ci + N_AIR * ct);
  const rp = (N_AIR * ci - n1 * ct) / (N_AIR * ci + n1 * ct);
  const R = (rs * rs + rp * rp) / 2;
  return { R, T: 1 - R, thetaT: Math.asin(st) };
}

export const criticalAngle = (n1: number): number => Math.asin(N_AIR / n1);

// ------------------------------------------------------------------------
// 자동 진행 — 단계와 진행도에서 입사각
// ------------------------------------------------------------------------

/**
 * 임계각에서 벗어난 각(도). 원본의 `v = −cos(2π(p + 1.77)/12)` 를 세 단계로 나눈 것이다 —
 * approach 는 v 가 −1 → 0, beyond 는 0 → 1 → 0, retreat 는 0 → −1. 휜 모양은 |v|^1.8.
 */
function offsetDeg(phase: string, progress: number): number {
  const bend = (v: number): number => Math.pow(Math.max(0, v), AUTO.exponent);
  if (phase === 'beyond') return AUTO.above * bend(Math.sin(Math.PI * progress));
  if (phase === 'retreat') return -AUTO.below * bend(Math.sin((Math.PI / 2) * progress));
  return -AUTO.below * bend(Math.cos((Math.PI / 2) * progress));
}

/** 자동 진행의 입사각(라디안). */
export function autoAngle(phase: string, progress: number, n1: number): number {
  const deg = criticalAngle(n1) / DEG + offsetDeg(phase, progress);
  return Math.min(AUTO.maxDeg, Math.max(AUTO.minDeg, deg)) * DEG;
}

/** 조작과 자동을 섞은 입사각(라디안) — 원본 `currentAngle`. */
export function currentAngle(s: TotalInternalReflectionState, phase: string, progress: number): number {
  const a = autoAngle(phase, progress, s.n);
  return a + (s.manualDeg * DEG - a) * s.blend;
}

/**
 * 조각 시계로 선언된 시간표의 지금 단계와 진행도를 다시 센다 — `step` 은 `TimelineFrame` 을 받지
 * 못한다(NOTES 「어휘 부족」). 단계 길이는 선언에서 읽고, 세 단계 모두 이징이 없다(linear).
 */
function phaseAt(clock: number): { phase: string; progress: number } {
  const phases = totalInternalReflectionSchema.timeline!.phases;
  const period = phases.reduce((acc, p) => acc + p.duration, 0);
  const u = ((clock % period) + period) % period;
  let start = 0;
  for (const p of phases) {
    if (u < start + p.duration) return { phase: p.id, progress: (u - start) / p.duration };
    start += p.duration;
  }
  const last = phases[phases.length - 1]!;
  return { phase: last.id, progress: 1 };
}

// ------------------------------------------------------------------------
// 월드 좌표 — 원본 px, y 위
// ------------------------------------------------------------------------

/** 원본 캔버스 px (y 아래) → 월드 (y 위). */
export const W = (x: number, y: number): Vec2 => [x, -y];

/** 광원 자리(월드) — 입사점에서 광원 쪽으로 172. */
export function sourcePos(theta: number): Vec2 {
  return W(LAYOUT.px - Math.sin(theta) * GUIDE.sourceDist, LAYOUT.by + Math.cos(theta) * GUIDE.sourceDist);
}

/** 끈 자리(월드)에서 입사각 — 원본 `pointerAngle`. 장면 밖이면 null. */
function pointerAngle(pos: Vec2): number | null {
  const x = pos[0];
  const y = -pos[1];
  if (x > LAYOUT.sceneW) return null;
  const dx = Math.abs(x - LAYOUT.px);
  const dy = Math.max(1, y - LAYOUT.by);
  return Math.min(MANUAL.maxDeg * DEG, Math.max(0, Math.atan2(dx, dy)));
}

// ------------------------------------------------------------------------
// 한 걸음 — 조작 인계 · 캡션 판정
// ------------------------------------------------------------------------

export function step(params: { state: TotalInternalReflectionState; dt: number }): TotalInternalReflectionState {
  const { dt } = params;
  const s = params.state;
  const clock = s.clock + dt;

  let { manual, idle, manualDeg, blend } = s;
  if (s.dragHeld) {
    manual = true;
    idle = 0;
    const a = pointerAngle(s.dragPos);
    if (a !== null) manualDeg = a / DEG;
  } else if (manual) {
    idle += dt;
    if (idle > MANUAL.idleSeconds) manual = false;
  }
  const target = manual ? 1 : 0;
  blend += (target - blend) * Math.min(1, dt * MANUAL.blendRate);
  if (!manual && blend < 0.001) blend = 0;

  const next: TotalInternalReflectionState = { ...s, clock, manual, idle, manualDeg, blend };
  const { phase, progress } = phaseAt(clock);
  const theta = currentAngle(next, phase, progress);
  const { T } = split(next.n, theta);
  const thc = criticalAngle(next.n);

  const capTotal = T <= 0;
  const capNear = !capTotal && theta >= thc - NEAR_DEG * DEG;
  return {
    ...next,
    angleDeg: theta / DEG,
    // 잡지 않았을 때 손잡이를 광원 위에 둔다 — 잡는 자리가 곧 광원이다.
    dragPos: s.dragHeld ? s.dragPos : sourcePos(theta),
    capTotal,
    capNear,
    capFar: !capTotal && !capNear,
  };
}
