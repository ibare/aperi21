/**
 * 상태가 비어 있다 — 모든 것이 시각의 함수다.
 *
 * 원자마다의 방향 · 갈래 · 보낸 시각은 (시드, 주기 번호)에서 뽑고, 지금 자리는 보낸 뒤 흐른 시간에서
 * 나온다 (`physics.ts`). 시계는 엔진이 시간표 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 */
export type SternGerlachState = Record<string, never>;

export function initialState(): SternGerlachState {
  return {};
}
