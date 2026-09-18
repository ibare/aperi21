// ========================================================================
// stellar-luminosity — 순수 계산
// ========================================================================
// 받은 밝기 b = L / 4πd² 와 그 거꾸로 L = b · 4πd². DOM · 캔버스 · 테마 색을 모른다.
//
// 화면에서 공(반지름 d)은 원판으로 그린다 — 원판 넓이 πd² 가 공 겉넓이 4πd² 와 같은 비로
// 커지므로, **넓이 × 빛 세기** 가 곧 그 별이 내는 빛의 양이다. 되모으는 동안 이 곱을 지킨다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { D_FAR, D_NEAR, L_FAR, L_NEAR, RECEIVED, WORLD_PER_LY } from './schema';
import type { StellarLuminosityState } from './state';

export interface StellarLuminosityConstants {
  /** 두 별까지의 거리(광년). */
  dNear: number;
  dFar: number;
  /** 두 별의 광도(L☉). */
  lNear: number;
  lFar: number;
  /** 가까운 별에서 지구에 닿는 빛의 세기(빛 채널 값). */
  received: number;
}

export function readConstants(stage: StageDef): StellarLuminosityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    dNear: c.dNear ?? D_NEAR,
    dFar: c.dFar ?? D_FAR,
    lNear: c.lNear ?? L_NEAR,
    lFar: c.lFar ?? L_FAR,
    received: c.received ?? RECEIVED,
  };
}

/** 한 별의 그림 값. */
export interface StarFigure {
  /** 지구까지의 거리(광년) · 광도(L☉) — 선언값 그대로. */
  d: number;
  l: number;
  /** 공의 반지름(월드) = 거리. */
  sphereR: number;
  /**
   * 지구에 닿는 빛의 세기(빛 채널 값). 가까운 별을 `received` 로 두고 L / d² 비로 옮긴다 —
   * 두 별의 상수가 L ∝ d² 를 지키면 같은 값이 되고, 저작자가 깨면 하늘에서도 달라 보인다.
   */
  received: number;
  /** 공의 빛을 세기 1 로 되모은 원판의 반지름(월드). 넓이 × 세기를 지킨다: πR²·b = πr²·1. */
  gatheredR: number;
}

export function starFigures(c: StellarLuminosityConstants): { near: StarFigure; far: StarFigure } {
  const fig = (d: number, l: number): StarFigure => {
    const received = c.received * (l / c.lNear) / ((d / c.dNear) * (d / c.dNear));
    const sphereR = d * WORLD_PER_LY;
    return { d, l, sphereR, received, gatheredR: sphereR * Math.sqrt(Math.min(1, received)) };
  };
  return { near: fig(c.dNear, c.lNear), far: fig(c.dFar, c.lFar) };
}

/**
 * 되모으는 중의 원판 — 반지름을 공에서 모은 크기로 줄이고, 그만큼 세기를 올린다(넓이 × 세기 보존).
 * `g` 는 되모으기 진행도 0~1.
 */
export function gatheringDisc(s: StarFigure, g: number): { r: number; light: number } {
  const r = s.sphereR + (s.gatheredR - s.sphereR) * g;
  const light = Math.min(1, (s.received * s.sphereR * s.sphereR) / (r * r));
  return { r, light };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StellarLuminosityState }): StellarLuminosityState {
  return params.state;
}
