/**
 * 상태가 없다. 두 사람의 자리·힘의 크기는 모두 주기 안 시각의 닫힌 식이고,
 * 시계는 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 준다.
 */
export type NewtonsThirdLawState = Record<string, never>;

export function initialState(): NewtonsThirdLawState {
  return {};
}
