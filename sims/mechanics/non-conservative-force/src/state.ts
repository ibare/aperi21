/**
 * 상태가 없다. 두 상자의 자리 · 지나온 길 · 잃은 에너지 막대가 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 잃은 에너지는 「쌓이는」 양이지만 빠르기가 일정해 지나온 길이 닫힌 식이므로 누적
 * 적분이 필요 없다. 그래서 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 진행 중인
 * 그림은 `startAt` 이 만든다.
 */
export type NonConservativeForceState = Record<string, never>;

export function initialState(): NonConservativeForceState {
  return {};
}
