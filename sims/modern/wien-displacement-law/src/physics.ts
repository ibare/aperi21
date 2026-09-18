// ========================================================================
// wien-displacement-law — 순수 계산
// ========================================================================
// 흑체 복사(플랑크) 곡선을 **봉우리 높이를 1 로 맞춰** 센다.
//
//   B(λ) ∝ 1 / (λ⁵ (e^{hc/λkT} − 1))
//
// 봉우리 파장 λ_max = b/T 를 쓰면 hc/(λkT) = x_w · λ_max/λ 이고(x_w 는 봉우리 조건
// x = 5(1 − e^−x) 의 해), 봉우리로 나눈 모양은 λ/λ_max 하나의 함수가 된다 —
//
//   B(λ)/B(λ_max) = (λ_max/λ)⁵ · (e^{x_w} − 1) / (e^{x_w · λ_max/λ} − 1)
//
// 그래서 온도가 두 배면 곡선 **전체가** 가로로 절반이 된다. 빈 상수 b 하나만 선언하면
// 곡선과 막대가 같은 수에서 나온다.
//
// DOM · 캔버스 · 테마 색을 모른다. 모든 것이 시각의 함수다 — 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { T_FIRST, T_SECOND, T_THIRD, WIEN_B_NM_K } from './schema';
import type { WienDisplacementLawState } from './state';

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface WienConstants {
  /** 세 온도(K). 둘째 · 셋째가 앞 온도의 두 배라야 막대 둘이 앞 막대 하나에 닿는다. */
  tFirst: number;
  tSecond: number;
  tThird: number;
  /** 빈 상수 b(nm · K). */
  wienB: number;
}

export function readConstants(stage: StageDef): WienConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tFirst: c.tFirst ?? T_FIRST,
    tSecond: c.tSecond ?? T_SECOND,
    tThird: c.tThird ?? T_THIRD,
    wienB: c.wienB ?? WIEN_B_NM_K,
  };
}

// ------------------------------------------------------------------------
// 복사 곡선
// ------------------------------------------------------------------------

/** 파장 단위 플랑크 식의 봉우리 조건 x = 5(1 − e^−x) 의 해 — 수학 상수다. */
const WIEN_X = 4.965114231744276;

/** 봉우리 파장(nm) = b / T. */
export function peakNm(T: number, c: WienConstants): number {
  return c.wienB / T;
}

/** 봉우리를 1 로 맞춘 복사 세기. */
export function relativeIntensity(nm: number, T: number, c: WienConstants): number {
  if (nm <= 0) return 0;
  const r = peakNm(T, c) / nm;
  const x = WIEN_X * r;
  // 아주 짧은 파장에서 e^x 가 넘친다 — 그 자리의 세기는 0 이다.
  if (x > 700) return 0;
  return (Math.pow(r, 5) * (Math.exp(WIEN_X) - 1)) / (Math.exp(x) - 1);
}

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/**
 * 지금 온도(K). **단계 경계는 선언이 정한다** — 단계 id 로 가르지 않고 두 오름 단계의
 * 진행도(`at`)를 로그 온도에 쌓는다. 두 배는 곱으로 한 걸음이라 로그로 옮겨야 봉우리가
 * 고르게 움직인다. 머무는 단계에서는 앞 단계 `at` 이 1, 뒤가 0 이라 분기가 없다.
 */
export function temperatureAt(tl: TimelineFrame, c: WienConstants): number {
  return c.tFirst * Math.pow(c.tSecond / c.tFirst, tl.at('heat1')) * Math.pow(c.tThird / c.tSecond, tl.at('heat2'));
}

/** 그림 전체의 짙기 — 지움 단계에서 옅어져 처음으로 돌아간다. */
export function drawingOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('clear');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: WienDisplacementLawState }): WienDisplacementLawState {
  return params.state;
}
