// ========================================================================
// moment-of-inertia — 순수 물리
// ========================================================================
// θ = ½(τ/I)t², I = I_frame + N·m·r². 멈춘 상태에서 출발하므로 같은 시간에 돈 각의 비가
// 곧 관성 모멘트의 역비다.
// ========================================================================

import {
  I_FRAME,
  M_EACH,
  N_MASSES,
  R_LEFT,
  RUN,
  SLIDER_STEP,
  TRIALS,
  momentOfInertiaSchema,
} from './schema';
import type { MomentOfInertiaState } from './state';

export function inertia(r: number): number {
  return I_FRAME + N_MASSES * M_EACH * r * r;
}

export const I_LEFT = inertia(R_LEFT);

/** 왼쪽 바퀴가 한 시행(RUN)에 정확히 3바퀴 돌도록 정한 돌림힘. 두 바퀴 같다. */
export const TAU = (3 * 2 * Math.PI * 2 * I_LEFT) / (RUN * RUN);

/** 시행 시작 뒤 s 초에 돈 각. 돌림힘은 RUN 동안만 걸리고 그 뒤로는 멈춘다. */
export function angleAt(r: number, s: number): number {
  const u = Math.min(Math.max(s, 0), RUN);
  return 0.5 * (TAU / inertia(r)) * u * u;
}

/** 한 시행에서 돈 각 전부. */
export function fullAngle(r: number): number {
  return angleAt(r, RUN);
}

/** 그래프 세로 끝 = 왼쪽 바퀴가 한 시행에 돈 각(6π). */
export const THETA_MAX = fullAngle(R_LEFT);

// ---- 표시 문자열 — 자릿수를 한곳에서 정한다 --------------------------------

/** 거리 비(소수 첫째 자리). */
export function distRatioText(r: number): string {
  return (r / R_LEFT).toFixed(1);
}
/** 관성 모멘트 비 = 돈 각의 역비(소수 첫째 자리). */
export function inertiaRatioText(r: number): string {
  return (inertia(r) / I_LEFT).toFixed(1);
}
/** 반지름 표시(소수 둘째 자리). 라벨 · 캡션 · 슬라이더가 같다. */
export function rText(r: number): string {
  return r.toFixed(2);
}

// ---- 자동 진행 -----------------------------------------------------------

/** 자동 진행의 한 순간. scene 은 시간표 프레임에서, step 은 시계 사본에서 만든다. */
export interface TrialMoment {
  /** 이번 시행 시작 뒤 흐른 시간(초). RUN 이 넘으면 돌림힘이 끝난 것. */
  s: number;
  /** 이번 시행의 오른쪽 반지름. */
  rTrial: number;
  /** 지금 그릴 오른쪽 반지름 — 옮기는 동안 다음 자리로 미끄러진다. */
  rDisp: number;
  /** 옮기는 중인가. 곡선 · 잔상을 그리지 않는다. */
  moving: boolean;
  /** 이번 시행 시작 때의 두 바퀴 각 — 지난 시행들에서 돈 각이 이어진다. */
  baseL: number;
  baseR: number;
}

/** 시행 번호(주기 · 주기 안 순번)에서 이전 시행들이 쌓은 각. */
export function baseAngles(cycle: number, index: number): { baseL: number; baseR: number } {
  const sum3 = TRIALS.reduce((a, tr) => a + fullAngle(tr.r), 0);
  let baseR = cycle * sum3;
  for (let j = 0; j < index; j++) baseR += fullAngle(TRIALS[j]!.r);
  return { baseL: (cycle * TRIALS.length + index) * fullAngle(R_LEFT), baseR };
}

/** 두 바퀴의 지금 각. */
export function wheelAngles(m: Pick<TrialMoment, 's' | 'rTrial' | 'baseL' | 'baseR'>): { thL: number; thR: number } {
  return { thL: m.baseL + angleAt(R_LEFT, m.s), thR: m.baseR + angleAt(m.rTrial, m.s) };
}

const smooth = (x: number): number => x * x * (3 - 2 * x);

