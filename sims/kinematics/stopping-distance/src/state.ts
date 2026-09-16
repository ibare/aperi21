/**
 * 상태가 없다. 세 대의 위치·속력·반응 끝 지점·정지 시각이 모두 시간표 선언
 * (`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 시각의 함수다.
 *
 * 원본은 프레임마다 사다리꼴로 적분해 위치를 쌓았지만, 등가속에서 그 누적의 결과는
 * 닫힌 식과 소수점까지 같다 (physics.ts 머리말).
 */
export type StoppingDistanceState = Record<string, never>;

export function initialState(): StoppingDistanceState {
  return {};
}
