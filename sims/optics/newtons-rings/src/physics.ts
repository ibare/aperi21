// ========================================================================
// newtons-rings — 순수 물리
// ========================================================================
// 곡률 반지름 R 인 볼록 렌즈가 평판에 한 점으로 닿아 있다. 가운데에서 r 떨어진 자리의
// 공기층 두께는 (r ≪ R 일 때) t = r² / 2R — 반지름의 **제곱**을 따라 가파르게 두꺼워진다.
//
// 위에서 수직으로 비춘 단색광이 렌즈 아랫면과 평판 윗면에서 반사된 두 빛이 겹친다. 길 차는 2t 이고,
// 평판 쪽 반사(공기 → 유리)만 위상이 반 바퀴 뒤집힌다. 그래서 반사 세기는 sin²(2πt/λ) 꼴 —
// t = 0(닿은 가운데)이 어둡고, 두께가 반 파장(λ/2)씩 늘 때마다 다시 어둡다.
// 어두운 고리 m 의 반지름은 t = mλ/2 에서 r = √(mλR) 이다.
// ========================================================================

import { wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import type { StageDef } from '@aperi21/schema';

import { LENS_RADIUS_M, MARKED_RINGS, THICKNESS_EXAGGERATION, VIEW_RADIUS_MM, WAVELENGTH_NM } from './schema';
import type { NewtonsRingsState } from './state';

export interface NewtonsRingsConstants {
  /** 렌즈 곡률 반지름(m). */
  lensRadius: number;
  /** 단색광 파장(nm). */
  wavelength: number;
  /** 그림에 담는 반지름(mm). */
  viewRadius: number;
  /** 안내선을 긋는 어두운 고리 수. */
  markedRings: number;
  /** 단면 두께의 세로 과장 배율. */
  exaggeration: number;
}

export function readConstants(stage: StageDef): NewtonsRingsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    lensRadius: c.lensRadius ?? LENS_RADIUS_M,
    wavelength: c.wavelength ?? WAVELENGTH_NM,
    viewRadius: c.viewRadius ?? VIEW_RADIUS_MM,
    markedRings: c.markedRings ?? MARKED_RINGS,
    exaggeration: c.exaggeration ?? THICKNESS_EXAGGERATION,
  };
}

/** mm 단위로 옮긴 R · λ. */
const lensRadiusMm = (c: NewtonsRingsConstants): number => c.lensRadius * 1000;
const wavelengthMm = (c: NewtonsRingsConstants): number => c.wavelength * 1e-6;

/** 가운데에서 r(mm) 떨어진 자리의 공기층 두께(mm). t = r² / 2R. */
export function gapThickness(rMm: number, c: NewtonsRingsConstants): number {
  return (rMm * rMm) / (2 * lensRadiusMm(c));
}

/** 반 파장 m 개 두께(mm) — 어두운 고리 m 이 서는 두께. */
export function halfWaveThickness(m: number, c: NewtonsRingsConstants): number {
  return (m * wavelengthMm(c)) / 2;
}

/** 어두운 고리 m 의 반지름(mm). t = mλ/2 를 t = r²/2R 에 넣은 r = √(mλR). */
export function darkRingRadius(m: number, c: NewtonsRingsConstants): number {
  return Math.sqrt(m * wavelengthMm(c) * lensRadiusMm(c));
}

/**
 * 반사광 세기 0~1. 두 반사광의 길 차 2t 에 평판 쪽 반사의 반 바퀴 뒤집힘을 더해,
 * 0 ~ 1 사이를 sin²(2πt/λ) 로 오간다 — 닿은 가운데(t = 0)가 어둡다.
 */
export function reflectedIntensity(rMm: number, c: NewtonsRingsConstants): number {
  const s = Math.sin((2 * Math.PI * gapThickness(rMm, c)) / wavelengthMm(c));
  return s * s;
}

/** 비추는 단색광의 색(선형광, 가득 찬 빛 = 1). 색 계산은 plugin-optics 의 순수 함수가 한다. */
export function sourceLight(c: NewtonsRingsConstants): LinearRgb {
  return wavelengthToLinearRgb(c.wavelength);
}

/** 쌓는 상태가 없다 — 모든 것이 시각과 스테이지 상수의 함수다. */
export function step(params: { state: NewtonsRingsState }): NewtonsRingsState {
  return params.state;
}
