// ========================================================================
// @aperi21/sim-de-broglie-wavelength
// ========================================================================
// 같은 전자를 두 배 빠르게 하면 물질파의 파장이 절반이 된다 — 빨라지는
// 동안 물결 간격이 좁아지고, 위 물결 하나에 아래 물결 둘이 들어간다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { deBroglieWavelengthSchema } from './schema';
import { initialState, type DeBroglieWavelengthState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const deBroglieWavelengthBundle: Bundle<DeBroglieWavelengthState> = {
  schema: deBroglieWavelengthSchema,
  initialState,
  step,
  scene,
  controllers,
  boundsHint,
};

export * from './schema';
export * from './state';
export * from './physics';
export * from './scene';
export * from './controllers';
