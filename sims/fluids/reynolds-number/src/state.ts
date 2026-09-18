/** 쌓는 상태가 없다 — 시계는 엔진이 시간표로 준다 (S-sim 「상태가 시계뿐인 조각」). */
export type ReynoldsNumberState = Record<string, never>;

export function initialState(): ReynoldsNumberState {
  return {};
}
