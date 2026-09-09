import type { EnvironmentDef, StageDef } from '@aperi21/schema';

/**
 * 한 점의 유체 조건과 판. 전부 stage 상수에서 온다 (원칙 2).
 * 단위는 SI — ρ [kg/m³] · g [m/s²] · depth [m] · area [m²].
 */
export interface PlateSetup {
  readonly rho: number;
  readonly g: number;
  readonly depth: number;
  readonly area: number;
}

export interface PressureIsotropyState {
  /**
   * 판의 방향. 0° 는 수평이고, 판은 두께 없는 면이라 방향은 180° 주기다 —
   * 0..180° 가 판이 가질 수 있는 방향 전부다.
   *
   * `angle-dial` 컨트롤러가 `plate.thetaDeg` 경로에 직접 쓴다.
   */
  plate: { thetaDeg: number };

  /** 자동 회전이 지금까지 쓸고 지나간 각(도). 자취의 길이이기도 하다. */
  sweptDeg: number;

  setup: PlateSetup;
}

/** 자동 회전이 끝나는 각. 판의 방향은 180° 주기라 이것이 한 바퀴다. */
export const SWEEP_END_DEG = 180;

/** 자동 회전 속도. 180° 를 6 초에 지난다. */
export const SWEEP_RATE_DEG_PER_S = 30;

/** stage 상수를 읽는다. 값이 비면 물의 기본 조건으로 되돌린다. */
export function readSetup(stage: StageDef): PlateSetup {
  const c = stage.constants;
  return {
    rho: c['rho'] ?? 1000,
    g: c['g'] ?? 9.8,
    depth: c['depth'] ?? 0.2,
    area: c['area'] ?? 0.0001,
  };
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): PressureIsotropyState {
  return {
    plate: { thetaDeg: 0 },
    sweptDeg: 0,
    setup: readSetup(params.stage),
  };
}
