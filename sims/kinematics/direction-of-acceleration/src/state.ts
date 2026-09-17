/**
 * 상태가 없다. 공의 위치·속도와 자취는 모두 시각의 해석적 함수(등가속도 식)이고,
 * 시계는 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 준다.
 */
export type DirectionOfAccelerationState = Record<string, never>;

export function initialState(): DirectionOfAccelerationState {
  return {};
}
