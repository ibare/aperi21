// ========================================================================
// torque — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 두 문의 각은 시간표 진행도의 함수이고, `step` 은 항등이다.
//
//   돌림힘      τ = F · r            (힘을 문 면에 수직으로 건다)
//   관성 모멘트  I = ⅓ · M · L²       (경첩에 매인 판)
//   각가속도     α = τ / I
//   연 각        θ(t) = ½ · α · t²     (멈춘 문에서 출발)
//
// 두 문은 I 와 F 가 같고 r 만 다르므로 θ 의 비가 **매 순간** r 의 비와 같다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { ARM_LONG, ARM_SHORT, DOOR_MASS, DOOR_WIDTH, FORCE } from './schema';
import type { TorqueState } from './state';

export interface TorqueConstants {
  force: number;
  doorMass: number;
  doorWidth: number;
  armShort: number;
  armLong: number;
}

export function readConstants(stage: StageDef): TorqueConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    force: c.force ?? FORCE,
    doorMass: c.doorMass ?? DOOR_MASS,
    doorWidth: c.doorWidth ?? DOOR_WIDTH,
    armShort: c.armShort ?? ARM_SHORT,
    armLong: c.armLong ?? ARM_LONG,
  };
}

/**
 * 긴 팔 ÷ 짧은 팔을 글자로. 정수에 충분히 가까우면 정수로(`2`), 아니면 소수 둘째
 * 자리까지(`1.75`). 자릿수를 자동으로 줄이지 않는다 — 1.50 은 1.50 이다 (S-piece).
 */
export function ratioText(c: TorqueConstants): string {
  const k = c.armLong / c.armShort;
  const n = Math.round(k);
  return Math.abs(k - n) < 1e-6 ? String(n) : k.toFixed(2);
}

/** 경첩에 매인 판의 관성 모멘트. */
export function doorInertia(c: TorqueConstants): number {
  return (c.doorMass * c.doorWidth * c.doorWidth) / 3;
}

/** 멈춘 문을 팔 길이 `arm` 자리에서 `t` 초 동안 밀었을 때 연 각(rad). */
export function openAngle(c: TorqueConstants, arm: number, t: number): number {
  const alpha = (c.force * arm) / doorInertia(c);
  return 0.5 * alpha * t * t;
}

export interface Reading {
  /** 힘이 걸린 시간(초). */
  pushTime: number;
  /** 왼쪽(짧은 팔) · 오른쪽(긴 팔) 문이 연 각(rad). */
  thetaShort: number;
  thetaLong: number;
  /** 화면 전체의 불투명도 — 나타날 때 차오르고 물러날 때 빠진다. */
  opacity: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두지 않는다 — `at(id)` 가 그 단계의 진행도를(앞에서는 0, 지난
 * 뒤에는 1), `duration(id)` 이 그 단계의 길이를 준다. `push` 와 `fade` 는 이징이
 * `linear` 라 진행도 × 길이가 곧 흐른 시간이다. 물러나는 동안에도 힘은 걸려 있다.
 */
export function derive(tl: TimelineFrame, c: TorqueConstants): Reading {
  const pushTime = tl.at('push') * tl.duration('push') + tl.at('fade') * tl.duration('fade');
  return {
    pushTime,
    thetaShort: openAngle(c, c.armShort, pushTime),
    thetaLong: openAngle(c, c.armLong, pushTime),
    opacity: tl.at('ready') * (1 - tl.at('fade')),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: TorqueState }): TorqueState {
  return params.state;
}
