/**
 * 쌓는 상태가 없다. 세 추의 변위 · 곡선 · 멎음 눈금이 모두 시간표 진행도의 함수다
 * (S-sim 「상태가 시계뿐인 조각」).
 */
export type DampingRegimesState = Record<string, never>;

export function initialState(): DampingRegimesState {
  return {};
}
