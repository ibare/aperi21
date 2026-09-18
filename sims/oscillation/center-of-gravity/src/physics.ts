// ========================================================================
// center-of-gravity — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 기울기 각이 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 상자는 오른쪽 아래 모서리 P 를 축으로 시계 방향으로 θ 만큼 기운다. 무게 중심은
// 상자 가운데라 P 에서 본 자리가 (−w/2, h/2) 이고, θ 만큼 돌면 그 가로 자리는
//
//   x_G − x_P = −(w/2)·cosθ + (h/2)·sinθ
//
// 이다. 이것이 0 보다 작으면(수직선이 받침면 안) 무게의 돌림힘이 상자를 되세우고,
// 0 을 넘으면 바깥으로 넘어뜨린다. 경계각은 tanθc = w/h.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { BOX_HEIGHT, BOX_WIDTH, SMALL_TILT_RATIO } from './schema';
import type { CenterOfGravityState } from './state';

export interface CenterOfGravityConstants {
  boxWidth: number;
  boxHeight: number;
  smallTiltRatio: number;
}

export function readConstants(stage: StageDef): CenterOfGravityConstants {
  const c = stage.constants ?? {};
  return {
    boxWidth: c.boxWidth ?? BOX_WIDTH,
    boxHeight: c.boxHeight ?? BOX_HEIGHT,
    smallTiltRatio: c.smallTiltRatio ?? SMALL_TILT_RATIO,
  };
}

/** 수직선이 모서리에 닿는 경계각(rad). */
export function criticalAngle(c: CenterOfGravityConstants): number {
  return Math.atan2(c.boxWidth, c.boxHeight);
}

export interface Reading {
  /** 기울기 각(rad). 0 이 선 자세, π/2 가 옆으로 누운 자세. */
  theta: number;
  /** 손이 밀고 있는가 — 기울이는 단계와 멈춰 잡은 단계. */
  pushing: boolean;
  /** 옆으로 다 누웠는가 — 받침면이 밑면에서 옆면으로 바뀐다. */
  lying: boolean;
  /** 물러나며 옅어지는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 진행도 → 기울기. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 가 그 단계의 진행도를 준다
 * (단계 앞에서는 0, 지난 뒤에는 1).
 */
export function derive(tl: TimelineFrame, c: CenterOfGravityConstants): Reading {
  const thetaC = criticalAngle(c);
  const small = thetaC * c.smallTiltRatio;

  const lean = tl.at('lean');
  const ret = tl.at('return');
  const leanMore = tl.at('leanMore');
  const tip = tl.at('tip');
  const fade = tl.at('fade');

  let theta: number;
  if (ret < 1) {
    // 놓으면 가만히 있던 자리에서 출발해 빨라지며 떨어진다 — 진행도의 제곱.
    theta = small * lean * (1 - ret * ret);
  } else if (tip === 0) {
    theta = thetaC * leanMore;
  } else {
    // 경계를 넘은 뒤에는 무게가 바깥으로 끌어 점점 빨라지며 눕는다.
    theta = thetaC + (Math.PI / 2 - thetaC) * tip * tip;
  }

  const phase = tl.phase;
  return {
    theta,
    pushing: phase === 'lean' || phase === 'hold' || phase === 'leanMore' || phase === 'edge',
    lying: tip >= 1,
    opacity: 1 - fade,
  };
}

// ------------------------------------------------------------------------
// 기하 — 축 P 를 중심으로 θ 만큼 시계 방향으로 돌린 자리
// ------------------------------------------------------------------------

/** 축 P 기준 상자 좌표(x 왼쪽이 음) → 월드. */
export function toWorld(pivot: Vec2, theta: number, local: Vec2): Vec2 {
  const cs = Math.cos(theta);
  const sn = Math.sin(theta);
  return [pivot[0] + local[0] * cs + local[1] * sn, pivot[1] - local[0] * sn + local[1] * cs];
}

export interface BoxPose {
  /** 네 모서리 — 오른쪽 아래(축) · 왼쪽 아래 · 왼쪽 위 · 오른쪽 위. */
  corners: readonly [Vec2, Vec2, Vec2, Vec2];
  /** 무게 중심. */
  cog: Vec2;
}

export function boxPose(pivot: Vec2, theta: number, c: CenterOfGravityConstants): BoxPose {
  const w = c.boxWidth;
  const h = c.boxHeight;
  return {
    corners: [
      toWorld(pivot, theta, [0, 0]),
      toWorld(pivot, theta, [-w, 0]),
      toWorld(pivot, theta, [-w, h]),
      toWorld(pivot, theta, [0, h]),
    ],
    cog: toWorld(pivot, theta, [-w / 2, h / 2]),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: CenterOfGravityState }): CenterOfGravityState {
  return params.state;
}
