// ========================================================================
// antenna-radiation — 순수 물리 · 배치 계산
// ========================================================================
// 세로 쌍극자 안테나의 먼 곳 복사.
//   위상      φ(r, t) = 2π (f t − r/λ)          — 마루는 f t − r/λ 가 정수인 자리
//   세기      I(θ) = I₀ · sin²θ                 — θ 는 안테나 축(세로)과 이룬 각
// 거리에 따른 옅어짐(1/r²)은 그리지 않는다 — 이 조각이 견주는 것은 **같은 거리에서
// 방향끼리**의 세기다 (NOTES (b)).
// 모든 것이 조각 시계의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  ANTENNA_HALF,
  CHARGE_SWING,
  FREQUENCY,
  LOBE_SCALE,
  PEAK_INTENSITY,
  RING_OPACITY_SCALE,
  RING_REACH,
  RING_START,
  WAVELENGTH,
} from './schema';
import type { AntennaRadiationState } from './state';

/** 고리 하나를 자르는 조각 수. 조각마다 제 방향의 짙기를 갖는다. */
const RING_SEGMENTS = 96;
/** 두 잎 윤곽의 표본 수(한 바퀴). */
const LOBE_SAMPLES = 180;
export interface AntennaRadiationConstants {
  /** 전하가 흔들리는 진동수(Hz). */
  frequency: number;
  /** 물결 간격(월드 칸). */
  wavelength: number;
  /** 옆 방향(θ = 90°) 세기. 상대값. */
  peakIntensity: number;
  /** 세기 → 고리 불투명도 배율. */
  ringOpacityScale: number;
  /** 세기 → 두 잎 반지름 배율(월드 칸). */
  lobeScale: number;
  /** 안테나 반 길이(월드 칸). */
  antennaHalf: number;
  /** 전하가 흔들리는 폭(월드 칸). */
  chargeSwing: number;
  /** 고리를 그리기 시작하는 반지름(월드 칸). */
  ringStart: number;
}

export function readConstants(stage: StageDef): AntennaRadiationConstants {
  const c = stage.constants ?? {};
  return {
    frequency: c.frequency ?? FREQUENCY,
    wavelength: c.wavelength ?? WAVELENGTH,
    peakIntensity: c.peakIntensity ?? PEAK_INTENSITY,
    ringOpacityScale: c.ringOpacityScale ?? RING_OPACITY_SCALE,
    lobeScale: c.lobeScale ?? LOBE_SCALE,
    antennaHalf: c.antennaHalf ?? ANTENNA_HALF,
    chargeSwing: c.chargeSwing ?? CHARGE_SWING,
    ringStart: c.ringStart ?? RING_START,
  };
}

/**
 * 방향의 세기. `theta` 는 안테나 축(위쪽 세로)과 이룬 각(라디안).
 * 옆(90°)에서 가장 크고 축 위(0° · 180°)에서 0 이다.
 */
export function intensityAt(theta: number, c: AntennaRadiationConstants): number {
  const s = Math.sin(theta);
  return c.peakIntensity * s * s;
}

/**
 * 위 · 아래 전하의 세로 자리(안테나 가운데 기준). 둘은 엇갈려 흔들린다 —
 * 위가 올라가면 아래가 내려간다. 마루 고리는 전하가 끝에 닿는 순간마다 나간다.
 */
export function chargeOffset(t: number, c: AntennaRadiationConstants): number {
  return c.chargeSwing * Math.cos(2 * Math.PI * c.frequency * t);
}

/** 지금 판 안에 있는 마루 고리의 반지름들. 작은 것(갓 나온 것)부터. */
export function crestRadii(t: number, c: AntennaRadiationConstants): number[] {
  const ft = c.frequency * t;
  const nLo = Math.ceil(ft - RING_REACH / c.wavelength);
  const nHi = Math.floor(ft - c.ringStart / c.wavelength);
  const out: number[] = [];
  for (let n = nHi; n >= nLo; n--) out.push(c.wavelength * (ft - n));
  return out;
}

export interface RingPieces {
  lines: Vec2[][];
  opacities: number[];
}

/**
 * 마루 고리들을 조각으로 잘라 조각마다 제 방향의 짙기를 준다. 고리는 원이고 모양은
 * 어느 방향이나 같다 — 방향마다 다른 것은 **짙기** 하나다.
 * 갓 나온 고리는 물결 한 칸을 지나는 동안 짙어진다 — 안테나 곁에서 고리가 불쑥 켜지지 않게.
 */
export function ringPieces(t: number, c: AntennaRadiationConstants): RingPieces {
  const lines: Vec2[][] = [];
  const opacities: number[] = [];
  const dA = (2 * Math.PI) / RING_SEGMENTS;
  for (const r of crestRadii(t, c)) {
    const bornIn = Math.min(1, (r - c.ringStart) / c.wavelength);
    for (let k = 0; k < RING_SEGMENTS; k++) {
      // a 는 가로축에서 잰 각. 축(세로)과 이룬 각 θ = π/2 − a.
      const a0 = k * dA;
      const a1 = a0 + dA;
      const theta = Math.PI / 2 - (a0 + a1) / 2;
      lines.push([
        [r * Math.cos(a0), r * Math.sin(a0)],
        [r * Math.cos(a1), r * Math.sin(a1)],
      ]);
      opacities.push(Math.min(1, c.ringOpacityScale * intensityAt(theta, c) * bornIn));
    }
  }
  return { lines, opacities };
}

/**
 * 극좌표 복사 무늬 — 방향마다 세기만큼의 거리에 점을 찍어 이은 것. 옆으로 두 잎이
 * 나오고 축 위에서 가운데로 오므라든다(도넛 단면). `grow` 0~1 로 잎이 자란다.
 */
export function lobeOutline(grow: number, c: AntennaRadiationConstants): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k < LOBE_SAMPLES; k++) {
    const a = (k / LOBE_SAMPLES) * 2 * Math.PI;
    const theta = Math.PI / 2 - a;
    const r = grow * c.lobeScale * intensityAt(theta, c);
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: AntennaRadiationState }): AntennaRadiationState {
  return params.state;
}
