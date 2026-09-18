// ========================================================================
// inelastic-collision — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 같은 질량 m 두 수레, 하나는 v 로 달려오고 하나는 멈춰 있다. 반발 계수 e 이면
//
//   vA′ = v(1 − e)/2      vB′ = v(1 + e)/2
//   벌어지는 빠르기  vB′ − vA′ = e·v          (다가오던 빠르기 v 의 e 배)
//   남는 운동 에너지  (1 + e²)/2 · ½mv²
//   사라지는 몫       (1 − e²)/2 · ½mv²
//
// 이 조각은 둘째 줄과 넷째 줄을 같은 화면의 같은 높이에 놓는 것이 전부다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  APPROACH_DISTANCE,
  APPROACH_SPEED,
  CART_HALF_W,
  RESTITUTION_BOTTOM,
  RESTITUTION_MID,
  RESTITUTION_TOP,
} from './schema';
import type { InelasticCollisionState } from './state';

export interface InelasticCollisionConstants {
  /** 달려오는 속력(m/s). */
  speed: number;
  /** 세 줄의 반발 계수, 위에서부터. */
  restitutions: readonly [number, number, number];
}

export function readConstants(stage: StageDef): InelasticCollisionConstants {
  const c = stage.constants ?? {};
  return {
    speed: c.speed ?? APPROACH_SPEED,
    restitutions: [
      c.restitutionTop ?? RESTITUTION_TOP,
      c.restitutionMid ?? RESTITUTION_MID,
      c.restitutionBottom ?? RESTITUTION_BOTTOM,
    ],
  };
}

/** 닿는 순간 달려온 수레의 중심 x. 멈춘 수레의 중심이 0 이다. */
export const CONTACT_X = -2 * CART_HALF_W;

/** 한 줄의 지금 값. */
export interface LaneReading {
  /** 반발 계수. */
  e: number;
  /** 두 수레 중심 x(월드). */
  xA: number;
  xB: number;
  /** 두 수레의 지금 속도(m/s). 화살표 길이가 된다. */
  vA: number;
  vB: number;
  /** 처음 운동 에너지에 대한 지금 남은 몫 0~1. */
  kept: number;
  /** 충돌이 끝났을 때 남는 몫 — 사라진 칸의 왼쪽 끝. */
  keptFinal: number;
}

export interface Reading {
  lanes: readonly LaneReading[];
  /** 움직이는 중인가 — 멈춰 세운 비교 화면에서는 속도 화살표를 걷는다. */
  moving: boolean;
  /** 부딪힌 뒤인가 — 틈을 재기 시작한다. */
  separating: boolean;
  /** 사라진 칸을 드러내는 정도 0~1. 충돌 동안 자란다. */
  lostShown: number;
  /** 물러나며 옅어지는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 가 그 단계의 진행도를 준다
 * (단계 앞에서는 0, 지난 뒤에는 1).
 */
export function derive(tl: TimelineFrame, c: InelasticCollisionConstants): Reading {
  const v = c.speed;
  const approach = tl.at('approach');
  const imp = tl.at('impact');
  const apart = tl.at('apart');
  const compare = tl.at('compare');
  const fade = tl.at('fade');

  // 부딪힌 뒤 흐른 물리 시간 — `apart` 단계는 조각 시계와 같은 빠르기로 흐른다.
  const since = apart * tl.duration('apart');

  const lanes = c.restitutions.map((e): LaneReading => {
    const vA1 = (v * (1 - e)) / 2;
    const vB1 = (v * (1 + e)) / 2;
    const keptFinal = (1 + e * e) / 2;
    const before = imp === 0;
    return {
      e,
      xA: before ? CONTACT_X - APPROACH_DISTANCE * (1 - approach) : CONTACT_X + vA1 * since,
      xB: before ? 0 : vB1 * since,
      // 닿아 있는 동안 한쪽 속도가 다른 쪽으로 넘어간다. 늘인 시간이라 모양만 잇는다.
      vA: v + (vA1 - v) * imp,
      vB: vB1 * imp,
      // 막대는 곧게 줄어든다. 실제로는 눌리는 동안 더 내려갔다가 되튀며 조금 돌아오지만,
      // 그 굴곡은 이 조각의 주장(끝에 무엇이 남는가)이 아니다 — NOTES (b).
      kept: 1 - (1 - keptFinal) * imp,
      keptFinal,
    };
  });

  return {
    lanes,
    moving: compare === 0,
    separating: apart > 0,
    lostShown: imp,
    opacity: 1 - fade,
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: InelasticCollisionState }): InelasticCollisionState {
  return params.state;
}
