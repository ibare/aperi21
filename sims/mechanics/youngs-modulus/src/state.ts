/**
 * 상태가 없다. 받침대 높이와 선의 늘어남은 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 값의 함수다.
 */
export type YoungsModulusState = Record<string, never>;

export function initialState(): YoungsModulusState {
  return {};
}
