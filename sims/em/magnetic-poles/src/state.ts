/**
 * 상태가 시계뿐인 조각이다 (S-sim). 수레의 자리와 자석의 방향이 모두 시간표 시각의
 * 함수라 쌓을 것이 없다. 시계는 엔진이 `params.timeline` 으로 준다.
 */
export type MagneticPolesState = Record<string, never>;

export function initialState(): MagneticPolesState {
  return {};
}
