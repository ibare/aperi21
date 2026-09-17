// ========================================================================
// impulse-force-relation — 순수 물리
// ========================================================================
// 두 공은 질량·속력이 같고 둘 다 완전히 멈춘다 → 운동량 변화가 같다.
// 받는 힘은 반사인 모양 F(τ) = Fmax·sin(πτ/T). 넓이 2·Fmax·T/π = m·v0 이 되도록 Fmax 를 정한다.
// 속도와 파고든 거리는 이 힘을 적분한 닫힌 식이라 같은 시각은 언제나 같은 화면이다.
// ========================================================================

import { CYCLE, T_HARD, T_HIT, T_SOFT_RANGE, T_SOFT_STEP, V0 } from './schema';
import type { ImpulseForceRelationState } from './state';

/** 최대 힘 비율 — 딱딱한 벽의 최대 힘이 1. 넓이가 같으므로 멈춤 시간에 반비례한다. */
export function fmaxRel(T: number): number {
  return T_HARD / T;
}

/** 접촉 τ 초 뒤의 힘 (벽 최대 = 1). */
export function forceRel(tau: number, T: number): number {
  if (tau < 0 || tau > T) return 0;
  return fmaxRel(T) * Math.sin((Math.PI * tau) / T);
}

/** 접촉 τ 초 뒤의 속력 비율 (1 → 0). */
export function speedRel(tau: number, T: number): number {
  if (tau <= 0) return 1;
  if (tau >= T) return 0;
  return (1 + Math.cos((Math.PI * tau) / T)) / 2;
}

/** 접촉 이후 공이 더 나아간 거리 (월드 단위). */
export function pushIn(tau: number, T: number): number {
  if (tau <= 0) return 0;
  const s = Math.min(tau, T);
  return (V0 / 2) * (s + (T / Math.PI) * Math.sin((Math.PI * s) / T));
}

/** 조절기 값을 0.25 초 간격 · 범위 안에 붙인다 — 같음 판정(`=== T_HARD`)이 부동소수에 깨지지 않게. */
export function snapSoft(raw: number): number {
  const [lo, hi] = T_SOFT_RANGE;
  const k = Math.round((raw - lo) / T_SOFT_STEP);
  return Math.min(hi, Math.max(lo, lo + k * T_SOFT_STEP));
}

/** 주기 안 시각을 [0, CYCLE) 로 되감는다. */
export function wrapU(u: number): number {
  const r = u % CYCLE;
  return r < 0 ? r + CYCLE : r;
}

/**
 * 조절기 값과 주기 안 시각에서 캡션이 읽는 조건을 정한다. 원본 `captionFor` 의 판정 그대로다 —
 *
 *   τ < 0                     → 날아가는 중
 *   벽·방석 둘 다 접촉 중       → 방석 시간이 벽과 같으면 「같은 짧은 시간」, 아니면 「벽이 순식간에」
 *   방석만 접촉 중              → 「방석은 아직 멈추는 중」
 *   둘 다 멈춤                  → 같으면 「같은 시간이면 힘도 같다」, 아니면 마무리 문장(기본)
 */
export function derive(rawSoft: number, u: number, held: boolean): ImpulseForceRelationState {
  const tSoft = snapSoft(rawSoft);
  const tau = u - T_HIT;
  const hardOn = tau >= 0 && tau < T_HARD;
  const softOn = tau >= 0 && tau < tSoft;
  const same = tSoft === T_HARD;
  const approaching = tau < 0;
  const both = hardOn && softOn;
  const done = !approaching && !hardOn && !softOn;
  return {
    tSoft,
    held,
    u,
    approaching,
    sameShort: both && same,
    hardHit: both && !same,
    softStopping: softOn && !hardOn,
    sameDone: done && same,
  };
}

/**
 * 주기 안 시각만 적분한다. 조절기를 잡는 동안은 0 — 러너가 누를 때와 놓을 때 시계를 0 으로
 * 되돌리므로(`restart`), 놓는 순간 두 시각이 함께 0 에서 흐른다.
 */
export function step(params: { state: ImpulseForceRelationState; dt: number }): ImpulseForceRelationState {
  const s = params.state;
  const u = s.held ? 0 : wrapU(s.u + params.dt);
  return derive(s.tSoft, u, s.held);
}
