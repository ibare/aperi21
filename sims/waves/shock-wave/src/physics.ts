// ========================================================================
// shock-wave — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 것이 시간표 시각의 함수이고 `step` 은 항등이다.
//
//   음원 자리  x(τ) — 주기 시작 전부터 소리 빠르기 V 로 달려왔고, `accel` 동안 빠르기가
//              V 에서 U 까지 고르게 오르며, 그 뒤 U 로 간다
//   파면 k    τ_k = k·T 에 그때의 음원 자리 x(τ_k) 에서 나와 반지름 V·(τ − τ_k) 로 퍼진다
//   원뿔      U 로 달리는 동안 난 파면은 모두 음원에서 뒤로 뻗은 두 선에 접한다 —
//              반각 θ 는 sin θ = V / U (화면 빠르기의 비 = 선언된 v/u)
//
// U = V 이면 모든 파면이 음원 코끝 한 점에서 접한다(벽). U > V 이면 음원이 파면 밖으로
// 나가 원뿔이 된다. 같은 식이 두 경우를 모두 푼다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  FRONT_FADE_TAIL,
  FRONT_REACH,
  SCREEN_PERIOD,
  SCREEN_WAVE_SPEED,
  SOUND_SPEED,
  SOURCE_SPEED,
  SOURCE_START_X,
  TRIANGLE_AGE,
} from './schema';
import type { ShockWaveState } from './state';

/** 스테이지 상수. 비면 모듈 기본값으로 되돌린다. */
export interface ShockWaveConstants {
  soundSpeed: number;
  sourceSpeed: number;
  screenWaveSpeed: number;
  screenPeriod: number;
  sourceStartX: number;
}

export function readConstants(stage: StageDef): ShockWaveConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    soundSpeed: c.soundSpeed ?? SOUND_SPEED,
    sourceSpeed: c.sourceSpeed ?? SOURCE_SPEED,
    screenWaveSpeed: c.screenWaveSpeed ?? SCREEN_WAVE_SPEED,
    screenPeriod: c.screenPeriod ?? SCREEN_PERIOD,
    sourceStartX: c.sourceStartX ?? SOURCE_START_X,
  };
}

/** 파면 하나 — 중심 x(축 위) · 반지름 · 옅어짐. */
export interface FrontReading {
  cx: number;
  r: number;
  opacity: number;
}

/** 지금 음원이 어느 빠르기 구간에 있는가 — 칩 글자를 고른다. */
export type Regime = 'sonic' | 'accel' | 'fast';

/** 멈춰 세운 장면의 작도 — 축 위 음원(S) · 파면 중심(P) · 접점(Q, 위) · 반각. */
export interface Construction {
  /** 음원 코끝 — 원뿔의 꼭짓점. 축 위 x. */
  sx: number;
  /** 삼각형을 건 파면의 중심 x. */
  px: number;
  /** 접점의 축 기준 자리 [x, 축에서의 높이]. */
  q: Vec2;
  /** 원뿔 반각(라디안). */
  theta: number;
  /** 원뿔 선이 꼭짓점에서 뒤로 뻗는 길이(월드) — U 시대에 난 가장 오래된 파면의 접점까지. */
  coneLength: number;
}

export interface Reading {
  sourceX: number;
  /** 지금 빠르기의 소리 빠르기에 대한 비 — 화살표 길이. */
  speedRatio: number;
  regime: Regime;
  /** 멈춰 섰는가(`hold` · `fade`). */
  frozen: boolean;
  fronts: FrontReading[];
  /** 멈춰 세운 장면에서만 있다. */
  construction: Construction | null;
  /** 장면 전체의 옅어짐(1 이면 또렷하다). */
  opacity: number;
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

/**
 * 시간표 시각 → 화면 값. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두지 않는다 — `start` · `end` · `at` 으로 선언을 읽는다.
 * 움직임은 `cone` 이 끝날 때 멈춘다. 그 뒤(`hold` · `fade`)는 멈춰 세운 장면이다 —
 * 시계를 `cone` 의 끝에 묶는다 (장부 G117).
 */
export function derive(tl: TimelineFrame, c: ShockWaveConstants): Reading {
  const V = c.screenWaveSpeed;
  const T = c.screenPeriod;
  const ratio = c.sourceSpeed / c.soundSpeed;
  const U = V * ratio;

  const tA = tl.start('accel');
  const tB = tl.end('accel');
  const tC = tl.end('cone');
  const D = tB - tA;
  const frozen = tl.u > tC;
  const tau = Math.min(tl.u, tC);

  /** 음원 자리. 주기 시작 전은 「소리 빠르기로 줄곧 달려온 과거」 다. */
  const xAt = (s: number): number => {
    if (s <= tA) return c.sourceStartX + V * s;
    const xA = c.sourceStartX + V * tA;
    if (s <= tB) {
      const d = s - tA;
      return xA + V * d + ((U - V) * d * d) / (2 * D);
    }
    const xB = xA + ((V + U) / 2) * D;
    return xB + U * (s - tB);
  };

  const speedAt = (s: number): number => {
    if (s <= tA) return V;
    if (s <= tB) return V + ((U - V) * (s - tA)) / D;
    return U;
  };

  const life = FRONT_REACH / V;
  const kMin = Math.ceil((tau - life) / T);
  const kMax = Math.floor(tau / T);

  const sourceX = xAt(tau);
  const fronts: FrontReading[] = [];
  for (let k = kMin; k <= kMax; k++) {
    const tk = k * T;
    const r = V * (tau - tk);
    fronts.push({ cx: xAt(tk), r, opacity: clamp((FRONT_REACH - r) / FRONT_FADE_TAIL, 0, 1) });
  }

  let construction: Construction | null = null;
  if (frozen && U > V) {
    const theta = Math.asin(V / U);
    // 삼각형을 걸 파면 — U 시대(τ_k ≥ tB)에 난 것 중 나이가 TRIANGLE_AGE 에 가장 가까운 것.
    const kTri = Math.max(Math.round((tau - TRIANGLE_AGE) / T), Math.ceil(tB / T));
    const tk = kTri * T;
    const r = V * (tau - tk);
    const px = xAt(tk);
    // 접점 — 중심에서 원뿔 선에 수직으로 r 만큼. 원뿔 선이 축과 θ 를 이루므로 반지름은
    // 축과 90° − θ 를 이룬다.
    const q: Vec2 = [px + r * Math.sin(theta), r * Math.cos(theta)];
    // 원뿔 선 — U 시대에 난 가장 오래된 파면(τ_k ≥ tB 의 첫 파면)의 접점까지.
    const kOld = Math.ceil(tB / T);
    const age = tau - kOld * T;
    const coneLength = age > 0 ? Math.sqrt(U * U - V * V) * age : 0;
    construction = { sx: sourceX, px, q, theta, coneLength };
  }

  const regime: Regime = tau < tA ? 'sonic' : tau < tB ? 'accel' : 'fast';

  return {
    sourceX,
    speedRatio: speedAt(tau) / V,
    regime,
    frozen,
    fronts,
    construction,
    opacity: tl.at('appear') * (1 - tl.at('fade')),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: ShockWaveState }): ShockWaveState {
  return params.state;
}
