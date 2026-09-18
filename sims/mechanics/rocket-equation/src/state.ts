/**
 * 상태가 없다. 로켓의 속도 · 남은 연료 · 별의 자리가 모두 시각의 닫힌 함수라
 * 쌓을 것이 없다 (S-sim 「상태가 시계뿐인 조각」). 그래도 파일과 항등 `step` 은 둔다.
 */
export type RocketEquationState = Record<string, never>;

export function initialState(): RocketEquationState {
  return {};
}
