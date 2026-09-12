// ========================================================================
// @aperi21/sim-beats
// ========================================================================
// 두 음은 각각 줄곧 같은 세기로 흔들리는데, 둘의 발걸음이 어긋났다 되돌아오는
// 그 박자에 맞춰 합쳐진 소리만 커졌다 사라졌다 한다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/beats).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { beatsSchema } from './schema';
import { initialState, type BeatsState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const beatsBundle: Bundle<BeatsState> = {
  schema: beatsSchema,
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
