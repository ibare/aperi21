// ========================================================================
// force-between-wires — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 전류와 도선의 휨이 모두 시간표 시각의 함수이고 `step` 은 항등이다.
//
//   F/L = (μ₀/2π) I₁ I₂ / d    단위 길이당 힘. I₁I₂ > 0(같은 방향)이면 당김, < 0 이면 밀어냄.
//                              두 도선이 받는 힘은 크기가 같고 방향이 반대다.
//
// 두 끝이 받침에 묶인 도선이 고르게 퍼진 힘을 받으면 가운데가 가장 많이 휜다. 휨의 모양은
// 사인 반 파장 하나로 두고, 가운데 휨 a 만 시각의 함수로 구한다. 전류는 단계 시작에서 계단으로
// 바뀌므로 a 는 감쇠 진동자의 **계단 응답들의 합**이다 — 앞 단계의 끝 상태를 이어받지 않아도
// 되므로 같은 시각은 언제나 같은 휨이다.
//
//   a(u) = Σ_k Δa_k · S(u − u_k),   S(τ) = 1 − e^{−γτ}(cos ω_d τ + (γ/ω_d) sin ω_d τ)
//
// 단계 경계는 `tl.start(id)` 가 준다 — 모듈 상수로 두지 않는다 (S-piece).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BOW_DAMPING,
  BOW_OMEGA,
  BOW_SCALE,
  CURRENT,
  FORCE_SCALE,
  GAP,
  MAGNETIC_CONSTANT,
  WIRE_LENGTH,
  WORLD_PER_METER,
} from './schema';
import type { ForceBetweenWiresState } from './state';

export interface ForceBetweenWiresConstants {
  current: number;
  gap: number;
  wireLength: number;
  magneticConstant: number;
  worldPerMeter: number;
  bowScale: number;
  forceScale: number;
  bowOmega: number;
  bowDamping: number;
}

export function readConstants(stage: StageDef): ForceBetweenWiresConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    current: c.current ?? CURRENT,
    gap: c.gap ?? GAP,
    wireLength: c.wireLength ?? WIRE_LENGTH,
    magneticConstant: c.magneticConstant ?? MAGNETIC_CONSTANT,
    worldPerMeter: c.worldPerMeter ?? WORLD_PER_METER,
    bowScale: c.bowScale ?? BOW_SCALE,
    forceScale: c.forceScale ?? FORCE_SCALE,
    bowOmega: c.bowOmega ?? BOW_OMEGA,
    bowDamping: c.bowDamping ?? BOW_DAMPING,
  };
}

/**
 * 스위치 한 번 — 이 단계가 시작하는 순간 두 전류가 이 값이 된다(부호 포함, + 는 위로).
 * 단계 id 와 스테이지 상수를 잇는 것만 코드에 둔다. 시각은 시간표가 정한다 (G13).
 */
interface Switching {
  phase: string;
  left: number;
  right: number;
}

function switchings(c: ForceBetweenWiresConstants): readonly Switching[] {
  return [
    { phase: 'same', left: c.current, right: c.current },
    { phase: 'opposite', left: c.current, right: -c.current },
  ];
}

/** 단위 길이당 힘(N/m). + 는 당김(서로를 향함), − 는 밀어냄. */
export function forcePerLength(left: number, right: number, c: ForceBetweenWiresConstants): number {
  return (c.magneticConstant * left * right) / c.gap;
}

/** 감쇠 진동자의 계단 응답 — 평형이 1 만큼 바뀐 뒤 τ 초에 따라온 몫. */
function stepResponse(tau: number, c: ForceBetweenWiresConstants): number {
  if (tau <= 0) return 0;
  const g = c.bowDamping;
  const wd = Math.sqrt(Math.max(c.bowOmega * c.bowOmega - g * g, 1e-9));
  return 1 - Math.exp(-g * tau) * (Math.cos(wd * tau) + (g / wd) * Math.sin(wd * tau));
}

export interface Reading {
  /** 왼쪽 도선 전류(A, 부호 포함). + 는 위로. */
  left: number;
  /** 오른쪽 도선 전류(A, 부호 포함). + 는 위로. */
  right: number;
  /** 지금 단위 길이당 힘(N/m). + 는 당김. */
  force: number;
  /** 도선 가운데 휨(월드). + 는 안쪽(상대 도선 쪽). 두 도선이 같다. */
  bow: number;
  /** 떠오르고 물러나는 정도(1 이면 또렷하다). */
  opacity: number;
}

/** 시간표 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다. */
export function derive(tl: TimelineFrame, c: ForceBetweenWiresConstants): Reading {
  let left = 0;
  let right = 0;
  let prevEq = 0;
  let bow = 0;
  const list = [...switchings(c)].sort((a, b) => tl.start(a.phase) - tl.start(b.phase));
  for (const s of list) {
    const u0 = tl.start(s.phase);
    const eq = c.bowScale * forcePerLength(s.left, s.right, c);
    bow += (eq - prevEq) * stepResponse(tl.u - u0, c);
    prevEq = eq;
    if (tl.u >= u0) {
      left = s.left;
      right = s.right;
    }
  }
  return {
    left,
    right,
    force: forcePerLength(left, right, c),
    bow,
    opacity: tl.at('appear') * (1 - tl.at('fade')),
  };
}

export function step(params: { state: ForceBetweenWiresState }): ForceBetweenWiresState {
  return params.state;
}
