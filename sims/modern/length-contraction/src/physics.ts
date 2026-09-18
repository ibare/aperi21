// ========================================================================
// length-contraction — 순수 물리
// ========================================================================
// 정지한 틀에서 잰다. t 는 지나가는 상자가 가운데(x = 0)에 선 순간부터 흐른
// 시각이고, 그 순간 정지 틀이 상자 두 끝의 자리를 함께 찍는다.
//
//   지나가는 상자의 중심      x(t) = 화면 빠르기 · t
//   정지 틀에서 잰 길이        L = L₀ / γ          γ = 1 / √(1 − β²)
//   진행 방향에 수직인 높이    h = h₀              (줄지 않는다)
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BETA,
  BOX_HEIGHT,
  MARK_RADIUS,
  PROPER_LENGTH,
  RATIO_DEN,
  RATIO_NUM,
  SCREEN_SPEED,
} from './schema';
import type { LengthContractionState } from './state';

export interface LengthContractionConstants {
  /** v/c. */
  beta: number;
  /** 화면에 띄울 줄어든 비의 분자 · 분모(선언값). */
  ratioNum: number;
  ratioDen: number;
  /** 제 길이 L₀ (월드). */
  properLength: number;
  /** 높이(월드). */
  boxHeight: number;
  /** 옆면 원의 반지름(월드). */
  markRadius: number;
  /** 화면에서 움직이는 빠르기(월드/초) — 연출 배율. */
  screenSpeed: number;
}

export function readConstants(stage: StageDef): LengthContractionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    beta: c.beta ?? BETA,
    ratioNum: c.ratioNum ?? RATIO_NUM,
    ratioDen: c.ratioDen ?? RATIO_DEN,
    properLength: c.properLength ?? PROPER_LENGTH,
    boxHeight: c.boxHeight ?? BOX_HEIGHT,
    markRadius: c.markRadius ?? MARK_RADIUS,
    screenSpeed: c.screenSpeed ?? SCREEN_SPEED,
  };
}

/** 로런츠 인자. 화면에 띄우지 않는다 — 띄우는 비는 문안의 선언값이다. */
export function lorentzGamma(beta: number): number {
  return 1 / Math.sqrt(1 - beta * beta);
}

/** 한 시각의 지나가는 상자와 찍힌 기록. */
export interface PassFrame {
  /** 가운데에 선 순간부터 흐른 정지 틀 시각(초). 그 전은 음수. */
  t: number;
  /** 지나가는 상자 중심(월드 x). */
  x: number;
  /** 정지 틀에서 잰 지나가는 상자의 길이 = L₀/γ. */
  length: number;
  /** 옆면 타원의 가로 반지름 = r/γ. 세로 반지름은 r 그대로다. */
  markRx: number;
  /** 찍힌 기록이 있는가(가운데를 지난 뒤). */
  snapped: boolean;
  /** 찍은 뒤 흐른 시간(초) — 섬광의 나이. */
  snapAge: number;
  gamma: number;
}

export function passFrame(tl: TimelineFrame, c: LengthContractionConstants): PassFrame {
  const gamma = lorentzGamma(c.beta);
  const t = tl.u - tl.start('snap');
  return {
    t,
    x: c.screenSpeed * t,
    length: c.properLength / gamma,
    markRx: c.markRadius / gamma,
    snapped: t >= 0,
    snapAge: Math.max(0, t),
    gamma,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LengthContractionState }): LengthContractionState {
  return params.state;
}
