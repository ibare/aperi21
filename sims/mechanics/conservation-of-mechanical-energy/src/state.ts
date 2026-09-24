/**
 * 상태가 없다. 공의 자리 · 높이 · 속력이 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 **시각의 함수**다 — 사이클로이드 골짜기에서 운동이
 * 닫힌 해이기 때문에 적분해 쌓을 것이 하나도 없다.
 *
 * 쌓을 것이 없으므로 `preroll` 도 쓰지 않는다. 도착한 순간 이미 진행 중인 화면은
 * `startAt` 이 만든다.
 */
export type ConservationOfMechanicalEnergyState = Record<string, never>;

export function initialState(): ConservationOfMechanicalEnergyState {
  return {};
}
