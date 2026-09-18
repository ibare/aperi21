/**
 * 상태가 없다. 구동 진동수 · 두 추의 자리 · 곡선이 그려진 끝 · 기록 선이 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 훑는 중인 그림은
 * `startAt` 이 만든다.
 */
export type QualityFactorState = Record<string, never>;

export function initialState(): QualityFactorState {
  return {};
}
