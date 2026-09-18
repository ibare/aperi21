// ========================================================================
// circular-orbit — 순수 물리
// ========================================================================
// 등속 원운동 하나뿐이다. 위성의 각은 θ = θ₀ + ω·u (u 는 주기 안 시각)이고
// 빠르기 v = ω·R 은 내내 같다. 중력(구심력)은 늘 중심을 향하고 크기가 같다.
//
// 「중력이 없다면」 유령은 떠나는 순간의 자리 · 속도로 곧게 간다:
//   유령 = P₀ + v₀·s   (s 는 떠난 뒤 흐른 시간)
// 유령과 위성 사이의 틈이 그동안 중력이 중심 쪽으로 끌어내린 몫이다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { GHOST_ANGLE_DEG, ORBIT_RADIUS, PLANET_RADIUS } from './schema';
import type { CircularOrbitState } from './state';

export interface CircularOrbitConstants {
  /** 궤도 반지름(월드 단위). */
  orbitRadius: number;
  /** 행성 반지름(월드 단위). */
  planetRadius: number;
  /** 유령이 떠나는 자리(도). */
  ghostAngle: number;
}

export function readConstants(stage: StageDef): CircularOrbitConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    orbitRadius: c.orbitRadius ?? ORBIT_RADIUS,
    planetRadius: c.planetRadius ?? PLANET_RADIUS,
    ghostAngle: c.ghostAngle ?? GHOST_ANGLE_DEG,
  };
}

/**
 * 각속도(rad/s). **`close` 가 끝나는 순간 정확히 한 바퀴** — 자취가 그때 닫히도록
 * 시간표에게 묻는다. 모듈 상수로 주기를 두면 저작자가 단계를 늘여도 원이 제때 닫히지 않는다.
 */
export function angularSpeed(tl: TimelineFrame): number {
  return (2 * Math.PI) / tl.end('close');
}

/**
 * 주기 첫 순간의 각(rad). 위성이 `ghost` 가 시작하는 시각에 `ghostAngle` 에 닿도록
 * 되짚는다 — 유령이 떠나는 자리가 선언의 값이 된다.
 */
export function startAngle(tl: TimelineFrame, c: CircularOrbitConstants): number {
  return (c.ghostAngle * Math.PI) / 180 - angularSpeed(tl) * tl.start('ghost');
}

/** 주기 안 시각 u 에서의 위성 각(rad). */
export function angleAt(tl: TimelineFrame, c: CircularOrbitConstants, u: number): number {
  return startAngle(tl, c) + angularSpeed(tl) * u;
}

/** 각 θ 에서의 위성 자리. */
export function pointAt(c: CircularOrbitConstants, theta: number): Vec2 {
  return [c.orbitRadius * Math.cos(theta), c.orbitRadius * Math.sin(theta)];
}

/** 각 θ 에서 반시계로 도는 방향(단위 벡터). 속도의 방향이다. */
export function tangentAt(theta: number): Vec2 {
  return [-Math.sin(theta), Math.cos(theta)];
}

/** 각 θ 에서 중심을 향하는 방향(단위 벡터). 중력의 방향이다. */
export function inwardAt(theta: number): Vec2 {
  return [-Math.cos(theta), -Math.sin(theta)];
}

export interface GhostReading {
  /** 유령이 떠난 자리 — 그 순간 위성이 있던 곳. */
  from: Vec2;
  /** 유령의 지금 자리. `fall` 동안은 `ghost` 끝 자리에 멈춘다. */
  at: Vec2;
  /** 유령이 떠난 뒤 위성이 간 자리. 유령과 같은 시간만큼 흐른 곳이다. */
  satellite: Vec2;
  /** 유령 무리의 짙기 0~1. `ghost` 동안 1, `fall` 동안 흐려진다. */
  alpha: number;
}

/**
 * 유령을 읽는다. `ghost` 단계 동안만 떠 있고, `fall` 동안 멈춘 채 흐려진다. 그 밖에는
 * 없다(`null`). 단계 경계는 선언이 정한다 — `at('ghost')` · `at('fall')` 로 읽는다.
 */
export function readGhost(tl: TimelineFrame, c: CircularOrbitConstants): GhostReading | null {
  const inGhost = tl.phase === 'ghost';
  const inFall = tl.phase === 'fall';
  if (!inGhost && !inFall) return null;

  const omega = angularSpeed(tl);
  const t0 = tl.start('ghost');
  // 떠난 뒤 흐른 시간 — `fall` 동안은 `ghost` 의 끝에 멈춘다.
  const s = tl.duration('ghost') * tl.at('ghost');
  const theta0 = angleAt(tl, c, t0);
  const from = pointAt(c, theta0);
  const dir = tangentAt(theta0);
  const speed = omega * c.orbitRadius;
  return {
    from,
    at: [from[0] + dir[0] * speed * s, from[1] + dir[1] * speed * s],
    satellite: pointAt(c, theta0 + omega * s),
    alpha: 1 - tl.at('fall'),
  };
}

/** 자취의 짙기 0~1. 마지막 단계에서 흐려지고 다음 주기에 새로 자란다. */
export function trailOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: CircularOrbitState }): CircularOrbitState {
  return params.state;
}
