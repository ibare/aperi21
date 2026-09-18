/**
 * 쌓는 상태가 없다 — 바람 세기 · 액면 · 공기 점 · 물방울이 모두 조각 시계의 함수다
 * (S-sim 「상태가 시계뿐인 조각」). 공기 점의 자리는 바람 세기의 적분인데, 그것도
 * 시간표 선언에서 매 프레임 다시 계산한다.
 */
export type VenturiEffectState = Record<string, never>;

export function initialState(): VenturiEffectState {
  return {};
}
