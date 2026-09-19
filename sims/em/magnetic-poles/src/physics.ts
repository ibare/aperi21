// ========================================================================
// magnetic-poles — 순수 물리
// ========================================================================
// 자석 — 막대자석 하나를 **극 두 점**으로 본다. N 끝 가까이에 +1, S 끝 가까이에 −1
// 의 자극이 있고(끝에서 `poleInset` 안쪽), 극 둘 사이의 힘은 거리 제곱에 반비례한다.
// 같은 부호면 밀고 다른 부호면 당긴다. 두 자석이 한 줄(x 축) 위에 놓여 있으므로
// 힘도 x 성분뿐이다 — 네 쌍(고정 N·S × 수레 N·S)을 더한다.
//
// 수레 — x 축 선로 위에서만 움직인다.
//   x'' = a(x) − γ·x'      a = K · Σ qᵢ qⱼ · sign(dx) / dx²    γ = 감쇠
// 닫힌 꼴이 없어 놓은 순간(0)부터 지금까지 같은 걸음으로 매 프레임 다시 푼다 —
// 쌓는 상태가 없고 같은 시각은 언제나 같은 화면이다 (S-sim).
//
// 멈춤 — 수레 판이 고정 자석 끝에 닿으면(붙음) 또는 선로 끝 멈춤막이에 닿으면 그 자리에
// 선다. 자석을 돌리는 동안에는 수레를 붙잡고 있다고 보고 움직이지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  DAMPING,
  DECK_SIZE,
  FIXED_MAGNET_X,
  MAGNET_LENGTH,
  MAGNET_WIDTH,
  POLE_INSET,
  POLE_STRENGTH,
  TRACK_END_X,
} from './schema';
import type { MagneticPolesState } from './state';

/** 적분 걸음(초). 같은 시각은 언제나 같은 걸음 수로 풀린다. */
const INTEGRATION_DT = 1 / 1000;

export interface MagneticPolesConstants {
  magnetLength: number;
  magnetWidth: number;
  poleInset: number;
  poleStrength: number;
  damping: number;
  fixedMagnetX: number;
  deckSize: number;
  trackEndX: number;
}

export function readConstants(stage: StageDef): MagneticPolesConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    magnetLength: c.magnetLength ?? MAGNET_LENGTH,
    magnetWidth: c.magnetWidth ?? MAGNET_WIDTH,
    poleInset: c.poleInset ?? POLE_INSET,
    poleStrength: c.poleStrength ?? POLE_STRENGTH,
    damping: c.damping ?? DAMPING,
    fixedMagnetX: c.fixedMagnetX ?? FIXED_MAGNET_X,
    deckSize: c.deckSize ?? DECK_SIZE,
    trackEndX: c.trackEndX ?? TRACK_END_X,
  };
}

/** 수레가 고정 자석에 붙었을 때의 가운데 x — 판의 왼쪽 변이 고정 자석 N 끝에 닿는다. */
export function nearX(c: MagneticPolesConstants): number {
  return c.fixedMagnetX + c.magnetLength / 2 + c.deckSize / 2;
}

/** 수레가 멈춤막이에 섰을 때의 가운데 x — 판의 오른쪽 변이 선로 끝에 닿는다. */
export function farX(c: MagneticPolesConstants): number {
  return c.trackEndX - c.deckSize / 2;
}

/**
 * 수레 위 자석의 방향(rad). 자석의 +x 쪽 끝이 N 이다 — 0 이면 N 이 오른쪽(S 가 고정
 * 자석을 마주 봄), π 면 N 이 왼쪽(N 끼리 마주 봄).
 *
 * 주기를 π 에서 시작해 두 번의 돌림 단계마다 반 바퀴씩 늘 같은 쪽으로 돈다. 주기 끝은
 * 3π ≡ π 라 다음 주기와 이어진다.
 */
export function cartMagnetAngle(tl: TimelineFrame): number {
  return Math.PI * (1 + tl.at('turnAttract') + tl.at('turnRepel'));
}

/**
 * 수레 가운데가 x 에 있을 때 수레가 받는 가속도(x 성분).
 *
 * `facing` — 수레 자석의 N 이 오른쪽이면 +1(당김 배치), 왼쪽이면 −1(밂 배치).
 * 고정 자석은 N 이 오른쪽이다.
 */
export function cartAcceleration(c: MagneticPolesConstants, x: number, facing: 1 | -1): number {
  const reach = c.magnetLength / 2 - c.poleInset;
  const fixed: readonly (readonly [number, number])[] = [
    [c.fixedMagnetX - reach, -1],
    [c.fixedMagnetX + reach, 1],
  ];
  const cart: readonly (readonly [number, number])[] = [
    [x - reach, -facing],
    [x + reach, facing],
  ];
  let a = 0;
  for (const [xf, qf] of fixed) {
    for (const [xc, qc] of cart) {
      const d = xc - xf;
      a += (c.poleStrength * qf * qc * Math.sign(d)) / (d * d);
    }
  }
  return a;
}

/**
 * `from` 에 멈춰 있던 수레를 놓고 `elapsed` 초가 흐른 때의 자리. 붙음 · 멈춤막이에
 * 닿으면 그 자리에 선다.
 */
export function releasedCartX(
  c: MagneticPolesConstants,
  from: number,
  facing: 1 | -1,
  elapsed: number,
): number {
  const lo = nearX(c);
  const hi = farX(c);
  let x = from;
  let v = 0;
  const steps = Math.floor(Math.max(0, elapsed) / INTEGRATION_DT);
  for (let i = 0; i < steps; i++) {
    const a = cartAcceleration(c, x, facing) - c.damping * v;
    v += a * INTEGRATION_DT;
    x += v * INTEGRATION_DT;
    if (x <= lo) {
      x = lo;
      v = 0;
    } else if (x >= hi) {
      x = hi;
      v = 0;
    }
  }
  return x;
}

/**
 * 지금 수레 가운데 x. 돌리는 단계에서는 붙잡혀 제자리, 놓인 단계에서는 놓은 뒤 흐른
 * 시간의 함수다. 단계 경계는 시간표 선언이 정한다.
 */
export function cartX(c: MagneticPolesConstants, tl: TimelineFrame): number {
  switch (tl.phase) {
    case 'attract':
    case 'near':
      return releasedCartX(c, farX(c), 1, tl.u - tl.start('attract'));
    case 'turnRepel':
      return nearX(c);
    case 'repel':
    case 'far':
      return releasedCartX(c, nearX(c), -1, tl.u - tl.start('repel'));
    default:
      return farX(c);
  }
}

/** 상태가 시계뿐인 조각이다 — 모든 것이 시간표 시각의 함수라 항등이다. */
export function step(params: { state: MagneticPolesState }): MagneticPolesState {
  return params.state;
}
