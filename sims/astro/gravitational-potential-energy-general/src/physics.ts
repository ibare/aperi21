// ========================================================================
// gravitational-potential-energy-general — 순수 물리
// ========================================================================
// 근점 r₀ 에서 옆으로(반지름에 수직으로) 쏜 물체의 케플러 궤도. 단위 질량당 역학적 에너지 E 가
// 주어지면 쏘는 속력은 v² = 2(E + GM/r₀) 이고, 근점에서 쏘았으므로 이심률은 e = r₀v²/GM − 1 이다.
//
//   E < 0  타원   a = GM / (2|E|),  r = a(1 − e cos η),  M = η − e sin η
//   E > 0  쌍곡선 a = GM / (2E),    r = a(e cosh F − 1), M = e sinh F − F
//
// 퍼텐셜 U(r) = −GM/r. E 선이 우물 벽과 만나는 거리는 U(r) = E 인 r = GM/|E| — E < 0 일 때만 있다.
// 물체의 거리는 늘 이 안쪽이다(운동 에너지 E − U ≥ 0).
//
// 모든 자리가 시간표 시계의 닫힌 식이라 쌓는 상태가 없다 — 같은 시각은 언제나 같은 화면이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ENERGY_1,
  ENERGY_2,
  ENERGY_3,
  EXIT_AT,
  EXIT_RADIUS,
  GM,
  LAUNCH_RADIUS,
  PLANET_RADIUS,
  WORLD_PER_ENERGY,
  WORLD_PER_LENGTH,
} from './schema';
import type { GravitationalPotentialEnergyGeneralState } from './state';

export interface GravitationalPotentialEnergyGeneralConstants {
  gm: number;
  launchRadius: number;
  planetRadius: number;
  /** 샷마다의 역학적 에너지. 시간표의 `shot1`~`shot3` 과 같은 순서다. */
  energies: readonly number[];
  worldPerLength: number;
  worldPerEnergy: number;
  exitRadius: number;
  exitAt: number;
}

export function readConstants(stage: StageDef): GravitationalPotentialEnergyGeneralConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gm: c.gm ?? GM,
    launchRadius: c.launchRadius ?? LAUNCH_RADIUS,
    planetRadius: c.planetRadius ?? PLANET_RADIUS,
    energies: [c.energy1 ?? ENERGY_1, c.energy2 ?? ENERGY_2, c.energy3 ?? ENERGY_3],
    worldPerLength: c.worldPerLength ?? WORLD_PER_LENGTH,
    worldPerEnergy: c.worldPerEnergy ?? WORLD_PER_ENERGY,
    exitRadius: c.exitRadius ?? EXIT_RADIUS,
    exitAt: c.exitAt ?? EXIT_AT,
  };
}

/**
 * 샷 단계 id 와 올리기 단계 id. 스테이지 상수 `energy1`~`energy3` 과 한 줄씩 짝이다 — 샷 수 3 이
 * 코드에 있다. 목록을 선언할 자리가 없다 (장부 G105).
 */
export const SHOT_PHASES = ['shot1', 'shot2', 'shot3'] as const;
export const RAISE_PHASES = ['raise1', 'raise2'] as const;

/** 퍼텐셜 U(r) = −GM/r. */
export function potential(c: GravitationalPotentialEnergyGeneralConstants, r: number): number {
  return -c.gm / r;
}

/** E 선이 우물 벽과 만나는 거리. E ≥ 0 이면 없다. */
export function wallRadius(c: GravitationalPotentialEnergyGeneralConstants, energy: number): number | null {
  return energy < 0 ? c.gm / -energy : null;
}

/** 궤도 한 점 — 행성 중심 기준 무차원 좌표(근점이 +x, 반시계로 돈다)와 거리. */
export interface OrbitPoint {
  x: number;
  y: number;
  r: number;
}

/** 근점에서 옆으로 쏜 궤도의 모양. */
export interface Orbit {
  energy: number;
  /** 긴반지름(쌍곡선은 절댓값). */
  a: number;
  e: number;
  bound: boolean;
}

export function orbitFor(c: GravitationalPotentialEnergyGeneralConstants, energy: number): Orbit {
  const v2 = 2 * (energy + c.gm / c.launchRadius);
  const e = (c.launchRadius * v2) / c.gm - 1;
  const a = c.gm / (2 * Math.abs(energy));
  return { energy, a, e, bound: energy < 0 };
}

/** 이심 근점 이각(타원 η · 쌍곡선 F) → 자리. */
export function pointAt(o: Orbit, anomaly: number): OrbitPoint {
  if (o.bound) {
    const x = o.a * (Math.cos(anomaly) - o.e);
    const y = o.a * Math.sqrt(Math.max(0, 1 - o.e * o.e)) * Math.sin(anomaly);
    return { x, y, r: o.a * (1 - o.e * Math.cos(anomaly)) };
  }
  const x = o.a * (o.e - Math.cosh(anomaly));
  const y = o.a * Math.sqrt(Math.max(0, o.e * o.e - 1)) * Math.sinh(anomaly);
  return { x, y, r: o.a * (o.e * Math.cosh(anomaly) - 1) };
}

