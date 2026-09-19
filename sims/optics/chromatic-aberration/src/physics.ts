// ========================================================================
// chromatic-aberration — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고 `step` 은 항등이다.
//
// 얇은 렌즈의 초점 거리는 렌즈 제작자 식에서 1/f = (n − 1)(1/R₁ − 1/R₂) 이라, 같은 렌즈
// 모양이면 f ∝ 1/(n − 1) 이다. 기준 색(초록)의 초점 거리에서 다른 색의 초점 거리를
// 굴절률 비로 얻고, 화면에는 초록 초점에서 벗어난 몫을 `focusGain` 배 키운 자리를 쓴다.
//
// 줄기는 얇은 렌즈의 근축 그림이다 — 높이 h 로 들어온 줄기가 렌즈에서 꺾여 그 색의
// 초점(f, 0)을 지난다. 높이마다 모이는 자리가 다른 것(구면 수차)은 `spherical-aberration`
// 의 몫이라 여기서는 일부러 없앤다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BEAM_HALF,
  FOCAL_GREEN,
  FOCUS_GAIN,
  FACE_SCALE,
  N_BLUE,
  N_GREEN,
  N_RED,
  NM_BLUE,
  NM_GREEN,
  NM_RED,
  RAY_END_X,
  RAY_PAIRS,
  RAY_START_X,
} from './schema';
import type { ChromaticAberrationState } from './state';

export interface ChromaticAberrationConstants {
  nmBlue: number;
  nBlue: number;
  nmGreen: number;
  nGreen: number;
  nmRed: number;
  nRed: number;
  /** 기준 색(초록)의 초점 거리(월드). */
  focalGreen: number;
  /** 초록 초점에서 벗어난 몫의 과장 배율. */
  focusGain: number;
  /** 정면 원판 반지름 = 옆모습 퍼진 높이 × 이 배율 (표시 배율, 화면에 알리지 않음 — NOTES (b)). */
  faceScale: number;
  /** 흰 줄기 다발의 반높이(월드). */
  beamHalf: number;
  /** 축 한쪽의 흰 줄기 수. */
  rayPairs: number;
}

export function readConstants(stage?: StageDef): ChromaticAberrationConstants {
  const c = (stage?.constants ?? {}) as Record<string, number | undefined>;
  return {
    nmBlue: c.nmBlue ?? NM_BLUE,
    nBlue: c.nBlue ?? N_BLUE,
    nmGreen: c.nmGreen ?? NM_GREEN,
    nGreen: c.nGreen ?? N_GREEN,
    nmRed: c.nmRed ?? NM_RED,
    nRed: c.nRed ?? N_RED,
    focalGreen: c.focalGreen ?? FOCAL_GREEN,
    focusGain: c.focusGain ?? FOCUS_GAIN,
    faceScale: c.faceScale ?? FACE_SCALE,
    beamHalf: c.beamHalf ?? BEAM_HALF,
    rayPairs: c.rayPairs ?? RAY_PAIRS,
  };
}

/** 한 색 — 파장(빛 색을 얻는 데)과 화면 위 초점 거리. */
export interface ColourFocus {
  id: 'blue' | 'green' | 'red';
  nm: number;
  /** 화면에 긋는 초점 거리(월드) — 과장 배율이 들어가 있다. */
  focal: number;
}

/**
 * 굴절률 n 인 색의 화면 초점 거리. 참 초점 거리는 f초록 · (n초록 − 1)/(n − 1) 이고,
 * 초록 초점에서 벗어난 몫을 `focusGain` 배 키운다. 초록은 그대로다.
 */
export function shownFocal(c: ChromaticAberrationConstants, n: number): number {
  const real = (c.focalGreen * (c.nGreen - 1)) / (n - 1);
  return c.focalGreen + c.focusGain * (real - c.focalGreen);
}

/** 세 색의 초점 — 파랑이 가장 가깝고 빨강이 가장 멀다(굴절률 표를 따른다). */
export function colourFoci(c: ChromaticAberrationConstants): ColourFocus[] {
  return [
    { id: 'blue', nm: c.nmBlue, focal: shownFocal(c, c.nBlue) },
    { id: 'green', nm: c.nmGreen, focal: shownFocal(c, c.nGreen) },
    { id: 'red', nm: c.nmRed, focal: shownFocal(c, c.nRed) },
  ];
}

/** 흰 줄기 높이(축 위, 양수) — 다발 반높이를 줄 수만큼 고르게. 축 아래는 부호만 바꾼다. */
export function rayHeights(c: ChromaticAberrationConstants): number[] {
  const n = Math.max(1, Math.round(c.rayPairs));
  return Array.from({ length: n }, (_, i) => (c.beamHalf * (i + 1)) / n);
}

/** 렌즈(x = 0)에서 높이 h 로 나와 초점 f 를 지나는 줄기의 x 에서의 높이. */
export function heightAt(h: number, focal: number, x: number): number {
  return h * (1 - x / focal);
}

export interface Reading {
  /** 흰 줄기 앞머리의 x — `enter` 동안 출발점에서 렌즈까지. */
  whiteFront: number;
  /** 색 줄기 앞머리의 x — `split` 동안 렌즈에서 줄 끝까지. */
  colourFront: number;
  /** 전체 짙기 — 주기 끝(`fade`)에 옅어진다. */
  visible: number;
  /** 초점 점 · 이름표의 짙기. */
  mark: number;
  /** 스크린 · 정면 칸의 짙기. 스크린 뒤 줄기는 (1 − 이 값)만큼 남는다. */
  screen: number;
  /** 스크린의 x — 파랑 초점에서 `slide` 동안 빨강 초점으로. */
  screenX: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 가 그 단계 앞에서 0, 지난 뒤 1 이다.
 */
export function derive(tl: TimelineFrame, c: ChromaticAberrationConstants): Reading {
  const blue = shownFocal(c, c.nBlue);
  const red = shownFocal(c, c.nRed);
  const visible = 1 - tl.at('fade');
  return {
    whiteFront: RAY_START_X + (0 - RAY_START_X) * tl.at('enter'),
    colourFront: RAY_END_X * tl.at('split'),
    visible,
    mark: tl.at('mark') * visible,
    screen: tl.at('screen-in') * visible,
    screenX: blue + (red - blue) * tl.at('slide'),
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ChromaticAberrationState }): ChromaticAberrationState {
  return params.state;
}
