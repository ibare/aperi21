// ========================================================================
// pinhole-camera — 순수 계산
// ========================================================================
// 빛은 촛불의 한 점에서 곧게 간다. 줄기는 그 점에서 앞벽의 한 높이로 긋는 직선이고,
// 그 높이가 구멍 폭 안이면 뒷벽까지 이어지고 아니면 앞벽에서 끝난다. 한 점의 빛이
// 뒷벽에 닿는 범위(조각)는 그 점에서 구멍 위 · 아래 가장자리를 지나는 두 직선이 뒷벽에
// 닿는 자리 사이다 — 폭은 구멍 폭 × (1 + 상거리/물체거리), 가운데는 거꾸로 선 자리.
//
// 구멍 폭은 시간표의 함수다. 캔버스도 테마 색도 모른다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  AIM_HALF,
  BASE_Y,
  BOX_HALF,
  CANDLE_HALF_WIDTH,
  CANDLE_LIGHT,
  CANDLE_TOP_Y,
  FLAME_R,
  FLAME_Y,
  HOLE_LARGE,
  HOLE_MID,
  HOLE_SMALL,
  IMAGE_LIGHT,
  LIGHT_POWER,
  OBJECT_X,
  PINHOLE_X,
  PINHOLE_Y,
  RAY_COUNT,
  WALL_X,
} from './schema';
import type { PinholeCameraState } from './state';

export interface PinholeCameraConstants {
  objectX: number;
  flameY: number;
  baseY: number;
  candleHalfWidth: number;
  candleTopY: number;
  flameR: number;
  pinholeX: number;
  pinholeY: number;
  wallX: number;
  boxHalf: number;
  holeSmall: number;
  holeMid: number;
  holeLarge: number;
  rayCount: number;
  aimHalf: number;
  imageLight: number;
  lightPower: number;
  candleLight: number;
}

export function readConstants(stage: StageDef): PinholeCameraConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    objectX: c.objectX ?? OBJECT_X,
    flameY: c.flameY ?? FLAME_Y,
    baseY: c.baseY ?? BASE_Y,
    candleHalfWidth: c.candleHalfWidth ?? CANDLE_HALF_WIDTH,
    candleTopY: c.candleTopY ?? CANDLE_TOP_Y,
    flameR: c.flameR ?? FLAME_R,
    pinholeX: c.pinholeX ?? PINHOLE_X,
    pinholeY: c.pinholeY ?? PINHOLE_Y,
    wallX: c.wallX ?? WALL_X,
    boxHalf: c.boxHalf ?? BOX_HALF,
    holeSmall: c.holeSmall ?? HOLE_SMALL,
    holeMid: c.holeMid ?? HOLE_MID,
    holeLarge: c.holeLarge ?? HOLE_LARGE,
    rayCount: c.rayCount ?? RAY_COUNT,
    aimHalf: c.aimHalf ?? AIM_HALF,
    imageLight: c.imageLight ?? IMAGE_LIGHT,
    lightPower: c.lightPower ?? LIGHT_POWER,
    candleLight: c.candleLight ?? CANDLE_LIGHT,
  };
}

/**
 * 지금 구멍 폭. 넓히는 두 단계에서 작은 → 중간 → 큰 폭으로, 좁히는 단계에서 큰 → 작은 폭으로.
 * 이징은 선언이 정한다. 단계 전 `at` 은 0, 뒤는 1 이다.
 */
export function holeWidth(c: PinholeCameraConstants, tl: TimelineFrame): number {
  return (
    c.holeSmall +
    (c.holeMid - c.holeSmall) * tl.at('widen') +
    (c.holeLarge - c.holeMid) * tl.at('widen-more') -
    (c.holeLarge - c.holeSmall) * tl.at('shrink')
  );
}

/** `from` 에서 `through` 를 지나는 직선이 세로선 x 에서 갖는 높이. */
export function heightAt(from: Vec2, through: Vec2, x: number): number {
  const dx = through[0] - from[0];
  if (dx === 0) return through[1];
  return from[1] + ((through[1] - from[1]) * (x - from[0])) / dx;
}

