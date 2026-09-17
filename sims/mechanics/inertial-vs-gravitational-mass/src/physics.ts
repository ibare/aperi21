// ========================================================================
// inertial-vs-gravitational-mass — 순수 물리
// ========================================================================
// 원본 step 을 그대로 옮긴다. 달라진 곳은 저울의 되돌리는 돌림힘 하나다 (schema.ts
// `TILT_PER_UNIT` · NOTES (a)).
// ========================================================================

import {
  BEAM_DAMP,
  BEAM_INERTIA,
  G_TORQUE,
  HOLD,
  IMPULSE,
  LEAD,
  OBJECTS,
  RUN,
  RUN_MATCH,
  THETA_MAX,
  TILT_PER_UNIT,
  type ObjectKey,
} from './schema';
import type { InertialVsGravitationalMassState } from './state';

/** 한 시험 — 추 n 개, 주기 안 시작 · 놓는 시각 · 끝. */
export interface Trial {
  n: number;
  start: number;
  release: number;
  end: number;
}

/** 추 1 개부터 물체 질량까지의 시험 목록과 한 바퀴 길이. 원본 schedule. */
export function schedule(mass: number): { list: Trial[]; total: number } {
  const list: Trial[] = [];
  let t0 = 0;
  for (let n = 1; n <= mass; n++) {
    const run = n === mass ? RUN_MATCH : RUN;
    list.push({ n, start: t0, release: t0 + HOLD, end: t0 + HOLD + run });
    t0 += HOLD + run;
  }
  return { list, total: t0 };
}

/** 시계가 가리키는 시험. 원본 currentTrial. */
export function currentTrial(obj: ObjectKey, clock: number): { idx: number; trial: Trial; local: number } {
  const s = schedule(OBJECTS[obj].mass);
  const local = clock % s.total;
  for (let i = 0; i < s.list.length; i++) {
    if (local < s.list[i]!.end) return { idx: i, trial: s.list[i]!, local };
  }
  const last = s.list.length - 1;
  return { idx: last, trial: s.list[last]!, local };
}

type Core = Pick<
  InertialVsGravitationalMassState,
  'obj' | 'shownObj' | 'held' | 'clock' | 'trial' | 'theta' | 'omega' | 'objX' | 'wX'
>;

/** 쌓인 상태에서 캡션이 읽는 값을 계산해 붙인다. */
export function derive(core: Core): InertialVsGravitationalMassState {
  const { trial, local } = currentTrial(core.obj, core.clock);
  const mass = OBJECTS[core.obj].mass;
  const released = local >= trial.release;
  const short = released && trial.n < mass;
  return {
    ...core,
    n: trial.n,
    released,
    nText: String(trial.n),
    shortStone: short && core.obj === 'stone',
    shortIron: short && core.obj === 'iron',
    shortWood: short && core.obj === 'wood',
    matched: released && trial.n === mass,
  };
}

/** 추 1 개 시험의 첫머리 — 원본이 물체를 바꿀 때 되돌린 자리(START_OFFSET). */
function restartFrom(obj: ObjectKey, held: boolean): InertialVsGravitationalMassState {
  return derive({ obj, shownObj: obj, held, clock: LEAD, trial: 0, theta: 0, omega: 0, objX: 0, wX: 0 });
}

/**
 * 한 걸음.
 *
 * 원본은 물체 단추를 누르면(같은 물체여도) 시계를 START_OFFSET 으로 되돌렸다. 여기서는 두 신호로
 * 알아챈다 — 칩을 누르는 동안(`held`)과, 고른 물체가 지금 그리는 물체와 다를 때(`shownObj`).
 * 누르고 떼는 것이 한 프레임 안에 끝나면 `held` 를 step 이 보지 못하므로 값 변화도 함께 본다.
 * 러너의 `restart` 는 엔진 시계를 되돌리지만 이 조각은 그 시계를 읽지 않아 상태를 여기서 비운다.
 */
export function step(params: { state: InertialVsGravitationalMassState; dt: number }): InertialVsGravitationalMassState {
  const s = params.state;
  const dt = params.dt;
  if (s.held) return restartFrom(s.obj, true);
  if (s.obj !== s.shownObj) return restartFrom(s.obj, false);

  const clock = s.clock + dt;
  const { idx, trial, local } = currentTrial(s.obj, clock);
  let { theta, omega, objX, wX } = s;
  // 새 시험 — 저울과 얼음을 처음으로. 한 바퀴가 끝나 추 1 개로 돌아갈 때도 여기다.
  if (idx !== s.trial) {
    theta = 0;
    omega = 0;
    objX = 0;
    wX = 0;
  }
  if (local >= trial.release) {
    const mass = OBJECTS[s.obj].mass;
    const n = trial.n;
    // 저울: 물체 쪽 알짜 돌림힘은 (중력 질량 − 추) 에 비례, 버팀은 전체 질량.
    // 되돌리는 돌림힘(원본에 없음)이 평형각을 모자란 몫에 비례시킨다.
    const restoring = (G_TORQUE / TILT_PER_UNIT) * theta;
    const alpha = (G_TORQUE * (mass - n) - restoring) / (mass + n + BEAM_INERTIA) - BEAM_DAMP * omega;
    omega += alpha * dt;
    theta += omega * dt;
    if (theta > THETA_MAX) {
      theta = THETA_MAX;
      omega = 0;
    }
    if (theta < -THETA_MAX) {
      theta = -THETA_MAX;
      omega = 0;
    }
    // 얼음: 같은 충격량을 양쪽이 나눠 받는다 — 속력은 관성 질량에 반비례.
    objX -= (IMPULSE / mass) * dt;
    wX += (IMPULSE / n) * dt;
  }
  return derive({ obj: s.obj, shownObj: s.shownObj, held: false, clock, trial: idx, theta, omega, objX, wX });
}
