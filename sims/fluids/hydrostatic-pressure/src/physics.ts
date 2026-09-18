// ========================================================================
// hydrostatic-pressure — 순수 물리
// ========================================================================
// 정지한 물 속 깊이 d 에서 물이 누르는 압력(계기압)은
//   p = ρ · g · d
// 하나뿐이다. d 가 두 배면 p 도 두 배 — 이 조각이 보이는 것은 이 정비례다.
// 대기압은 더하지 않는다. 수면에서 0 이 되어야 쐐기가 원점(수면)에서 출발한다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { DEPTH_UNIT, G, RHO, STOP_1, STOP_2 } from './schema';
import type { HydrostaticPressureState } from './state';

export interface HydrostaticPressureConstants {
  /** 물의 밀도(kg/m³). */
  rho: number;
  /** 중력 가속도(m/s²). */
  g: number;
  /** 깊이 한 칸 h(m). */
  depthUnit: number;
  /** 첫 번째 · 두 번째로 멈추는 깊이(h 의 배수). */
  stop1: number;
  stop2: number;
}

export function readConstants(stage: StageDef): HydrostaticPressureConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    rho: c.rho ?? RHO,
    g: c.g ?? G,
    depthUnit: c.depthUnit ?? DEPTH_UNIT,
    stop1: c.stop1 ?? STOP_1,
    stop2: c.stop2 ?? STOP_2,
  };
}

/** 깊이 d(m)에서 물이 누르는 압력(Pa). */
export function pressureAt(depth: number, c: HydrostaticPressureConstants): number {
  return c.rho * c.g * depth;
}

export interface SensorReading {
  /** 센서 중심의 깊이(m, 수면에서 아래로 양수). */
  depth: number;
  /** 그 깊이의 압력(Pa). */
  pressure: number;
  /** 첫 번째 멈춤 깊이를 지났는가 — 그 자리의 화살표를 잔상으로 남길 조건이다. */
  passedStop1: boolean;
}

/**
 * 센서를 읽는다. **단계 경계는 선언이 정한다** — 내려가는 두 구간의 진행도를
 * `timeline.at` 에게 묻는다 (S-piece 「시간표는 선언이다」). 멈춘 단계에서는 진행도가
 * 0 이나 1 에 머물러 깊이가 저절로 그대로다 — 분기가 필요 없다.
 */
export function readSensor(tl: TimelineFrame, c: HydrostaticPressureConstants): SensorReading {
  const steps = c.stop1 * tl.at('descend-1') + (c.stop2 - c.stop1) * tl.at('descend-2');
  const depth = c.depthUnit * steps;
  return {
    depth,
    pressure: pressureAt(depth, c),
    passedStop1: tl.at('descend-1') >= 1,
  };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 수면에서 다시 시작한다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: HydrostaticPressureState }): HydrostaticPressureState {
  return params.state;
}
