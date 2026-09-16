// ========================================================================
// @aperi21/sim-uniform-motion
// ========================================================================
// "속도가 변하지 않는다" 는 말은 눈으로 보면 무엇인가 — 1초마다 자국 하나가
// 찍히고, 자국과 자국 사이가 모두 같다. 그 간격을 떼어내 아래에 왼쪽을 맞춰
// 쌓으면 여섯 개의 오른쪽 끝이 한 줄로 맞는다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/uniform-motion).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { uniformMotionSchema } from './schema';
import { initialState, type UniformMotionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const uniformMotionBundle: Bundle<UniformMotionState> = {
  schema: uniformMotionSchema,
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
