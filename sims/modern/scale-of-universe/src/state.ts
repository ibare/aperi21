/**
 * 쌓는 상태가 없다. 틀의 지수 z · 캡션 · 불투명도가 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 시각의 함수이고, 흩뿌린 점 자리는 스테이지 상수의 씨앗에서 나온다.
 */
export type ScaleOfUniverseState = Record<string, never>;

export function initialState(): ScaleOfUniverseState {
  return {};
}
