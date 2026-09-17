// ========================================================================
// @aperi21/sim-thin-film-interference
// ========================================================================
// 두께가 바뀌면 간섭으로 지워지는 파장이 옮겨 가고, 남은 빛이 그 자리의 색이 된다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/thin-film-interference).
// 자유 렌더 없이 선언만으로 옮겼다. 빛의 색은 어휘가 없어 밝기로 근사했다 (NOTES.md).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { thinFilmInterferenceSchema } from './schema';
import { initialState, type ThinFilmInterferenceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const thinFilmInterferenceBundle: Bundle<ThinFilmInterferenceState> = {
  schema: thinFilmInterferenceSchema,
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
