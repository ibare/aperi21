/**
 * 상태가 없다 — 구슬의 높이 · 마루의 자리 · 두 자취가 모두 조각 시계의 함수다.
 * 시계는 엔진이 시간표 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 */
export type TransverseWaveState = Record<string, never>;

export function initialState(): TransverseWaveState {
  return {};
}
