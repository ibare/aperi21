// ========================================================================
// elastic-collision — 순수 물리
// ========================================================================
// 1차원 탄성 충돌. 맞닿아 있는 동안을 **짧은 용수철**로 본다 — 상대 속도가 반주기의
// 코사인으로 w → −w 로 뒤집히고, 질량 중심 속도는 그대로다.
//
//   v_A(τ) = v_cm + (m_B / M) · w · cos(πτ/T)
//   v_B(τ) = v_cm − (m_A / M) · w · cos(πτ/T)      w = u_A − u_B,  M = m_A + m_B
//
// τ = T 에서 탄성 충돌의 결과식과 같아진다. 질량이 같으면 v_A′ = u_B, v_B′ = u_A —
// 속도를 통째로 주고받는다. 이 조각이 보이려는 것이 그것이다.
//
// 맞닿는 시간 T 는 상수가 아니라 시간표의 `contact` 단계 길이다 (원칙 2).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BALL_R,
  EPISODE_UNITS,
  EPISODES,
  MASS_A,
  MASS_B,
  SPEED,
  type EpisodeDef,
  type EpisodeUnitsKey,
} from './schema';
import type { ElasticCollisionState } from './state';

export interface ElasticCollisionConstants {
  massA: number;
  massB: number;
  /** 기준 빠르기 v (월드/초). */
  speed: number;
  /** 충돌마다의 처음 속도 — v 의 배수. */
  units: Record<EpisodeUnitsKey, number>;
}

export function readConstants(stage: StageDef): ElasticCollisionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    massA: c.massA ?? MASS_A,
    massB: c.massB ?? MASS_B,
    speed: c.speed ?? SPEED,
    units: {
      restUnitsA: c.restUnitsA ?? EPISODE_UNITS.restUnitsA,
      restUnitsB: c.restUnitsB ?? EPISODE_UNITS.restUnitsB,
      bothUnitsA: c.bothUnitsA ?? EPISODE_UNITS.bothUnitsA,
      bothUnitsB: c.bothUnitsB ?? EPISODE_UNITS.bothUnitsB,
    },
  };
}

/** 지금 시각이 속한 충돌. 단계 이름은 선언(`EPISODES`)이 가진다. */
export function episodeOf(phase: string): EpisodeDef {
  const found = EPISODES.find((e) => Object.values(e.phases).includes(phase));
  if (!found) throw new Error(`elastic-collision: 모르는 단계 ${phase}`);
  return found;
}

/** 한 충돌의 세 국면 — 다가오는 중 · 맞닿은 중 · 떨어져 가는 중. */
export type EpisodePhase = 'before' | 'contact' | 'after';

export function phaseOf(tl: TimelineFrame, ep: EpisodeDef): EpisodePhase {
  if (tl.phase === ep.phases.contact) return 'contact';
  if (tl.phase === ep.phases.apart || tl.phase === ep.phases.fade) return 'after';
  return 'before';
}

/** 탄성 충돌의 결과 속도. 질량이 같으면 둘이 바뀐다. */
export function afterVelocities(
  uA: number,
  uB: number,
  c: ElasticCollisionConstants,
): { vA: number; vB: number } {
  const M = c.massA + c.massB;
  return {
    vA: ((c.massA - c.massB) * uA + 2 * c.massB * uB) / M,
    vB: ((c.massB - c.massA) * uB + 2 * c.massA * uA) / M,
  };
}

/** 한 공의 지금 — 중심 x 와 속도. */
export interface BallNow {
  x: number;
  v: number;
}

/** 두 공의 지금. 같은 시각은 언제나 같은 값이다. */
export interface Pair {
  a: BallNow;
  b: BallNow;
  phase: EpisodePhase;
}

export function pairAt(
  tl: TimelineFrame,
  ep: EpisodeDef,
  c: ElasticCollisionConstants,
): Pair {
  const uA = c.units[ep.unitsA] * c.speed;
  const uB = c.units[ep.unitsB] * c.speed;
  const M = c.massA + c.massB;
  const vcm = (c.massA * uA + c.massB * uB) / M;
  const w = uA - uB;
  const T = tl.duration(ep.phases.contact);

  // 맞닿기 시작하는 순간의 두 중심. 출발 자리는 여기서 거꾸로 센다 — 저작자가
  // 다가오는 단계를 늘리면 출발 자리가 따라 멀어진다.
  const a0 = ep.contactX - BALL_R;
  const b0 = ep.contactX + BALL_R;
  const tContact = tl.start(ep.phases.contact);
  const phase = phaseOf(tl, ep);

  if (phase === 'before') {
    const dt = tl.u - tContact;
    return { a: { x: a0 + uA * dt, v: uA }, b: { x: b0 + uB * dt, v: uB }, phase };
  }

  // 맞닿은 동안 — 용수철 반주기. 선형 진행도라야 τ 가 실제 시간이다.
  const tau = phase === 'contact' ? tl.progress * T : T;
  const k = Math.PI / T;
  const cos = Math.cos(k * tau);
  const sinTerm = Math.sin(k * tau) / k;
  const aC: BallNow = {
    x: a0 + vcm * tau + (c.massB / M) * w * sinTerm,
    v: vcm + (c.massB / M) * w * cos,
  };
  const bC: BallNow = {
    x: b0 + vcm * tau - (c.massA / M) * w * sinTerm,
    v: vcm - (c.massA / M) * w * cos,
  };
  if (phase === 'contact') return { a: aC, b: bC, phase };

  const { vA, vB } = afterVelocities(uA, uB, c);
  const dt = tl.u - tl.end(ep.phases.contact);
  return { a: { x: aC.x + vA * dt, v: vA }, b: { x: bC.x + vB * dt, v: vB }, phase };
}

/**
 * 이번 충돌이 화면에 드러난 정도 0~1. 나타나며 짙어지고 사라지며 옅어진다.
 *
 * 한 주기에 충돌이 둘이라 갈아 끼우는 자리가 필요하다. 공이 갑자기 사라지고 다시
 * 나타나면 그 순간이 충돌만큼 눈에 띄어 주장을 가린다.
 */
export function revealOf(tl: TimelineFrame, ep: EpisodeDef): number {
  return tl.at(ep.phases.appear) * (1 - tl.at(ep.phases.fade));
}

/** 쌓는 상태가 없다 — 공도 화살표도 모두 시각의 함수다. */
export function step(params: { state: ElasticCollisionState }): ElasticCollisionState {
  return params.state;
}
