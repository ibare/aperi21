/**
 * 상태가 없다. 두 추의 자리 · 두 기록 · 힘 화살표가 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다. 비선형 운동도
 * 사분 주기 적분 한 번이면 어떤 시각이든 곧바로 나온다 (`physics.solveOrbit`).
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 진행 중인
 * 그림은 `startAt` 이 만든다.
 */
export type NonlinearOscillationState = Record<string, never>;

export function initialState(): NonlinearOscillationState {
  return {};
}
