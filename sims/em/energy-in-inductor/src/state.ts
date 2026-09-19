/**
 * 상태가 없다. 전류 · 자기력선 수 · 삼각형 넓이 · 역기전력이 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 캡션에 스테이지 상수의 값이 끼지 않으므로 캡션 `vars` 용 글자도 두지 않는다.
 * 누적할 것이 없어 `preroll` 도 쓰지 않는다 — 도착한 순간의 진행은 `startAt` 이 만든다.
 */
export type EnergyInInductorState = Record<string, never>;

export function initialState(): EnergyInInductorState {
  return {};
}