/** 평균 근점 이각 M → 이심 근점 이각. 뉴턴법. */
export function anomalyFromMean(o: Orbit, mean: number): number {
  let x = o.bound ? mean : Math.asinh(mean / Math.max(o.e, 1e-9));
  for (let i = 0; i < 40; i++) {
    const f = o.bound ? x - o.e * Math.sin(x) - mean : o.e * Math.sinh(x) - x - mean;
    const d = o.bound ? 1 - o.e * Math.cos(x) : o.e * Math.cosh(x) - 1;
    const dx = f / Math.max(d, 1e-9);
    x -= dx;
    if (Math.abs(dx) < 1e-12) break;
  }
  return x;
}

/** 쌍곡선이 거리 `r` 에 닿는 평균 근점 이각. */
export function meanAtRadius(o: Orbit, r: number): number {
  const f = Math.acosh(Math.max(1, (r / o.a + 1) / o.e));
  return o.e * Math.sinh(f) - f;
}

/** 지금 화면이 보이는 것 — 시간표 한 프레임에서 닫힌 식으로 뽑는다. */
export interface Frame {
  /** 지금 에너지 선의 값. 올리기 단계에서는 두 샷 사이를 오른다. */
  energy: number;
  /** 지금 그리는 궤도. 올리기 단계에서는 다음 궤도(아직 떠나지 않음). */
  orbit: Orbit;
  /** 물체의 지금 이심 근점 이각. 근점이면 0. 물체가 떠난 뒤에는 자취가 끝나는 자리. */
  anomaly: number;
  /** 물체가 그림에 있는지. 빠져나간 뒤(`hold` · `fade`)에는 없다. */
  present: boolean;
  /** 지난 샷의 궤도 — 올리기 단계 동안 옅게 남긴다. */
  previous: Orbit | null;
  /** 흐려지는 몫 0~1. `fade` 에서 1 → 0. */
  fade: number;
}

export function frameAt(c: GravitationalPotentialEnergyGeneralConstants, tl: TimelineFrame): Frame {
  const fade = 1 - tl.at('fade');
  const last = c.energies.length - 1;

  const shot = SHOT_PHASES.indexOf(tl.phase as (typeof SHOT_PHASES)[number]);
  if (shot >= 0) {
    const orbit = orbitFor(c, c.energies[shot]!);
    let mean: number;
    if (orbit.bound) {
      mean = 2 * Math.PI * tl.progress;
    } else {
      mean = (meanAtRadius(orbit, c.exitRadius) * tl.progress) / c.exitAt;
    }
    return { energy: orbit.energy, orbit, anomaly: anomalyFromMean(orbit, mean), present: true, previous: null, fade };
  }

  const raise = RAISE_PHASES.indexOf(tl.phase as (typeof RAISE_PHASES)[number]);
  if (raise >= 0) {
    const from = c.energies[raise]!;
    const to = c.energies[raise + 1]!;
    const energy = from + (to - from) * tl.progress;
    return {
      energy,
      orbit: orbitFor(c, to),
      anomaly: 0,
      present: true,
      previous: orbitFor(c, from),
      fade,
    };
  }

  // hold · fade — 마지막 샷의 물체는 떠났다. 자취는 샷이 끝난 자리(그림 밖)까지 남는다.
  const orbit = orbitFor(c, c.energies[last]!);
  const mean = orbit.bound ? 2 * Math.PI : meanAtRadius(orbit, c.exitRadius) / c.exitAt;
  return { energy: orbit.energy, orbit, anomaly: anomalyFromMean(orbit, mean), present: false, previous: null, fade };
}

/** 근점(이각 0)에서 `anomaly` 까지 궤도 표본. */
export function orbitPath(o: Orbit, anomaly: number, samples: number): OrbitPoint[] {
  const out: OrbitPoint[] = [];
  const n = Math.max(2, Math.ceil(samples * Math.min(1, Math.abs(anomaly) / (2 * Math.PI)) + 1));
  for (let i = 0; i <= n; i++) out.push(pointAt(o, (anomaly * i) / n));
  return out;
}

/** 이번 샷에서 지금까지 닿은 가장 먼 거리. 타원은 원점(η = π)을 넘으면 원점 거리. */
export function reachedRadius(o: Orbit, anomaly: number): number {
  if (o.bound) return pointAt(o, Math.min(anomaly, Math.PI)).r;
  return pointAt(o, anomaly).r;
}

/** 상태가 비어 있다 — 항등. */
export function step(params: {
  state: GravitationalPotentialEnergyGeneralState;
}): GravitationalPotentialEnergyGeneralState {
  return params.state;
}
