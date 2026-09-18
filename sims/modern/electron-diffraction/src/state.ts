/**
 * 상태가 없다. 전압 · 빔의 흐름 · 스크린의 잔광 점이 모두 시간표 선언(`schema.timeline`)에서
 * 엔진이 `scene` 에 넘겨 주는 시각의 함수다 — 점은 (시드, 도착 번호)에서 뽑고, 빔이 흘러간
 * 거리는 닫힌 식이다.
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 도착한 순간 스크린이 이미 빛나는 것은
 * 도착 번호를 시계 이전(음수)까지 세어 만든다.
 */
export type ElectronDiffractionState = Record<string, never>;

export function initialState(): ElectronDiffractionState {
  return {};
}
