/**
 * 상태가 없다. 늘임·힘·자국·캡션은 모두 시간표 선언(`schema.timeline`)에서 엔진이
 * `scene` 에 넘겨 주는 값의 함수다.
 */
export type SpringForceState = Record<string, never>;

export function initialState(): SpringForceState {
  return {};
}
