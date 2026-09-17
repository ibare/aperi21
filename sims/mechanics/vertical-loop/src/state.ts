/**
 * 상태가 없다. 두 공의 운동은 미리 적분한 표(`physics.ts`)에서 조각 시계로 읽고,
 * 캡션 전환과 끝의 흐려짐은 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에
 * 넘겨 주는 값의 함수다. 같은 시각은 언제나 같은 화면이다.
 */
export type VerticalLoopState = Record<string, never>;

export function initialState(): VerticalLoopState {
  return {};
}
