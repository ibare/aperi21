import type { StageDef } from '@aperi21/schema';
import { readConstants, solveRayModel, type RayModel } from './physics';

/**
 * 쌓는 것이 없다. 파가 어디까지 갔는지는 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에
 * 넘겨 주는 시각의 함수다 (S-sim).
 *
 * 상태에 남는 것은 **선언에서 역산한 파선 모형** 하나다 — 맨틀 휨의 곡률과 핵 속력비는
 * 그림자대 각(스테이지 상수)에서 이분법으로 풀어야 해서, 매 프레임 풀지 않고 여기서 한 번 푼다.
 */
export interface SeismicWavesState {
  model: RayModel;
}

export function initialState(params: { stage: StageDef }): SeismicWavesState {
  return { model: solveRayModel(readConstants(params.stage)) };
}
