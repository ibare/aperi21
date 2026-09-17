/**
 * 상태가 없다. 공의 높이 · 속도 · 찍힌 화살표의 개수가 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 */
export type GravitationalAccelerationState = Record<string, never>;

export function initialState(): GravitationalAccelerationState {
  return {};
}
