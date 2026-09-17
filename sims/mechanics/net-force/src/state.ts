/**
 * 상태가 없다.
 *
 * 원본은 위치·속도를 매 프레임 적분하고 자리 점 목록을 쌓았다. 그러나 알짜힘이
 * 주기 안에서 일정하므로 위치는 풀려난 뒤 흐른 시간의 닫힌 식이고, 자리 점도
 * 0.3 초 간격의 같은 식이다. 주기마다 초기화하던 것은 주기 안 시각으로 대신한다.
 */
export type NetForceState = Record<string, never>;

export function initialState(): NetForceState {
  return {};
}
