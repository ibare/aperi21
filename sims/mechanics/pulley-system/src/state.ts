/**
 * 상태가 없다. 짐 높이 · 줄 · 도르래 회전 · 손 자리가 모두 시각의 함수이고, 시각은
 * 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 준다.
 */
export type PulleySystemState = Record<string, never>;

export function initialState(): PulleySystemState {
  return {};
}
