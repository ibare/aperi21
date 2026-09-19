// ========================================================================
// rectilinear-propagation — 순수 계산
// ========================================================================
// 빛은 광원에서 곧게 간다. 줄기는 광원에서 스크린의 한 점으로 긋는 직선이고, 그 직선이
// 가림판의 x 에서 가림판 높이 안을 지나면 거기서 끝난다. 그림자의 위 · 아래 끝은 광원에서
// 가림판 위 · 아래 가장자리를 지나는 직선을 스크린 x 까지 늘인 자리다.
//
// 가림판 자리는 시간표의 함수다 — 옮기는 단계에서 스크린 쪽 ↔ 광원 쪽을 오간다.
// 캔버스도 테마 색도 모른다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  PLATE_FAR_X,
  PLATE_HEIGHT,
  PLATE_NEAR_X,
  PLATE_Y,
  RATIO_FAR,
  RATIO_NEAR,
  RAY_COUNT,
  SCREEN_HALF,
  SCREEN_X,
  SOURCE_X,
  SOURCE_Y,
} from './schema';
import type { RectilinearPropagationState } from './state';

export interface RectilinearPropagationConstants {
  /** 점광원 자리(월드). */
  source: Vec2;
  /** 스크린 앞면 x · 반높이. */
  screenX: number;
  screenHalf: number;
  /** 가림판 높이 · 가운데 높이. */
  plateHeight: number;
  plateY: number;
  /** 가림판의 두 자리(x). */
  plateFarX: number;
  plateNearX: number;
  /** 두 자리에서 그림자 높이 ÷ 가림판 높이 — 화면에 띄우는 정박값. */
  ratioFar: number;
  ratioNear: number;
  /** 고르게 내보내는 줄기 수. */
  rayCount: number;
}

export function readConstants(stage: StageDef): RectilinearPropagationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    source: [c.sourceX ?? SOURCE_X, c.sourceY ?? SOURCE_Y],
    screenX: c.screenX ?? SCREEN_X,
    screenHalf: c.screenHalf ?? SCREEN_HALF,
    plateHeight: c.plateHeight ?? PLATE_HEIGHT,
    plateY: c.plateY ?? PLATE_Y,
    plateFarX: c.plateFarX ?? PLATE_FAR_X,
    plateNearX: c.plateNearX ?? PLATE_NEAR_X,
    ratioFar: c.ratioFar ?? RATIO_FAR,
    ratioNear: c.ratioNear ?? RATIO_NEAR,
    rayCount: c.rayCount ?? RAY_COUNT,
  };
}

/**
 * 가림판이 광원 쪽으로 간 정도 0~1. 옮기는 단계에서 0 → 1, 되돌리는 단계에서 1 → 0.
 * 두 단계의 이징은 선언이 정한다. 단계 전 `at` 은 0, 뒤는 1 이다.
 */
export function towardSource(tl: TimelineFrame): number {
  return tl.at('move-in') - tl.at('move-out');
}

/** 지금 가림판 x. */
export function plateX(c: RectilinearPropagationConstants, toward: number): number {
  return c.plateFarX + (c.plateNearX - c.plateFarX) * toward;
}

/** 광원에서 `through` 를 지나는 직선이 세로선 x 에서 갖는 높이. */
export function heightAt(source: Vec2, through: Vec2, x: number): number {
  const dx = through[0] - source[0];
  if (dx === 0) return through[1];
  return source[1] + ((through[1] - source[1]) * (x - source[0])) / dx;
}

/** 가림판 위 · 아래 가장자리. */
export function plateEdges(c: RectilinearPropagationConstants, px: number): { top: Vec2; bottom: Vec2 } {
  const h = c.plateHeight / 2;
  return { top: [px, c.plateY + h], bottom: [px, c.plateY - h] };
}

/** 그림자의 위 · 아래 끝 높이 — 가장자리를 스친 두 직선이 스크린에 닿는 자리. */
export function shadowEnds(c: RectilinearPropagationConstants, px: number): { top: number; bottom: number } {
  const e = plateEdges(c, px);
  return { top: heightAt(c.source, e.top, c.screenX), bottom: heightAt(c.source, e.bottom, c.screenX) };
}

/** 줄기 하나 — 광원에서 나가 끝나는 자리까지. `blocked` 는 가림판에 걸려 끝났는지. */
export interface Ray {
  from: Vec2;
  to: Vec2;
  blocked: boolean;
}

/**
 * 광원에서 스크린 위 고른 점들로 가는 줄기. 가림판 높이 안을 지나는 것은 가림판 앞면에서 끝난다.
 * 가장자리를 스치는 두 선은 여기 넣지 않는다 — scene 이 따로 긋는다.
 */
export function fanRays(c: RectilinearPropagationConstants, px: number, plateThick: number): Ray[] {
  const out: Ray[] = [];
  const n = Math.max(2, Math.round(c.rayCount));
  const h = c.plateHeight / 2;
  const front = px - plateThick / 2;
  for (let i = 0; i < n; i++) {
    const y = -c.screenHalf + (2 * c.screenHalf * i) / (n - 1);
    const target: Vec2 = [c.screenX, y];
    const atPlate = heightAt(c.source, target, front);
    const blocked = Math.abs(atPlate - c.plateY) <= h;
    out.push({ from: c.source, to: blocked ? [front, atPlate] : target, blocked });
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: RectilinearPropagationState }): RectilinearPropagationState {
  return params.state;
}
