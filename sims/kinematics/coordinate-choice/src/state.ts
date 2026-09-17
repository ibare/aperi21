/**
 * 상태가 없다. 물체 · 그림자 · 발자국이 모두 시각의 함수이고, 그 시각은 시간표
 * 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 준다. 발자국도 쌓지 않고
 * 매 프레임 지난 시각을 다시 샘플하므로 `?t=` 와 실시간이 같다.
 */
export type CoordinateChoiceState = Record<string, never>;

export function initialState(): CoordinateChoiceState {
  return {};
}
