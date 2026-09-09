import type { Bounds, Bundle, StageDef } from '@aperi21/schema';
import { pressureIsotropySchema } from './schema';
import { initialState, type PressureIsotropyState } from './state';
import { deriveForce, isSweepComplete, step, toRadians } from './physics';
import { scene } from './scene';
import { controllers } from './controllers';

export * from './schema';
export * from './state';
export * from './physics';
export * from './scene';
export * from './controllers';

/**
 * 카메라 프레이밍. 상태와 무관하게 고정한다 — 자취가 자라는 동안 화면이
 * 흔들리면 안 된다 (원칙 6). 값은 scene.ts 의 표시 좌표계와 같은 단위다.
 */
function boundsHint(): Bounds {
  return { minX: -1.5, maxX: 1.5, minY: -1.25, maxY: 2.5 };
}

function derivedValues(state: PressureIsotropyState, _stage: StageDef): Record<string, number> {
  const f = deriveForce(state.setup, toRadians(state.plate.thetaDeg));
  return {
    pressure: f.pressure,
    forceX: f.fx,
    forceY: f.fy,
    forceMagnitude: f.magnitude,
    thetaDeg: state.plate.thetaDeg,
  };
}

export const pressureIsotropyBundle: Bundle<PressureIsotropyState> = {
  schema: pressureIsotropySchema,
  initialState,
  step: (params) => step({ state: params.state, dt: params.dt }),
  scene,
  controllers,
  isTerminated: isSweepComplete,
  derivedValues,
  boundsHint,
};
