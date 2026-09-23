import type { Bundle } from "@aperi21/schema";

import { seriesParallelResistorsSchema } from "./schema";
import { initialState, type SeriesParallelResistorsState } from "./state";
import { step } from "./physics";
import { boundsHint, scene } from "./scene";
import { controllers } from "./controllers";

export const seriesParallelResistorsBundle: Bundle<SeriesParallelResistorsState> = {
  schema: seriesParallelResistorsSchema,
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
