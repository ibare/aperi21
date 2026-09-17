/**
 * 상태가 없다. 기차·전봇대·공·자취가 모두 조각 시계의 함수이고, 주기 안 단계는
 * 시간표 선언(`schema.timeline`)에서 엔진이 `scene` 에 넘겨 주는 값이다.
 */
export type ReferenceFrameState = Record<string, never>;

export function initialState(): ReferenceFrameState {
  return {};
}
