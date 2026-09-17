// ========================================================================
// equilibrium-of-forces — 순수 물리
// ========================================================================
// 매듭 하나를 세 줄이 당긴다 — 두 도르래 쪽 줄(장력 = 바깥 추 칸 수)과 가운데 추.
// 세 힘의 합(알짜힘)으로 매듭을 적분한다. 도르래·줄의 마찰에 해당하는 감쇠가 있어
// 알짜힘이 0 이 되는 자리에서 멈춘다.
//
//   v ← v + (F·g/M − c·v)·dt,   x ← x + v·dt      (M = 전체 칸 수)
//
// 틈이 닫히는 것과 매듭이 멈추는 것이 같은 계산의 결과라 둘이 어긋날 수 없다.
// 대본이 바꾸는 것은 왼쪽 추 칸 수 하나뿐이다.
// ========================================================================

import type { EnvironmentDef, StageDef, Vec2 } from '@aperi21/schema';
import {
  CLOSED_GAP,
  DAMP,
  DROP_MAX,
  DROP_MIN,
  GRAVITY,
  KNOT_MAX,
  KNOT_MIN,
  LEFT_FEW,
  LEFT_MANY,
  MIDDLE_COUNT,
  PULLEY_LEFT,
  PULLEY_R,
  PULLEY_RIGHT,
  RIGHT_COUNT,
  ROPE_LEN,
  equilibriumOfForcesSchema,
} from './schema';
import type { EquilibriumOfForcesState } from './state';

export interface EquilibriumConstants {
  g: number;
  damp: number;
  closedGap: number;
  leftFew: number;
  leftMany: number;
  right: number;
  middle: number;
}

export function readConstants(stage: StageDef): EquilibriumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    g: c.g ?? GRAVITY,
    damp: c.damp ?? DAMP,
    closedGap: c.closedGap ?? CLOSED_GAP,
    leftFew: c.leftFew ?? LEFT_FEW,
    leftMany: c.leftMany ?? LEFT_MANY,
    right: c.right ?? RIGHT_COUNT,
    middle: c.middle ?? MIDDLE_COUNT,
  };
}

/** 시간표 단계마다 왼쪽 추 칸 수 — 스테이지 상수 이름으로 가리킨다. */
export const PHASE_LEFT: Record<string, 'leftFew' | 'leftMany'> = {
  removed: 'leftFew',
  added: 'leftMany',
};

/**
 * 시계 → 지금 단계 id. **선언의 단계 목록을 읽는다** — 단계 경계를 상수로 두지 않는다.
 * 엔진의 시간표 계산과 같은 일을 하는 것은 `step` 이 `TimelineFrame` 을 받지 못해서다
 * (NOTES 「어휘 부족」).
 */
export function phaseAt(clock: number): string {
  const phases = equilibriumOfForcesSchema.timeline?.phases ?? [];
  const period = phases.reduce((s, p) => s + p.duration, 0);
  if (!(period > 0) || phases.length === 0) return 'removed';
  let u = ((clock % period) + period) % period;
  for (const p of phases) {
    if (u < p.duration) return p.id;
    u -= p.duration;
  }
  return phases[phases.length - 1]!.id;
}

/** 대본이 그 시각에 왼쪽 추에 두는 칸 수. */
export function leftCountAt(clock: number, c: EquilibriumConstants): number {
  return c[PHASE_LEFT[phaseAt(clock)] ?? 'leftFew'];
}

export interface Forces {
  /** 왼쪽 줄 장력 · 오른쪽 줄 장력 · 가운데 추 무게 (한 칸 = 1, 월드 방향). */
  tl: Vec2;
  tr: Vec2;
  w: Vec2;
  net: Vec2;
}

/** 매듭 자리에서 세 힘. 방향은 줄과 평행, 크기는 칸 수. 원본 forces. */
export function forces(knot: Vec2, left: number, c: EquilibriumConstants): Forces {
  const ax = PULLEY_LEFT[0] - knot[0];
  const ay = PULLEY_LEFT[1] - knot[1];
  const da = Math.hypot(ax, ay);
  const bx = PULLEY_RIGHT[0] - knot[0];
  const by = PULLEY_RIGHT[1] - knot[1];
  const db = Math.hypot(bx, by);
  const tl: Vec2 = [(left * ax) / da, (left * ay) / da];
  const tr: Vec2 = [(c.right * bx) / db, (c.right * by) / db];
  const w: Vec2 = [0, -c.middle];
  return { tl, tr, w, net: [tl[0] + tr[0] + w[0], tl[1] + tr[1] + w[1]] };
}

