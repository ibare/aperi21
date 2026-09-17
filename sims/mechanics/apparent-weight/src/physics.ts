// ========================================================================
// apparent-weight — 순수 물리
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { apparentWeightSchema, DEFAULT_CONSTANTS, NEEDLE } from './schema';
import type { ApparentWeightState } from './state';

export interface ApparentWeightConstants {
  g: number;
  mass: number;
  /** 가속·감속 구간의 가속도 크기(m/s²) = accelRatio · g. */
  accel: number;
}

export function readConstants(stage: StageDef): ApparentWeightConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const g = c.g ?? DEFAULT_CONSTANTS.g;
  return {
    g,
    mass: c.mass ?? DEFAULT_CONSTANTS.mass,
    accel: (c.accelRatio ?? DEFAULT_CONSTANTS.accelRatio) * g,
  };
}

/**
 * 단계마다의 가속도 부호(위가 양). 단계의 **길이**는 선언(`schema.timeline`)이 정하고,
 * 여기는 그 단계에서 엘리베이터가 무엇을 하는지만 안다.
 */
const PHASE_ACCEL_SIGN: Readonly<Record<string, number>> = {
  'up-speeding': 1,
  'up-steady': 0,
  'up-slowing': -1,
  top: 0,
  'down-speeding': -1,
  'down-steady': 0,
  'down-slowing': 1,
  bottom: 0,
};

function signOf(id: string): number {
  const s = PHASE_ACCEL_SIGN[id];
  if (s === undefined) throw new Error(`apparent-weight: 가속도를 모르는 단계 '${id}'`);
  return s;
}

export interface Motion {
  /** 가속도(m/s², 위가 양). */
  a: number;
  /** 속도(m/s, 위가 양). */
  v: number;
  /** 바닥에서 잰 높이(m). */
  y: number;
}

/**
 * 시간표 진행도에서 가속도·속도·높이 (닫힌 식 — 누적 오차 없음).
 *
 * 단계마다 가속도가 일정하므로, 지나간 시간 `at(id) · duration(id)` 만으로 속도와
 * 높이가 정해진다. 단계 경계를 상수로 두지 않는다 — 선언의 길이를 바꾸면 따라온다.
 */
export function motionAt(tl: TimelineFrame, c: ApparentWeightConstants): Motion {
  let v = 0;
  let y = 0;
  let a = 0;
  for (const phase of apparentWeightSchema.timeline!.phases) {
    const ai = signOf(phase.id) * c.accel;
    const s = tl.at(phase.id) * tl.duration(phase.id);
    y += v * s + 0.5 * ai * s * s;
    v += ai * s;
    if (tl.phase === phase.id) a = ai;
  }
  return { a, v, y };
}

/** 한 번 오르는 높이(m) — 올라가는 단계들을 끝까지 지난 높이. 화면 배율의 기준이다. */
export function riseHeight(c: ApparentWeightConstants): number {
  let v = 0;
  let y = 0;
  for (const phase of apparentWeightSchema.timeline!.phases) {
    if (phase.id === 'top') break;
    const ai = signOf(phase.id) * c.accel;
    const s = phase.duration;
    y += v * s + 0.5 * ai * s * s;
    v += ai * s;
  }
  return y;
}

/**
 * 조각 시계 `t` 에서의 가속도 — `step` 용.
 *
 * `step` 은 TimelineFrame 을 받지 못한다. 그래서 선언의 단계 길이를 여기서 한 번 더
 * 훑는다 (NOTES 「어휘 부족」). 이징·재생 속도가 없는 시간표라 이 셈이 엔진과 같다.
 */
export function accelAtClock(t: number, c: ApparentWeightConstants): number {
  const phases = apparentWeightSchema.timeline!.phases;
  const period = phases.reduce((sum, p) => sum + p.duration, 0);
  let u = ((t % period) + period) % period;
  for (const phase of phases) {
    if (u < phase.duration) return signOf(phase.id) * c.accel;
    u -= phase.duration;
  }
  return 0;
}

/** 저울이 받치는 힘을 kg 눈금으로: m(g + a)/g. */
export function readingOf(a: number, c: ApparentWeightConstants): number {
  return (c.mass * (c.g + a)) / c.g;
}

/**
 * 바늘을 한 걸음. 원본과 같은 반암시적 오일러 — 목표 눈금은 **걸음 시작 시각**의 것.
 */
export function step(params: {
  state: ApparentWeightState;
  dt: number;
  stage: StageDef;
}): ApparentWeightState {
  const { state, dt, stage } = params;
  const c = readConstants(stage);
  const target = readingOf(accelAtClock(state.t, c), c);
  const { omega, zeta } = NEEDLE;
  const acc = omega * omega * (target - state.needle) - 2 * zeta * omega * state.needleRate;
  const needleRate = state.needleRate + acc * dt;
  const needle = state.needle + needleRate * dt;
  return { t: state.t + dt, needle, needleRate };
}
