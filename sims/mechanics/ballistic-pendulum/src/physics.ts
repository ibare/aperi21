// ========================================================================
// ballistic-pendulum — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 두 단계를 각각 무엇이 잇는지가 이 조각의 전부다.
//
//   박힘  m·v = (m+M)·V                운동량이 이어진다
//         ½mv² → ½(m+M)V² = m/(m+M)·½mv²   에너지는 m/(m+M) 만 남는다
//   상승  ½(m+M)V² = (m+M)·g·L(1−cosθ)  에너지가 이어진다
//         (m+M)·|v| → 0                 운동량은 줄 · 중력이 가져간다
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BULLET_DEPTH,
  BULLET_HALF_L,
  BULLET_MASS,
  BULLET_SPEED,
  BLOCK_HALF_W,
  BULLET_START_X,
  G,
  STRING_LENGTH,
} from './schema';
import type { BallisticPendulumState } from './state';

export interface BallisticPendulumConstants {
  g: number;
  bulletMass: number;
  bulletSpeed: number;
  stringLength: number;
}

export function readConstants(stage: StageDef): BallisticPendulumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    g: c.g ?? G,
    bulletMass: c.bulletMass ?? BULLET_MASS,
    bulletSpeed: c.bulletSpeed ?? BULLET_SPEED,
    stringLength: c.stringLength ?? STRING_LENGTH,
  };
}

/** 탄알이 토막에 닿는 순간의 탄알 중심 x. */
export const CONTACT_X = -BLOCK_HALF_W - BULLET_HALF_L;

export interface Reading {
  /** 탄알 중심 x(월드). */
  bulletX: number;
  /** 나무토막 중심이 쉬는 자리에서 옮겨 간 거리(월드). */
  blockDx: number;
  blockDy: number;
  /** 줄이 연직에서 벗어난 각(rad). */
  theta: number;

  /** 운동량 크기(kg·m/s)와 날아오는 탄알의 운동량. */
  momentum: number;
  momentum0: number;
  /** 운동 에너지 · 위치 에너지 · 사라진 몫(J)과 처음 에너지. */
  kinetic: number;
  potential: number;
  lost: number;
  energy0: number;

  /** 이 단계에서 그대로인 양 — 강조 점선을 어느 막대에 걸지. */
  keptMomentum: boolean;
  keptEnergy: boolean;
  /** 올라간 높이를 재는 단계인가. */
  measuring: boolean;
  /** 물러나며 옅어지는 정도(1 이면 또렷하다). */
  opacity: number;
}

/** 박힌 뒤 토막이 오르는 최대 각. 에너지가 다 위치로 갈 때다. */
function topAngle(v: number, ratio: number, c: BallisticPendulumConstants): number {
  const speed = ratio * v;
  const rise = (speed * speed) / (2 * c.g);
  return Math.acos(Math.max(-1, Math.min(1, 1 - rise / c.stringLength)));
}

/**
 * 시간표 진행도 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 가 그 단계의 진행도를 준다
 * (단계 앞에서는 0, 지난 뒤에는 1).
 */
export function derive(
  tl: TimelineFrame,
  c: BallisticPendulumConstants,
  blockMass: number,
): Reading {
  const m = c.bulletMass;
  const M = blockMass;
  const v = c.bulletSpeed;
  const ratio = m / (m + M);
  const V = ratio * v;

  const fly = tl.at('fly');
  const imp = tl.at('impact');
  const rise = tl.at('rise');
  const top = tl.at('top');
  const fade = tl.at('fade');

  const theta = topAngle(v, ratio, c) * Math.sin((Math.PI / 2) * rise);
  const blockDx = c.stringLength * Math.sin(theta);
  const blockDy = c.stringLength * (1 - Math.cos(theta));

  let momentum: number;
  let kinetic: number;
  let potential: number;
  let bulletX: number;

  if (imp < 1) {
    // 박히는 동안 — 탄알은 느려지고 토막은 빨라진다. 둘의 합은 바뀌지 않는다.
    const bulletV = v - (v - V) * imp;
    const blockV = V * imp;
    momentum = m * bulletV + M * blockV;
    kinetic = 0.5 * m * bulletV * bulletV + 0.5 * M * blockV * blockV;
    potential = 0;
    // 파고든 깊이는 상대 속도가 줄어드는 만큼 — 처음에 깊고 끝에서 멎는다.
    const depth = imp > 0 ? BULLET_DEPTH * (1 - (1 - imp) * (1 - imp)) : 0;
    bulletX = imp > 0 ? CONTACT_X + depth : BULLET_START_X + (CONTACT_X - BULLET_START_X) * fly;
  } else {
    // 올라가는 동안 — 에너지 합이 그대로이고 운동량이 줄어든다.
    potential = (m + M) * c.g * c.stringLength * (1 - Math.cos(theta));
    kinetic = Math.max(0, 0.5 * (m + M) * V * V - potential);
    momentum = Math.sqrt(2 * (m + M) * kinetic);
    bulletX = CONTACT_X + BULLET_DEPTH + blockDx;
  }

  const energy0 = 0.5 * m * v * v;

  return {
    bulletX,
    blockDx: imp < 1 ? 0 : blockDx,
    blockDy: imp < 1 ? 0 : blockDy,
    theta,
    momentum,
    momentum0: m * v,
    kinetic,
    potential,
    lost: Math.max(0, energy0 - kinetic - potential),
    energy0,
    keptMomentum: imp > 0 && rise === 0,
    keptEnergy: rise > 0,
    measuring: top > 0,
    opacity: 1 - fade,
  };
}

/** 쌓는 상태가 없다 — 칩이 고른 질량만 들고 있다. */
export function step(params: { state: BallisticPendulumState }): BallisticPendulumState {
  return params.state;
}
