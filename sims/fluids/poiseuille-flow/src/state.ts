/**
 * 상태가 없다. 흐름 점 · 염료 전선은 조각 시계의 함수이고, 받는 칸의 채움은 시간표
 * 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 값의 함수다.
 */
export type PoiseuilleFlowState = Record<string, never>;

export function initialState(): PoiseuilleFlowState {
  return {};
}
