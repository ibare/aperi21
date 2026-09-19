// ========================================================================
// iv-characteristic — 순수 물리
// ========================================================================
// 세 소자의 전류 I(V):
//   저항      I = V / R
//   전구      I = V / (R₀ + k|V|)       — 뜨거워질수록 저항이 커지는 근사
//   다이오드  I = I_th (exp((V − V_th)/w) − exp(−V_th/w))  — 원점에서 0, 문턱에서 I_th
// 셋 모두 V 에 대해 늘기만 하므로, 평면의 위 · 아래 끝에서 멎는 전압을 이분법으로 찾는다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다 — `step` 은 항등이다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  BULB_COLD_RESISTANCE,
  BULB_RESISTANCE_PER_VOLT,
  DIODE_CURRENT_AT_THRESHOLD,
  DIODE_KNEE_WIDTH,
  DIODE_THRESHOLD,
  PLOT_CURRENT_MAX,
  PLOT_CURRENT_MIN,
  PLOT_WORLD_PER_AMP,
  PLOT_WORLD_PER_VOLT,
  RESISTANCE,
  SWEEP_VOLTAGE_MAX,
  SWEEP_VOLTAGE_MIN,
} from './schema';
import type { IvCharacteristicState } from './state';

export type Device = 'resistor' | 'bulb' | 'diode';

export interface IvCharacteristicConstants {
  resistance: number;
  bulbColdResistance: number;
  bulbResistancePerVolt: number;
  diodeThreshold: number;
  diodeCurrentAtThreshold: number;
  diodeKneeWidth: number;
  sweepVoltageMin: number;
  sweepVoltageMax: number;
  plotCurrentMin: number;
  plotCurrentMax: number;
  plotWorldPerVolt: number;
  plotWorldPerAmp: number;
}

export function readConstants(stage: StageDef): IvCharacteristicConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    resistance: c.resistance ?? RESISTANCE,
    bulbColdResistance: c.bulbColdResistance ?? BULB_COLD_RESISTANCE,
    bulbResistancePerVolt: c.bulbResistancePerVolt ?? BULB_RESISTANCE_PER_VOLT,
    diodeThreshold: c.diodeThreshold ?? DIODE_THRESHOLD,
    diodeCurrentAtThreshold: c.diodeCurrentAtThreshold ?? DIODE_CURRENT_AT_THRESHOLD,
    diodeKneeWidth: c.diodeKneeWidth ?? DIODE_KNEE_WIDTH,
    sweepVoltageMin: c.sweepVoltageMin ?? SWEEP_VOLTAGE_MIN,
    sweepVoltageMax: c.sweepVoltageMax ?? SWEEP_VOLTAGE_MAX,
    plotCurrentMin: c.plotCurrentMin ?? PLOT_CURRENT_MIN,
    plotCurrentMax: c.plotCurrentMax ?? PLOT_CURRENT_MAX,
    plotWorldPerVolt: c.plotWorldPerVolt ?? PLOT_WORLD_PER_VOLT,
    plotWorldPerAmp: c.plotWorldPerAmp ?? PLOT_WORLD_PER_AMP,
  };
}

/** 소자의 전류(A). */
export function currentOf(device: Device, v: number, c: IvCharacteristicConstants): number {
  switch (device) {
    case 'resistor':
      return v / c.resistance;
    case 'bulb':
      return v / (c.bulbColdResistance + c.bulbResistancePerVolt * Math.abs(v));
    case 'diode': {
      const w = c.diodeKneeWidth;
      return c.diodeCurrentAtThreshold * (Math.exp((v - c.diodeThreshold) / w) - Math.exp(-c.diodeThreshold / w));
    }
  }
}

/** 이분법 반복 수. 전압 구간 몇 V 를 2^-40 까지 좁히면 화면에서 구별되지 않는다. */
const BISECT_STEPS = 40;

/** [lo, hi] 에서 I(V) = target 인 V. I 가 V 에 대해 늘기만 한다는 것에 기댄다. */
function solveVoltage(device: Device, target: number, lo: number, hi: number, c: IvCharacteristicConstants): number {
  let a = lo;
  let b = hi;
  for (let k = 0; k < BISECT_STEPS; k++) {
    const m = (a + b) / 2;
    if (currentOf(device, m, c) < target) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

/**
 * 곡선이 평면 안에 머무는 전압 구간 — 쓸어 올리는 구간을 평면의 전류 끝에서 자른다.
 * 다이오드는 위 끝(`plotCurrentMax`)에서 멎는다.
 */
export function sweepRange(device: Device, c: IvCharacteristicConstants): [number, number] {
  let v0 = c.sweepVoltageMin;
  let v1 = c.sweepVoltageMax;
  if (currentOf(device, v0, c) < c.plotCurrentMin) v0 = solveVoltage(device, c.plotCurrentMin, v0, v1, c);
  if (currentOf(device, v1, c) > c.plotCurrentMax) v1 = solveVoltage(device, c.plotCurrentMax, v0, v1, c);
  return [v0, v1];
}

/** (V, I) 를 평면 월드 좌표로. 원점은 월드 원점이다. */
export function toPlane(v: number, i: number, c: IvCharacteristicConstants): Vec2 {
  return [v * c.plotWorldPerVolt, i * c.plotWorldPerAmp];
}

/**
 * 전압 [from, to] 를 `samples` 칸으로 나눠 곡선을 월드 점으로 표본한다(장부 G28 — 곡선 어휘가
 * 없다). 다이오드의 무릎처럼 급한 곳도 매끈하도록 표본을 촘촘히 준다.
 */
export function sampleCurve(
  device: Device,
  from: number,
  to: number,
  samples: number,
  c: IvCharacteristicConstants,
): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k <= samples; k++) {
    const v = from + ((to - from) * k) / samples;
    pts.push(toPlane(v, currentOf(device, v, c), c));
  }
  return pts;
}

/** 폴리라인의 누적 길이 — `lengths[k]` 는 0 번 점부터 k 번 점까지. */
export function cumulativeLengths(points: readonly Vec2[]): number[] {
  const out = [0];
  for (let k = 1; k < points.length; k++) {
    const [ax, ay] = points[k - 1]!;
    const [bx, by] = points[k]!;
    out.push(out[k - 1]! + Math.hypot(bx - ax, by - ay));
  }
  return out;
}

/** 폴리라인 앞머리에서 길이 s 까지 잘라 낸 부분(끝점은 s 자리). */
export function headOf(points: readonly Vec2[], lengths: readonly number[], s: number): Vec2[] {
  const total = lengths[lengths.length - 1]!;
  if (s >= total) return [...points];
  const out: Vec2[] = [points[0]!];
  for (let k = 1; k < points.length; k++) {
    if (lengths[k]! < s) {
      out.push(points[k]!);
      continue;
    }
    const seg = lengths[k]! - lengths[k - 1]!;
    const f = seg > 0 ? (s - lengths[k - 1]!) / seg : 0;
    const [ax, ay] = points[k - 1]!;
    const [bx, by] = points[k]!;
    out.push([ax + (bx - ax) * f, ay + (by - ay) * f]);
    break;
  }
  return out;
}

/** 항등 — 쌓는 상태가 없다. */
export function step(params: { state: IvCharacteristicState }): IvCharacteristicState {
  return params.state;
}
