// ========================================================================
// explosion-and-recoil — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 멈춰 있던 계의 운동량은 0 이다. 터진 뒤에도 합은 0 이어야 하므로 두 조각은
// 같은 크기의 운동량을 반대로 받는다.
//
//   M·V = m·v   →   V / v = m / M
//
// 받은 운동량이 같으니 속력은 질량에 반비례한다. 같은 시간 동안 간 거리도 그렇다.
// 바닥은 매끄럽다 — 마찰이 있으면 멈추는 거리가 질량과 무관한 다른 셈이 끼어든다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { GHOST_EVERY, HEAVY_MASS, KICK_MOMENTUM, LIGHT_MASS } from './schema';
import type { ExplosionAndRecoilState } from './state';

export interface ExplosionAndRecoilConstants {
  heavyMass: number;
  lightMass: number;
  kickMomentum: number;
}

export function readConstants(stage: StageDef): ExplosionAndRecoilConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    heavyMass: c.heavyMass ?? HEAVY_MASS,
    lightMass: c.lightMass ?? LIGHT_MASS,
    kickMomentum: c.kickMomentum ?? KICK_MOMENTUM,
  };
}

/** 한 조각의 지금. 거리는 처음 맞닿은 이음매에서 잰 안쪽 면의 이동(월드, 부호 없음). */
export interface PieceReading {
  /** 받은 뒤의 속력(월드/초). */
  speed: number;
  /** 지금 속력 — 터지는 동안 0 에서 `speed` 까지 붙는다. */
  speedNow: number;
  /** 이음매에서 떨어진 거리. */
  moved: number;
  /** 1 초마다 남긴 자국 자리들(이음매에서 떨어진 거리). 지난 것만. */
  ghosts: number[];
  /** 미끄러지기 시작한 뒤 `glide` 길이만큼 간 거리 — 치수선이 재는 자리. */
  measured: number;
}

export interface Reading {
  heavy: PieceReading;
  light: PieceReading;
  /** 터진 뒤 흐른 시간(초). 터지기 전이면 음수. 파편 불꽃이 쓴다. */
  sinceBurst: number;
  /** 덩이 · 화살표의 불투명도 — `leave` 동안 옅어진다. */
  pieceOpacity: number;
  /** 치수선을 두는가. */
  measuring: boolean;
  /** 전체가 물러나며 옅어지는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` · `start(id)` 가 그 단계를 준다.
 */
export function derive(tl: TimelineFrame, c: ExplosionAndRecoilConstants): Reading {
  const burst = tl.at('burst');
  const burstDur = tl.duration('burst');
  const glideDur = tl.duration('glide');
  /** 미끄러지기 시작한 뒤 흐른 시간(초). 터지는 동안과 그 전에는 0. */
  const glideTime = Math.max(0, tl.u - tl.end('burst'));

  const piece = (mass: number): PieceReading => {
    const speed = c.kickMomentum / mass;
    // 터지는 동안은 고른 힘으로 밀린다 — 속력이 진행도에 비례해 붙는다.
    const burstMoved = 0.5 * speed * burstDur * burst * burst;
    const at = (t: number): number => burstMoved + speed * t;
    const ghosts: number[] = [];
    for (let k = GHOST_EVERY; k <= glideDur + 1e-9; k += GHOST_EVERY) {
      if (glideTime >= k) ghosts.push(at(k));
    }
    return {
      speed,
      speedNow: speed * burst,
      moved: at(glideTime),
      ghosts,
      measured: at(glideDur),
    };
  };

  return {
    heavy: piece(c.heavyMass),
    light: piece(c.lightMass),
    sinceBurst: tl.u - tl.start('burst'),
    pieceOpacity: 1 - tl.at('leave'),
    measuring: tl.at('leave') > 0,
    opacity: 1 - tl.at('fade'),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: ExplosionAndRecoilState }): ExplosionAndRecoilState {
  return params.state;
}
