// ========================================================================
// doppler-effect — 순수 물리
// ========================================================================
// 원천을 옮기고, 파면을 낳고, 수명이 다한 것을 버린다.
//
// **방출 이력을 쌓는 것은 여기다.** 어느 시각에 어디서 파면이 태어났는지는
// 조각만 알고, 렌더러는 그 목록을 나이 들여 지우고 그리기만 한다 (S-render).
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import {
  CRUISE_SPEED,
  CYCLE,
  EMIT_PERIOD,
  PHASE_ACCEL_END,
  PHASE_STOP_END,
  SOURCE_START_X,
  SOURCE_WRAP_IN,
  SOURCE_WRAP_OUT,
  STARTING_TAIL,
  STOPPED_EPS,
  WAVE_RANGE,
  WAVE_SPEED,
} from './schema';
import type { DopplerEffectState, Front } from './state';

function clamp01(u: number): number {
  return u < 0 ? 0 : u > 1 ? 1 : u;
}

function smoothstep(u: number): number {
  const x = clamp01(u);
  return x * x * (3 - 2 * x);
}

/** 자동 진행의 단계 길이. 선언(`stages[0].constants`)에서 온다. */
export interface DopplerConstants {
  /** 정지 구간 끝(초). 여기까지 원천이 멈춰 있다 — 비교의 기준선이다. */
  stopEnd: number;
  /** 가속 구간 끝(초). 이 사이 v/c 가 0 에서 등속값으로 오른다. */
  accelEnd: number;
  /** 한 바퀴(초). */
  cycle: number;
  /** 등속 구간의 원천 속력(월드/초). */
  cruise: number;
}

/** stage 상수를 읽는다. 값이 비면 모듈 기본값으로 되돌린다. */
export function readConstants(stage: StageDef): DopplerConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    stopEnd: c.stopEnd ?? PHASE_STOP_END,
    accelEnd: c.accelEnd ?? PHASE_ACCEL_END,
    cycle: c.cycle ?? CYCLE,
    cruise: c.cruise ?? CRUISE_SPEED,
  };
}

/**
 * 자동 진행의 원천 속력(월드/초) — 멈춤 → 부드럽게 가속 → 등속.
 *
 * 정지 구간을 먼저 두는 것은 이 주장이 **비교**를 필요로 하기 때문이다. 간격이
 * 좁아지는 것을 보여 주려면 좁아지기 전이 같은 화면에 남아 있어야 한다.
 */
export function autoSpeed(tau: number, c: DopplerConstants): number {
  if (tau < c.stopEnd) return 0;
  if (tau < c.accelEnd) {
    return c.cruise * smoothstep((tau - c.stopEnd) / (c.accelEnd - c.stopEnd));
  }
  return c.cruise;
}

export function step(params: {
  state: DopplerEffectState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): DopplerEffectState {
  const { state, dt } = params;
  const c = readConstants(params.stage);

  // 조작기를 한 번 잡으면 자동 진행은 영영 양보한다. 러너는 잡혔다는 사실만
  // 적고, 놓은 뒤 무엇으로 돌아갈지는 조각이 정한다 (`ControllerInstance.heldPath`).
  // 이 조각은 돌아가지 않는다 — 독자가 고른 속도가 곧 지금 보고 있는 화면이라,
  // 손을 떼는 순간 자동 값으로 튀면 방금 만든 반례가 사라진다.
  const manual = state.manual || state.ui.held;

  let tau = state.tau;
  let x = state.x;
  let v: number;
  if (manual) {
    v = state.ui.vc * WAVE_SPEED;
  } else {
    tau += dt;
    // 되돌림은 구급차가 화면 오른쪽 밖에 있을 때 일어나 점프가 보이지 않는다.
    // 앞 바퀴의 파면은 지우지 않아 되돌아온 직후에도 화면이 비지 않는다.
    if (tau >= c.cycle) {
      tau -= c.cycle;
      x = SOURCE_START_X;
    }
    v = autoSpeed(tau, c);
  }

  x += v * dt;
  if (x > SOURCE_WRAP_OUT) x = SOURCE_WRAP_IN;

  const t = state.t + dt;

  let emitAcc = state.emitAcc + dt;
  const born: Front[] = [];
  while (emitAcc >= EMIT_PERIOD) {
    emitAcc -= EMIT_PERIOD;
    born.push({ x, t0: t });
  }

  // 반지름이 사정거리를 넘은 파면은 버린다. 목록이 무한히 자라지 않는다.
  const fronts =
    born.length === 0 && state.fronts.length === 0
      ? state.fronts
      : [...state.fronts, ...born].filter((f) => WAVE_SPEED * (t - f.t0) < WAVE_RANGE);

  // 손대기 전에는 조작기가 자동 값을 **따라 읽는다.** 화면과 조작기가 어긋나지
  // 않아야 독자가 슬라이더를 잡는 순간 값이 튀지 않는다.
  const vc = manual ? state.ui.vc : v / WAVE_SPEED;

  return {
    t,
    tau,
    x,
    v,
    emitAcc,
    fronts,
    manual,
    ui: { vc, held: state.ui.held },
    says: {
      // 자동 진행에서는 시간표가, 손댄 뒤에는 고른 속도가 문장을 가른다.
      stopped: manual ? vc < STOPPED_EPS : tau < c.stopEnd,
      starting: !manual && tau < c.accelEnd + STARTING_TAIL,
    },
  };
}
