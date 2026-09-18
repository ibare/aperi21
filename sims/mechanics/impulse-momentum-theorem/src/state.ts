/**
 * 쌓는 상태가 없다. 공 · 화살표 · 넓이가 모두 시간표 시각의 닫힌 식이다 (S-sim
 * 「상태가 시계뿐인 조각」).
 */
export type ImpulseMomentumTheoremState = Record<string, never>;

export function initialState(): ImpulseMomentumTheoremState {
  return {};
}
