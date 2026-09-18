// ========================================================================
// @aperi21/sim-quantum-tunneling
// ========================================================================
// 터널 효과 — 장벽보다 에너지가 낮은 파동 묶음이 대부분 되튀지만, 장벽 안에서 지수로
// 줄어든 만큼 일부가 너머에 나타난다. 두께가 d 와 2d 인 두 레인이 나란히 견준다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { quantumTunnelingSchema } from './schema';
import { initialState, type QuantumTunnelingState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const quantumTunnelingBundle: Bundle<QuantumTunnelingState> = {
  schema: quantumTunnelingSchema,
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
