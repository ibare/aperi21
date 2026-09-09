// ========================================================================
// pressure-and-container-shape — 순수 물리
// ========================================================================
// 이 파일은 DOM · 캔버스 · 시간을 모른다. 상태와 dt 를 받아 다음 상태를 낸다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import {
  FILL_RATE,
  GRAVITY,
  TARGET_LEVEL_RANGE,
  VESSEL_SHAPES,
  WATER_DENSITY,
} from './schema';
import type { PressureAndContainerShapeState, VesselState } from './state';

/** 폭 계산에 필요한 최소 형상. VesselShape 와 VesselPrimitive 둘 다 만족한다. */
export interface VesselProfile {
  bottomWidth: number;
  topWidth: number;
  wallHeight: number;
}

/** 부피 계산에는 깊이가 더 필요하다. */
export interface VesselVolumeProfile extends VesselProfile {
  depth: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** 단면 폭이 높이에 따라 변하는 기울기 (m/m). */
export function widthSlope(shape: VesselProfile): number {
  return (shape.topWidth - shape.bottomWidth) / shape.wallHeight;
}

/** 높이 y 에서의 단면 폭 (m). */
export function widthAtHeight(shape: VesselProfile, y: number): number {
  return Math.max(0, shape.bottomWidth + widthSlope(shape) * clamp(y, 0, shape.wallHeight));
}

/** 바닥 넓이 (m²). 셋 다 같다 — 이 조각의 전제. */
export function bottomArea(shape: VesselVolumeProfile): number {
  return shape.depth * shape.bottomWidth;
}

/** 셋이 공유하는 바닥 넓이 (m²). 이 조각의 전제를 한 줄로 꺼내 쓴다. */
export function commonBottomArea(): number {
  const first = VESSEL_SHAPES[0];
  return first ? bottomArea(first) : 0;
}

/** 수면 높이 level 까지 담긴 물의 부피 (m³). */
export function volumeAtLevel(shape: VesselVolumeProfile, level: number): number {
  const y = clamp(level, 0, shape.wallHeight);
  return shape.depth * (shape.bottomWidth * y + (widthSlope(shape) * y * y) / 2);
}

/** volumeAtLevel 의 역함수 — 부피에서 수면 높이 (m) 를 되찾는다. */
export function levelAtVolume(shape: VesselVolumeProfile, volume: number): number {
  const v = Math.max(0, volume);
  const s = widthSlope(shape);
  if (Math.abs(s) < 1e-9) {
    return v / (shape.depth * shape.bottomWidth);
  }
  const disc = shape.bottomWidth * shape.bottomWidth + (2 * s * v) / shape.depth;
  const root = Math.sqrt(Math.max(0, disc));
  return (-shape.bottomWidth + root) / s;
}

/** 바닥 계기압 (Pa). 그릇 모양이 인자에 없다 — 그것이 이 조각의 답이다. */
export function bottomPressure(rho: number, g: number, level: number): number {
  return rho * g * level;
}

/** stage.constants 에서 상수를 꺼낸다. 비어 있으면 선언의 기본값. */
export function readConstants(stage: StageDef): { rho: number; g: number; fillRate: number } {
  return {
    rho: stage.constants['rho'] ?? WATER_DENSITY,
    g: stage.constants['g'] ?? GRAVITY,
    fillRate: stage.constants['fillRate'] ?? FILL_RATE,
  };
}

/** 목표 수면 높이를 선언된 범위 안으로 가둔다. */
export function clampTargetHeight(h: number): number {
  return clamp(Number.isFinite(h) ? h : TARGET_LEVEL_RANGE[0], TARGET_LEVEL_RANGE[0], TARGET_LEVEL_RANGE[1]);
}

/** 부피가 목표와 같다고 볼 허용 오차 (m³). 0.01 mL. */
const VOLUME_EPSILON = 1e-8;

/**
 * 그릇 하나를 한 스텝 채우거나 뺀다. 세 그릇이 **같은 유량**을 받으므로
 * 수면이 오르는 속도는 모양마다 다르고, 목표에 이르는 시각도 다르다.
 */
export function stepVessel(
  vessel: VesselState,
  shape: VesselVolumeProfile,
  targetHeight: number,
  dt: number,
  rho: number,
  g: number,
  fillRate: number,
): VesselState {
  const targetVolume = volumeAtLevel(shape, targetHeight);
  const budget = fillRate * Math.max(0, dt);
  const gap = targetVolume - vessel.volume;
  const volume = vessel.volume + clamp(gap, -budget, budget);
  const level = levelAtVolume(shape, volume);
  return {
    id: vessel.id,
    volume,
    level,
    pressure: bottomPressure(rho, g, level),
    atTarget: Math.abs(targetVolume - volume) <= VOLUME_EPSILON,
  };
}

/** Bundle.step — 순수 함수. */
export function step(params: {
  state: PressureAndContainerShapeState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): PressureAndContainerShapeState {
  const { state, dt, stage } = params;
  const { rho, g, fillRate } = readConstants(stage);
  const targetHeight = clampTargetHeight(state.targetHeight);
  const t = state.t + Math.max(0, dt);

  const vessels = state.vessels.map((vessel) => {
    const shape = VESSEL_SHAPES.find((s) => s.id === vessel.id);
    if (!shape) return vessel;
    return stepVessel(vessel, shape, targetHeight, dt, rho, g, fillRate);
  });

  const leveled = vessels.every((v) => v.atTarget);
  const leveledAt = leveled ? (state.leveledAt ?? t) : null;

  return { t, targetHeight, vessels, leveled, leveledAt };
}

/** 파생값 — 호스트 공통 뷰·디버깅용. */
export function derivedValues(
  state: PressureAndContainerShapeState,
  stage: StageDef,
): Record<string, number> {
  const { rho, g } = readConstants(stage);
  const out: Record<string, number> = {
    targetHeight: state.targetHeight,
    pressureAtTarget: bottomPressure(rho, g, state.targetHeight),
  };
  for (const v of state.vessels) {
    out[`level.${v.id}`] = v.level;
    out[`volume.${v.id}`] = v.volume;
    out[`pressure.${v.id}`] = v.pressure;
  }
  return out;
}
