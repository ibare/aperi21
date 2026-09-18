// ========================================================================
// gears — 순수 운동학
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 시각의 함수이고, `step` 은 항등이다.
//
//   맞물림     톱니가 하나씩 함께 지나간다 → N₁·θ₁ = N₂·θ₂ (돈 톱니 수가 같다)
//   빠르기     ω₂ = ω₁ · N₁/N₂                 큰 기어가 k = N₂/N₁ 배 느리다
//   접점의 힘  두 톱니가 서로 미는 힘은 크기가 같다 (작용 · 반작용)
//   돌림힘     τ₂ = F·r₂ = k · F·r₁ = k·τ₁      같은 힘을 k 배 긴 팔로 받는다
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { MODULE, SMALL_TEETH } from './schema';
import type { GearsState } from './state';

export interface GearsConstants {
  smallTeeth: number;
  module: number;
}

export function readConstants(stage: StageDef): GearsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    smallTeeth: c.smallTeeth ?? SMALL_TEETH,
    module: c.module ?? MODULE,
  };
}

/** 피치 원 반지름 = m·N/2. 맞물리는 두 기어는 이 원이 접점에서 맞닿아 미끄럼 없이 구른다. */
export function pitchRadius(teeth: number, c: GearsConstants): number {
  return (c.module * teeth) / 2;
}

export interface Reading {
  /** 기어비 k = N₂/N₁. */
  ratio: number;
  /** 작은 기어 · 큰 기어가 돈 각(라디안, 반시계 +). 작은 기어는 시계 방향으로 돈다. */
  angleSmall: number;
  angleBig: number;
  /**
   * 이번 주기에 맞물린 자리를 지난 톱니 수. 작은 기어의 톱니 중심이 접점을 지날 때,
   * 큰 기어는 톱니 중심이 반 피치 뒤에 지나므로 둘은 하나씩 번갈아 는다.
   * `turn` 이 끝나면 둘 다 작은 기어 톱니 수(한 바퀴분)다.
   */
  passedSmall: number;
  passedBig: number;
  /** 지난 톱니 강조의 짙기 — 세는 동안 1, 힘을 보이는 동안 옅게 남고, 물러나며 0. */
  countOpacity: number;
  /** 힘 · 팔 · 돌림힘 표지의 짙기. */
  forceOpacity: number;
}

/** 힘을 보이는 동안 지난 톱니가 남는 짙기. 기록으로만 남아 화살표를 가리지 않는다. */
const COUNT_RESIDUE = 0.3;

/**
 * 시간표 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` · `duration(id)` 가 준다.
 * 작은 기어는 `turn` 단계 동안 꼭 한 바퀴 돈다. 빠르기가 그 단계 길이에서 나온다.
 */
export function derive(tl: TimelineFrame, c: GearsConstants, bigTeeth: number): Reading {
  const n1 = c.smallTeeth;
  const ratio = bigTeeth / n1;
  const omegaSmall = (2 * Math.PI) / tl.duration('turn');

  // 기어는 주기 내내 같은 빠르기로 돈다. 작은 기어 시계 방향(−), 큰 기어 반시계(+).
  const angleSmall = -omegaSmall * tl.u;
  const angleBig = (omegaSmall * tl.u) / ratio;

  // 톱니 세기 — `turn` 진행도가 곧 작은 기어가 돈 몫(0~1 바퀴)이다.
  const turned = tl.at('turn') * n1; // 지나간 피치 수
  const passedSmall = Math.min(n1, Math.floor(turned) + 1);
  const passedBig = Math.min(n1, Math.floor(turned + 0.5));

  // 힘 표지는 `appear` 동안 나타나고 `fade` 동안 물러난다. 그 사이(`force`)는 그대로다.
  const appear = tl.at('appear');
  const fade = tl.at('fade');
  const countOpacity = (1 - (1 - COUNT_RESIDUE) * appear) * (1 - fade);
  const forceOpacity = appear * (1 - fade);

  return {
    ratio,
    angleSmall,
    angleBig,
    passedSmall,
    passedBig,
    countOpacity,
    forceOpacity,
  };
}

/** 쌓는 상태가 없다 — 칩이 고른 톱니 수만 들고 있다. */
export function step(params: { state: GearsState }): GearsState {
  return params.state;
}
