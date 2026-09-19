// ========================================================================
// resolving-power — 물리 (순수 함수)
// ========================================================================
// 각은 μrad 다. 파장 λ(nm) 를 지름 D(mm) 로 나눈 값이 곧 μrad 라서 단위 바꿈이 없다.
//
// 원형 구멍을 지난 점 하나의 무늬(에어리 무늬)는 세기 [2·J1(v)/v]², v = π·θ·D/λ 이다.
// 첫 어두운 자리는 J1 의 첫 영점 v₁ 에 있다 — θ₁ = (v₁/π)·λ/D. 두 점의 빛은 서로 결이 맞지
// 않으므로 스크린에서 세기가 더해진다. 스크린 상 · 곡선 · 골 깊이 · 눈금이 모두 이 한 계산에서 나온다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  APERTURE_LARGE,
  APERTURE_SCALE,
  APERTURE_SMALL,
  CURVE_HEIGHT,
  EXPOSURE,
  IMAGE_SCALE,
  SEP_FAR,
  SEP_NEAR,
  SEP_RAYLEIGH,
  WAVELENGTH_NM,
} from './schema';
import type { ResolvingPowerState } from './state';

export interface ResolvingPowerConstants {
  wavelengthNm: number;
  apertureSmall: number;
  apertureLarge: number;
  sepFar: number;
  sepRayleigh: number;
  sepNear: number;
  imageScale: number;
  apertureScale: number;
  curveHeight: number;
  exposure: number;
}

/** 스테이지 상수를 기본값과 함께 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): ResolvingPowerConstants {
  const c = stage.constants ?? {};
  return {
    wavelengthNm: c.wavelengthNm ?? WAVELENGTH_NM,
    apertureSmall: c.apertureSmall ?? APERTURE_SMALL,
    apertureLarge: c.apertureLarge ?? APERTURE_LARGE,
    sepFar: c.sepFar ?? SEP_FAR,
    sepRayleigh: c.sepRayleigh ?? SEP_RAYLEIGH,
    sepNear: c.sepNear ?? SEP_NEAR,
    imageScale: c.imageScale ?? IMAGE_SCALE,
    apertureScale: c.apertureScale ?? APERTURE_SCALE,
    curveHeight: c.curveHeight ?? CURVE_HEIGHT,
    exposure: c.exposure ?? EXPOSURE,
  };
}

/** J1 의 첫 영점 — 수학 상수. */
const J1_FIRST_ZERO = 3.831705970207512;

/**
 * 1차 베셀 함수 J1(x). 유리 근사(Numerical Recipes `bessj1`) — 계수는 근사식의 수학 상수다.
 * 오차는 1e-8 수준이라 그림에는 보이지 않는다.
 */
export function besselJ1(x: number): number {
  const ax = Math.abs(x);
  if (ax < 8) {
    const y = x * x;
    const p =
      x *
      (72362614232.0 +
        y * (-7895059235.0 + y * (242396853.1 + y * (-2972611.439 + y * (15704.4826 + y * -30.16036606)))));
    const q =
      144725228442.0 + y * (2300535178.0 + y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y))));
    return p / q;
  }
  const z = 8 / ax;
  const y = z * z;
  const xx = ax - 2.356194491;
  const p = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * -0.240337019e-6)));
  const q =
    0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));
  const ans = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * p - z * Math.sin(xx) * q);
  return x < 0 ? -ans : ans;
}

/** λ/D (μrad). */
export function lambdaOverD(wavelengthNm: number, apertureMm: number): number {
  return wavelengthNm / apertureMm;
}

/** 첫 어두운 자리까지의 각(μrad) — 레일리 기준의 간격이기도 하다. */
export function firstDarkAngle(wavelengthNm: number, apertureMm: number): number {
  return (J1_FIRST_ZERO / Math.PI) * lambdaOverD(wavelengthNm, apertureMm);
}

/** 점 하나의 무늬 세기 0~1 — 봉우리에서 떨어진 각 θ(μrad). 가운데가 1. */
export function airy(theta: number, wavelengthNm: number, apertureMm: number): number {
  const v = (Math.PI * Math.abs(theta)) / lambdaOverD(wavelengthNm, apertureMm);
  if (v < 1e-9) return 1;
  const a = (2 * besselJ1(v)) / v;
  return a * a;
}

/** 상태가 캡션 글자뿐이다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ResolvingPowerState }): ResolvingPowerState {
  return params.state;
}
