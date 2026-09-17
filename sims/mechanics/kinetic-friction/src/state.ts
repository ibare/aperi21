/**
 * 상태가 없다. 상자 위치 · 속도 · 멈춤 · 지난 눈금이 모두 조각 시계의 함수이고,
 * 엔진이 시간표 선언(`schema.timeline`)에서 `scene` 에 넘겨 주는 주기 안 시각으로
 * 계산한다. 그래서 `?t=` 로 연 화면과 실시간 화면이 같다 (원본도 누적 상태가 없었다).
 */
export type KineticFrictionState = Record<string, never>;

export function initialState(): KineticFrictionState {
  return {};
}
