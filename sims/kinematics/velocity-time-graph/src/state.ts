/**
 * 상태가 없다. 넓이 · 떨어지는 기둥 · 물체가 전부 주기 안 시각의 함수이고, 시각은
 * 엔진이 시간표 선언(`schema.timeline`)에서 `scene` 에 넘겨 준다.
 *
 * 원본의 `tau(t) = (t + 1.5) % 12.4` 에서 1.5 는 `timeline.startAt`, 12.4 는 단계
 * 길이의 합이다.
 */
export type VelocityTimeGraphState = Record<string, never>;

export function initialState(): VelocityTimeGraphState {
  return {};
}
