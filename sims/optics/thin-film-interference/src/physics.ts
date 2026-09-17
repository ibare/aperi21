// ========================================================================
// thin-film-interference — 순수 물리
// ========================================================================
// 공기 – 비눗물(n = 1.33) – 공기, 수직 입사, 다중 반사 포함 반사율.
// 반사 스펙트럼을 CIE 1931 색맞춤 함수(Wyman 외 2013 근사)로 적분해 선형 sRGB 로 바꾼다.
// 흘러내리는 막의 두께 모형은 원본 상수 그대로다.
//
// 색 공간 변환의 수는 순수 함수의 수학 상수라 색 리터럴이 아니다 (C2 Exception).
// ========================================================================

import { FILM, PERIOD, PROBE_Y_RANGE, worldY } from './schema';
import type { ThinFilmInterferenceState } from './state';

// ---- 반사율 ----

/** 비눗물 굴절률. */
export const N_FILM = 1.33;
const r = (N_FILM - 1) / (N_FILM + 1);
/** 반사율 최댓값 (약 7.7%). 스펙트럼은 이것으로 나눠 모양만 보인다. */
export const R_MAX = (4 * r * r) / Math.pow(1 + r * r, 2);
/** 두께 → 밝기 표를 만들 범위(nm). */
export const D_MAX = 1400;

/** 두께 d(nm) · 파장 λ(nm) 에서의 반사율. 위쪽 반사만 위상이 뒤집힌다. */
export function reflectance(dNm: number, lamNm: number): number {
  const c = Math.cos((4 * Math.PI * N_FILM * dNm) / lamNm);
  return (2 * r * r * (1 - c)) / (1 + r * r * r * r - 2 * r * r * c);
}

// ---- 색맞춤 함수 → 선형 sRGB ----

const g = (x: number, mu: number, s1: number, s2: number): number => {
  const t = (x - mu) / (x < mu ? s1 : s2);
  return Math.exp(-0.5 * t * t);
};
const xbar = (l: number): number => 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
const ybar = (l: number): number => 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
const zbar = (l: number): number => 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);

const LAMS: number[] = [];
for (let l = 380; l <= 780; l += 5) LAMS.push(l);
const CMF = LAMS.map((l) => [xbar(l), ybar(l), zbar(l)] as const);

function spectrumToLin(fn: (lam: number) => number): [number, number, number] {
  let X = 0;
  let Y = 0;
  let Z = 0;
  for (let i = 0; i < LAMS.length; i++) {
    const s = fn(LAMS[i]!);
    X += s * CMF[i]![0];
    Y += s * CMF[i]![1];
    Z += s * CMF[i]![2];
  }
  return [
    3.2406 * X - 1.5372 * Y - 0.4986 * Z,
    -0.9689 * X + 1.8758 * Y + 0.0415 * Z,
    0.0557 * X - 0.204 * Y + 1.057 * Z,
  ];
}

/** 모든 파장이 그대로 돌아올 때를 흰색으로 맞춘다. */
const WHITE = spectrumToLin(() => 1);
/** 반사율이 몇 % 뿐이라 노출을 올려 그린다. 원본 값. */
const EXPOSURE = 0.8 / R_MAX;

/**
 * 두께 d 의 반사광이 **화면에 나오는 빛의 양**(0~1).
 *
 * 원본은 채널마다 `EXPOSURE · v / WHITE` 를 0~1 로 자른 뒤 감마를 걸어 색으로 칠했다.
 * 엔진에 계산한 색을 칠할 어휘가 없어, 같은 자른 선형 채널의 상대 휘도만 남긴다
 * (NOTES 「어휘 부족」 — 빛 색 트랙).
 */
function lightAmount(dNm: number): number {
  const lin = spectrumToLin((l) => reflectance(dNm, l));
  const ch = lin.map((v, i) => Math.max(0, Math.min(1, (EXPOSURE * v) / WHITE[i]!)));
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!;
}

/** 두께 → 빛의 양 표 (1 nm 간격). 선언 상수에서 나온 고정 표라 한 번만 만든다. */
const LIGHT_LUT = new Float32Array(D_MAX + 1);
for (let d = 0; d <= D_MAX; d++) LIGHT_LUT[d] = lightAmount(d);

export function lightAt(dNm: number): number {
  return LIGHT_LUT[Math.max(0, Math.min(D_MAX, Math.round(dNm)))]!;
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
