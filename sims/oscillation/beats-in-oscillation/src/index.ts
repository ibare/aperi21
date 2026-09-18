// ========================================================================
// @aperi21/sim-beats-in-oscillation
// ========================================================================
// 진동수가 조금 다른 두 용수철 추를 막대로 이으면 가운데 점의 흔들림이 부풀었다
// 잦아든다. 진동수 차이가 절반인 쌍은 그 부풂이 두 배 느리다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { beatsInOscillationSchema } from './schema';
import { initialState, type BeatsInOscillationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const beatsInOscillationBundle: Bundle<BeatsInOscillationState> = {
  schema: beatsInOscillationSchema,
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
