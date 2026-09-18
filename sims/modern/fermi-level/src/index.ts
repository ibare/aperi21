// ========================================================================
// @aperi21/sim-fermi-level
// ========================================================================
// 채워진 데까지의 경계 — 절대 0도의 날카로운 페르미 준위가 온도를 올리면 kT 폭으로
// 무뎌진다. 자유 구현 원본 없이 엔진 어휘로 곧바로 지었다 (NOTES.md).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { fermiLevelSchema } from './schema';
import { initialState, type FermiLevelState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const fermiLevelBundle: Bundle<FermiLevelState> = {
  schema: fermiLevelSchema,
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
