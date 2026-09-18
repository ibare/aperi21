// ========================================================================
// @aperi21/sim-sound-source-vibration
// ========================================================================
// 소리 나는 물체는 떨리고, 떨림이 멎으면 새 소리도 멎는다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다. 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { soundSourceVibrationSchema } from './schema';
import { initialState, type SoundSourceVibrationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const soundSourceVibrationBundle: Bundle<SoundSourceVibrationState> = {
  schema: soundSourceVibrationSchema,
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
