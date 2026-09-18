/**
 * 쌓는 상태가 없다. 세 추 · 섬광 · 횟수 점이 모두 시간표 진행도의 함수다 (S-sim
 * 「상태가 시계뿐인 조각」).
 */
export type SimplePendulumState = Record<string, never>;

export function initialState(): SimplePendulumState {
  return {};
}
