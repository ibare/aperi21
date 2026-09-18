// ========================================================================
// radiometric-dating — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 곡선 · 읽기 선 · 점 · 화살표는 모두 스테이지 상수와 시간표 진행도의
// 함수다. `step` 은 항등이다.
//
// 좌표 — 가로는 지난 시간을 반감기 수로, 세로는 살아 있을 때를 1 로 둔 비율. 곡선은
// 비율 = 2^(−반감기 수). 가로를 년이 아니라 반감기 수로 두면 반감기 경계가 같은 간격에
// 서서 「거꾸로 한 번 = 반감기 하나」 가 같은 길이의 화살표로 읽힌다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  AGE_YEARS,
  HALF_LIFE_YEARS,
  HALF_LIVES,
  HOP_PHASES,
  PLOT,
  RATIO_DENOMINATOR,
  RATIO_NUMERATOR,
} from './schema';
import type { RadiometricDatingState } from './state';

export interface RadiometricDatingConstants {
  halfLifeYears: number;
  ratioNumerator: number;
  ratioDenominator: number;
  halfLives: number;
  ageYears: number;
}

/** 비율과 반감기 수가 어긋나도 되는 폭 — 분수는 정확해야 하므로 수치 오차만 허용한다. */
const RATIO_TOLERANCE = 1e-9;
/** 선언한 연대와 반감기 × 횟수가 어긋나도 되는 몫. 「약」 을 붙여 띄우므로 1 % 까지. */
const AGE_TOLERANCE = 0.01;

/**
 * 스테이지 상수를 기본값과 함께 읽는다 (원칙 2).
 *
 * 세 값이 서로 맞지 않으면 던진다 — 화면에 띄우는 비율 · 횟수 · 연대는 모두 선언값이라,
 * 어긋난 채로 그리면 곡선과 글자가 서로 다른 말을 한다.
 */
export function readConstants(stage: StageDef): RadiometricDatingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const k: RadiometricDatingConstants = {
    halfLifeYears: c.halfLifeYears ?? HALF_LIFE_YEARS,
    ratioNumerator: c.ratioNumerator ?? RATIO_NUMERATOR,
    ratioDenominator: c.ratioDenominator ?? RATIO_DENOMINATOR,
    halfLives: c.halfLives ?? HALF_LIVES,
    ageYears: c.ageYears ?? AGE_YEARS,
  };
  if (Math.abs(ratioOf(k) - Math.pow(2, -k.halfLives)) > RATIO_TOLERANCE) {
    throw new Error('radiometric-dating: 측정 비율이 2^(−halfLives) 와 같아야 한다');
  }
  const years = k.halfLives * k.halfLifeYears;
  if (Math.abs(k.ageYears - years) > years * AGE_TOLERANCE) {
    throw new Error('radiometric-dating: ageYears 가 halfLives × halfLifeYears 와 맞지 않는다');
  }
  if (Math.ceil(k.halfLives) !== HOP_PHASES.length) {
    throw new Error('radiometric-dating: 되짚는 단계 수가 반감기 수의 올림과 같아야 한다 (장부 G13)');
  }
  if (k.halfLives >= PLOT.endHalfLives) {
    throw new Error('radiometric-dating: 읽는 자리가 가로축 끝을 넘는다');
  }
  return k;
}

/** 측정한 비율(살아 있을 때 = 1). */
export function ratioOf(k: RadiometricDatingConstants): number {
  return k.ratioNumerator / k.ratioDenominator;
}

/** 반감기 `n` 번 뒤 남은 비율. */
export function remaining(n: number): number {
  return Math.pow(2, -n);
}

/** (반감기 수, 비율) → 월드. */
export function plotPoint(halfLives: number, ratio: number): Vec2 {
  return [halfLives * PLOT.perHalfLife, ratio * PLOT.perRatio];
}

/** 곡선 위의 점. */
export function curvePoint(halfLives: number): Vec2 {
  return plotPoint(halfLives, remaining(halfLives));
}

/**
 * 거꾸로 되짚는 한 걸음의 양 끝(반감기 수). 읽은 자리에서 반감기 하나씩 0 쪽으로 —
 * 마지막 걸음은 반감기 수가 정수가 아니면 짧다.
 */
export function hopRange(k: RadiometricDatingConstants, index: number): readonly [number, number] {
  const from = k.halfLives - index;
  return [from, Math.max(0, from - 1)];
}

/** 캡션 `vars` 가 가리킬 문자열 — 선언값을 그대로 쓴다 (장부 G133). */
export function captionOf(k: RadiometricDatingConstants): RadiometricDatingState['caption'] {
  return {
    num: String(k.ratioNumerator),
    den: String(k.ratioDenominator),
    half: String(k.halfLifeYears),
    n: String(k.halfLives),
    age: String(k.ageYears),
  };
}

export function step(params: { state: RadiometricDatingState }): RadiometricDatingState {
  return params.state;
}
