/**
 * 상태가 없다. 탐사선 · 행성의 자리와 두 끝의 속도가 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 시각의 함수다 — 쌍곡선 궤도는 케플러 방정식으로 어느 시각이든
 * 곧바로 풀린다.
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 진행 중인 그림은
 * `startAt` 이 만든다.
 */
export type GravitationalSlingshotState = Record<string, never>;

export function initialState(): GravitationalSlingshotState {
  return {};
}
