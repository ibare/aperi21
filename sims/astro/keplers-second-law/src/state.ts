/**
 * 상태가 없다. 행성 자리 · 자라는 부채꼴 · 막대 높이가 모두 시각의 함수이고,
 * 시계는 엔진이 시간표 선언(`schema.timeline`)에서 `scene` 에 넘겨 준다.
 */
export type KeplersSecondLawState = Record<string, never>;

export function initialState(): KeplersSecondLawState {
  return {};
}
