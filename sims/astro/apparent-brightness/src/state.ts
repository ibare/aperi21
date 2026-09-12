/**
 * 상태가 없다.
 *
 * 묶음의 자리 · 칸의 밝기 · 캡션이 모두 조각 시계의 순수 함수다. 방출 번호를
 * floor 로 역산하므로 프레임 사이에 쌓는 것이 없고, `?t=6.5` 로 연 화면과
 * 6.5 초 지켜본 화면이 같다.
 *
 * "도착한 순간 이미 진행 중" 도 여기가 아니라 `schema.startAt` 이다 (원칙 2) —
 * 시각의 함수로만 되어 있으면 시계를 앞당기는 것으로 충분하고 `preroll` 은 쓸
 * 일이 없다.
 */
export type ApparentBrightnessState = Record<string, never>;

export function initialState(): ApparentBrightnessState {
  return {};
}
