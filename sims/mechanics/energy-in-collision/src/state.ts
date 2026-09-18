/**
 * 쌓는 상태가 없다. 수레 · 장부가 모두 시간표 진행도의 함수다 (S-sim 「상태가 시계뿐인 조각」).
 */
export type EnergyInCollisionState = Record<string, never>;

export function initialState(): EnergyInCollisionState {
  return {};
}
