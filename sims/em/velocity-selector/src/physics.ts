// ========================================================================
// velocity-selector — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 세 전하의 자리는 모두 발사 뒤 흐른 시간의 함수이고 `step` 은 항등이다.
//
// 교차장 속 운동은 정확한 해가 있다. E 가 아래(−y), B 가 종이 안(−z)이면 양전하는
//
//   표류 속도  v_d = E / B  (+x)
//   회전      ω = (q/m) · B, 반시계
//   u₀ = v₀ − v_d  (표류하는 틀에서 본 처음 속도)
//
//   x(s) = v_d s + (u₀/ω) sin ωs
//   y(s) = (u₀/ω)(1 − cos ωs)
//
// u₀ = 0 (v₀ = E/B) 이면 y 가 늘 0 — 곧게 지난다. u₀ > 0 이면 위(자기력 쪽), u₀ < 0 이면
// 아래(전기력 쪽)로 휜다. 힘은 F_E = (0, −qE), F_B = q v × B = qB(−v_y, v_x).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  CHARGE,
  CHARGE_TO_MASS,
  DETECTOR_X,
  FIELD_B,
  FIELD_E,
  FORCE_SCALE,
  PLATE_HALF_GAP,
  PLATE_LENGTH,
  SLIT_HALF,
  SOURCE_X,
  SPEED_FAST,
  SPEED_SLOW,
} from './schema';
import type { VelocitySelectorState } from './state';

/** 판에 닿는 순간을 찾는 훑기 걸음(초). 이 사이에서 이분법으로 좁힌다. */
const SEARCH_STEP_S = 1 / 240;
/** 이만큼 날아도 아무 데도 닿지 않으면 그 자리에서 멈춘 것으로 본다(초). */
const SEARCH_LIMIT_S = 60;
/** 이분법 횟수. */
const BISECT_ITERS = 40;
/** 궤적 표본 간격(초). */
const PATH_STEP_S = 1 / 60;

export interface VelocitySelectorConstants {
  charge: number;
  chargeToMass: number;
  fieldE: number;
  fieldB: number;
  speedSlow: number;
  speedFast: number;
  plateLength: number;
  plateHalfGap: number;
  slitHalf: number;
  sourceX: number;
  detectorX: number;
  forceScale: number;
}

export function readConstants(stage: StageDef): VelocitySelectorConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    charge: c.charge ?? CHARGE,
    chargeToMass: c.chargeToMass ?? CHARGE_TO_MASS,
    fieldE: c.fieldE ?? FIELD_E,
    fieldB: c.fieldB ?? FIELD_B,
    speedSlow: c.speedSlow ?? SPEED_SLOW,
    speedFast: c.speedFast ?? SPEED_FAST,
    plateLength: c.plateLength ?? PLATE_LENGTH,
    plateHalfGap: c.plateHalfGap ?? PLATE_HALF_GAP,
    slitHalf: c.slitHalf ?? SLIT_HALF,
    sourceX: c.sourceX ?? SOURCE_X,
    detectorX: c.detectorX ?? DETECTOR_X,
    forceScale: c.forceScale ?? FORCE_SCALE,
  };
}

/**
 * 차례로 쏘는 세 전하. `id` 가 곧 시간표 단계 id 다 — 그 단계 동안 날아간다.
 * 목록 길이는 코드에 있다(스테이지 상수가 수 하나씩이라, NOTES c G105).
 */
export const RUNS = [
  { id: 'slow', speed: (c: VelocitySelectorConstants) => c.speedSlow },
  { id: 'fast', speed: (c: VelocitySelectorConstants) => c.speedFast },
  // 맞는 속력은 선언값이 아니라 E/B 로 정해진다 — 상수를 바꿔도 이 전하는 늘 곧게 지난다.
  { id: 'match', speed: (c: VelocitySelectorConstants) => c.fieldE / c.fieldB },
] as const;

export type RunId = (typeof RUNS)[number]['id'];

/** 비행이 어떻게 끝났는가. */
export type Outcome = 'upper' | 'lower' | 'wall' | 'detector' | 'free';

interface Kin {
  pos: Vec2;
  vel: Vec2;
}

/** 입구 슬릿(x = 0, y = 0)을 지난 뒤 s 초의 자리 · 속도. */
function inField(c: VelocitySelectorConstants, v0: number, s: number): Kin {
  const vd = c.fieldE / c.fieldB;
  const w = c.chargeToMass * c.fieldB;
  const u0 = v0 - vd;
  const sn = Math.sin(w * s);
  const cs = Math.cos(w * s);
  return {
    pos: [vd * s + (u0 / w) * sn, (u0 / w) * (1 - cs)],
    vel: [vd + u0 * cs, u0 * sn],
  };
}

