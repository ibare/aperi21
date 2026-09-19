// ========================================================================
// charge-in-uniform-field — 순수 물리
// ========================================================================
// 두 판을 옆에서 본 2차원 그림이다. 판 사이 장은 고르고(아래 방향), 판 밖에는 장이 없다.
// 전하가 판 앞 x = 0 에 닿은 때를 비행 시각 τ = 0 으로 둔다.
//
//   τ < 0 (판 앞)   x = v₀τ,  y = 들어온 높이                — 곧게 온다
//   τ ≥ 0 (판 사이) x = v₀τ,  y = 들어온 높이 − ½ (qE/m) τ²  — 포물선
//
// 모든 것이 조각 시계의 함수라 쌓는 것이 없다. 비행 시각은 시간표 단계의 진행도에서
// 읽는다 — 판 앞 구간은 `approach`, 판 사이는 `fly`(무거운 전하는 `heavy*`).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  APPROACH_LENGTH,
  CHARGE,
  CHARGE_RADIUS,
  ENTRY_Y,
  FIELD,
  FORCE_SCALE,
  GAP,
  HEAVY_MASS_RATIO,
  MASS,
  PLATE_LENGTH,
  PLATE_THICKNESS,
  SPEED,
  STROBE_INTERVAL,
} from './schema';
import type { ChargeInUniformFieldState } from './state';

/** 칸 수를 셀 때 나눗셈의 부동소수 오차를 덮는 여유. 표현의 정밀도라 상수에 두지 않는다. */
const STROBE_EPS = 1e-9;
/** 포물선을 표본하는 점 수(비행 전체). 곡선 어휘가 없어 점으로 잇는다 (장부 G28). */
const CURVE_SAMPLES = 64;

export interface ChargeInUniformFieldConstants {
  charge: number;
  mass: number;
  heavyMassRatio: number;
  field: number;
  speed: number;
  gap: number;
  plateLength: number;
  plateThickness: number;
  entryY: number;
  approachLength: number;
  strobeInterval: number;
  forceScale: number;
  chargeRadius: number;
}

/** 스테이지 상수를 기본값과 함께 읽는다. */
export function readConstants(stage: StageDef): ChargeInUniformFieldConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    charge: c.charge ?? CHARGE,
    mass: c.mass ?? MASS,
    heavyMassRatio: c.heavyMassRatio ?? HEAVY_MASS_RATIO,
    field: c.field ?? FIELD,
    speed: c.speed ?? SPEED,
    gap: c.gap ?? GAP,
    plateLength: c.plateLength ?? PLATE_LENGTH,
    plateThickness: c.plateThickness ?? PLATE_THICKNESS,
    entryY: c.entryY ?? ENTRY_Y,
    approachLength: c.approachLength ?? APPROACH_LENGTH,
    strobeInterval: c.strobeInterval ?? STROBE_INTERVAL,
    forceScale: c.forceScale ?? FORCE_SCALE,
    chargeRadius: c.chargeRadius ?? CHARGE_RADIUS,
  };
}

/** 두 전하 — 가벼운 것(질량 m)과 무거운 것(질량 배수 × m). 단계 id 묶음이 다르다. */
export type Which = 'light' | 'heavy';

const PHASES: Record<Which, { approach: string; fly: string; leave: string }> = {
  light: { approach: 'approach', fly: 'fly', leave: 'leave' },
  heavy: { approach: 'heavyApproach', fly: 'heavyFly', leave: 'heavyLeave' },
};

/** 그 전하의 질량. */
export function massOf(which: Which, c: ChargeInUniformFieldConstants): number {
  return which === 'light' ? c.mass : c.mass * c.heavyMassRatio;
}

/** 판 방향(아래) 가속 a = qE/m. */
export function accelOf(which: Which, c: ChargeInUniformFieldConstants): number {
  return (c.charge * c.field) / massOf(which, c);
}

/** 판 사이를 지나는 데 걸리는 시각 = 판 길이 / v₀. */
export function flightTime(c: ChargeInUniformFieldConstants): number {
  return c.plateLength / c.speed;
}

/**
 * 지금 그 전하의 비행 시각 τ. 판 앞에서는 음수(−들어오는 거리/v₀ 에서 0 까지),
 * 판 사이에서는 0 에서 비행 시간까지.
 */
export function flightClock(which: Which, tl: TimelineFrame, c: ChargeInUniformFieldConstants): number {
  const ph = PHASES[which];
  const before = -(c.approachLength / c.speed) * (1 - tl.at(ph.approach));
  return before + flightTime(c) * tl.at(ph.fly);
}

/** 비행 시각 τ 에서의 자리. */
export function positionAt(tau: number, which: Which, c: ChargeInUniformFieldConstants): Vec2 {
  const x = c.speed * tau;
  if (tau <= 0) return [x, c.entryY];
  return [x, c.entryY - 0.5 * accelOf(which, c) * tau * tau];
}

/** 이 전하가 화면에 나와 있는 정도 — 들어오기 시작하면 1, 판 끝에서 사라진다. */
export function chargeOpacity(which: Which, tl: TimelineFrame): number {
  const ph = PHASES[which];
  if (which === 'heavy' && tl.u < tl.start(ph.approach)) return 0;
  return 1 - tl.at(ph.leave);
}

/** 이 전하의 자국 · 곡선이 화면에 있는지 — 들어오기 시작한 뒤부터 지움 단계까지. */
export function recordShown(which: Which, tl: TimelineFrame): boolean {
  if (which === 'light') return true;
  return tl.u >= tl.start(PHASES.heavy.approach);
}

/** 지금까지 찍힌 자국의 비행 시각들 — 판 앞 x = 0 부터 같은 시간 간격. */
export function strobeTimes(tau: number, c: ChargeInUniformFieldConstants): number[] {
  if (tau < 0) return [];
  const n = Math.floor(tau / c.strobeInterval + STROBE_EPS);
  const out: number[] = [];
  for (let k = 0; k <= n; k++) out.push(k * c.strobeInterval);
  return out;
}

/** 지나온 포물선 — 판 앞 x = 0 에서 지금 자리까지 표본. */
export function pathSoFar(tau: number, which: Which, c: ChargeInUniformFieldConstants): Vec2[] {
  if (tau <= 0) return [];
  const total = flightTime(c);
  const n = Math.max(2, Math.ceil((CURVE_SAMPLES * tau) / total));
  const out: Vec2[] = [];
  for (let i = 0; i <= n; i++) out.push(positionAt((tau * i) / n, which, c));
  return out;
}

/** 받는 힘 화살표(월드) — 아래(− 판 쪽)로 qE × 배율. 두 전하가 같다. */
export function forceArrow(c: ChargeInUniformFieldConstants): Vec2 {
  return [0, -c.forceScale * c.charge * c.field];
}

/** 전하가 판 사이에 있는지 — 힘은 판 사이에서만 받는다. */
export function inField(tau: number): boolean {
  return tau > 0;
}

export function step(params: { state: ChargeInUniformFieldState }): ChargeInUniformFieldState {
  return params.state;
}
