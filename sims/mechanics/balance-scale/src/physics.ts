// ========================================================================
// balance-scale — 순수 물리
// ========================================================================
// 저울대 각 θ 를 토크로 적분한다. 받침점이 무게중심보다 위에 있는 저울이라
// 기울면 되돌리는 토크(−k·sin θ)가 생긴다. 그래서 양쪽 토크가 같으면 수평에서
// 멈추고, 다르면 그 차이만큼 기운 채 멈춘다.
//
//   τ = g·(m_light·x_light − m_heavy·x_heavy)·cos θ − k·sin θ − c·ω
//
// 대본이 움직이는 것은 가벼운 추의 거리 하나뿐이고, 기울고 일어서는 것은 그 결과다.
// ========================================================================

import type { EnvironmentDef, StageDef, TimelineEase, Vec2 } from '@aperi21/schema';
import {
  ARM_LEVEL,
  ARM_NEAR,
  ARM_OVER,
  BLOCK,
  BLOCK_LIFT,
  DAMP,
  DRAG_MIN,
  GRAVITY,
  HEAVY_ARM,
  HEAVY_MASS,
  INERTIA,
  LEVEL_DEG,
  LIGHT_MASS,
  MANUAL_LEVEL_DEG,
  MAX_TILT,
  NOTCHES,
  RESTORE,
  UNIT,
  balanceScaleSchema,
} from './schema';
import type { BalanceScaleState } from './state';

export interface BalanceConstants {
  g: number;
  heavyMass: number;
  lightMass: number;
  heavyArm: number;
  restore: number;
  inertia: number;
  damp: number;
  maxTilt: number;
  armNear: number;
  armLevel: number;
  armOver: number;
}

export function readConstants(stage: StageDef): BalanceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    g: c.g ?? GRAVITY,
    heavyMass: c.heavyMass ?? HEAVY_MASS,
    lightMass: c.lightMass ?? LIGHT_MASS,
    heavyArm: c.heavyArm ?? HEAVY_ARM,
    restore: c.restore ?? RESTORE,
    inertia: c.inertia ?? INERTIA,
    damp: c.damp ?? DAMP,
    maxTilt: c.maxTilt ?? MAX_TILT,
    armNear: c.armNear ?? ARM_NEAR,
    armLevel: c.armLevel ?? ARM_LEVEL,
    armOver: c.armOver ?? ARM_OVER,
  };
}

type ArmKey = 'armNear' | 'armLevel' | 'armOver';

/**
 * 시간표 단계마다 가벼운 추가 어디서 어디로 가는가 — 스테이지 상수 이름으로 가리킨다.
 * 단계의 길이 · 순서 · 이징은 선언(`schema.timeline`)에 있다.
 */
export const PHASE_ARMS: Record<string, readonly [ArmKey, ArmKey]> = {
  near: ['armNear', 'armNear'],
  outward: ['armNear', 'armLevel'],
  level: ['armLevel', 'armLevel'],
  over: ['armLevel', 'armOver'],
  overHold: ['armOver', 'armOver'],
  back: ['armOver', 'armLevel'],
  levelAgain: ['armLevel', 'armLevel'],
  inward: ['armLevel', 'armNear'],
  nearAgain: ['armNear', 'armNear'],
};

/** 캡션이 각으로 「수평」 을 말하는 단계. 원본 장면 `level` · `back`. */
const LEVEL_PHASES: ReadonlySet<string> = new Set(['level', 'levelAgain', 'back']);

const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/**
 * 시계 → 지금 단계와 이징한 진행도. **선언의 단계 목록을 읽는다** — 단계 경계를
 * 상수로 두지 않는다. 엔진의 시간표 계산과 같은 일을 하는 것은 `step` 이
 * `TimelineFrame` 을 받지 못해서다 (NOTES 「어휘 부족」).
 */
export function phaseAt(clock: number): { id: string; progress: number } {
  const phases = balanceScaleSchema.timeline?.phases ?? [];
  const period = phases.reduce((s, p) => s + p.duration, 0);
  if (!(period > 0)) return { id: 'near', progress: 0 };
  let u = ((clock % period) + period) % period;
  for (const p of phases) {
    if (u < p.duration) {
      const ease = EASES[p.ease ?? 'linear'];
      return { id: p.id, progress: ease(Math.min(1, Math.max(0, u / p.duration))) };
    }
    u -= p.duration;
  }
  const last = phases[phases.length - 1]!;
  return { id: last.id, progress: 1 };
}

