// ========================================================================
// pressure-and-container-shape — 런타임 상태
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { bottomPressure, clampTargetHeight, readConstants } from './physics';
import { REFERENCE_LEVEL, VESSEL_SHAPES, type VesselId } from './schema';

export interface VesselState {
  readonly id: VesselId;
  /** 담긴 물의 부피 (m³). */
  readonly volume: number;
  /** 현재 수면 높이 (m). */
  readonly level: number;
  /** 바닥 계기압 (Pa). */
  readonly pressure: number;
  /** 목표 수면에 이르렀는가. */
  readonly atTarget: boolean;
}

export interface PressureAndContainerShapeState {
  /** 경과 시간 (s). event 프리미티브의 startedAt 기준. */
  readonly t: number;
  /** 세 그릇이 함께 향하는 목표 수면 높이 (m). */
  readonly targetHeight: number;
  readonly vessels: readonly VesselState[];
  /** 셋 다 목표에 이르러 수면이 나란해졌는가. */
  readonly leveled: boolean;
  /** 나란해진 시각 (s). 아직이면 null. */
  readonly leveledAt: number | null;
}

/** Bundle.initialState — 세 그릇 모두 빈 채로 시작해 차오른다. */
export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): PressureAndContainerShapeState {
  const { rho, g } = readConstants(params.stage);
  const targetHeight = clampTargetHeight(params.values['targetHeight'] ?? REFERENCE_LEVEL);
  return {
    t: 0,
    targetHeight,
    vessels: VESSEL_SHAPES.map((shape) => ({
      id: shape.id,
      volume: 0,
      level: 0,
      pressure: bottomPressure(rho, g, 0),
      atTarget: false,
    })),
    leveled: false,
    leveledAt: null,
  };
}
