/**
 * 상태가 없다. 두 상자의 자리 · 기울기와 두 막대의 높이가 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 중력이 한 일은 적분하지 않는다 — 보존력이라 지금 높이 하나로 정해진다. 그것이 이
 * 조각이 말하는 것이기도 하다. 누적할 것이 없으므로 `preroll` 도 쓰지 않는다.
 */
export type ConservativeForceState = Record<string, never>;

export function initialState(): ConservativeForceState {
  return {};
}
