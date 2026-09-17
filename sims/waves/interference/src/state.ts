/**
 * 상태가 없다 — 수면 · 파원 · 캡션이 모두 조각 시계의 함수다. 시계는 엔진이
 * 시간표 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 */
export type InterferenceState = Record<string, never>;

export function initialState(): InterferenceState {
  return {};
}
