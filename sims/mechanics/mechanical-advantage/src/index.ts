// ========================================================================
// @aperi21/sim-mechanical-advantage
// ========================================================================
// 같은 상자를 같은 높이로 — 지레와 빗면은 드는 힘을 줄이지만, 줄어든 만큼 손은 더
// 긴 거리를 민다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/mechanical-advantage).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { mechanicalAdvantageSchema } from './schema';
import { initialState, type MechanicalAdvantageState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const mechanicalAdvantageBundle: Bundle<MechanicalAdvantageState> = {
  schema: mechanicalAdvantageSchema,
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
