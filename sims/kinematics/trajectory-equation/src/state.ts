/**
 * 상태가 없다. 공 · 경로 · 눈금 · 지우개가 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 값의 함수다. 같은 시각은 언제나 같은 화면이다.
 */
export type TrajectoryEquationState = Record<string, never>;

export function initialState(): TrajectoryEquationState {
  return {};
}
