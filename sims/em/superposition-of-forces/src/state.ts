// ========================================================================
// superposition-of-forces — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. 캡션도 스테이지 상수의 값을 끼우지
// 않는다 — 화면에 수가 없다. 도착한 순간 이미 진행 중인 그림은 `startAt` 이 만든다.
// ========================================================================

export type SuperpositionOfForcesState = Record<string, never>;

export function initialState(): SuperpositionOfForcesState {
  return {};
}
