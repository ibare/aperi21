/** 상태가 필요하면 여기 둔다. 시각의 함수로 풀리는 것은 상태가 아니다. */
export type SeriesParallelResistorsState = Record<string, never>;

export function initialState(): SeriesParallelResistorsState {
  return {};
}
