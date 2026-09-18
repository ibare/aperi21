/** 상태가 비어 있다 — 모든 것이 시간표 시계의 함수다 (S-sim 「상태가 시계뿐인 조각」). */
export type EscapeVelocityState = Record<string, never>;

export function initialState(): EscapeVelocityState {
  return {};
}
