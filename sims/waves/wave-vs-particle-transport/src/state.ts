/**
 * 쌓는 상태가 없다. 펄스의 자리 · 줄 조각의 높이 · 끝 추의 흔들림은 모두 이번 주기
 * `travel` 시작부터 흐른 시간의 함수다 — 추도 매 프레임 그 시각까지 식을 다시 적분한다.
 * 시계는 엔진이 시간표 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 */
export type WaveVsParticleTransportState = Record<string, never>;

export function initialState(): WaveVsParticleTransportState {
  return {};
}
