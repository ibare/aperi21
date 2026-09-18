// ========================================================================
// @aperi21/sim-two-dimensional-collision
// ========================================================================
// 2차원 충돌 — 비스듬히 부딪쳐 두 공이 갈라져도 운동량은 성분마다 따로 보존된다.
// 오른쪽 장부에서 A 의 성분이 B 로 넘어가며 쪼개지는 동안 x 줄 끝과 y 기둥 끝이
// 처음 합에 머문다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { twoDimensionalCollisionSchema } from './schema';
import { initialState, type TwoDimensionalCollisionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const twoDimensionalCollisionBundle: Bundle<TwoDimensionalCollisionState> = {
  schema: twoDimensionalCollisionSchema,
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
