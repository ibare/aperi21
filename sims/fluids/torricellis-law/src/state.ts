export interface TorricellisLawState {
  /** 흐른 시간(초). 이 조각의 상태는 시간뿐이다. */
  t: number;
}

export function initialState(): TorricellisLawState {
  return { t: 0 };
}
