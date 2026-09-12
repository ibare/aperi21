// ========================================================================
// @aperi21/sim-doppler-effect
// ========================================================================
// 파면은 언제나 같은 빠르기로 같은 주기마다 퍼지는데, 원천이 자기 방출점을 앞으로
// 밀고 가기 때문에 앞쪽에서만 파면 사이가 좁아지고 뒤쪽은 벌어진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/doppler-effect).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { dopplerEffectSchema } from './schema';
import { initialState, type DopplerEffectState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const dopplerEffectBundle: Bundle<DopplerEffectState> = {
  schema: dopplerEffectSchema,
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
