// ========================================================================
// thin-film-interference — 순수 물리
// ========================================================================
// 공기 – 비눗물(n = 1.33) – 공기, 수직 입사, 다중 반사 포함 반사율.
// 반사 스펙트럼을 CIE 1931 색맞춤 함수로 적분한 빛의 색은 `@aperi21/plugin-optics` 의 순수 계산 함수가 주고,
// 원본이 그 위에 곱한 것(노출 계수 · 가시광 양 끝 어둡게 하기)은 이 조각의 계산이라 여기서 세기로 곱한다.
// 흘러내리는 막의 두께 모형은 원본 상수 그대로다.
//
// 색 공간 변환의 수는 순수 함수의 수학 상수라 색 리터럴이 아니다 (C2 Exception).
// ========================================================================

import { spectrumToLinearRgb, wavelengthToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';

import { FILM, PERIOD, PROBE_Y_RANGE, worldY } from './schema';
import type { ThinFilmInterferenceState } from './state';

// ---- 반사율 ----

/** 비눗물 굴절률. */
export const N_FILM = 1.33;
const r = (N_FILM - 1) / (N_FILM + 1);
/** 반사율 최댓값 (약 7.7%). 스펙트럼은 이것으로 나눠 모양만 보인다. */
export const R_MAX = (4 * r * r) / Math.pow(1 + r * r, 2);
/** 두께 → 반사색 표를 만들 범위(nm). */
export const D_MAX = 1400;

/** 두께 d(nm) · 파장 λ(nm) 에서의 반사율. 위쪽 반사만 위상이 뒤집힌다. */
export function reflectance(dNm: number, lamNm: number): number {
  const c = Math.cos((4 * Math.PI * N_FILM * dNm) / lamNm);
  return (2 * r * r * (1 - c)) / (1 + r * r * r * r - 2 * r * r * c);
}

// ---- 빛의 색 ----

/** 반사율이 몇 % 뿐이라 노출을 올려 그린다. 원본 값 — 반사율 최대인 자리가 흰빛의 0.8. */
const EXPOSURE = 0.8 / R_MAX;

/** 선형광 세 성분에 세기를 곱한다. */
const scale = (c: LinearRgb, k: number): LinearRgb => [c[0] * k, c[1] * k, c[2] * k];

/**
 * 두께 d 의 반사광 색(선형광, 흰빛 = 1). 반사 스펙트럼을 CIE 1931 로 적분하고(모든 파장이 다 돌아오면 흰빛)
 * 원본 노출 계수를 곱한다. 원본은 채널마다 `EXPOSURE · v / WHITE` 를 0~1 로 자른 뒤 감마를 걸었다 —
 * 자르기 · 감마는 렌더러가 같은 셈으로 한다.
 */
export function reflectedLight(dNm: number): LinearRgb {
  return scale(
    spectrumToLinearRgb((l) => reflectance(dNm, l)),
    EXPOSURE,
  );
}

/** 두께 → 반사색 표 (1 nm 간격, 칸마다 세 성분). 선언 상수에서 나온 고정 표라 모듈 로드 때 한 번 만든다 (원본과 같다). */
const LIGHT_LUT = new Float32Array((D_MAX + 1) * 3);
for (let d = 0; d <= D_MAX; d++) {
  const c = reflectedLight(d);
  LIGHT_LUT[d * 3] = c[0];
  LIGHT_LUT[d * 3 + 1] = c[1];
  LIGHT_LUT[d * 3 + 2] = c[2];
}

/** 두께 d 의 반사색을 표에서 읽어 `out[o..o+2]` 에 적는다. 막 칸 수만큼 부르므로 배열을 만들지 않는다. */
export function writeLightAt(dNm: number, out: number[], o: number): void {
  const i = Math.max(0, Math.min(D_MAX, Math.round(dNm))) * 3;
  out[o] = LIGHT_LUT[i]!;
  out[o + 1] = LIGHT_LUT[i + 1]!;
  out[o + 2] = LIGHT_LUT[i + 2]!;
}

/** 두께 d 의 반사색 (표 조회). 보이는 색 원판은 막과 같은 표를 읽어 둘이 어긋나지 않는다. */
export function lightAt(dNm: number): LinearRgb {
  const c: number[] = [0, 0, 0];
  writeLightAt(dNm, c, 0);
  return [c[0]!, c[1]!, c[2]!];
}

/** 화면값(0~1) → 선형광. sRGB 전달 곡선의 역 — 색 공간 변환 상수다. */
const screenToLinear = (v: number): number => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));

/** 원본 스펙트럼 채움의 불투명도. 어두운 바탕 위라 화면값에 곱해진다. */
const SPECTRUM_FILL_ALPHA = 0.9;

/**
 * 스펙트럼 채움의 파장 하나 색 (선형광). 색상은 `wavelengthToLinearRgb` 가 주고, 원본이 따로 곱한 두 가지 —
 * **가시광 양 끝은 눈에 어둡다**(380~420 · 700~780 nm 에서 0.3 까지)와 화면값 지수 0.8 · 채움 불투명도 0.9 — 는
 * 이 조각의 계산이라 여기서 세기로 곱한다. 원본은 성분마다 지수를 걸었으나 세기 하나로 곱하므로
 * 주성분(1 인 성분)은 원본과 같고 섞인 성분은 조금 다르다.
 */
export function spectrumBandLight(nm: number): LinearRgb {
  let f = 1;
  if (nm < 420) f = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm > 700) f = 0.3 + (0.7 * (780 - nm)) / 80;
  return scale(wavelengthToLinearRgb(nm), screenToLinear(SPECTRUM_FILL_ALPHA * Math.pow(Math.max(0, f), 0.8)));
}

// ---- 흘러내리는 막 ----

const T0 = 3;
const P_EXP = 0.8;
const C_H = 2885;
const BLACK_RATE = 0.012;

/** 자리 (x, y 는 막 폭 · 높이의 비, y 는 위가 0) 와 막 나이(초)에서의 두께(nm). */
export function thicknessAt(x: number, y: number, age: number): number {
  const yy = Math.max(
    0,
    Math.min(1, y + 0.014 * Math.sin(2 * Math.PI * 1.6 * x + 0.9 * age + 3 * y) * Math.sin(Math.PI * y)),
  );
  const black = BLACK_RATE * age; // 위에서부터 자라는 검은 막(거의 두께 0) 구간
  return (C_H * Math.pow(Math.max(0, yy - black), P_EXP)) / Math.pow(age + T0, P_EXP);
}

/**
 * 높이 y 의 막 나이. 새 막 경계(`wipe`, 막 높이의 비)보다 아래는 아직 이전 막이다.
 *
 * @param u 주기 안 시각(초)
 * @param wipe 경계 높이 0~1. 덮는 단계가 끝났으면 1 — 전부 새 막.
 */
export function filmAge(y: number, u: number, wipe: number): number {
  return wipe < 1 && y > wipe ? u + PERIOD : u;
}

/** 관찰점 월드 자리 → 관찰 높이(막 높이의 비). 끌기 범위로 자른다. */
export function probeYOf(state: ThinFilmInterferenceState): number {
  const y = (worldY(state.pos[1]) - FILM.y) / FILM.h;
  return Math.max(PROBE_Y_RANGE[0], Math.min(PROBE_Y_RANGE[1], y));
}

/** 쌓는 상태가 없다 — 관찰점 자리는 조작기가 적고, 나머지는 시각의 함수다. */
export function step(params: { state: ThinFilmInterferenceState; dt: number }): ThinFilmInterferenceState {
  return params.state;
}
