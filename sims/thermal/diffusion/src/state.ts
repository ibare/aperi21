// ========================================================================
// diffusion — 상태
// ========================================================================
// 쌓는 것이 없다. 모든 걸음을 여기서 시드로 한 번 미리 걸어 두고, 화면은 걸음 번호로
// 읽기만 한다 (S-sim — 같은 시각은 같은 화면). 캡션에 끼우는 수는 없다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { pickTracked, readConstants, walkAll } from './physics';

export interface DiffusionState {
  /** 걸음 번호마다 `[x0, y0, x1, y1, …]`. 0 번이 떨어뜨린 순간이다. */
  frames: readonly (readonly number[])[];
  /** 경로를 따라 보이는 알갱이 번호. */
  tracked: number;
}

export function initialState(params: { stage: StageDef }): DiffusionState {
  const c = readConstants(params.stage);
  const frames = walkAll(c);
  return { frames, tracked: pickTracked(frames[0]!) };
}
