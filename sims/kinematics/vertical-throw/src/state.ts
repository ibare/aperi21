/**
 * 상태가 없다. 공·도장·사본·점선이 모두 시간표 선언(`schema.timeline`)에서 엔진이
 * `scene` 에 넘겨 주는 시각의 함수다.
 */
export type VerticalThrowState = Record<string, never>;

export function initialState(): VerticalThrowState {
  return {};
}
