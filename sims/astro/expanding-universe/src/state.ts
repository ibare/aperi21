/**
 * 쌓는 상태가 없다. 척도 인자 · 관찰 은하 · 캡션이 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 시각의 함수이고, 은하 자리는 스테이지 상수의 씨앗에서 나온다.
 */
export type ExpandingUniverseState = Record<string, never>;

export function initialState(): ExpandingUniverseState {
  return {};
}
