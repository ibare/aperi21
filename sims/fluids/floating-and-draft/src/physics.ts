// ========================================================================
// floating-and-draft — 순수 물리
// ========================================================================
// 뜬 물체가 멈추는 자리는 「밀어낸 물의 무게 = 제 무게」 하나로 정해진다. 폭과 g 를 1 로 두면
//   무게 = ρ물체 · H,  떠받치는 힘 = ρ물 · s   (s = 잠긴 깊이)
// 이라서 멈추는 깊이는 s* = H · ρ물체 / ρ물 — 잠기는 몫이 곧 두 밀도의 비다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BLOCK_HEIGHT,
  BLOCK_WIDTH,
  FORCE_SCALE,
  RHO_CORK,
  RHO_ICE,
  RHO_SALT,
  RHO_WATER,
  RHO_WOOD,
  DENSITY_DIGITS,
} from './schema';
import type { FloatingAndDraftState } from './state';

export interface FloatingAndDraftConstants {
  rhoCork: number;
  rhoWood: number;
  rhoIce: number;
  rhoWater: number;
  rhoSalt: number;
  blockWidth: number;
  blockHeight: number;
  forceScale: number;
  /** 밀도 이름표의 소수 자릿수. */
  densityDigits: number;
}

export function readConstants(stage: StageDef): FloatingAndDraftConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    rhoCork: c.rhoCork ?? RHO_CORK,
    rhoWood: c.rhoWood ?? RHO_WOOD,
    rhoIce: c.rhoIce ?? RHO_ICE,
    rhoWater: c.rhoWater ?? RHO_WATER,
    rhoSalt: c.rhoSalt ?? RHO_SALT,
    blockWidth: c.blockWidth ?? BLOCK_WIDTH,
    blockHeight: c.blockHeight ?? BLOCK_HEIGHT,
    forceScale: c.forceScale ?? FORCE_SCALE,
    densityDigits: c.densityDigits ?? DENSITY_DIGITS,
  };
}

/**
 * 지금 물의 밀도. **단계 경계는 선언이 정한다** — `salt` 단계의 진행도만큼 소금물 쪽으로 옮겨 갈 뿐,
 * 어느 단계인지 가르지 않는다. 그 단계 전에는 0, 뒤에는 1 이다.
 */
export function readFluidDensity(tl: TimelineFrame, c: FloatingAndDraftConstants): number {
  return c.rhoWater + (c.rhoSalt - c.rhoWater) * tl.at('salt');
}

/** 이 밀도의 물체가 이 물에서 멈추는 잠긴 깊이(m). 물보다 무거우면 통째로 잠긴 높이에서 자른다. */
export function equilibriumDraft(rhoBody: number, rhoFluid: number, c: FloatingAndDraftConstants): number {
  return Math.min(c.blockHeight, (c.blockHeight * rhoBody) / rhoFluid);
}

export interface DraftReading {
  /** 지금 잠긴 깊이(m). 0 이면 수면에 올려 둔 채. */
  draft: number;
  /** 무게 · 밀어낸 물의 무게(폭 · g = 1). */
  weight: number;
  lift: number;
}

/**
 * 지금 잠긴 깊이와 두 힘. 놓인 상자는 `settle` 진행도만큼 멈출 자리로 잠겨 들고, 그 뒤로는 물 밀도가
 * 바뀌는 대로 멈출 자리를 따라간다. 둘을 진행도의 곱 하나로 쓴다 — `settle` 이 끝나기 전에는 물이
 * 아직 진해지지 않으므로 분기가 필요 없다.
 */
export function readDraft(rhoBody: number, tl: TimelineFrame, c: FloatingAndDraftConstants): DraftReading {
  const rhoFluid = readFluidDensity(tl, c);
  const draft = tl.at('settle') * equilibriumDraft(rhoBody, rhoFluid, c);
  return { draft, weight: rhoBody * c.blockHeight, lift: rhoFluid * draft };
}

/** 이번 주기에서 움직이는 그림의 불투명도 0~1. 첫 단계에 나타나고 마지막 단계에 흐려진다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: FloatingAndDraftState }): FloatingAndDraftState {
  return params.state;
}
