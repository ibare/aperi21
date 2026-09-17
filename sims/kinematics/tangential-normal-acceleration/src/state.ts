/**
 * 상태가 없다. 물체의 자리·속도·두 몫은 모두 주기 안 시각의 함수이고(미리 적분한
 * 프레임 표를 시각으로 조회한다), 캡션은 시간표 선언에서 엔진이 고른다.
 */
export type TangentialNormalAccelerationState = Record<string, never>;

export function initialState(): TangentialNormalAccelerationState {
  return {};
}
