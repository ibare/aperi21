// ========================================================================
// uniform-circular-motion — 순수 운동학
// ========================================================================
// 월드 좌표(궤도 중심 원점, y 위). 물체는 반시계로 돈다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import {
  PERIOD,
  RADIUS,
  SPEED_LENGTH,
  STAMP_ALPHA_FLOOR,
  STAMP_ALPHA_SPAN,
  STAMPS_PER_TURN,
} from './schema';
import type { UniformCircularMotionState } from './state';

const OMEGA = (2 * Math.PI) / PERIOD;
const STAMP_DT = PERIOD / STAMPS_PER_TURN;
/** 경계에서 부동소수 오차로 잔상 하나를 놓치지 않게 한다. 원본과 같은 값. */
const STAMP_EPS = 1e-9;

/** 조각 시계 t 에서 물체의 각. */
export function theta(t: number): number {
  return OMEGA * t;
}

/** 각 θ 에서 물체의 자리. */
export function position(th: number): Vec2 {
  return [RADIUS * Math.cos(th), RADIUS * Math.sin(th)];
}

/** 각 θ 에서 속도 — 접선 방향, 길이는 늘 같다. */
export function velocity(th: number): Vec2 {
  return [-SPEED_LENGTH * Math.sin(th), SPEED_LENGTH * Math.cos(th)];
}

export interface Stamp {
  /** 잔상 번호 — 시각 k × (주기/12) 에 남겼다. */
  k: number;
  /** 남긴 순간의 각. */
  th: number;
  /** 옅기. 오래될수록 옅다. */
  alpha: number;
}

/**
 * 시각 t 까지 남긴 잔상 — 저장하지 않고 t 에서 바로 계산한다. 최근 한 바퀴분까지.
 * 같은 시각은 언제나 같은 목록이다.
 */
export function stampsAt(t: number): Stamp[] {
  const kNow = Math.floor(t / STAMP_DT + STAMP_EPS);
  const list: Stamp[] = [];
  for (let k = Math.max(0, kNow - (STAMPS_PER_TURN - 1)); k <= kNow; k++) {
    const age = t - k * STAMP_DT;
    list.push({ k, th: theta(k * STAMP_DT), alpha: STAMP_ALPHA_SPAN * (1 - age / PERIOD) + STAMP_ALPHA_FLOOR });
  }
  return list;
}

/** 쌓는 상태가 없다 — 모든 움직임이 조각 시계의 함수다. */
export function step(params: { state: UniformCircularMotionState }): UniformCircularMotionState {
  return params.state;
}
