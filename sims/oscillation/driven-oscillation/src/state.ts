/**
 * 쌓는 상태가 없다. 손 · 추 · 기록지 자국이 모두 조각 시계의 함수다 — 정상 상태
 * 해를 그대로 쓰므로 적분할 것이 없다 (S-sim 「상태가 시계뿐인 조각」).
 */
export type DrivenOscillationState = Record<string, never>;

export function initialState(): DrivenOscillationState {
  return {};
}
