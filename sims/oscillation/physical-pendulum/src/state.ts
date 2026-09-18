/**
 * 쌓는 상태가 없다. 네 막대의 각 · 돌아온 고리 · 흔든 횟수가 모두 시간표 시각의 함수다
 * (S-sim 「상태가 시계뿐인 조각」).
 */
export type PhysicalPendulumState = Record<string, never>;

export function initialState(): PhysicalPendulumState {
  return {};
}
