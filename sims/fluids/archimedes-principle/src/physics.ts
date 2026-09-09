// ========================================================================
// archimedes-principle — 순수 물리
// ========================================================================
// DOM·캔버스·시간을 모른다. 난수도 쓰지 않는다 (S-sim).
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import type { ArchimedesPrincipleState } from './state';

/** 스테이지 선언에서 읽어 온 상수. 코드에는 키와 기본값만 남는다 (원칙 2). */
export interface ArchimedesConstants {
  /** 중력 가속도 (m/s²). */
  g: number;
  /** 물의 밀도 (kg/m³). */
  rhoWater: number;
  /** 물체의 질량 (kg). */
  objectMass: number;
  /** 물체의 부피 (m³). */
  objectVolume: number;
  /** 수면에 닿기까지 걸리는 시간 (s). */
  approachSeconds: number;
  /** 완전히 잠기기까지 걸리는 시간 (s). */
  submergeSeconds: number;
}

export function readConstants(stage: StageDef): ArchimedesConstants {
  const c = stage.constants;
  return {
    g: c['g'] ?? 9.8,
    rhoWater: c['rhoWater'] ?? 1000,
    objectMass: c['objectMass'] ?? 2.0,
    objectVolume: c['objectVolume'] ?? 0.001,
    approachSeconds: c['approachSeconds'] ?? 1.2,
    submergeSeconds: c['submergeSeconds'] ?? 4.6,
  };
}

/** 어느 한 순간의 두 저울 눈금과 그 사이의 관계. */
export interface ArchimedesReadings {
  /** 잠긴 정도 0..1. */
  submersion: number;
  /** 공기 중 무게 (N). */
  weightInAir: number;
  /** 밀려난 물의 부피 (m³). */
  displacedVolume: number;
  /** 밀려난 물의 질량 (kg). */
  displacedMass: number;
  /** 부력 (N). */
  buoyancy: number;
  /** 물속 겉보기 무게 (N) — 물체 쪽 저울이 가리키는 값. */
  apparentWeight: number;
  /** 넘쳐서 컵에 모인 물의 무게 (N) — 넘친 물 쪽 저울이 가리키는 값. */
  spilledWeight: number;
  /** 물체 쪽 저울이 잃은 양 (N). `spilledWeight` 와 항상 같다. */
  weightLost: number;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * 이 조각의 전부다.
 *
 *   밀려난 부피 = 잠긴 부피        (물이 들어갈 자리가 없으니 그만큼 넘친다)
 *   부력        = ρ·V_disp·g       = 넘친 물의 무게
 *   겉보기 무게 = m·g − 부력
 *
 * 따라서 `weightLost === spilledWeight` 가 잠긴 정도와 무관하게 매 순간 성립한다.
 */
export function deriveReadings(
  submersion: number,
  c: ArchimedesConstants,
): ArchimedesReadings {
  const f = clamp01(submersion);
  const displacedVolume = f * c.objectVolume;
  const displacedMass = c.rhoWater * displacedVolume;
  const buoyancy = displacedMass * c.g;
  const weightInAir = c.objectMass * c.g;
  const apparentWeight = weightInAir - buoyancy;
  return {
    submersion: f,
    weightInAir,
    displacedVolume,
    displacedMass,
    buoyancy,
    apparentWeight,
    spilledWeight: displacedMass * c.g,
    weightLost: weightInAir - apparentWeight,
  };
}

/** 컵에 고인 물의 수면 높이 (m). 컵의 바닥 넓이로 부피를 나눈 것. */
export function deriveCupLevel(
  displacedVolume: number,
  cup: { bottom: number; width: number; depth: number },
): number {
  const area = cup.width * cup.depth;
  return cup.bottom + (area > 0 ? displacedVolume / area : 0);
}

/** 물줄기 굵기가 따라붙는 속도 (1/s). 값이 튀지 않게 하는 완화 계수. */
const FLOW_RESPONSE = 8;

/**
 * 한 스텝 전진. 순수 함수.
 *
 * 자동 진행이 기본이고, 읽는 사람이 슬라이더로 `submersion` 을 직접 바꾼 순간
 * (`submersion !== autoSubmersion`) 부터는 그 손을 따른다.
 */
export function step(params: {
  state: ArchimedesPrincipleState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): ArchimedesPrincipleState {
  const { state, dt, stage } = params;
  const c = readConstants(stage);

  const scrubbed = state.submersion !== state.autoSubmersion;
  const manual = state.manual || scrubbed;

  const t = state.t + dt;
  let approach: number;
  let submersion: number;

  if (manual) {
    approach = 1;
    submersion = clamp01(state.submersion);
  } else {
    approach = c.approachSeconds > 0 ? clamp01(t / c.approachSeconds) : 1;
    submersion =
      c.submergeSeconds > 0
        ? clamp01((t - c.approachSeconds) / c.submergeSeconds)
        : t >= c.approachSeconds
          ? 1
          : 0;
  }

  // 넘치는 기세 = 잠기는 속도. 멈춰 있으면 물도 넘치지 않는다.
  // 직전 프레임에 물리가 남긴 자리(autoSubmersion)와 견준다 — 슬라이더가
  // state.submersion 을 직접 고쳐 쓰므로 그것과 비교하면 손으로 끌 때의
  // 움직임이 통째로 사라진다.
  const nominalRate = c.submergeSeconds > 0 ? 1 / c.submergeSeconds : 1;
  const rate = dt > 0 ? (submersion - state.autoSubmersion) / dt : 0;
  const target = Math.max(-1, Math.min(1, nominalRate > 0 ? rate / nominalRate : 0));
  const k = Math.min(1, dt * FLOW_RESPONSE);
  const flow = state.flow + (target - state.flow) * k;

  return { t, approach, submersion, autoSubmersion: submersion, manual, flow };
}

/** 에너지 뷰 등 프레임워크 공통 뷰를 위한 파생값. */
export function derivedValues(
  state: ArchimedesPrincipleState,
  stage: StageDef,
): Record<string, number> {
  const r = deriveReadings(state.submersion, readConstants(stage));
  return {
    weightInAir: r.weightInAir,
    buoyancy: r.buoyancy,
    apparentWeight: r.apparentWeight,
    spilledWeight: r.spilledWeight,
    weightLost: r.weightLost,
    displacedMass: r.displacedMass,
  };
}
