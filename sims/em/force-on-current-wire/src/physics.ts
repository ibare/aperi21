// ========================================================================
// force-on-current-wire — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 전류와 그네 각이 모두 시간표 시각의 함수이고 `step` 은 항등이다.
//
//   F = B I L        힘은 수평(자기장은 세로, 전류는 화면 안팎). 오른손: I 가 화면 안쪽(⊗),
//                    B 가 아래(N 위 → S 아래)이면 F 는 왼쪽이다.
//   tan θ_eq = F / mg    힘과 무게가 막대 방향으로 맞서는 평형각.
//
// 스위치는 순간이라 평형각이 단계 시작마다 계단으로 바뀐다. 그네를 감쇠 진자(작은 각 선형
// 근사)로 보면 각은 **계단 응답들의 합**이다 — 앞 단계의 끝 상태를 이어받지 않아도 되므로
// 같은 시각은 언제나 같은 각이다.
//
//   θ(u) = Σ_k Δθ_k · S(u − u_k),   S(τ) = 1 − e^{−γτ}(cos ω_d τ + (γ/ω_d) sin ω_d τ)
//
// 단계 경계는 `tl.start(id)` 가 준다 — 모듈 상수로 두지 않는다 (S-piece).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CHARGE_ARROW,
  CHARGE_COUNT,
  CURRENT_HIGH,
  CURRENT_LOW,
  FIELD,
  FORCE_SCALE,
  GRAVITY,
  SWING_DAMPING,
  SWING_LENGTH,
  SWING_OMEGA,
  WIRE_LENGTH,
  WIRE_MASS,
} from './schema';
import type { ForceOnCurrentWireState } from './state';

export interface ForceOnCurrentWireConstants {
  field: number;
  currentLow: number;
  currentHigh: number;
  wireLength: number;
  wireMass: number;
  gravity: number;
  swingLength: number;
  swingOmega: number;
  swingDamping: number;
  forceScale: number;
  chargeCount: number;
  chargeArrow: number;
}

export function readConstants(stage: StageDef): ForceOnCurrentWireConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    field: c.field ?? FIELD,
    currentLow: c.currentLow ?? CURRENT_LOW,
    currentHigh: c.currentHigh ?? CURRENT_HIGH,
    wireLength: c.wireLength ?? WIRE_LENGTH,
    wireMass: c.wireMass ?? WIRE_MASS,
    gravity: c.gravity ?? GRAVITY,
    swingLength: c.swingLength ?? SWING_LENGTH,
    swingOmega: c.swingOmega ?? SWING_OMEGA,
    swingDamping: c.swingDamping ?? SWING_DAMPING,
    forceScale: c.forceScale ?? FORCE_SCALE,
    chargeCount: c.chargeCount ?? CHARGE_COUNT,
    chargeArrow: c.chargeArrow ?? CHARGE_ARROW,
  };
}

/**
 * 스위치 한 번 — 이 단계가 시작하는 순간 전류가 이 값이 된다(부호 포함, + 는 화면 안쪽 ⊗).
 * 단계 id 와 스테이지 상수를 잇는 것만 코드에 둔다. 시각은 시간표가 정한다.
 */
interface Switching {
  phase: string;
  current: number;
}

function switchings(c: ForceOnCurrentWireConstants): readonly Switching[] {
  return [
    { phase: 'on', current: c.currentLow },
    { phase: 'reverse', current: -c.currentLow },
    { phase: 'off', current: 0 },
    { phase: 'more', current: c.currentHigh },
  ];
}

/** 전류 I(A, 부호 포함)가 도선에 주는 힘(N, 부호 포함 — + 는 오른쪽). ⊗(+) 이면 왼쪽(−)이다. */
export function forceOf(current: number, c: ForceOnCurrentWireConstants): number {
  return -c.field * current * c.wireLength;
}

/** 그 힘이 주는 평형각(rad, + 는 오른쪽으로 기움). */
export function equilibriumAngle(current: number, c: ForceOnCurrentWireConstants): number {
  return Math.atan2(forceOf(current, c), c.wireMass * c.gravity);
}

/** 감쇠 진자의 계단 응답 — 평형각이 1 만큼 바뀐 뒤 τ 초에 따라온 몫. */
function stepResponse(tau: number, c: ForceOnCurrentWireConstants): number {
  if (tau <= 0) return 0;
  const g = c.swingDamping;
  const wd = Math.sqrt(Math.max(c.swingOmega * c.swingOmega - g * g, 1e-9));
  return 1 - Math.exp(-g * tau) * (Math.cos(wd * tau) + (g / wd) * Math.sin(wd * tau));
}

export interface Reading {
  /** 지금 전류(A, 부호 포함). + 는 화면 안쪽(⊗). */
  current: number;
  /** 지금 힘(N, 부호 포함). + 는 오른쪽. */
  force: number;
  /** 그네 각(rad, + 는 오른쪽). 받침점 아래 수직에서 잰다. */
  angle: number;
  /** `currentLow`(⊗) 일 때의 평형각 — `more` 단계에 점선 잔상으로 남긴다. */
  lowAngle: number;
  /** 떠오르고 물러나는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 */
export function derive(tl: TimelineFrame, c: ForceOnCurrentWireConstants): Reading {
  let current = 0;
  let prevEq = 0;
  let angle = 0;
  const list = [...switchings(c)].sort((a, b) => tl.start(a.phase) - tl.start(b.phase));
  for (const s of list) {
    const u0 = tl.start(s.phase);
    const eq = equilibriumAngle(s.current, c);
    angle += (eq - prevEq) * stepResponse(tl.u - u0, c);
    prevEq = eq;
    if (tl.u >= u0) current = s.current;
  }
  const opacity = tl.at('appear') * (1 - tl.at('fade'));
  return {
    current,
    force: forceOf(current, c),
    angle,
    lowAngle: equilibriumAngle(c.currentLow, c),
    opacity,
  };
}

export function step(params: { state: ForceOnCurrentWireState }): ForceOnCurrentWireState {
  return params.state;
}