/**
 * 시계 사본에서 자동 진행의 순간을 다시 계산한다 — **step 전용.** `step` 이 시간표 프레임을
 * 받지 못해(장부 G01) 선언된 단계 목록을 직접 훑는다. scene 은 이것을 쓰지 않는다.
 */
export function autoMomentFromClock(clock: number): TrialMoment {
  const phases = momentOfInertiaSchema.timeline!.phases;
  const period = phases.reduce((a, p) => a + p.duration, 0);
  const cycle = Math.floor(clock / period);
  const u = clock - cycle * period;
  let start = 0;
  let i = 0;
  while (i < phases.length - 1 && u >= start + phases[i]!.duration) {
    start += phases[i]!.duration;
    i++;
  }
  const perTrial = phases.length / TRIALS.length;
  const index = Math.floor(i / perTrial);
  const runStart = phases.slice(0, index * perTrial).reduce((a, p) => a + p.duration, 0);
  const rTrial = TRIALS[index]!.r;
  const rNext = TRIALS[(index + 1) % TRIALS.length]!.r;
  const moving = phases[i]!.id.startsWith('move-');
  const progress = moving ? smooth(Math.min(1, (u - start) / phases[i]!.duration)) : 0;
  return {
    s: u - runStart,
    rTrial,
    rDisp: rTrial + (rNext - rTrial) * progress,
    moving,
    ...baseAngles(cycle, index),
  };
}

/** 수동 시행 — 같은 반지름으로 돌림 + 멈춤을 반복한다. `t` 는 수동 시행 시작 뒤 시각. */
export function manualMoment(state: MomentOfInertiaState, t: number, cycleLength: number): TrialMoment {
  const k = Math.floor(Math.max(0, t) / cycleLength);
  return {
    s: Math.max(0, t) - k * cycleLength,
    rTrial: state.r,
    rDisp: state.r,
    moving: false,
    baseL: state.baseL + k * fullAngle(R_LEFT),
    baseR: state.baseR + k * fullAngle(state.r),
  };
}

/**
 * 수동 시행 한 번의 길이 = 첫 시행의 돌림 + 멈춤 (선언에서). step 전용 — scene 은 시간표 프레임의
 * `duration('run-far') + duration('hold-far')` 로 같은 값을 읽는다.
 */
function manualCycleFromDeclaration(): number {
  const phases = momentOfInertiaSchema.timeline!.phases;
  const d = (id: string): number => phases.find((p) => p.id === id)?.duration ?? 0;
  return d('run-far') + d('hold-far');
}

// ---- 걸음 ----------------------------------------------------------------

/**
 * 독자 조작만 다룬다.
 *
 * - 잡는 순간: 지금 두 바퀴의 각을 이어 받고 수동 시행으로 넘어간다.
 * - 잡는 동안: 시계 사본을 0 에 붙잡는다 — 러너의 `restart` 가 조각 시계를 0 으로 되돌린 것과 맞춘다.
 * - 자동 진행 중: 슬라이더가 지금 표시 반지름을 따라간다(간격에 붙여).
 */
export function step(params: { state: MomentOfInertiaState; dt: number }): MomentOfInertiaState {
  const prev = params.state;
  let next: MomentOfInertiaState = { ...prev };

  if (prev.held && !prev.wasHeld) {
    const m = prev.manual
      ? manualMoment(prev, prev.clock, manualCycleFromDeclaration())
      : autoMomentFromClock(prev.clock);
    const { thL, thR } = wheelAngles(m);
    next = { ...next, manual: true, baseL: thL, baseR: thR };
  }

  if (prev.held) {
    next.clock = 0;
  } else {
    next.clock = prev.clock + params.dt;
    if (!next.manual) {
      const m = autoMomentFromClock(next.clock);
      next.r = Math.round(m.rDisp / SLIDER_STEP) * SLIDER_STEP;
    }
  }
  next.wasHeld = prev.held;

  if (next.manual) {
    const same = Math.abs(next.r - R_LEFT) < 1e-6;
    next.manualSame = same;
    next.manualLag = !same;
    next.manDist = distRatioText(next.r);
    next.manRatio = inertiaRatioText(next.r);
  }
  return next;
}
