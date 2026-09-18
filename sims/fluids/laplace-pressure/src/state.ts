/**
 * 상태가 없다. 두 거품의 크기 · 밸브 · 흐름이 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 시각의 함수다. 흐름 단계의 부피 이동은 적분이지만 그 단계
 * 안에서 흐른 초만으로 정해지므로 `scene` 이 매 프레임 처음부터 다시 적분한다 — 같은
 * 시각은 언제나 같은 화면이다.
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다.
 */
export type LaplacePressureState = Record<string, never>;

export function initialState(): LaplacePressureState {
  return {};
}
