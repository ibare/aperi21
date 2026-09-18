/**
 * 상태가 없다. 빛의 고리 · 사건의 판정 · 틀을 바꾼 자리가 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 진행 중인
 * 그림은 `startAt` 이 만든다.
 */
export type LightConeState = Record<string, never>;

export function initialState(): LightConeState {
  return {};
}
