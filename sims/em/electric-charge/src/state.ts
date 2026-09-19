/**
 * 쌓는 상태가 없다. 공의 자리가 모두 시간표 진행도의 함수다 (S-sim 「상태가 시계뿐인 조각」).
 */
export type ElectricChargeState = Record<string, never>;

export function initialState(): ElectricChargeState {
  return {};
}