/** 장 속에서 무언가에 닿았는가(판 · 입구 벽 · 출구 벽). */
function blocked(c: VelocitySelectorConstants, p: Vec2): boolean {
  return Math.abs(p[1]) >= c.plateHalfGap || p[0] >= c.plateLength || p[0] < 0;
}

export interface Flight {
  v0: number;
  /** 발사 뒤 입구 슬릿에 닿는 시각(초). */
  enterT: number;
  /** 장을 떠나는 시각(초) — 판 · 벽에 닿거나 출구 슬릿을 지나는 때. */
  leaveT: number;
  /** 멈추는 시각(초). */
  stopT: number;
  outcome: Outcome;
  /** 출구 슬릿을 지난 자리 · 속도. 빠져나가지 못했으면 없다. */
  exit?: Kin;
}

/** 한 속력의 비행 전체를 정한다. 같은 상수 · 속력이면 언제나 같은 값이다. */
export function planFlight(c: VelocitySelectorConstants, v0: number): Flight {
  const enterT = -c.sourceX / v0;
  // 훑어서 처음 막히는 걸음을 찾고, 그 사이를 이분법으로 좁힌다.
  let lo = 0;
  let hi = -1;
  for (let s = SEARCH_STEP_S; s <= SEARCH_LIMIT_S; s += SEARCH_STEP_S) {
    if (blocked(c, inField(c, v0, s).pos)) {
      hi = s;
      break;
    }
    lo = s;
  }
  if (hi < 0) {
    const t = enterT + SEARCH_LIMIT_S;
    return { v0, enterT, leaveT: t, stopT: t, outcome: 'free' };
  }
  for (let i = 0; i < BISECT_ITERS; i++) {
    const mid = (lo + hi) / 2;
    if (blocked(c, inField(c, v0, mid).pos)) hi = mid;
    else lo = mid;
  }
  const at = inField(c, v0, hi);
  const [x, y] = at.pos;
  const leaveT = enterT + hi;
  if (Math.abs(y) >= c.plateHalfGap) {
    return { v0, enterT, leaveT, stopT: leaveT, outcome: y > 0 ? 'upper' : 'lower' };
  }
  if (x >= c.plateLength && Math.abs(y) <= c.slitHalf && at.vel[0] > 0) {
    const exit: Kin = { pos: [c.plateLength, y], vel: at.vel };
    const stopT = leaveT + (c.detectorX - c.plateLength) / at.vel[0];
    return { v0, enterT, leaveT, stopT, outcome: 'detector', exit };
  }
  return { v0, enterT, leaveT, stopT: leaveT, outcome: 'wall' };
}

export interface FlightState {
  pos: Vec2;
  /** 장 속에 있을 때만 — 두 힘 화살표가 붙는다. */
  field?: { vel: Vec2 };
  /** 멈췄는가. */
  stopped: boolean;
}

/** 발사 뒤 tau 초의 자리. 멈춘 뒤는 멈춘 자리 그대로다. */
export function flightAt(c: VelocitySelectorConstants, f: Flight, tau: number): FlightState {
  const t = Math.min(Math.max(tau, 0), f.stopT);
  const stopped = tau >= f.stopT;
  if (t < f.enterT) return { pos: [c.sourceX + f.v0 * t, 0], stopped };
  if (t < f.leaveT || !f.exit) {
    const k = inField(c, f.v0, Math.min(t, f.leaveT) - f.enterT);
    return stopped || t >= f.leaveT ? { pos: k.pos, stopped } : { pos: k.pos, field: { vel: k.vel }, stopped };
  }
  const s = t - f.leaveT;
  return { pos: [f.exit.pos[0] + f.exit.vel[0] * s, f.exit.pos[1] + f.exit.vel[1] * s], stopped };
}

/** 발사부터 tau 초까지 지나온 길. */
export function flightPath(c: VelocitySelectorConstants, f: Flight, tau: number): Vec2[] {
  const end = Math.min(Math.max(tau, 0), f.stopT);
  const pts: Vec2[] = [];
  for (let t = 0; t < end; t += PATH_STEP_S) pts.push(flightAt(c, f, t).pos);
  pts.push(flightAt(c, f, end).pos);
  return pts;
}

/** 두 힘 — 전기력 · 자기력(월드 길이로 배율 적용). */
export function forces(c: VelocitySelectorConstants, vel: Vec2): { electric: Vec2; magnetic: Vec2 } {
  const k = c.charge * c.forceScale;
  return {
    electric: [0, -c.fieldE * k],
    magnetic: [-c.fieldB * vel[1] * k, c.fieldB * vel[0] * k],
  };
}

export function step(params: { state: VelocitySelectorState }): VelocitySelectorState {
  return params.state;
}
