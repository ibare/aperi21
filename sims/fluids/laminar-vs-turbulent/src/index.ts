// ========================================================================
// @aperi21/sim-laminar-vs-turbulent
// ========================================================================
// 흐름은 왜 서서히가 아니라 어느 순간 갑자기 흐트러지는가.
//
// 원본은 엔진 없이 손으로 짠 607줄이었다 (tasks/piece-lab/laminar-vs-turbulent).
// 거기서 발견한 vortexField · filament 가 코어 어휘가 되면서 선언만 남았다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { laminarVsTurbulentSchema } from './schema';
import { initialState, type LaminarVsTurbulentState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const laminarVsTurbulentBundle: Bundle<LaminarVsTurbulentState> = {
  schema: laminarVsTurbulentSchema,
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
