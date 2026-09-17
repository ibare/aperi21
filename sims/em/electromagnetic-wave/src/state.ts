// ========================================================================
// electromagnetic-wave — 런타임 상태
// ========================================================================
// 비어 있다. 모든 장은 지연 시각 τ = t − r/c 의 함수이고, 시계는 엔진이 시간표 선언에서
// `scene` 에 `params.timeline` 으로 준다 (S-sim 「상태가 시계뿐인 조각」).
// ========================================================================

export type ElectromagneticWaveState = Record<string, never>;

export function initialState(): ElectromagneticWaveState {
  return {};
}
