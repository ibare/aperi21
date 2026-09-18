// ========================================================================
// buoyancy — 순수 물리
// ========================================================================
// 정수압 하나뿐이다. 깊이 h 에서 물이 면을 미는 세기는 ρgh 이고, 여기서는 ρg 를 1 로 둬
// 깊이 그 자체로 센다. 상자의 아랫면 깊이를 d 라 하면
//   아랫면 = max(0, d),  윗면 = max(0, d − H),  차이 = clamp(d, 0, H)
// 이라서 차이는 잠긴 높이만 따라가고, 다 잠긴 뒤로는 d 가 얼마든 H 다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_PER_DEPTH,
  BAR_PER_DEPTH,
  BOX_HEIGHT,
  BOX_WIDTH,
  MAX_TOP_DEPTH,
  START_CLEARANCE,
} from './schema';
import type { BuoyancyState } from './state';

export interface BuoyancyConstants {
  boxWidth: number;
  boxHeight: number;
  startClearance: number;
  maxTopDepth: number;
  arrowPerDepth: number;
  barPerDepth: number;
}

export function readConstants(stage: StageDef): BuoyancyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    boxWidth: c.boxWidth ?? BOX_WIDTH,
    boxHeight: c.boxHeight ?? BOX_HEIGHT,
    startClearance: c.startClearance ?? START_CLEARANCE,
    maxTopDepth: c.maxTopDepth ?? MAX_TOP_DEPTH,
    arrowPerDepth: c.arrowPerDepth ?? ARROW_PER_DEPTH,
    barPerDepth: c.barPerDepth ?? BAR_PER_DEPTH,
  };
}

/**
 * 지금 아랫면의 깊이(m, 수면 아래가 양). **단계 경계는 선언이 정한다** — 잠겨 드는 몫과
 * 더 내려가는 몫을 각 단계의 진행도로 더할 뿐, 어느 단계인지 가르지 않는다. 단계 전에는
 * 진행도가 0, 뒤에는 1 이라 분기가 필요 없다.
 */
export function readDepth(tl: TimelineFrame, c: BuoyancyConstants): number {
  return -c.startClearance + (c.startClearance + c.boxHeight) * tl.at('enter') + c.maxTopDepth * tl.at('sink');
}

/** 깊이 h 에서 물이 미는 세기(ρg = 1). 물 밖이면 0. */
export function pressureAt(depth: number): number {
  return Math.max(0, depth);
}

export interface FaceReading {
  /** 아랫면 · 윗면의 깊이(m). 물 밖이면 음수. */
  bottomDepth: number;
  topDepth: number;
  /** 아랫면 · 윗면이 받는 세기. */
  bottom: number;
  top: number;
  /** 아랫면이 더 받는 몫 = 부력. */
  net: number;
}

export function readFaces(bottomDepth: number, c: BuoyancyConstants): FaceReading {
  const topDepth = bottomDepth - c.boxHeight;
  const bottom = pressureAt(bottomDepth);
  const top = pressureAt(topDepth);
  return { bottomDepth, topDepth, bottom, top, net: bottom - top };
}

/** 이번 주기에서 움직이는 그림의 불투명도 0~1. 첫 단계에 나타나고 마지막 단계에 흐려진다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: BuoyancyState }): BuoyancyState {
  return params.state;
}
