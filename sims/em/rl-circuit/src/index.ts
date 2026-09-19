// ========================================================================
// @aperi21/sim-rl-circuit
// ========================================================================
// 스위치를 닫아도 코일이 전지 전압을 맡아 버텨, 전류는 단숨에 오르지 못하고 서서히 찬다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다. 자유 렌더 없음.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rlCircuitSchema } from './schema';
import { initialState, type RlCircuitState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rlCircuitBundle: Bundle<RlCircuitState> = {
  schema: rlCircuitSchema,
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
