// ========================================================================
// uniformly-accelerated-motion — 순수 물리
// ========================================================================
// 적분할 것이 없다. 위치는 닫힌 식 x = v0·s + ½·a·s² 이고, 나머지는 모두 거기서 나온다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import type { UniformlyAcceleratedMotionState } from './state';

export interface MotionConstants {
  /** 처음 속도(원본 px/초). */
  v0: number;
  /** 가속도(원본 px/초²). */
  a: number;
  /** 자리를 찍는 시간 간격(초). */
  interval: number;
  /** 찍는 간격 수. */
  count: number;
  /** 간격 막대가 사다리로 내려가는 시간(초). */
  drop: number;
}

export function readConstants(stage: StageDef): MotionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    v0: c.v0 ?? 70,
    a: c.a ?? 110,
    interval: c.interval ?? 0.5,
    count: c.count ?? 6,
    drop: c.drop ?? 0.35,
  };
}

/** 달리는 시간(초). 이 뒤로 물체는 선다. */
export function moveTime(c: MotionConstants): number {
  return c.count * c.interval;
}

/** 출발점에서 잰 거리. 달리는 시간 밖으로는 끝에 머문다. */
export function distance(c: MotionConstants, s: number): number {
  const u = Math.max(0, Math.min(moveTime(c), s));
  return c.v0 * u + 0.5 * c.a * u * u;
}

/** n 번째 간격의 길이 (1 부터). */
export function gap(c: MotionConstants, n: number): number {
  return distance(c, n * c.interval) - distance(c, (n - 1) * c.interval);
}

/**
 * 막대 하나를 "앞 간격과 겹치는 몸통 / 넘는 몫" 으로 가른다.
 * 앞 간격이 없으면(첫 간격) 전부 몸통이다.
 */
export function splitBar(len: number, prevLen: number | null): { body: number; extra: number } {
  if (prevLen === null) return { body: len, extra: 0 };
  return { body: Math.min(len, prevLen), extra: Math.max(0, len - prevLen) };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: UniformlyAcceleratedMotionState }): UniformlyAcceleratedMotionState {
  return params.state;
}
