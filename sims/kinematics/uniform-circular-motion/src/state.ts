/**
 * 상태가 없다. 물체의 각 · 남긴 잔상 · 잔상의 옅기가 전부 조각 시계의 함수이고,
 * 시계는 엔진이 시간표 선언(`schema.timeline`)에서 `scene` 에 넘겨 준다.
 *
 * "도착한 순간 이미 진행 중" 도 여기가 아니라 `schema.startAt` 이다 (원칙 2).
 */
export type UniformCircularMotionState = Record<string, never>;

export function initialState(): UniformCircularMotionState {
  return {};
}
