// ========================================================================
// centripetal-acceleration — 순수 운동학
// ========================================================================
// 월드 좌표(원의 중심 원점, y 위). 공은 반시계로 돈다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { E1, FADE, GAP, OMEGA, PERIOD, RADIUS, SPEED_LENGTH, THETA0 } from './schema';
import type { CentripetalAccelerationState } from './state';

/** 운동 시계 s 에서 공의 각. */
export function theta(s: number): number {
  return THETA0 + OMEGA * s;
}

/** 각 θ 에서 공의 자리. */
export function position(th: number): Vec2 {
  return [RADIUS * Math.cos(th), RADIUS * Math.sin(th)];
}

/** 각 θ 에서 공의 속도 — 접선 방향, 길이는 늘 같다. */
export function velocity(th: number): Vec2 {
  return [-SPEED_LENGTH * Math.sin(th), SPEED_LENGTH * Math.cos(th)];
}

export function ease(x: number): number {
  const k = Math.max(0, Math.min(1, x));
  return k * k * (3 - 2 * k);
}

export function lerp2(a: Vec2, b: Vec2, k: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

/** 자리 잡은 Δv 의 진하기 — 자리 잡은 순간 1 에서 시작해 FADE 척도로 옅어진다. */
export function spokeAlpha(age: number): number {
  return Math.exp(-Math.max(0, age) / FADE);
}

export interface Cycle {
  /** 앞 순간(v1)의 공 자리와 속도. */
  p1: Vec2;
  v1: Vec2;
  /** 조금 뒤(v2)의 공 자리와 속도. */
  p2: Vec2;
  v2: Vec2;
  /** 두 순간 사이 호의 가운데. */
  mid: Vec2;
  /** Δv = v2 − v1 (속도와 같은 척도). */
  dv: Vec2;
  /** Δv 가 호의 가운데에 자리 잡는 시각(운동 시계). */
  done: number;
}

/** k 번 주기의 비교. 주기 번호만으로 정해지므로 지난 주기도 다시 계산할 수 있다. */
export function cycle(k: number): Cycle {
  const th1 = theta(k * PERIOD);
  const th2 = th1 + GAP;
  const v1 = velocity(th1);
  const v2 = velocity(th2);
  return {
    p1: position(th1),
    v1,
    p2: position(th2),
    v2,
    mid: position((th1 + th2) / 2),
    dv: [v2[0] - v1[0], v2[1] - v1[1]],
    done: k * PERIOD + E1,
  };
}

/** 운동 시계 s 를 주기 번호 k 와 주기 안 시각 u 로 가른다. */
export function phase(s: number): { k: number; u: number } {
  const k = Math.floor(s / PERIOD);
  return { k, u: s - k * PERIOD };
}

/** 시간만 전진한다. 모든 움직임이 시계의 함수라 쌓는 상태가 없다. */
export function step(params: { state: CentripetalAccelerationState; dt: number }): CentripetalAccelerationState {
  return { t: params.state.t + params.dt };
}
