// ========================================================================
// @aperi21/sim-impulse-momentum-theorem
// ========================================================================
// 충격량-운동량 정리 — 벽이 미는 힘-시간 넓이(J)가 쌓이는 만큼 공의 운동량
// 화살표가 옮겨 간다. 넓이가 처음 운동량만큼 쌓인 순간 공이 멈추고, 그 뒤의
// 넓이는 운동량을 반대로 키운다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { impulseMomentumTheoremSchema } from './schema';
import { initialState, type ImpulseMomentumTheoremState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const impulseMomentumTheoremBundle: Bundle<ImpulseMomentumTheoremState> = {
  schema: impulseMomentumTheoremSchema,
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