/** 상거리 ÷ 물체거리 — 상이 물체보다 줄어드는 몫. */
export function shrinkRatio(c: PinholeCameraConstants): number {
  return (c.wallX - c.pinholeX) / (c.pinholeX - c.objectX);
}

/** 구멍 위 · 아래 가장자리. */
export function holeEdges(c: PinholeCameraConstants, w: number): { top: Vec2; bottom: Vec2 } {
  return { top: [c.pinholeX, c.pinholeY + w / 2], bottom: [c.pinholeX, c.pinholeY - w / 2] };
}

/** 촛불의 한 점(높이 y)의 빛이 뒷벽에 닿는 조각 — 구멍 가장자리를 스친 두 직선이 뒷벽에 닿는 두 높이. */
export function wallPatch(c: PinholeCameraConstants, y: number, w: number): { lo: number; hi: number } {
  const e = holeEdges(c, w);
  const p: Vec2 = [c.objectX, y];
  const a = heightAt(p, e.top, c.wallX);
  const b = heightAt(p, e.bottom, c.wallX);
  return { lo: Math.min(a, b), hi: Math.max(a, b) };
}

/** 줄기 하나 — 점에서 나가 끝나는 자리까지. `passed` 는 구멍을 지나 뒷벽까지 갔는지. */
export interface Ray {
  from: Vec2;
  to: Vec2;
  passed: boolean;
}

/**
 * 촛불의 한 점에서 앞벽의 고른 높이들로 가는 줄기. 구멍 폭 안을 지나는 것은 뒷벽까지 가고,
 * 나머지는 앞벽 앞면(`frontX`)에서 끝난다.
 */
export function fanRays(c: PinholeCameraConstants, y: number, w: number, frontX: number): Ray[] {
  const out: Ray[] = [];
  const n = Math.max(2, Math.round(c.rayCount));
  const p: Vec2 = [c.objectX, y];
  // 줄기가 겨누는 높이가 구멍 가장자리와 정확히 겹칠 때 부동소수 오차로 갈리지 않게.
  const eps = 1e-9;
  for (let i = 0; i < n; i++) {
    const aim: Vec2 = [c.pinholeX, c.pinholeY - c.aimHalf + (2 * c.aimHalf * i) / (n - 1)];
    const passed = Math.abs(aim[1] - c.pinholeY) <= w / 2 + eps;
    const endX = passed ? c.wallX : frontX;
    out.push({ from: p, to: [endX, heightAt(p, aim, endX)], passed });
  }
  return out;
}

/** 뒷벽에 맺힌 상의 빛 세기(불꽃 기준) — 큰 구멍에서 `imageLight`, 구멍 폭 ÷ 큰 폭의 `lightPower` 제곱에 비례. */
export function imageBrightness(c: PinholeCameraConstants, w: number): number {
  return c.imageLight * Math.pow(Math.max(0, w) / c.holeLarge, c.lightPower);
}

/** 한 점의 빛이 뒷벽에서 번지는 원판의 지름 — 둥근 구멍이면 옆모습 조각의 폭과 같다. */
export function blurDiameter(c: PinholeCameraConstants, w: number): number {
  return w * (1 + shrinkRatio(c));
}

/**
 * 번짐 원판 위에 고르게 흩은 표본 자리(원판 가운데 기준). 해바라기 나선이라 결정적이다 —
 * 같은 폭은 언제나 같은 자리다.
 */
export function blurOffsets(diameter: number, samples: number): Vec2[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const n = Math.max(1, Math.round(samples));
  const out: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const r = (diameter / 2) * Math.sqrt((i + 0.5) / n);
    const th = i * golden;
    out.push([r * Math.cos(th), r * Math.sin(th)]);
  }
  return out;
}

/** 촛불 위 한 점(옆 · 높이)이 뒷벽에 맺히는 자리 — 구멍을 지나며 위아래 · 좌우가 뒤집히고 줄어든다. */
export function toImage(c: PinholeCameraConstants, lateral: number, y: number): Vec2 {
  const m = shrinkRatio(c);
  return [-lateral * m, c.pinholeY - (y - c.pinholeY) * m];
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: PinholeCameraState }): PinholeCameraState {
  return params.state;
}
