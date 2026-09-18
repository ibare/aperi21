/**
 * 상태가 없다. 띠의 굵기 · 흐르는 점의 자리 · 이름표가 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 흐르는 그림은
 * `startAt` 과, 시각의 함수인 점 자리가 만든다.
 */
export type EfficiencyState = Record<string, never>;

export function initialState(): EfficiencyState {
  return {};
}
