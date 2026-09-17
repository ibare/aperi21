/**
 * 상태가 없다 — 입자 자리 · 밀도 띠가 모두 시각의 함수다.
 * 시계는 엔진이 시간표 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 */
export type LongitudinalWaveState = Record<string, never>;

export function initialState(): LongitudinalWaveState {
  return {};
}
