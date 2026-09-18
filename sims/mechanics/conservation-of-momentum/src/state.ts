/**
 * 쌓는 상태가 없다. 수레 자리 · 운동량 · 힘이 모두 시간표 시각의 함수다 (S-sim
 * 「상태가 시계뿐인 조각」). 시계는 엔진이 `scene` 에 `params.timeline` 으로 준다.
 */
export type ConservationOfMomentumState = Record<string, never>;

export function initialState(): ConservationOfMomentumState {
  return {};
}
