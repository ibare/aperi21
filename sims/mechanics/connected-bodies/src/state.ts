/**
 * 상태가 없다. 물체 위치는 달린 시간의 해석식(x = ½·a·τ²)이고, 달린 시간과 캡션은
 * 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 값의 함수다.
 */
export type ConnectedBodiesState = Record<string, never>;

export function initialState(): ConnectedBodiesState {
  return {};
}
