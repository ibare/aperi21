/**
 * 상태가 없다. 광자 일정 · 전자 운동이 모두 (시드, 주기 번호, 주기 안 시각)의 함수이고,
 * 시각은 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 준다.
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 도착한 순간 이미 진행 중인 그림은
 * `startAt` 이 만든다.
 */
export type PhotoelectricEffectState = Record<string, never>;

export function initialState(): PhotoelectricEffectState {
  return {};
}
