// ========================================================================
// @aperi21/sim-simple-harmonic-motion
// ========================================================================
// 변위에 비례해 되미는 힘이 운동을 사인 곡선으로 만든다 — 추의 오르내림을 펜이
// 옆으로 나아가며 적으면 사인이 펼쳐지고, 1/8 주기마다 남긴 힘 화살표가 곡선이
// 축에서 멀수록 세게 휜다는 것을 보인다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { simpleHarmonicMotionSchema } from './schema';
import { initialState, type SimpleHarmonicMotionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const simpleHarmonicMotionBundle: Bundle<SimpleHarmonicMotionState> = {
  schema: simpleHarmonicMotionSchema,
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
