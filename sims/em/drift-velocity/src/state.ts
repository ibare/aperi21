/**
 * 상태가 없다. 전자 자리 · 열운동 흔들림 · 표류 거리 · 스위치 · 전구가 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다. 캡션은 값을 끼우지
 * 않으므로(`caption.vars` 없음) state 에 글자를 둘 일도 없다.
 *
 * 누적할 것이 없으므로 `preroll` 도 쓰지 않는다 — 전자는 모든 시각에 도선을 채우고
 * 떨고 있어 도착한 순간 이미 움직인다.
 */
export type DriftVelocityState = Record<string, never>;

export function initialState(): DriftVelocityState {
  return {};
}
