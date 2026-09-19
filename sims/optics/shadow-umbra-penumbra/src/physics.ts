// ========================================================================
// shadow-umbra-penumbra — 순수 계산
// ========================================================================
// 빛은 광원의 모든 점에서 곧게 간다. 스크린 위 한 점에서 가림판 위 · 아래 가장자리를 지나는
// 두 직선을 광원 자리(x)까지 늘이면, 그 사이의 광원 부분이 가려진 몫이다. 나머지가 그 점에서
// 보이는 광원의 몫 — 0 이면 본그림자, 0 과 1 사이면 반그림자, 1 이면 밝은 곳이다.
//
// 경계는 네 직선이다 — 광원 위 끝 → 가림판 위 가장자리(본그림자 위 끝), 광원 아래 끝 → 가림판 위
// 가장자리(반그림자 위 끝), 그리고 그 둘의 아래 대칭.
//
// 광원 폭은 시간표의 함수다. 캔버스도 테마 색도 모른다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  PLATE_HEIGHT,
  PLATE_X,
  PLATE_Y,
  SCREEN_HALF,
  SCREEN_X,
  SOURCE_LARGE,
  SOURCE_MID,
  SOURCE_SMALL,
  SOURCE_X,
  SOURCE_Y,
} from './schema';
import type { ShadowUmbraPenumbraState } from './state';

export interface ShadowUmbraPenumbraConstants {
  /** 광원 가운데 자리(월드). */
  source: Vec2;
  /** 가림판 x · 높이 · 가운데 높이. */
  plateX: number;
  plateHeight: number;
  plateY: number;
  /** 스크린 앞면 x · 반높이. */
  screenX: number;
  screenHalf: number;
  /** 광원 폭의 세 정박값. */
  sourceSmall: number;
  sourceMid: number;
  sourceLarge: number;
}

export function readConstants(stage: StageDef): ShadowUmbraPenumbraConstants {
  const c = stage.constants ?? {};
  return {
    source: [c.sourceX ?? SOURCE_X, c.sourceY ?? SOURCE_Y],
    plateX: c.plateX ?? PLATE_X,
    plateHeight: c.plateHeight ?? PLATE_HEIGHT,
    plateY: c.plateY ?? PLATE_Y,
    screenX: c.screenX ?? SCREEN_X,
    screenHalf: c.screenHalf ?? SCREEN_HALF,
    sourceSmall: c.sourceSmall ?? SOURCE_SMALL,
    sourceMid: c.sourceMid ?? SOURCE_MID,
    sourceLarge: c.sourceLarge ?? SOURCE_LARGE,
  };
}

/**
 * 지금 광원 폭. 키우는 두 단계에서 작다 → 중간 → 크다, 되돌리는 단계에서 크다 → 작다.
 * 단계의 이징은 선언이 정한다. 단계 전 `at` 은 0, 뒤는 1 이다.
 */
export function sourceWidth(c: ShadowUmbraPenumbraConstants, tl: TimelineFrame): number {
  return (
    c.sourceSmall +
    (c.sourceMid - c.sourceSmall) * tl.at('grow-mid') +
    (c.sourceLarge - c.sourceMid) * tl.at('grow-large') -
    (c.sourceLarge - c.sourceSmall) * tl.at('shrink')
  );
}

/** 두 점을 지나는 직선이 세로선 x 에서 갖는 높이. */
export function heightAt(a: Vec2, b: Vec2, x: number): number {
  const dx = b[0] - a[0];
  if (dx === 0) return b[1];
  return a[1] + ((b[1] - a[1]) * (x - a[0])) / dx;
}

/** 광원 위 · 아래 끝과 가림판 위 · 아래 가장자리. */
export function ends(
  c: ShadowUmbraPenumbraConstants,
  width: number,
): { srcTop: Vec2; srcBottom: Vec2; plateTop: Vec2; plateBottom: Vec2 } {
  const a = width / 2;
  const h = c.plateHeight / 2;
  return {
    srcTop: [c.source[0], c.source[1] + a],
    srcBottom: [c.source[0], c.source[1] - a],
    plateTop: [c.plateX, c.plateY + h],
    plateBottom: [c.plateX, c.plateY - h],
  };
}

/**
 * 네 선이 스크린에 닿는 높이.
 * `umbraTop` · `umbraBottom` — 광원 같은 쪽 끝 → 같은 쪽 가장자리(본그림자 경계).
 * `outerTop` · `outerBottom` — 광원 반대쪽 끝 → 가장자리(반그림자 바깥 경계). 이 둘은 가림판 앞에서 엇갈린다.
 */
export function bands(
  c: ShadowUmbraPenumbraConstants,
  width: number,
): { umbraTop: number; umbraBottom: number; outerTop: number; outerBottom: number } {
  const e = ends(c, width);
  return {
    umbraTop: heightAt(e.srcTop, e.plateTop, c.screenX),
    umbraBottom: heightAt(e.srcBottom, e.plateBottom, c.screenX),
    outerTop: heightAt(e.srcBottom, e.plateTop, c.screenX),
    outerBottom: heightAt(e.srcTop, e.plateBottom, c.screenX),
  };
}

/**
 * 점 `p`(가림판 뒤)에서 보이는 광원의 몫 0~1. 가림판 두 가장자리를 지나는 직선을 광원 x 까지 늘여
 * 그 사이에 든 광원 부분을 뺀다.
 */
export function visibleFraction(c: ShadowUmbraPenumbraConstants, width: number, p: Vec2): number {
  const e = ends(c, width);
  const x = c.source[0];
  const hiA = heightAt(p, e.plateTop, x);
  const loA = heightAt(p, e.plateBottom, x);
  // 폭 없는 광원(점광원)은 가려졌거나 다 보이거나 둘 중 하나다.
  if (width <= 0) return c.source[1] >= loA && c.source[1] <= hiA ? 0 : 1;
  const hi = Math.min(e.srcTop[1], hiA);
  const lo = Math.max(e.srcBottom[1], loA);
  const blocked = Math.max(0, hi - lo);
  return Math.min(1, Math.max(0, 1 - blocked / width));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ShadowUmbraPenumbraState }): ShadowUmbraPenumbraState {
  return params.state;
}
