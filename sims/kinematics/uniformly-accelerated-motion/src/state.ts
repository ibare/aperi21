/**
 * 상태가 없다. 물체의 자리 · 찍힌 자리 · 간격 막대가 모두 시각의 함수이고, 시계는
 * 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 준다.
 */
export type UniformlyAcceleratedMotionState = Record<string, never>;

export function initialState(): UniformlyAcceleratedMotionState {
  return {};
}
