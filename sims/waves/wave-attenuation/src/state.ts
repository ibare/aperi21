/**
 * 쌓는 상태가 없다. 줄 · 마루 · 막대가 모두 시간표 선언(`schema.timeline`)에서 엔진이
 * `scene` 에 넘겨 주는 시각의 함수다 (S-sim 「상태가 시계뿐인 조각」).
 */
export type WaveAttenuationState = Record<string, never>;

export function initialState(): WaveAttenuationState {
  return {};
}
