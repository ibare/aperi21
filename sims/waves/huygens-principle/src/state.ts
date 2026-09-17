/**
 * 장 · 점파원은 모두 조각 시계의 함수라 쌓는 것이 없다. 시계는 엔진이 시간표 선언에서
 * `scene` 에 `params.timeline` 으로 준다 (S-sim).
 *
 * 상태에 남은 둘은 **캡션 하나를 고르기 위한 것**이다. 「점을 1개로 줄였다」 문장은
 * 주기 번호에 달려 있는데 캡션 슬롯은 상태 경로만 읽고 `step` 은 시간표를 받지 못한다
 * (NOTES 「어휘 부족」 G01). 그래서 `step` 이 시계를 따로 센다.
 */
export interface HuygensPrincipleState {
  /** 조각 시계(초). `startAt` 이 0 이라 엔진 시계와 같다. */
  t: number;
  /** 되돌린 뒤 곧은 파면의 꼬리가 아직 화면에 있는가 — 캡션 `cases` 가 읽는다. */
  returning: boolean;
}

export function initialState(): HuygensPrincipleState {
  return { t: 0, returning: false };
}
