import { captionValues, makeStars, type Star } from './physics';
import { CLUSTER } from './schema';

/**
 * 상태.
 *
 * 별의 자리는 성단 나이(= 시각)의 함수라 상태에 쌓지 않는다. 쌓는 것은 둘이다.
 * - `stars` — 시드에서 뽑은 별 무리. 바뀌지 않는다.
 * - `t` 와 캡션 값 — 캡션 슬롯의 `vars` 가 state 경로만 읽으므로, `step` 이 시계를
 *   따로 세어 시간표를 다시 계산한다 (NOTES 「어휘 부족」 G01).
 */
export interface HrDiagramState {
  t: number;
  stars: readonly Star[];
  /** 나이가 1억 년 이상이면 참 — 캡션 틀(만 년 / 억 년)을 고른다. */
  ageInEok: boolean;
  /** 나이 ÷ 1만 (유효숫자 2자리). */
  ageMan: string;
  /** 나이 ÷ 1억 (유효숫자 2자리). */
  ageEok: string;
  /** 나이 ÷ 100만 (유효숫자 2자리). */
  ageMyr: string;
  /** 전향점 질량(태양 질량, 유효숫자 2자리). */
  massText: string;
}

export function initialState(): HrDiagramState {
  return {
    t: 0,
    stars: makeStars(CLUSTER.count, CLUSTER.seed),
    ...captionValues(0),
  };
}
