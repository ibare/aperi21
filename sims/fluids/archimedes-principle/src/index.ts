// ========================================================================
// @aperi21/sim-archimedes-principle
// ========================================================================
// 질문: 부력은 왜 하필 밀려난 물의 무게와 같은가.
//
// 물이 주둥이까지 가득한 그릇에는 새로 들어갈 자리가 없다. 물체를 담그면
// 잠긴 부피만큼 물이 그대로 주둥이로 넘어간다. 그래서 물체 쪽 저울이 잃는
// 무게와 넘친 물 쪽 저울이 얻는 무게가, 절반쯤 잠긴 중간에서도, 매 순간 같다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { archimedesPrincipleSchema } from './schema';
import { initialState, type ArchimedesPrincipleState } from './state';
import { derivedValues, step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const archimedesPrincipleBundle: Bundle<ArchimedesPrincipleState> = {
  schema: archimedesPrincipleSchema,
  initialState,
  step,
  scene,
  controllers,
  derivedValues,
  boundsHint,
};

export {
  ARCHIMEDES_PRINCIPLE_ID,
  ARCHIMEDES_PRIMITIVE_TYPES,
  ARCHIMEDES_Z_HINTS,
  archimedesPrincipleMessages,
  archimedesPrincipleSchema,
} from './schema';
export type {
  ArchimedesMessageKey,
  ArchimedesPrimitive,
  DialScalePrimitive,
  WaterStreamPrimitive,
  WaterVolumePrimitive,
} from './schema';

export { initialState } from './state';
export type { ArchimedesPrincipleState } from './state';

export {
  clamp01,
  deriveCupLevel,
  deriveReadings,
  derivedValues,
  readConstants,
  step,
} from './physics';
export type { ArchimedesConstants, ArchimedesReadings } from './physics';

export { ARCHIMEDES_LAYOUT, blockBottomY, boundsHint, scene } from './scene';
export { controllers } from './controllers';

// 자유 렌더 계층. 호스트가 등록한다 — NOTES.md 「등록」 참고.
export {
  archimedesPrincipleRenderers,
  archimedesPrincipleStagePlugin,
  renderDialScale,
  renderWaterStream,
  renderWaterVolume,
} from './archimedes-principle-stage';