/** 대본이 그 시각에 가벼운 추를 두는 거리(눈금 칸). */
export function scriptedArm(clock: number, c: BalanceConstants): { x: number; phase: string } {
  const { id, progress } = phaseAt(clock);
  const [from, to] = PHASE_ARMS[id] ?? ['armNear', 'armNear'];
  return { x: c[from] + (c[to] - c[from]) * progress, phase: id };
}

/** 가벼운 추 거리가 x 일 때 저울이 멈추는 각. */
export function equilibrium(xLight: number, c: BalanceConstants): number {
  return Math.atan2(c.g * (c.lightMass * xLight - c.heavyMass * c.heavyArm), c.restore);
}

/**
 * 저울대 좌표(s 오른쪽 +, up 위 +, 월드 단위) → 월드 좌표.
 * θ 가 양수면 오른쪽이 내려가므로 월드에서는 −θ 만큼 돈 것이다.
 */
export function beamPoint(s: number, up: number, theta: number): Vec2 {
  const c = Math.cos(theta);
  const sn = Math.sin(theta);
  return [s * c + up * sn, -s * sn + up * c];
}

/** 가벼운 추(블록 하나)의 가운데 — 손잡이가 놓이는 자리. */
export function handleAt(xLight: number, theta: number): Vec2 {
  return beamPoint(xLight * UNIT, BLOCK_LIFT + BLOCK / 2, theta);
}

/** 캡션 국면. 원본 `captionText` 의 조건을 그대로 센다. */
export function deriveReadings(
  s: Pick<BalanceScaleState, 'theta' | 'manual'>,
  phase: string,
): Pick<BalanceScaleState, 'levelReached' | 'manualLevel' | 'manualHeavy' | 'manualLight'> {
  const deg = (Math.abs(s.theta) * 180) / Math.PI;
  const manualLevel = s.manual && deg < MANUAL_LEVEL_DEG;
  return {
    levelReached: !s.manual && LEVEL_PHASES.has(phase) && deg < LEVEL_DEG,
    manualLevel,
    manualHeavy: s.manual && !manualLevel && s.theta < 0,
    manualLight: s.manual && !manualLevel && s.theta >= 0,
  };
}

/**
 * 한 스텝 전진. 순수 함수.
 *
 * 잡고 있으면 손잡이 자리를 저울대 위로 투영해 거리로 삼는다 — `point-drag` 의
 * `snapTo` 는 선언이라 도는 저울대를 따라가지 못한다. 한 번 끌면 대본은 멈추고
 * 거리는 마지막으로 끈 자리에 남는다 (원본 `manual`).
 */
export function step(params: {
  state: BalanceScaleState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): BalanceScaleState {
  const { state, dt } = params;
  if (!(dt > 0)) return state;
  const c = readConstants(params.stage);

  const clock = state.clock + dt;
  let xLight = state.xLight;
  let manual = state.manual;
  const { x: scripted, phase } = scriptedArm(clock, c);

  if (state.held) {
    manual = true;
    const [hx, hy] = state.handle;
    // 저울대 방향(월드) = (cos θ, −sin θ). 원본 toBeamS 와 같은 투영이다.
    const s = hx * Math.cos(state.theta) - hy * Math.sin(state.theta);
    xLight = Math.max(DRAG_MIN, Math.min(NOTCHES, s / UNIT));
  } else if (!manual) {
    xLight = scripted;
  }

  // 원본과 같은 반암시 오일러 — 각속도를 먼저 갱신하고 그것으로 각을 민다.
  const tau =
    c.g * (c.lightMass * xLight - c.heavyMass * c.heavyArm) * Math.cos(state.theta) -
    c.restore * Math.sin(state.theta) -
    c.damp * state.omega;
  let omega = state.omega + (tau / c.inertia) * dt;
  let theta = state.theta + omega * dt;
  if (theta > c.maxTilt) {
    theta = c.maxTilt;
    omega = 0;
  }
  if (theta < -c.maxTilt) {
    theta = -c.maxTilt;
    omega = 0;
  }

  const next = {
    ...state,
    clock,
    theta,
    omega,
    xLight,
    manual,
    // 잡고 있지 않으면 손잡이가 추를 따라온다.
    handle: state.held ? state.handle : handleAt(xLight, theta),
  };
  return { ...next, ...deriveReadings(next, phase) };
}
