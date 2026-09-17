// ========================================================================
// @aperi21/sim-gyroscopic-precession
// ========================================================================
// 무게가 만드는 돌림힘은 L 끝에 늘 옆으로 더해지므로, 축은 떨어지지 않고 L 은 길이 그대로
// 방향만 돈다. 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/gyroscopic-precession).
// 자유 렌더 없이 선언만으로 옮겼다 — 3 차원 투영은 조각이 좌표로 계산한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { gyroscopicPrecessionSchema } from './schema';
import { initialState, type GyroscopicPrecessionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const gyroscopicPrecessionBundle: Bundle<GyroscopicPrecessionState> = {
  schema: gyroscopicPrecessionSchema,
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
