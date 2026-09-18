// ========================================================================
// two-dimensional-collision — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 매끄러운 두 공의 탄성 충돌. 충격량은 두 중심을 잇는 선 n 을 따라서만 오간다.
//
//   J = 2·mA·mB/(mA+mB) · (v·n)
//   pA' = pA − J·n        pB' = J·n
//
// 부딪치는 동안 넘어간 몫을 s(0 → 1)로 두면 pA(s) + pB(s) = pA 가 **성분마다**
// 성립한다 — x 끼리, y 끼리. 장부가 보이는 것이 이 한 줄이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { MASS_A, MASS_B, RADIUS_A, RADIUS_B, SPEED_A, WORLD_PER_SPEED } from './schema';
import type { TwoDimensionalCollisionState } from './state';

export interface TwoDimensionalCollisionConstants {
  massA: number;
  massB: number;
  speedA: number;
}

export function readConstants(stage: StageDef): TwoDimensionalCollisionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    massA: c.massA ?? MASS_A,
    massB: c.massB ?? MASS_B,
    speedA: c.speedA ?? SPEED_A,
  };
}

export interface Reading {
  /** 두 공 중심(월드). */
  posA: Vec2;
  posB: Vec2;
  /** 지금 운동량(kg·m/s). */
  pA: Vec2;
  pB: Vec2;
  /** 부딪치기 전의 합 — 장부의 강조 점선 자리. */
  total: Vec2;
  /** A 가 들어온 길의 시작점 · 두 공이 만난 자리. 지나온 자취를 긋는 데 쓴다. */
  startA: Vec2;
  contactA: Vec2;
  /** 갈라져 나간 뒤인가. */
  separated: boolean;
  /** 물러나며 옅어지는 정도(1 이면 또렷하다). */
  opacity: number;
}

const add = (a: Vec2, b: Vec2, k = 1): Vec2 => [a[0] + b[0] * k, a[1] + b[1] * k];

/**
 * 시간표 진행도 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두지 않는다 — `at(id)` 가 그 단계의 진행도를 준다
 * (단계 앞에서는 0, 지난 뒤에는 1).
 */
export function derive(
  tl: TimelineFrame,
  c: TwoDimensionalCollisionConstants,
  impactAngleDeg: number,
): Reading {
  const phi = (impactAngleDeg * Math.PI) / 180;
  // 두 중심을 잇는 선. B 가 A 의 진행선보다 아래에 있어 B 는 오른쪽 아래로 밀린다.
  const n: Vec2 = [Math.cos(phi), -Math.sin(phi)];
  const vA: Vec2 = [c.speedA, 0];
  const total: Vec2 = [c.massA * vA[0], c.massA * vA[1]];
  const vn = vA[0] * n[0] + vA[1] * n[1];
  const J = ((2 * c.massA * c.massB) / (c.massA + c.massB)) * vn;

  // 부딪칠 때 A 의 중심. B 는 원점에 서 있다.
  const reach = RADIUS_A + RADIUS_B;
  const contactA: Vec2 = [-reach * n[0], -reach * n[1]];

  const approachT = tl.duration('approach');
  const startA = add(contactA, vA, -WORLD_PER_SPEED * approachT);

  // 넘어간 충격량의 몫. `contact` 가 늘여 보이는 순간이다.
  const s = tl.at('contact');
  const pB: Vec2 = [J * s * n[0], J * s * n[1]];
  const pA: Vec2 = [total[0] - pB[0], total[1] - pB[1]];

  // 갈라진 뒤 흐른 시간 — 옅어지는 동안에도 공은 계속 나아간다.
  const after = tl.at('apart') * tl.duration('apart') + tl.at('fade') * tl.duration('fade');
  const separated = tl.at('apart') > 0;

  let posA: Vec2;
  let posB: Vec2 = [0, 0];
  if (!separated) {
    // 달려오는 동안은 곧게, 부딪치는 동안은 맞닿은 채로 둔다. 실제 접촉 동안 공이
    // 옮겨 가는 거리는 화면에서 1 px 미만이다.
    posA = add(startA, vA, WORLD_PER_SPEED * approachT * tl.at('approach'));
  } else {
    const k = WORLD_PER_SPEED * after;
    posA = add(contactA, [pA[0] / c.massA, pA[1] / c.massA], k);
    posB = add([0, 0], [pB[0] / c.massB, pB[1] / c.massB], k);
  }

  return {
    posA,
    posB,
    pA,
    pB,
    total,
    startA,
    contactA,
    separated,
    opacity: 1 - tl.at('fade'),
  };
}

/** 쌓는 상태가 없다 — 칩이 고른 각만 들고 있다. */
export function step(params: { state: TwoDimensionalCollisionState }): TwoDimensionalCollisionState {
  return params.state;
}
