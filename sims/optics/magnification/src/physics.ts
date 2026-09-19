// ========================================================================
// magnification — 순수 물리
// ========================================================================
// 상의 자리 · 크기는 여기서 계산하지 않는다 — scene 이 plugin-optics `findImage` 로 얻는다.
// 여기 있는 것은 스테이지 상수 읽기와, 시간표 진행도를 물체 자리 · 배율 글자 짙기로 옮기는
// 것뿐이다. 단계 경계를 코드 상수로 가르지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  FAR_FACTOR,
  FAR_MAG,
  FOCAL_LENGTH,
  MID_FACTOR,
  MID_MAG,
  NEAR_FACTOR,
  NEAR_MAG,
  OBJECT_HEIGHT,
} from './schema';
import type { MagnificationState } from './state';

export interface MagnificationConstants {
  /** 볼록 렌즈의 초점 거리(월드). */
  focalLength: number;
  /** 물체 높이(월드). */
  objectHeight: number;
  /** 세 멈춤 자리의 물체 거리 — 초점 거리의 배수. */
  farFactor: number;
  midFactor: number;
  nearFactor: number;
  /** 세 멈춤 자리의 배율 정박값(화면 글자). */
  farMag: number;
  midMag: number;
  nearMag: number;
}

export function readConstants(stage: StageDef): MagnificationConstants {
  const c = stage.constants ?? {};
  return {
    focalLength: c.focalLength ?? FOCAL_LENGTH,
    objectHeight: c.objectHeight ?? OBJECT_HEIGHT,
    farFactor: c.farFactor ?? FAR_FACTOR,
    midFactor: c.midFactor ?? MID_FACTOR,
    nearFactor: c.nearFactor ?? NEAR_FACTOR,
    farMag: c.farMag ?? FAR_MAG,
    midMag: c.midMag ?? MID_MAG,
    nearMag: c.nearMag ?? NEAR_MAG,
  };
}

/**
 * 물체가 렌즈에서 떨어진 거리(월드). 먼 자리에서 출발해 `move-12` 동안 가운데로, `move-23`
 * 동안 가까운 자리로, `return` 동안 다시 먼 자리로 간다. 세 진행도의 합이라 분기가 없다.
 */
export function objectDistance(tl: TimelineFrame, c: MagnificationConstants): number {
  const factor =
    c.farFactor +
    (c.midFactor - c.farFactor) * tl.at('move-12') +
    (c.nearFactor - c.midFactor) * tl.at('move-23') +
    (c.farFactor - c.nearFactor) * tl.at('return');
  return factor * c.focalLength;
}

/**
 * 세 멈춤 자리의 배율 글자 짙기 — `show-*` 에서 나타나 `hide-*` 에서 사라진다. 물체가 움직이는
 * 동안(`move-*` · `return`)은 모두 0 이다.
 */
export function magLabelOpacity(tl: TimelineFrame): { far: number; mid: number; near: number } {
  return {
    far: tl.at('show-1') * (1 - tl.at('hide-1')),
    mid: tl.at('show-2') * (1 - tl.at('hide-2')),
    near: tl.at('show-3') * (1 - tl.at('hide-3')),
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: MagnificationState }): MagnificationState {
  return params.state;
}
