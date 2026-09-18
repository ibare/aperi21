// ========================================================================
// static-equilibrium — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 오른쪽 막대의 각은 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 마찰 없는 판 위의 막대. 힘은 막대에 붙어 함께 돈다(늘 막대에 수직).
//
//   힘의 합         F − F = 0          → 중심은 제자리 (두 막대 모두)
//   관성 모멘트      I = M · L² / 12     (중심을 지나는 축)
//   돌림힘          τ = −F · s          (한 힘을 중심에서 s 만큼 옮겼을 때, 시계 방향)
//
// `shift` 동안 s 는 0 → a 로 곧게 늘어난다(s = a · τ / T). 그동안
//   α = −F·a·τ / (T·I),  ω = −F·a·τ² / (2·T·I),  θ = −F·a·τ³ / (6·T·I).
// 그 뒤로는 s = a 로 고정이라 α = −F·a / I 로 일정하다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { BAR_LENGTH, BAR_MASS, FORCE, OFFSET } from './schema';
import type { StaticEquilibriumState } from './state';

export interface StaticEquilibriumConstants {
  force: number;
  barMass: number;
  barLength: number;
  offset: number;
}

export function readConstants(stage: StageDef): StaticEquilibriumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    force: c.force ?? FORCE,
    barMass: c.barMass ?? BAR_MASS,
    barLength: c.barLength ?? BAR_LENGTH,
    offset: c.offset ?? OFFSET,
  };
}

/** 중심을 지나는 축에 대한 막대의 관성 모멘트. */
export function barInertia(c: StaticEquilibriumConstants): number {
  return (c.barMass * c.barLength * c.barLength) / 12;
}

/**
 * 한 힘을 `shiftTime` 동안 0 → a 로 옮기기 시작해 `elapsed` 초가 흘렀을 때 막대가 돈 각(rad).
 * 시계 방향이 음수다.
 */
export function turnAngle(c: StaticEquilibriumConstants, shiftTime: number, elapsed: number): number {
  if (elapsed <= 0) return 0;
  const k = (c.force * c.offset) / barInertia(c); // 옮긴 뒤의 각가속도 크기
  const T = shiftTime;
  if (elapsed <= T) return -(k * elapsed ** 3) / (6 * T);
  const thetaT = -(k * T * T) / 6;
  const omegaT = -(k * T) / 2;
  const d = elapsed - T;
  return thetaT + omegaT * d - 0.5 * k * d * d;
}

export interface Reading {
  /** 오른쪽 막대에서 옮긴 힘의 자리 — 중심에서 막대를 따라 잰 거리(m). */
  shifted: number;
  /** 오른쪽 막대가 돈 각(rad, 시계 방향이 음수). 왼쪽 막대는 늘 0 이다. */
  theta: number;
  /** 힘 · 오른쪽 막대의 불투명도 — 나타날 때 차오르고 물러날 때 빠진다. */
  opacity: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두지 않는다 — `at(id)` 가 그 단계의 진행도를, `duration(id)` 이
 * 길이를 준다. `shift` · `turn` · `fade` 는 이징이 `linear` 라 진행도 × 길이가 곧 흐른
 * 시간이다. 물러나는 동안에도 두 힘은 걸려 있다.
 */
export function derive(tl: TimelineFrame, c: StaticEquilibriumConstants): Reading {
  const shiftTime = tl.duration('shift');
  const elapsed =
    tl.at('shift') * shiftTime + tl.at('turn') * tl.duration('turn') + tl.at('fade') * tl.duration('fade');
  return {
    shifted: c.offset * tl.at('shift'),
    theta: turnAngle(c, shiftTime, elapsed),
    opacity: tl.at('ready') * (1 - tl.at('fade')),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: StaticEquilibriumState }): StaticEquilibriumState {
  return params.state;
}
