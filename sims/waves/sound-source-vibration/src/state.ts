/**
 * 상태가 없다 — 가지 변위 · 고리 반지름 · 손과 망치의 자리가 모두 시각의 함수다.
 * 시계는 엔진이 시간표 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 */
export type SoundSourceVibrationState = Record<string, never>;

export function initialState(): SoundSourceVibrationState {
  return {};
}
