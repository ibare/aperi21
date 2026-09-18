/**
 * 상태가 없다. 네 추의 자리 · 막대 가운데 점 · 기록지의 잉크가 모두 조각 시계의
 * 닫힌 식이라, 엔진이 시간표 선언(`schema.timeline`)에서 `scene` 에 넘겨 주는 시각만으로
 * 정해진다.
 *
 * 기록지의 지나간 자리도 같은 식으로 계산하므로 `preroll` 도 쓰지 않는다 — 첫 프레임부터
 * 기록지가 차 있다.
 */
export type BeatsInOscillationState = Record<string, never>;

export function initialState(): BeatsInOscillationState {
  return {};
}
