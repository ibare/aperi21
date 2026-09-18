// ========================================================================
// @aperi21/sim-doppler-source-vs-observer
// ========================================================================
// 같은 빠르기로 다가가도 누가 움직이느냐에 따라 결과가 다르다 — 음원이 움직이면
// 파장 자체가 짧아지고, 관찰자가 움직이면 파장은 그대로인데 만나는 빈도만 는다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { dopplerSourceVsObserverSchema } from './schema';
import { initialState, type DopplerSourceVsObserverState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const dopplerSourceVsObserverBundle: Bundle<DopplerSourceVsObserverState> = {
  schema: dopplerSourceVsObserverSchema,
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
