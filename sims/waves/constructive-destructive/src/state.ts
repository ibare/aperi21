// ========================================================================
// constructive-destructive — 상태
// ========================================================================
// 상태가 시계뿐인 조각이다. 두 파동 · 합 · 위상차가 모두 시간표 시각의 함수라
// 쌓아 둘 것이 없다 (S-sim 「상태가 시계뿐인 조각」).
// ========================================================================

export type ConstructiveDestructiveState = Record<string, never>;

export function initialState(): ConstructiveDestructiveState {
  return {};
}
