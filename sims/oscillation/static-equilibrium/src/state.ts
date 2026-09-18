/**
 * 쌓는 상태가 없다. 오른쪽 막대의 회전각과 옮긴 힘의 자리는 모두 시간표 진행도의
 * 함수다 (S-sim 「상태가 시계뿐인 조각」).
 */
export type StaticEquilibriumState = Record<string, never>;

export function initialState(): StaticEquilibriumState {
  return {};
}
