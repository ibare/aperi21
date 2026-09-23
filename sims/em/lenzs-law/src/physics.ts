// ========================================================================
// lenzs-law — 순수 물리
// ========================================================================
// 코일 축 위 자기다발 Φ(u) = (1 + u²)^(−3/2) 와 그 기울기 gp(u) = dΦ/du.
//
//   유도 전류   I ∝ −gp(u)·v     → u = 0 에서 gp 가 부호를 바꾸므로 **뒤집힌다**
//   자석이 받는 힘 F ∝ −gp(u)²·v  → 제곱이 부호를 지우므로 **오직 v 의 반대**다
//
// 이 두 줄이 조각의 전부다. 화면에 수치를 하나도 두지 않으므로 둘 다 최댓값
// 기준으로 정규화한다 — 단위계를 세울 이유가 없다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { I_TURN, PAUSE, SPIN, U_END, V0, V_EPS } from './schema';
import type { LenzLawMode, LenzLawState } from './state';

export interface LenzConstants {
  /** 자동 진행 속도(u/s). */
  v0: number;
  /** 왕복하는 양 끝(u). */
  uEnd: number;
  /** 끝에서 멈추는 시간(초). */
  pause: number;
}

export function readConstants(stage: StageDef): LenzConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { v0: c.v0 ?? V0, uEnd: c.uEnd ?? U_END, pause: c.pause ?? PAUSE };
}

/** |gp| 가 가장 큰 곳은 u = ±0.5 다. 전류와 힘을 그 값으로 정규화한다. */
const GP_MAX = (3 * 0.5) / Math.pow(1.25, 2.5);

/** 놓는 순간 이보다 느리면 진행 방향을 속도가 아니라 자리에서 정한다. 원본 0.08. */
const RELEASE_V = 0.08;

/**
 * 잡은 자리를 따라가는 시간 척도(초).
 *
 * 원본은 프레임마다 남은 거리의 0.35 를 좁혔다. 걸음 길이가 달라져도 같은 속도로
 * 따라가도록 지수 추종으로 옮기되, dt = 1/60 에서 정확히 0.35 가 되게 맞췄다.
 */
const FOLLOW_TAU = 0.03868;

/** 다발의 기울기 dΦ/du. */
export function fluxSlope(u: number): number {
  return (-3 * u) / Math.pow(1 + u * u, 2.5);
}

/** 유도 전류(정규화). 부호가 도는 방향, 크기가 세기. */
export function inducedCurrent(u: number, v: number, c: LenzConstants): number {
  return (-fluxSlope(u) * v) / (GP_MAX * c.v0);
}

/** 자석이 받는 힘(정규화). gp² 이라 gp 의 부호가 사라지고 v 의 반대만 남는다. */
export function magnetForce(u: number, v: number, c: LenzConstants): number {
  const g = fluxSlope(u);
  return (-(g * g) * v) / (GP_MAX * GP_MAX * c.v0);
}

/**
 * 지금 값과 국면. 캡션 슬롯의 `cases` 가 가리키는 자리를 여기서 센다 —
 * 선언은 어디를 보라고만 말하고 조건은 담지 않는다 (원칙 2).
 *
 * 순서는 원본 `if` 사슬 그대로다. 멈춤이 먼저인 것은, 멈추면 전류도 0 이라
 * 「한가운데」 와 구별되지 않기 때문이다.
 */
export function deriveReadings(
  u: number,
  v: number,
  c: LenzConstants,
): Pick<LenzLawState, 'current' | 'force' | 'still' | 'turning' | 'approaching'> {
  const current = inducedCurrent(u, v, c);
  const still = Math.abs(v) < V_EPS;
  return {
    current,
    force: magnetForce(u, v, c),
    still,
    turning: !still && Math.abs(current) < I_TURN,
    // 자리와 속도의 부호가 반대면 코일 쪽으로 오는 중이다.
    approaching: u * v < 0,
  };
}

/**
 * 한 스텝 전진. 순수 함수.
 *
 * 자석을 잡아 끄는 동안에는 조작기가 값을 쥐고(`heldPath`), 놓으면 마지막
 * 속도의 방향으로 자동 왕복이 이어받는다 — 무엇으로 돌아갈지는 조각이 안다.
 * 놓는 순간 거의 멈춰 있었으면 속도에는 향이 없으므로 코일 쪽으로 돌려보낸다.
 */
export function step(params: {
  state: LenzLawState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): LenzLawState {
  const { state, dt } = params;
  if (!(dt > 0)) return state;
  const c = readConstants(params.stage);

  const prev = state.u;
  let u = state.u;
  let dir = state.dir;
  let timer = state.timer;
  // 잡으면 자동 진행이 양보하고, 놓으면 곧바로 이어받는다.
  let mode: LenzLawMode = state.held ? 'drag' : state.mode === 'drag' ? 'move' : state.mode;
  if (state.mode === 'drag' && !state.held) {
    dir = Math.abs(state.v) > RELEASE_V ? (state.v > 0 ? 1 : -1) : state.u > 0 ? -1 : 1;
  }

  if (mode === 'drag') {
    u += (state.target - u) * (1 - Math.exp(-dt / FOLLOW_TAU));
  } else if (mode === 'pause') {
    timer -= dt;
    if (timer <= 0) {
      timer = 0;
      mode = 'move';
      dir = dir === 1 ? -1 : 1;
    }
  } else {
    u += dir * c.v0 * dt;
    if (u >= c.uEnd) {
      u = c.uEnd;
      mode = 'pause';
      timer = c.pause;
    } else if (u <= -c.uEnd) {
      u = -c.uEnd;
      mode = 'pause';
      timer = c.pause;
    }
  }

  const v = (u - prev) / dt;
  const readings = deriveReadings(u, v, c);
  return {
    ...state,
    u,
    dir,
    mode,
    timer,
    v,
    // 전류가 고리를 도는 위상. 전류가 0 이면 멈추고 부호가 바뀌면 역류한다 —
    // "뒤집힌다" 는 쌓아 두지 않으면 보여 줄 수 없다.
    phase: state.phase + readings.current * SPIN * dt,
    // 잡고 있지 않으면 손잡이가 자석을 따라온다.
    target: state.held ? state.target : u,
    ...readings,
  };
}
