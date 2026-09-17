/**
 * 상태가 없다. 당기는 힘 · 마찰력 · 상자 위치 · 흐려짐이 모두 조각 시계의 함수이고,
 * 엔진이 시간표 선언(`schema.timeline`)에서 `scene` 에 넘겨 주는 값으로 계산한다.
 * 그래서 `?t=` 로 연 화면과 실시간 화면이 같다.
 */
export type StaticFrictionState = Record<string, never>;

export function initialState(): StaticFrictionState {
  return {};
}
