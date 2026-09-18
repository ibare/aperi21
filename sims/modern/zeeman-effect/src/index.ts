// ========================================================================
// @aperi21/sim-zeeman-effect
// ========================================================================
// 자기장이 없으면 한 줄이던 스펙트럼 선이, 자기장을 걸면 위 준위가 mₗ 에 따라 셋으로
// 갈라지며 세 줄로 벌어지고, 자기장을 키우면 더 벌어진다(정상 제이만 효과).
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { zeemanEffectSchema } from './schema';
import { initialState, type ZeemanEffectState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const zeemanEffectBundle: Bundle<ZeemanEffectState> = {
  schema: zeemanEffectSchema,
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
