// ========================================================================
// projectile-range — 순수 물리
// ========================================================================
// 포물선 하나뿐이다. 떠난 뒤 s 초가 흐르면
//   x = v·cosθ·s,  y = v·sinθ·s − ½·g·s²
// 이고, 닿기까지의 시간은 2·v·sinθ/g, 그때의 x 가 사거리 v²·sin2θ/g 다.
// sin2θ 는 45° 에서 가장 크고 45° 를 축으로 대칭이라 30° 와 60°, 15° 와 75° 가
// 같은 값을 준다 — 화면에서는 그것이 「같은 자리에 내려앉는다」 로 나타난다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ANGLE_BEST,
  ANGLE_HIGH,
  ANGLE_LOW,
  ANGLE_SHALLOW,
  ANGLE_STEEP,
  GRAVITY,
  SPEED,
} from './schema';
import type { ProjectileRangeState } from './state';

/** 다섯 발사각(°). 45° 를 가운데 두고 양쪽으로 짝을 이룬다. */
export interface LaunchAngles {
  shallow: number;
  low: number;
  best: number;
  high: number;
  steep: number;
}

export interface ProjectileRangeConstants {
  /** 다섯 공이 함께 쓰는 처음 속력(m/s). */
  speed: number;
  /** 중력가속도(m/s²). */
  g: number;
  angles: LaunchAngles;
}

/** 주장이 기대는 물리량은 `stages[].constants` 에서 기본값과 함께 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): ProjectileRangeConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    speed: c.speed ?? SPEED,
    g: c.g ?? GRAVITY,
    angles: {
      shallow: c.angleShallow ?? ANGLE_SHALLOW,
      low: c.angleLow ?? ANGLE_LOW,
      best: c.angleBest ?? ANGLE_BEST,
      high: c.angleHigh ?? ANGLE_HIGH,
      steep: c.angleSteep ?? ANGLE_STEEP,
    },
  };
}

export interface ShotReading {
  /** 이 발의 발사각(°). 선언에서 온 값이다. */
  angleDeg: number;
  /** 공의 지금 자리. 내려앉은 뒤로는 착지 자리에 멈춘다. */
  pos: Vec2;
  /** 떠난 자리부터 지금 자리까지의 경로. */
  path: readonly Vec2[];
  /** 떠난 뒤 흐른 시간(초). 0 이면 아직 겨누는 중이라 경로가 없다. */
  flown: number;
  /** 착지 자리의 x(m) — 사거리다. */
  range: number;
  /** 내려앉았는가 — 자국과 이름표를 놓을 조건이다. */
  landed: boolean;
  /** 내려앉은 뒤 흐른 시간(초). 착지 파문의 나이다. */
  landedFor: number;
}

/**
 * 한 발을 읽는다. **단계 경계는 선언이 정한다** — 떠나는 시각을 시간표에게 묻는다
 * (`end('aim')`). 모듈 상수와 견주어 단계를 가르면 저작자가 `aim` 을 늘여도 물리가
 * 따라가지 않는다 (S-piece 「시간표는 선언이다」 · 원칙 2).
 *
 * 다섯이 같은 시각에 떠나므로 「같은 시간에 어디까지 갔나」 를 견줄 수 있다.
 */
export function readShot(
  tl: TimelineFrame,
  angleDeg: number,
  c: ProjectileRangeConstants,
  samples: number,
): ShotReading {
  const rad = (angleDeg * Math.PI) / 180;
  const vx = c.speed * Math.cos(rad);
  const vy = c.speed * Math.sin(rad);
  const flight = (2 * vy) / c.g;
  // 떠난 뒤 흐른 시간. 단계가 끝나는 시각도 선언이 안다.
  const elapsed = Math.max(0, tl.u - tl.end('aim'));
  const s = Math.min(elapsed, flight);

  const at = (u: number): Vec2 => [vx * u, vy * u - 0.5 * c.g * u * u];
  const path: Vec2[] = [];
  for (let i = 0; i <= samples; i++) path.push(at((s * i) / samples));

  return {
    angleDeg,
    pos: at(s),
    path,
    flown: s,
    range: vx * flight,
    // 닿는 순간은 **물리**가 정한다 — 단계 경계가 아니라 2v sinθ/g 다.
    landed: elapsed >= flight,
    landedFor: Math.max(0, elapsed - flight),
  };
}

/** 겨눈 화살표가 남아 있는 정도 0~1. 쏘는 동안 걷힌다. */
export function aimOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('release');
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 겨눈다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 45° 가 더 간 거리를 재는 치수선이 그어진 정도 0~1. 짧은 단계 하나가 정한다. */
export function extraOpacity(tl: TimelineFrame): number {
  return tl.at('reveal');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ProjectileRangeState }): ProjectileRangeState {
  return params.state;
}
