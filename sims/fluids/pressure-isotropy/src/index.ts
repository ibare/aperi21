import type { Bounds, Bundle } from '@aperi21/schema';
import { pressureIsotropySchema } from './schema';
import { initialState, type PressureIsotropyState } from './state';
import { isSweepComplete, step } from './physics';
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

export const pressureIsotropyBundle: Bundle<PressureIsotropyState> = {
  schema: pressureIsotropySchema,
  initialState,
  step: (params) => step({ state: params.state, dt: params.dt }),
  scene,
  controllers,
  isTerminated: isSweepComplete,
  boundsHint,
};
