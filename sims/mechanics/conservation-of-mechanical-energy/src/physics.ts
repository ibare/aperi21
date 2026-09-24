// ========================================================================
// conservation-of-mechanical-energy — 순수 물리
// ========================================================================
// 사이클로이드 골짜기 x = R(θ + sinθ) · y = R(1 − cosθ) 위의 구속 운동이다.
//
// 바닥에서 잰 호 길이가 s = 4R·sin(θ/2) 이므로 높이는 y = s²/(8R) — 퍼텐셜이
// **정확히** 조화형이다. 그래서 근사 없이
//     s(t) = −s₀·cos(ωt),   ω = √(g/4R)
// 이고, 높이는 y = h·cos²(ωt), 내려온 높이는 h − y = h·sin²(ωt) 가 된다.
// 속력은 그 내려온 높이에서만 나온다 — v = √(2g·(h − y)). 조각이 다시 짜지 않고
// `@aperi21/plugin-mechanics` 의 `speedFromDrop` 에 묻는다 (원칙 1 이 허용하는
// 도메인 plugin 의 순수 계산).
//
// 적분이 없으므로 오차도 없다. 「합이 변하지 않는다」 가 수치가 아니라 구성상 참이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { speedFromDrop } from '@aperi21/plugin-mechanics';
import { GRAVITY, RADIUS, RELEASE_HEIGHT, SPEED_SCALE } from './schema';
import type { ConservationOfMechanicalEnergyState } from './state';

export interface ConservationOfMechanicalEnergyConstants {
  /** 중력 가속도(m/s²). */
  gravity: number;
  /** 골짜기를 그리는 사이클로이드의 생성원 반지름(m). */
  radius: number;
  /** 공을 놓는 높이(m) — 골짜기 바닥에서 잰다. 이것이 곧 합이다. */
  releaseHeight: number;
  /** 속력 → 화살표 길이 배율(m per m/s). */
  speedScale: number;
}

export function readConstants(stage: StageDef): ConservationOfMechanicalEnergyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gravity: c.gravity ?? GRAVITY,
    radius: c.radius ?? RADIUS,
    releaseHeight: c.releaseHeight ?? RELEASE_HEIGHT,
    speedScale: c.speedScale ?? SPEED_SCALE,
  };
}

/** 골짜기 위의 한 점. 매개변수 θ 를 좌표로 옮긴다. */
export function pointAt(theta: number, radius: number): Vec2 {
  return [radius * (theta + Math.sin(theta)), radius * (1 - Math.cos(theta))];
}

/** 그 높이에 닿는 자리의 매개변수. y = 2R·sin²(θ/2) 를 θ 에 대해 푼 것. */
export function thetaAtHeight(height: number, radius: number): number {
  return 2 * Math.asin(clampUnit(Math.sqrt(Math.max(0, height) / (2 * radius))));
}

function clampUnit(v: number): number {
  return Math.max(-1, Math.min(1, v));
}

export interface SwingReading {
  /** 공의 중심. 길 위에 꿴 구슬이다. */
  pos: Vec2;
  /** 기준면에서 잰 지금 높이(m) — 기둥의 아래 몫. */
  height: number;
  /** 놓은 높이에서 지금 높이를 뺀 몫(m) — 기둥의 위 몫. */
  motion: number;
  /** 지금 속력(m/s). 내려온 높이에서만 나온다. */
  speed: number;
  /** 길에 닿은 진행 방향(단위 벡터). */
  dir: Vec2;
}

/**
 * 지금 순간의 공을 읽는다.
 *
 * **위상은 선언이 정한다** — 네 단계의 진행도를 더해 0 → 4 로 자라는 수를 얻고 거기에
 * π/2 를 곱한다 (`at(id)` 는 단계 전에는 0, 동안 0~1, 뒤에는 1). 모듈 상수로 단계
 * 경계를 두고 `if (u < B1)` 로 가르지 않는다 (S-piece 「시간표는 선언이다」). 저작자가
 * 한 분기를 늘이면 그 분기가 그만큼 천천히 지나간다.
 *
 * 위상 0 이 왼쪽 되돌아서는 자리, π/2 가 바닥, π 가 오른쪽, 2π 가 다시 왼쪽이다.
 */
export function readSwing(
  tl: TimelineFrame,
  c: ConservationOfMechanicalEnergyConstants,
): SwingReading {
  const quarters =
    tl.at('fall-left') + tl.at('rise-right') + tl.at('fall-right') + tl.at('rise-left');
  const phase = (Math.PI / 2) * quarters;

  const cos = Math.cos(phase);
  const height = c.releaseHeight * cos * cos;
  const motion = Math.max(0, c.releaseHeight - height);
  const speed = speedFromDrop(motion, c.gravity);

  // sin(θ/2) = −√(h/2R)·cos(위상). 부호가 왼쪽 · 오른쪽을 가른다.
  const half = Math.sqrt(c.releaseHeight / (2 * c.radius));
  const theta = 2 * Math.asin(clampUnit(-half * cos));
  const pos = pointAt(theta, c.radius);

  // 접선 (dx/dθ, dy/dθ) = R(1 + cosθ, sinθ). 진행 방향의 부호는 sin(위상) 이다.
  const tx = 1 + Math.cos(theta);
  const ty = Math.sin(theta);
  const len = Math.hypot(tx, ty) || 1;
  const sign = Math.sin(phase) >= 0 ? 1 : -1;

  return { pos, height, motion, speed, dir: [(sign * tx) / len, (sign * ty) / len] };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: {
  state: ConservationOfMechanicalEnergyState;
}): ConservationOfMechanicalEnergyState {
  return params.state;
}
