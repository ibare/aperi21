// ========================================================================
// generator — 순수 물리
// ========================================================================
// 코일이 각속도 ω 로 돌면 기전력은 ε = NBAω · cos θ 다(θ 는 한 도선의 굴대 둘레 각,
// 도선이 극 쪽을 지나며 자기장을 가장 빨리 가로지를 때 θ = 0 · π). 회로가 닫히면
// 전류 I = ε / (R + r) 가 흐르고, 자기장이 그 전류에 거는 힘이 돌림을 거스른다:
//
//   τ_전자기 = NBA · I · cos θ = (NBA)² ω cos² θ / (R + r)
//
// 손이 같은 빠르기를 지키려면 마찰 τ_f 에 이것까지 더한 돌림힘을 내야 한다. 손잡이
// 팔 L 에서 미는 힘은 F = (τ_f + τ_전자기) / L. 한 바퀴 평균으로 τ_전자기 · ω 는 전구가
// 쓰는 전력 ε² / (R + r) 과 같다 — 손의 일이 전기가 된다.
//
// 모든 것이 시각의 함수라 상태를 쌓지 않는다. 필라멘트의 온기도 1차 지연의 해석해로
// 시각에서 바로 구한다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  COIL_AREA,
  COIL_RESISTANCE,
  CRANK_ARM,
  FIELD_B,
  FILAMENT_LAG,
  FORCE_TO_WORLD,
  FRICTION_TORQUE,
  LIGHT_GAIN,
  LOAD_RESISTANCE,
  TURNS,
  TURNS_PER_SECOND,
} from './schema';
import type { GeneratorState } from './state';

export interface GeneratorConstants {
  turnsPerSecond: number;
  fieldB: number;
  turns: number;
  coilArea: number;
  loadResistance: number;
  coilResistance: number;
  frictionTorque: number;
  crankArm: number;
  filamentLag: number;
  forceToWorld: number;
  lightGain: number;
}

export function readConstants(stage: StageDef): GeneratorConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    turnsPerSecond: c.turnsPerSecond ?? TURNS_PER_SECOND,
    fieldB: c.fieldB ?? FIELD_B,
    turns: c.turns ?? TURNS,
    coilArea: c.coilArea ?? COIL_AREA,
    loadResistance: c.loadResistance ?? LOAD_RESISTANCE,
    coilResistance: c.coilResistance ?? COIL_RESISTANCE,
    frictionTorque: c.frictionTorque ?? FRICTION_TORQUE,
    crankArm: c.crankArm ?? CRANK_ARM,
    filamentLag: c.filamentLag ?? FILAMENT_LAG,
    forceToWorld: c.forceToWorld ?? FORCE_TO_WORLD,
    lightGain: c.lightGain ?? LIGHT_GAIN,
  };
}

/** 각속도(rad/s). */
export function omegaOf(c: GeneratorConstants): number {
  return 2 * Math.PI * c.turnsPerSecond;
}

/**
 * 조각 시계 t 에서 첫 도선의 각(라디안, 월드 +x 에서 반시계). 빠르기가 늘 같으므로
 * 시계의 함수다 — 주기가 넘어가도 이어진다.
 */
export function coilAngle(t: number, c: GeneratorConstants): number {
  return omegaOf(c) * t;
}

/** 지금 회로가 닫혀 있는지 — 시간표 단계가 정한다. */
export function isClosed(tl: TimelineFrame): boolean {
  return tl.phase === 'closed';
}

/**
 * 첫 도선의 전류 몫 −1~1. 양수면 화면 밖으로(⊙), 음수면 화면 안으로(⊗).
 *
 * 자기장은 N(왼쪽) → S(오른쪽), 코일은 반시계로 돈다. 각 θ 의 도선 속도는
 * rω(−sin θ, cos θ) 이고 v × B 의 화면 밖 성분이 −cos θ 다. 둘째 도선(θ + π)은 부호가 반대.
 */
export function currentShare(theta: number): number {
  return -Math.cos(theta);
}

/** 손잡이를 미는 힘(N). 열려 있으면 마찰만, 닫히면 전자기 돌림힘이 더해진다. */
export function crankForce(theta: number, closed: boolean, c: GeneratorConstants): number {
  const nba = c.turns * c.fieldB * c.coilArea;
  const cos = Math.cos(theta);
  const em = closed ? (nba * nba * omegaOf(c) * cos * cos) / (c.loadResistance + c.coilResistance) : 0;
  return (c.frictionTorque + em) / c.crankArm;
}

/** 손잡이 힘 → 화살표 길이(월드). */
export function forceLength(force: number, c: GeneratorConstants): number {
  return force * c.forceToWorld;
}

/**
 * 닫힌 동안 필라멘트가 따라가려는 온기 — 전력 비 cos² θ 를 지연 τ 로 늦춘 정상 해.
 *   b_ss = 1/2 + (1/2) · cos(2θ − φ) / √(1 + (2ωτ)²),  φ = atan(2ωτ)
 */
function steadyWarmth(t: number, c: GeneratorConstants): number {
  const k = 2 * omegaOf(c) * c.filamentLag;
  return 0.5 + (0.5 * Math.cos(2 * coilAngle(t, c) - Math.atan(k))) / Math.sqrt(1 + k * k);
}

/**
 * 스위치가 닫힌 시각 t0 부터 t 까지 데워진 온기. 닫히는 순간의 온기는 0 으로 둔다 —
 * 앞선 열림 단계 동안 e^(−열림 길이/τ) 까지 식었으므로(기본값에서 e^−10).
 */
function warmthSinceClose(t: number, t0: number, c: GeneratorConstants): number {
  if (c.filamentLag <= 0) {
    const cos = Math.cos(coilAngle(t, c));
    return cos * cos;
  }
  return steadyWarmth(t, c) - steadyWarmth(t0, c) * Math.exp(-(t - t0) / c.filamentLag);
}

/**
 * 필라멘트의 온기 0~1 (한 바퀴 평균 0.5). 닫힌 동안 데워지고, 열리면 지연 τ 로 식는다.
 * 전구 빛의 세기가 이것을 따른다.
 */
export function filamentWarmth(tl: TimelineFrame, c: GeneratorConstants): number {
  const cycleStart = tl.t - tl.u;
  const closedStart = cycleStart + tl.start('closed');
  if (isClosed(tl)) return warmthSinceClose(tl.t, closedStart, c);
  // 가장 최근에 끝난 닫힘 단계 — 이번 주기 것이 아직 오지 않았으면 앞 주기 것.
  const span = tl.duration('closed');
  const lastStart = closedStart + span <= tl.t ? closedStart : closedStart - tl.period;
  const lastEnd = lastStart + span;
  if (c.filamentLag <= 0) return 0;
  return warmthSinceClose(lastEnd, lastStart, c) * Math.exp(-(tl.t - lastEnd) / c.filamentLag);
}

/** 온기 → 빛의 세기(0~1). 빛 채널이 1 까지뿐이라 넘치면 자른다. */
export function bulbLight(warmth: number, c: GeneratorConstants): number {
  return Math.min(1, Math.max(0, warmth * c.lightGain));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: GeneratorState }): GeneratorState {
  return params.state;
}
