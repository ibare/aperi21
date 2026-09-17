// ========================================================================
// @aperi21/sim-banked-curve
// ========================================================================
// 마찰 없는 빙판길에서도 기울기를 맞추면, 길이 미는 힘의 안쪽 몫이 돌기에 필요한
// 만큼과 같아져 차가 원을 따라 돈다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/banked-curve).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { bankedCurveSchema } from './schema';
import { initialState, type BankedCurveState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const bankedCurveBundle: Bundle<BankedCurveState> = {
  schema: bankedCurveSchema,
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
