// ========================================================================
// @aperi21/sim-net-force
// ========================================================================
// 여러 힘은 끝과 끝으로 이어 붙인 화살표 하나로 모이고, 물체는 가장 센 힘이
// 아니라 그 하나의 방향으로 빨라진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/net-force).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { netForceSchema } from './schema';
import { initialState, type NetForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const netForceBundle: Bundle<NetForceState> = {
  schema: netForceSchema,
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
