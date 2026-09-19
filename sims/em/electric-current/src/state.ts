/**
 * 상태가 없다. 알갱이 자리 · 센 수 · 문 열림이 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 주기 안 시각의 함수다.
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 알갱이는 모든 시각에 도선을 채우고
 * 있어 도착한 순간 이미 흐른다.
 */
export type ElectricCurrentState = Record<string, never>;

export function initialState(): ElectricCurrentState {
  return {};
}
