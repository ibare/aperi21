// ========================================================================
// @aperi21/sim-focal-length
// ========================================================================
// 물체도 렌즈도 그대로인데 상이 맺히는 자리를 정하는 것은 무엇인가 — 렌즈의 초점
// 거리다. 물체를 못박아 둔 채 초점 거리만 줄이면 초점 표식 F 가 렌즈 쪽으로 다가오고
// 상도 함께 다가오며, 늘리면 둘이 함께 물러난다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from "@aperi21/schema";

import { focalLengthSchema } from "./schema";
import { initialState, type FocalLengthState } from "./state";
import { step } from "./physics";
import { boundsHint, scene } from "./scene";
import { controllers } from "./controllers";

export const focalLengthBundle: Bundle<FocalLengthState> = {
  schema: focalLengthSchema,
  initialState,
  step,
  scene,
  controllers,
  boundsHint,
};

export * from "./schema";
export * from "./state";
export * from "./physics";
export * from "./scene";
export * from "./controllers";
