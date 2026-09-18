/**
 * 쌓는 상태가 없다. 덩어리의 자리 · 알갱이의 각 · 화살표 길이가 모두 시간표 진행도의
 * 함수다 — 같은 시각은 언제나 같은 화면이다.
 */
export type RocheLimitState = Record<string, never>;

export function initialState(): RocheLimitState {
  return {};
}
