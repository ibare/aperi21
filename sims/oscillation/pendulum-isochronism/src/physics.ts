// ========================================================================
// pendulum-isochronism — 순수 물리
// ========================================================================
//
// 소진폭 근사를 쓰지 않는다. θ = A cos(ωt) 로 그렸다면 다섯은 영원히 완벽하게
// 겹치지만, 그건 등시성을 보여 주는 것이 아니라 **등시성을 가정한 그림**이다.
// θ'' = −(g/L)sinθ 를 그대로 적분하므로 화면의 일치는 결과이지 전제가 아니다.
//
// 적분은 velocity Verlet 이다. 오일러로는 진폭이 시들어 몇 초 뒤 주장이 무너진다.
// ========================================================================

import type { EnvironmentDef, StageDef, Vec2 } from '@aperi21/schema';
import { AMP_RANGE, BAND_WINDOW, G_OVER_L, LAG_LIMIT, TRAIL_SPAN } from './schema';
import type { PendulumBob, PendulumIsochronismState, TrailSample } from './state';

export interface PendulumConstants {
  /** g/L. */
  gOverL: number;
  /** 줄 길이(m). 그림의 월드 길이이기도 하다. */
  length: number;
}

export function readConstants(stage: StageDef): PendulumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const length = typeof c.length === 'number' && c.length > 0 ? c.length : 1;
  const g = typeof c.g === 'number' ? c.g : G_OVER_L;
  return { gOverL: g / length, length };
}

/** 각도에서 추의 자리. 피벗이 월드 원점이고 매단 길이가 곧 월드 길이다. */
export function bobPos(th: number, length: number): Vec2 {
  return [Math.sin(th) * length, -Math.cos(th) * length];
}

function clampDeg(deg: number): number {
  return Math.max(AMP_RANGE[0], Math.min(AMP_RANGE[1], deg));
}

/**
 * 진자 하나를 한 걸음 전진시킨다.
 *
 * 바닥을 지난 시각은 프레임 사이를 **선형 보간**해서 잡는다. 1/60 초 격자에
 * 반올림하면 띠의 정렬이 물리 때문인지 격자 때문인지 구분되지 않는다.
 */
function advance(b: PendulumBob, dt: number, t: number, gOverL: number): PendulumBob {
  const prev = b.th;
  const a0 = -gOverL * Math.sin(b.th);
  const omh = b.om + 0.5 * a0 * dt;
  const th = b.th + omh * dt;
  const a1 = -gOverL * Math.sin(th);
  const om = omh + 0.5 * a1 * dt;

  let crossings: readonly number[] = b.crossings;
  let count = b.count;
  if ((prev > 0 && th <= 0) || (prev < 0 && th >= 0)) {
    const frac = prev === th ? 0 : prev / (prev - th);
    crossings = [...crossings, t + dt * frac];
    count += 1;
  }

  const now = t + dt;
  // 창 밖으로 나간 자국은 버린다. 둘은 남겨 지연을 잴 수 있게.
  while (crossings.length > 2 && crossings[0]! < now - BAND_WINDOW - 0.5) {
    crossings = crossings.slice(1);
  }

  const trail: TrailSample[] = [...b.trail, { th, t: now }].filter(
    (s) => now - s.t <= TRAIL_SPAN + 1e-9,
  );

  return { th, om, trail, crossings, count };
}

/**
 * 한 스텝 전진. 순수 함수.
 *
 * 슬라이더는 **잡고 있는 동안에만** 값을 민다 (`held`). 원본의 슬라이더는 1°
 * 눈금이었으므로 받은 값을 정수 도로 스냅해 되돌려 쓰고, 손을 떼면 조각이 쥐고
 * 있던 값으로 돌아간다 — 눈금이 가리키는 값과 실제 물리가 갈라지지 않게. 놓은
 * 뒤 무엇으로 돌아갈지는 조각이 안다 (`ControllerInstance.heldPath`).
 */
export function step(params: {
  state: PendulumIsochronismState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): PendulumIsochronismState {
  const { state, dt, stage } = params;
  if (!(dt > 0)) return state;
  const c = readConstants(stage);

  const wanted = state.held ? clampDeg(Math.round(state.ampDeg)) : state.appliedDeg;

  let bobs = state.bobs;
  if (wanted !== state.appliedDeg && state.appliedDeg > 0) {
    // 위상은 그대로 두고 크기만 늘린다 — 슬라이더를 끌어도 박자가 튀지 않는다.
    // 끊긴 박자는 이 조각에서 가장 비싼 손실이다. 잔상도 같은 비율로 늘려야
    // 지나온 호가 지금 각도와 이어진다.
    const k = wanted / state.appliedDeg;
    bobs = bobs.map((b) => ({
      ...b,
      th: b.th * k,
      om: b.om * k,
      trail: b.trail.map((s) => ({ th: s.th * k, t: s.t })),
    }));
  }

  bobs = bobs.map((b) => advance(b, dt, state.t, c.gOverL));

  // 지연은 **같은 횟수끼리만** 잰다. 한쪽이 한 번 더 지난 사이에 재면 반주기가
  // 통째로 지연으로 잡힌다.
  const big = bobs[0];
  const small = bobs[bobs.length - 1];
  let lag = state.lag;
  if (big && small && big.count === small.count && big.count > 0) {
    const last = big.crossings[big.crossings.length - 1];
    const first = small.crossings[small.crossings.length - 1];
    if (last !== undefined && first !== undefined) lag = last - first;
  }

  return {
    t: state.t + dt,
    ampDeg: wanted,
    appliedDeg: wanted,
    held: state.held,
    lag,
    lagExceeded: Math.abs(lag) >= LAG_LIMIT,
    bobs,
  };
}
