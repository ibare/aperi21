// 쌓는 상태가 없다 — 두 구의 자리와 자국은 모두 조각 시계의 닫힌 함수다 (physics.ts).
export type StokesDragState = Record<string, never>;

export function initialState(): StokesDragState {
  return {};
}
