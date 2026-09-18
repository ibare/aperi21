/**
 * 쌓는 상태가 없다. 세 추의 자리 · 돌아온 횟수가 모두 시간표 시각의 함수다 (S-sim
 * 「상태가 시계뿐인 조각」).
 */
export type MassSpringSystemState = Record<string, never>;

export function initialState(): MassSpringSystemState {
  return {};
}
