/**
 * 상태가 없다. 수레의 위치·속도는 밀어 준 시간의 해석식이고, 밀어 준 시간과 캡션은
 * 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 값의 함수다.
 */
export type NewtonsSecondLawState = Record<string, never>;

export function initialState(): NewtonsSecondLawState {
  return {};
}
