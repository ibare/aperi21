// ========================================================================
// focal-length — 순수 물리
// ========================================================================
// 상의 자리 · 크기는 여기서 계산하지 않는다 — scene 이 plugin-optics `findImage` 로 얻는다.
// 여기 있는 것은 스테이지 상수 읽기와, 시간표 진행도를 **지금 초점 거리**와 초점 거리 글자의
// 짙기로 옮기는 것뿐이다. 단계 경계를 코드 상수로 가르지 않는다 (S-piece).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { FOCAL_LONG, FOCAL_SHORT, OBJECT_DISTANCE, OBJECT_HEIGHT } from './schema';
import type { FocalLengthState } from './state';

export interface FocalLengthConstants {
  /** 긴 · 짧은 초점 거리 정박값(cm). 화면 글자가 이 값을 그대로 쓴다. */
  focalLong: number;
  focalShort: number;
  /** 물체가 렌즈에서 떨어진 거리(cm). 한 주기 내내 바뀌지 않는다. */
  objectDistance: number;
  /** 물체 높이(cm). */
  objectHeight: number;
}

/** 주장이 기대는 물리량은 `stages[].constants` 에 선언하고 여기서 기본값과 함께 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): FocalLengthConstants {
  const c = stage.constants ?? {};
  return {
    focalLong: c.focalLong ?? FOCAL_LONG,
    focalShort: c.focalShort ?? FOCAL_SHORT,
    objectDistance: c.objectDistance ?? OBJECT_DISTANCE,
    objectHeight: c.objectHeight ?? OBJECT_HEIGHT,
  };
}

/**
 * 지금 초점 거리(cm). 긴 값에서 출발해 `shorten` 동안 짧은 값으로, `lengthen` 동안 다시 긴
 * 값으로 간다. 두 진행도의 합이라 분기가 없고, 단계가 언제 시작하고 끝나는지는 선언이 안다.
 */
export function focalLength(tl: TimelineFrame, c: FocalLengthConstants): number {
  return (
    c.focalLong +
    (c.focalShort - c.focalLong) * tl.at('shorten') +
    (c.focalLong - c.focalShort) * tl.at('lengthen')
  );
}

/**
 * 두 멈춤 자리의 초점 거리 글자 짙기 — `show-*` 에서 나타나 `hide-*` 에서 사라진다. 값이
 * 움직이는 동안(`shorten` · `lengthen`)은 둘 다 0 이다. 중간값을 계산해 띄우지 않는다.
 */
export function valueLabelOpacity(tl: TimelineFrame): { long: number; short: number } {
  return {
    long: tl.at('show-long') * (1 - tl.at('hide-long')),
    short: tl.at('show-short') * (1 - tl.at('hide-short')),
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: FocalLengthState }): FocalLengthState {
  return params.state;
}
