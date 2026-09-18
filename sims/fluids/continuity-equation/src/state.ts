/**
 * 쌓는 상태가 없다 — 흐름 점 · 칠한 물 · 칸이 모두 조각 시계의 함수다 (S-sim 「상태가 시계뿐인 조각」).
 */
export type ContinuityEquationState = Record<string, never>;

export function initialState(): ContinuityEquationState {
  return {};
}
