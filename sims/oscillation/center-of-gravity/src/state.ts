/**
 * 쌓는 상태가 없다. 기울기 · 무게 중심 · 수직선이 모두 시간표 진행도의 함수다 (S-sim
 * 「상태가 시계뿐인 조각」).
 */
export type CenterOfGravityState = Record<string, never>;

export function initialState(): CenterOfGravityState {
  return {};
}
