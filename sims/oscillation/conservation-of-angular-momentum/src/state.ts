/**
 * 쌓는 상태가 없다. 손의 자리 · 팔 방향 · 직사각형이 모두 조각 시계의 함수다
 * (S-sim 「상태가 시계뿐인 조각」). 팔 방향은 적분이지만 시각에서 매번 다시 계산한다 —
 * 같은 시각은 언제나 같은 화면이어야 한다.
 */
export type ConservationOfAngularMomentumState = Record<string, never>;

export function initialState(): ConservationOfAngularMomentumState {
  return {};
}
