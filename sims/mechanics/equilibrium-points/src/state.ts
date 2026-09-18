/**
 * 상태가 없다. 세 공의 자리 · 비탈 힘 · 이름표의 짙기가 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다. 놓은 뒤의
 * 구름도 놓은 순간부터 다시 적분하므로 쌓을 것이 없다.
 *
 * 그래서 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 진행 중인 그림은 `startAt` 이 만든다.
 */
export type EquilibriumPointsState = Record<string, never>;

export function initialState(): EquilibriumPointsState {
  return {};
}