/**
 * 바깥 추 윗면의 높이(월드 y). 줄 길이가 보존되므로 매듭이 도르래에서 멀어진 만큼
 * 추가 올라간다. 원본의 위아래 한계 그대로.
 */
export function outerTop(pulley: Vec2, knot: Vec2): number {
  const d = Math.hypot(knot[0] - pulley[0], knot[1] - pulley[1]);
  const drop = Math.min(DROP_MAX, Math.max(DROP_MIN, ROPE_LEN - d));
  return pulley[1] - drop;
}

/** 매듭에서 도르래로 가는 줄이 도르래에 닿는 윗면 접점. 원본 tangentTop. */
export function tangentTop(pulley: Vec2, knot: Vec2): Vec2 {
  const d = Math.hypot(knot[0] - pulley[0], knot[1] - pulley[1]);
  const th = Math.atan2(knot[1] - pulley[1], knot[0] - pulley[0]);
  const al = Math.acos(Math.min(1, PULLEY_R / d));
  const p1: Vec2 = [pulley[0] + PULLEY_R * Math.cos(th + al), pulley[1] + PULLEY_R * Math.sin(th + al)];
  const p2: Vec2 = [pulley[0] + PULLEY_R * Math.cos(th - al), pulley[1] + PULLEY_R * Math.sin(th - al)];
  // 월드는 y 가 위라 윗면은 y 가 큰 쪽이다.
  return p1[1] > p2[1] ? p1 : p2;
}

/** 끌린 자리를 끌 수 있는 범위 안으로. 원본 clampKnot. */
export function clampKnot(p: Vec2): Vec2 {
  return [
    Math.min(KNOT_MAX[0], Math.max(KNOT_MIN[0], p[0])),
    Math.min(KNOT_MAX[1], Math.max(KNOT_MIN[1], p[1])),
  ];
}

/** 틈이 문턱 아래인가. 캡션과 그리기가 함께 보는 값 (원칙 2 — 세는 것은 physics). */
export function deriveReadings(
  s: Pick<EquilibriumOfForcesState, 'knot' | 'left'>,
  c: EquilibriumConstants,
): Pick<EquilibriumOfForcesState, 'closed'> {
  const f = forces(s.knot, s.left, c);
  return { closed: Math.hypot(f.net[0], f.net[1]) < c.closedGap };
}

/** 원본의 고정 걸음. 러너가 더 큰 dt 를 주어도 이 걸음으로 나눠 적분한다. */
const SUBSTEP = 1 / 60;

/**
 * 한 스텝 전진. 순수 함수.
 *
 * 잡고 있으면 매듭은 손잡이 자리(범위 안으로 붙인 것)에 서고 속도는 0 이다 — 적분하지
 * 않는다. 놓으면 그 자리에서 알짜힘으로 다시 끌려간다. 시계는 잡고 있어도 흐른다
 * (원본 그대로).
 */
export function step(params: {
  state: EquilibriumOfForcesState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): EquilibriumOfForcesState {
  const { state, dt } = params;
  if (!(dt > 0)) return state;
  const c = readConstants(params.stage);

  let clock = state.clock;
  let knot: Vec2 = state.knot;
  let vel: Vec2 = state.vel;

  if (state.held) {
    clock += dt;
    knot = clampKnot(state.handle);
    vel = [0, 0];
  } else {
    let rest = dt;
    while (rest > 1e-9) {
      const h = Math.min(SUBSTEP, rest);
      const left = leftCountAt(clock, c);
      const f = forces(knot, left, c);
      const M = left + c.right + c.middle;
      // 원본과 같은 반암시 오일러 — 속도를 먼저 갱신하고 그것으로 자리를 민다.
      const vx = vel[0] + ((f.net[0] * c.g) / M - c.damp * vel[0]) * h;
      const vy = vel[1] + ((f.net[1] * c.g) / M - c.damp * vel[1]) * h;
      vel = [vx, vy];
      knot = [knot[0] + vx * h, knot[1] + vy * h];
      clock += h;
      rest -= h;
    }
  }

  const left = leftCountAt(clock, c);
  const next = {
    ...state,
    clock,
    knot,
    vel,
    left,
    // 잡고 있지 않으면 손잡이가 매듭을 따라온다.
    handle: state.held ? state.handle : knot,
  };
  return { ...next, ...deriveReadings(next, c) };
}
