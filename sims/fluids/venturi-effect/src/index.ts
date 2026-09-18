// ========================================================================
// @aperi21/sim-venturi-effect
// ========================================================================
// 바람이 불면 좁아진 목 아래 관에서만 통의 액체가 빨려 올라가 물방울로 뜯겨 나간다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { venturiEffectSchema } from './schema';
import { initialState, type VenturiEffectState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const venturiEffectBundle: Bundle<VenturiEffectState> = {
  schema: venturiEffectSchema,
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
