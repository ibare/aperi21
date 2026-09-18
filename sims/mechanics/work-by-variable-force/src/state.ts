/**
 * 상태가 없다. 상자 자리 · 힘 · 쌓인 넓이가 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 시각의 함수다 — 넓이는 지금 자리까지의 곡선 아래라
 * 따로 적분해 쌓을 것이 없다.
 *
 * 그래서 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 진행 중인 그림은 `startAt` 이 만든다.
 */
export type WorkByVariableForceState = Record<string, never>;

export function initialState(): WorkByVariableForceState {
  return {};
}
