/**
 * 상태가 없다. 버스 이동거리 · 공의 버스 기준 위치 · 흐려짐이 모두 조각 시계의 닫힌
 * 식이고, 주기 안 단계는 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 값이다.
 */
export type NonInertialFrameState = Record<string, never>;

export function initialState(): NonInertialFrameState {
  return {};
}
